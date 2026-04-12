-- Dutuk Backend - Helper Functions and Triggers
-- Execute this in Supabase SQL Editor AFTER creating tables and policies

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS: Auto-update updated_at on all tables
-- =====================================================

CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_companies
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_dates
    BEFORE UPDATE ON public.dates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_requests
    BEFORE UPDATE ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_events
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_orders
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_reviews
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_payments
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_earnings
    BEFORE UPDATE ON public.earnings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FUNCTION: Create user profile on signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'vendor');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNCTION: Get request count for a vendor
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_request_count(vendor_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    company_name_var TEXT;
    request_count INTEGER;
BEGIN
    -- Get company name for this vendor
    SELECT company INTO company_name_var
    FROM public.companies
    WHERE user_id = vendor_user_id
    LIMIT 1;
    
    -- Count pending requests
    SELECT COUNT(*) INTO request_count
    FROM public.requests
    WHERE company_name = company_name_var
    AND status = 'pending';
    
    RETURN COALESCE(request_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Update event dates from array
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_event_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract start and end dates from date array
    IF NEW.date IS NOT NULL AND array_length(NEW.date, 1) > 0 THEN
        NEW.start_date := (NEW.date[1])::DATE;
        NEW.end_date := (NEW.date[array_length(NEW.date, 1)])::DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set start/end dates
CREATE TRIGGER set_event_dates
    BEFORE INSERT OR UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_event_dates();

-- =====================================================
-- FUNCTION: Update event status based on dates
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_event_status()
RETURNS void AS $$
BEGIN
    -- Update to ongoing if start date is today or past and end date is future
    UPDATE public.events
    SET status = 'ongoing'
    WHERE status = 'upcoming'
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE;
    
    -- Update to completed if end date is past
    UPDATE public.events
    SET status = 'completed'
    WHERE status IN ('upcoming', 'ongoing')
    AND end_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Set vendor role on registration
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_vendor_role(user_id_param UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (user_id_param, 'vendor')
    ON CONFLICT (user_id) DO UPDATE
    SET role = 'vendor';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Get vendor dashboard stats
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_vendor_stats(vendor_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_events', (
            SELECT COUNT(*) FROM public.events WHERE vendor_id = vendor_user_id
        ),
        'active_events', (
            SELECT COUNT(*) FROM public.events 
            WHERE vendor_id = vendor_user_id 
            AND status IN ('upcoming', 'ongoing')
        ),
        'pending_requests', (
            SELECT COUNT(*) FROM public.requests r
            INNER JOIN public.companies c ON r.company_name = c.company
            WHERE c.user_id = vendor_user_id AND r.status = 'pending'
        ),
        'total_earnings', (
            SELECT COALESCE(SUM(amount), 0) 
            FROM public.earnings 
            WHERE vendor_id = vendor_user_id
        ),
        'avg_rating', (
            SELECT COALESCE(AVG(rating), 0) 
            FROM public.reviews 
            WHERE vendor_id = vendor_user_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SCHEDULED JOB (Optional - requires pg_cron extension)
-- =====================================================

-- To enable scheduled jobs, run this:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule event status updates (runs daily at midnight)
-- SELECT cron.schedule(
--     'update-event-status',
--     '0 0 * * *',
--     'SELECT public.update_event_status();'
-- );

-- =====================================================
-- MULTI-PRICING: sync_event_pricing_summary trigger
-- Fires after INSERT/UPDATE/DELETE on event_pricing_items.
-- Atomically updates:
--   events.pricing_summary      — full JSONB array for fast reads
--   events.total_min_budget     — sum of fixed prices + range minimums
--   events.total_max_budget     — sum of fixed prices + range maximums
--   events.has_custom_pricing   — true if any item is 'custom'
--   events.payment              — backward-compat (equals total_min_budget)
-- =====================================================

CREATE OR REPLACE FUNCTION public.sync_event_pricing_summary()
RETURNS TRIGGER AS $$
DECLARE
    v_event_id UUID;
    v_items JSONB;
    v_total_min DECIMAL(12, 2);
    v_total_max DECIMAL(12, 2);
    v_has_custom BOOLEAN;
BEGIN
    -- Determine the affected event_id
    IF (TG_OP = 'DELETE') THEN
        v_event_id := OLD.event_id;
    ELSE
        v_event_id := NEW.event_id;
    END IF;

    -- Aggregate all pricing items for this event
    SELECT
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id',          epi.id,
                    'label',       epi.label,
                    'pricing_type', epi.pricing_type,
                    'price',       epi.price,
                    'price_min',   epi.price_min,
                    'price_max',   epi.price_max,
                    'price_unit',  epi.price_unit,
                    'custom_note', epi.custom_note,
                    'sort_order',  epi.sort_order
                ) ORDER BY epi.sort_order ASC
            ),
            '[]'::jsonb
        ),
        COALESCE(
            SUM(
                CASE epi.pricing_type
                    WHEN 'fixed' THEN COALESCE(epi.price, 0)
                    WHEN 'range' THEN COALESCE(epi.price_min, 0)
                    ELSE 0
                END
            ),
            0
        ),
        COALESCE(
            SUM(
                CASE epi.pricing_type
                    WHEN 'fixed' THEN COALESCE(epi.price, 0)
                    WHEN 'range' THEN COALESCE(epi.price_max, COALESCE(epi.price_min, 0))
                    ELSE 0
                END
            ),
            0
        ),
        BOOL_OR(epi.pricing_type = 'custom') IS TRUE
    INTO v_items, v_total_min, v_total_max, v_has_custom
    FROM public.event_pricing_items epi
    WHERE epi.event_id = v_event_id;

    -- Update the denormalized columns on the events table
    UPDATE public.events SET
        pricing_summary    = v_items,
        total_min_budget   = v_total_min,
        total_max_budget   = v_total_max,
        has_custom_pricing = COALESCE(v_has_custom, false),
        payment            = v_total_min   -- backward-compat
    WHERE id = v_event_id;

    RETURN NULL; -- AFTER trigger; return value is ignored
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on event_pricing_items
DROP TRIGGER IF EXISTS trg_sync_event_pricing_summary ON public.event_pricing_items;

CREATE TRIGGER trg_sync_event_pricing_summary
    AFTER INSERT OR UPDATE OR DELETE
    ON public.event_pricing_items
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_event_pricing_summary();