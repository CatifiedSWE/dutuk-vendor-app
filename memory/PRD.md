# Dutuk - Event Vendor Management App PRD

## Original Problem Statement
Fix issues in the onboarding page:
1. Database schema mismatch - field name was wrong
2. Location examples should show Tamil Nadu cities instead of foreign ones

## Architecture
- **Platform**: React Native (Expo v54.0.21)
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Navigation**: Expo Router

## Core Requirements (Static)
- Event vendor management for photographers, caterers, decorators
- Company profile management with onboarding flow
- Event creation and management
- Customer request handling
- Calendar integration

## User Personas
- Event service vendors (photographers, videographers, caterers, decorators)
- Event management companies
- Freelance event professionals

## What's Been Implemented
### 2025-01-26
- **Bug Fix**: Fixed OnboardingLocation.tsx to use correct database field `service_area` instead of `location`
- **Enhancement**: Updated POPULAR_REGIONS array with Tamil Nadu cities:
  - Chennai, Tamil Nadu
  - Coimbatore, Tamil Nadu
  - Madurai, Tamil Nadu
  - Tiruchirappalli, Tamil Nadu
  - Salem, Tamil Nadu
  - Tirunelveli, Tamil Nadu

## Files Modified
- `/app/app/auth/OnboardingLocation.tsx`

## Prioritized Backlog
### P0 (Critical)
- None

### P1 (High Priority)
- None identified

### P2 (Nice to Have)
- Dark mode support
- Multi-language support
- Analytics dashboard

## Next Tasks
- Complete onboarding flow verification with actual Supabase database
- Test full vendor registration and profile setup flow
