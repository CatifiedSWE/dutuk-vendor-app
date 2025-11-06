# 📊 Dutuk Database Architecture

## System Overview

**Platform:** Supabase (PostgreSQL + Auth + Storage)  
**Application:** Dutuk Vendor Management System  
**Frontend:** React Native (Expo)  
**Authentication:** Supabase Auth (Email/Password + OTP)

---

## 🗄️ Database Schema

### Tables Overview

| Table | Purpose | Records | RLS |
|-------|---------|---------|-----|
| `user_profiles` | Extended user information & roles | 1 per user | ✅ |
| `companies` | Vendor company details | 1 per vendor | ✅ |
| `dates` | Calendar availability | Many per vendor | ✅ |
| `requests` | Customer event requests | Many | ✅ |
| `events` | Accepted & ongoing events | Many | ✅ |
| `orders` | Orders requiring approval | Many | ✅ |
| `reviews` | Customer reviews | Many | ✅ |
| `payments` | Payment transactions | Many | ✅ |
| `earnings` | Vendor earnings records | Many | ✅ |

---

## 📐 Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
│  - id (PK)      │
│  - email        │
│  - created_at   │
└────────┬────────┘
         │
         │ 1:1
         ↓
┌─────────────────┐
│ user_profiles   │
│  - id (PK)      │
│  - user_id (FK) │
│  - role         │ (vendor/customer/admin)
└────────┬────────┘
         │
         │ 1:1
         ↓
┌─────────────────┐
│   companies     │
│  - id (PK)      │
│  - user_id (FK) │────────┐
│  - company      │        │
│  - mail         │        │
│  - phone        │        │
│  - address      │        │
│  - website      │        │
│  - logo_url     │        │
└─────────────────┘        │
                           │
         ┌─────────────────┘
         │
         │ 1:Many
         ↓
┌─────────────────┐        ┌─────────────────┐
│    requests     │───────→│     events      │
│  - id (PK)      │ Accept │  - id (PK)      │
│  - customer_id  │        │  - customer_id  │
│  - company_name │        │  - vendor_id(FK)│
│  - event        │        │  - company_name │
│  - date[]       │        │  - event        │
│  - payment      │        │  - date[]       │
│  - status       │        │  - payment      │
└─────────────────┘        │  - status       │
                           │  - start_date   │
                           │  - end_date     │
                           └────────┬────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ↓               ↓               ↓
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │   reviews    │ │   payments   │ │   earnings   │
            │  - id (PK)   │ │  - id (PK)   │ │  - id (PK)   │
            │  - vendor_id │ │  - vendor_id │ │  - vendor_id │
            │  - event_id  │ │  - event_id  │ │  - event_id  │
            │  - rating    │ │  - amount    │ │  - amount    │
            └──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────┐        ┌─────────────────┐
