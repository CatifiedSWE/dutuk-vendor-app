-- 1. Create portfolio_items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE, -- profile_id from user_profiles
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    event_type TEXT,
    event_date DATE,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Owners can manage their own items
CREATE POLICY "Vendors can manage their own portfolio"
    ON public.portfolio_items
    FOR ALL
    USING (
        vendor_id IN (
            SELECT id FROM public.user_profiles WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        vendor_id IN (
            SELECT id FROM public.user_profiles WHERE user_id = auth.uid()
        )
    );

-- Anyone can view portfolio items
CREATE POLICY "Public can view portfolio items"
    ON public.portfolio_items
    FOR SELECT
    USING (true);

-- 4. Set up updated_at trigger
CREATE TRIGGER set_updated_at_portfolio_items
    BEFORE UPDATE ON public.portfolio_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