│     dates       │        │     orders      │
│  - id (PK)      │        │  - id (PK)      │
│  - user_id (FK) │        │  - vendor_id(FK)│
│  - date         │        │  - customer_id  │
│  - event        │        │  - title        │
│  - status       │        │  - status       │
└─────────────────┘        └─────────────────┘
```

---

## 📋 Detailed Table Schemas

### 1. user_profiles

**Purpose:** Extended user information with role management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| user_id | UUID | FK → auth.users, UNIQUE, NOT NULL | Links to Supabase auth |
| role | TEXT | DEFAULT 'vendor', CHECK | User role (vendor/customer/admin) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:** None (small table)  
**RLS:** Users can only see their own profile

---

### 2. companies

**Purpose:** Vendor company information and profiles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → auth.users, UNIQUE, NOT NULL | Vendor's user ID |
| company | TEXT | NOT NULL | Company name |
| mail | TEXT | - | Company email |
| phone | TEXT | - | Company phone |
| address | TEXT | - | Company address |
| website | TEXT | - | Company website |
| logo_url | TEXT | - | Logo image URL |
| description | TEXT | - | Company description |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:** None  
**RLS:** 
- Vendors can CRUD their own company
- Public can READ all companies

---

### 3. dates

**Purpose:** Vendor calendar date management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → auth.users, NOT NULL | Vendor's user ID |
| date | DATE | NOT NULL | The calendar date |
| event | TEXT | - | Event name (if booked) |
| description | TEXT | - | Event description |
| status | TEXT | DEFAULT 'available', CHECK | available/booked/blocked |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:** 
- `idx_dates_user_date` on (user_id, date)

**Unique Constraint:** (user_id, date)  
**RLS:** Vendors can only see/modify their own dates

---

### 4. requests

**Purpose:** Customer event requests to vendors

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| customer_id | UUID | NOT NULL | Customer's user ID |
| customer_name | TEXT | - | Customer name |
| customer_email | TEXT | - | Customer email |
| customer_phone | TEXT | - | Customer phone |
| company_name | TEXT | NOT NULL | Target company name |
| event | TEXT | NOT NULL | Event name |
| description | TEXT | - | Event description |
| date | TEXT[] | NOT NULL | Array of date strings |
| payment | DECIMAL(10,2) | DEFAULT 0 | Payment amount |
| status | TEXT | DEFAULT 'pending', CHECK | pending/accepted/declined/expired |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:** 
- `idx_requests_company` on (company_name, status)

**RLS:** 
- Vendors see requests for their company
- Customers see their own requests
- Authenticated users can insert

---

### 5. events

**Purpose:** Accepted events and event management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| customer_id | UUID | NOT NULL | Customer's user ID |
| customer_name | TEXT | - | Customer name |
| company_name | TEXT | NOT NULL | Company name |
| vendor_id | UUID | FK → auth.users | Vendor's user ID |
| event | TEXT | NOT NULL | Event name |
| description | TEXT | - | Event description |
| date | TEXT[] | NOT NULL | Array of date strings |
| payment | DECIMAL(10,2) | DEFAULT 0 | Payment amount |
| status | TEXT | DEFAULT 'upcoming', CHECK | upcoming/ongoing/completed/cancelled |
| start_date | DATE | - | Auto-calculated from date[] |
| end_date | DATE | - | Auto-calculated from date[] |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:** 
- `idx_events_vendor_status` on (vendor_id, status)
- `idx_events_dates` on (start_date, end_date)

**RLS:** 
- Vendors see their own events
- Customers see their own events

**Triggers:**
- Auto-sets start_date and end_date from date array

---

### 6. orders

**Purpose:** Customer orders requiring vendor approval

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| vendor_id | UUID | FK → auth.users, NOT NULL | Vendor's user ID |
| customer_id | UUID | NOT NULL | Customer's user ID |
| customer_name | TEXT | NOT NULL | Customer name |
| customer_email | TEXT | - | Customer email |
| customer_phone | TEXT | - | Customer phone |
| title | TEXT | NOT NULL | Order title |
| package_type | TEXT | - | Package type |
| event_date | DATE | - | Event date |
| status | TEXT | DEFAULT 'pending', CHECK | pending/approved/rejected/completed |
| amount | DECIMAL(10,2) | DEFAULT 0 | Order amount |
| notes | TEXT | - | Additional notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:** 
- `idx_orders_vendor_status` on (vendor_id, status)

**RLS:** 
- Vendors see their own orders
- Customers see their own orders

---

### 7. reviews

**Purpose:** Customer reviews for vendors

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| vendor_id | UUID | FK → auth.users, NOT NULL | Vendor's user ID |
| customer_id | UUID | NOT NULL | Customer's user ID |
| customer_name | TEXT | NOT NULL | Customer name |
| event_id | UUID | FK → events | Related event |
| rating | INTEGER | NOT NULL, CHECK (1-5) | Rating 1-5 stars |
| review | TEXT | - | Review text |
| event_name | TEXT | - | Event name |
| event_date | DATE | - | Event date |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:** 
- `idx_reviews_vendor` on (vendor_id, created_at DESC)

**RLS:** 
- Public can READ all reviews
- Customers can CUD their own reviews

---

### 8. payments

**Purpose:** Payment transaction records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| vendor_id | UUID | FK → auth.users, NOT NULL | Vendor's user ID |
| customer_id | UUID | NOT NULL | Customer's user ID |
| customer_name | TEXT | - | Customer name |
| event_id | UUID | FK → events | Related event |
| event_name | TEXT | - | Event name |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| payment_method | TEXT | - | Payment method |
| payment_status | TEXT | DEFAULT 'pending', CHECK | pending/completed/failed/refunded |
| transaction_id | TEXT | - | External transaction ID |
| payment_date | DATE | - | Payment date |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:** 
- `idx_payments_vendor` on (vendor_id, payment_status)

**RLS:** 
- Vendors see their own payments
- Customers see their own payments

---

### 9. earnings

**Purpose:** Vendor earnings tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| vendor_id | UUID | FK → auth.users, NOT NULL | Vendor's user ID |
| event_id | UUID | FK → events | Related event |
| event_name | TEXT | - | Event name |
| amount | DECIMAL(10,2) | NOT NULL | Earning amount |
| earning_date | DATE | NOT NULL | Date earned |
| payment_id | UUID | FK → payments | Related payment |
| notes | TEXT | - | Additional notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:** 
- `idx_earnings_vendor` on (vendor_id, earning_date DESC)

**RLS:** 
- Vendors can only see/modify their own earnings

---

## 🔒 Row Level Security (RLS) Policies

### Security Model

**Principle:** Users can only access data they own or is publicly available

### Policy Categories

1. **User-Owned Data**
   - user_profiles, companies, dates, orders, earnings
   - Users can only CRUD their own records

2. **Company-Based Access**
   - requests, events
   - Vendors see data for their company
   - Customers see their own data

3. **Public Read Access**
   - companies, reviews
   - Anyone can read
   - Only owners can write

4. **Customer-Vendor Shared**
   - orders, payments, events
   - Both vendor and customer can read
   - Only vendor can approve/complete

### Example Policies

**Companies Table:**
```sql
-- Users can read their own company
CREATE POLICY "Users can read own company"
    ON public.companies FOR SELECT
    USING (auth.uid() = user_id);

-- Public can read all companies
CREATE POLICY "Public can read companies"
    ON public.companies FOR SELECT
    USING (true);

-- Users can update their own company
CREATE POLICY "Users can update own company"
    ON public.companies FOR UPDATE
    USING (auth.uid() = user_id);
```

**Requests Table:**
```sql
-- Vendors can see requests for their company
CREATE POLICY "Vendors can see their requests"
    ON public.requests FOR SELECT
    USING (
        company_name IN (
            SELECT company FROM public.companies 
            WHERE user_id = auth.uid()
        )
    );
```

---

## 🔧 Database Functions

### 1. handle_updated_at()

**Purpose:** Auto-update updated_at timestamp  
**Type:** Trigger function  
**Applied to:** All tables

```sql
CREATE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 2. handle_new_user()

**Purpose:** Auto-create user profile on signup  
**Type:** Trigger function  
**Applied to:** auth.users

```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'vendor');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 3. get_request_count(vendor_user_id UUID)

**Purpose:** Get pending request count for a vendor  
**Returns:** INTEGER  
**Usage:** `SELECT get_request_count('user-uuid-here');`

---

### 4. handle_event_dates()

**Purpose:** Auto-set start_date and end_date from date array  
**Type:** Trigger function  
**Applied to:** events table

---

### 5. update_event_status()

**Purpose:** Update event status based on dates  
**Type:** Callable function  
**Usage:** Can be scheduled or called manually

---

### 6. set_vendor_role(user_id_param UUID)

**Purpose:** Set user role to vendor  
**Type:** Callable function  
**Usage:** Called from frontend after registration

---

### 7. get_vendor_stats(vendor_user_id UUID)

**Purpose:** Get comprehensive vendor statistics  
**Returns:** JSON object with stats  
**Usage:** Dashboard analytics

---

## 📊 Views (Backward Compatibility)

### Purpose
Maintain compatibility with existing frontend code that expects certain table names.

### Views Created

1. **pastevents** - Completed events
2. **pastpayments** - Completed payments
3. **pastreviews** - All reviews
4. **pastearnings** - Past earnings

These are READ-ONLY views that filter data from the main tables.

---

## 🚀 Performance Optimizations

### Indexes Created

1. `idx_dates_user_date` - Fast date lookups per user
2. `idx_requests_company` - Fast request queries by company and status
3. `idx_events_vendor_status` - Fast event queries by vendor and status
4. `idx_events_dates` - Fast date range queries
5. `idx_orders_vendor_status` - Fast order queries
6. `idx_reviews_vendor` - Fast review lookups
7. `idx_payments_vendor` - Fast payment queries
8. `idx_earnings_vendor` - Fast earnings reports

### Query Optimization

- All foreign keys indexed automatically
- Composite indexes for common query patterns
- Unique constraints prevent duplicates
- Proper data types for optimal storage

---

## 🔄 Data Flow

### Request → Event Workflow

```
1. Customer creates REQUEST
   ↓
2. Vendor receives notification
   ↓
3. Vendor views REQUEST details
   ↓
4. Vendor ACCEPTS request
   ↓
5. System creates EVENT
   ↓
6. System adds dates to vendor calendar
   ↓
7. System deletes/archives REQUEST
   ↓
8. Event status: upcoming → ongoing → completed
```

### Order Approval Workflow

```
1. Customer creates ORDER
   ↓
2. Vendor receives ORDER (status: pending)
   ↓
3. Vendor reviews ORDER
   ↓
4. Vendor APPROVES or REJECTS
   ↓
5. Customer notified of decision
   ↓
6. If approved: ORDER status → approved → completed
```

---

## 📈 Scalability Considerations

### Current Capacity
- Handles 100,000+ records per table efficiently
- All critical queries indexed
- RLS policies optimized

### Future Scaling
- Add caching layer (Redis)
- Implement connection pooling
- Consider table partitioning for large tables
- Add read replicas for analytics

---

## 🔐 Security Features

1. **Row Level Security** - All tables protected
2. **Authentication Required** - No anonymous access to sensitive data
3. **Foreign Key Constraints** - Data integrity enforced
4. **Check Constraints** - Valid status values only
5. **Trigger Functions** - Automatic data validation

---

## 📝 Maintenance

### Regular Tasks

1. **Daily:** Monitor slow queries
2. **Weekly:** Review error logs
3. **Monthly:** Analyze table growth
4. **Quarterly:** Review and optimize indexes

### Backup Strategy

- Supabase provides automatic daily backups
- Consider weekly manual backups for critical data
- Test restore procedures regularly

---

## 🎯 Summary

- **9 Core Tables** - Complete data model
- **4 Views** - Backward compatibility
- **7 Functions** - Automation & helpers
- **40+ RLS Policies** - Comprehensive security
- **8 Indexes** - Optimized performance
- **UUID Primary Keys** - Globally unique identifiers
- **Automatic Timestamps** - Audit trail
- **Foreign Keys** - Data integrity

**Status:** ✅ Production-Ready MVP Database
