# Authentication System Documentation

## Overview

This authentication system provides comprehensive user authentication for the Dutuk Vendor Management app using Supabase OAuth. It handles user registration, login, email verification, Google OAuth, and automatic vendor role assignment.

## Architecture

### Database Schema
- **auth.users** (Supabase Auth) - Core authentication managed by Supabase
- **user_profiles** - Extended user information with role management

### User Flow

```
Registration → Email Verification → Vendor Role Assignment → Login
```

## Core Features

### ✅ User Registration (`useRegisterUser.ts`)
- Email/password registration
- Automatic email validation
- Password strength validation (minimum 6 characters)
- Duplicate account detection
- OTP-based email verification
- Auto-login after successful verification
- Automatic vendor role assignment

### ✅ User Login (`useLoginUser.ts`)
- Email/password authentication
- Comprehensive error handling
- Email verification status checking
- User profile validation
- Session management

### ✅ Email Verification (`useVerifyOTP.ts`)
- OTP verification via email
- Automatic vendor role assignment on first verification
- Expired/invalid code handling
- Auto-navigation to app on success

### ✅ Google OAuth (`useGoogleAuth.ts`)
- Google sign-in integration
- PKCE flow for enhanced security
- New user detection
- Automatic vendor role assignment for new users
- Session establishment

### ✅ Vendor Role Management (`setVendorAsRoleOnRegister.ts`)
- Checks if user profile exists
- Creates profile with 'vendor' role if needed
- Idempotent - safe to call multiple times
- Only assigns vendor role from this app

## Hook Usage

### Registration Example

```typescript
import registerUser from '@/hooks/useRegisterUser';

const handleRegister = async () => {
  try {
    await registerUser('user@example.com', 'securePassword123');
    // User will be redirected to OTP page automatically
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Login Example

```typescript
import loginUser from '@/hooks/useLoginUser';

const handleLogin = async () => {
  try {
    await loginUser('user@example.com', 'securePassword123');
    // User will be redirected to app on success
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### OTP Verification Example

```typescript
import verifyOTP from '@/hooks/useVerifyOTP';

const handleVerifyOTP = async () => {
  try {
    await verifyOTP('user@example.com', '123456', '/(tabs)');
    // User will be redirected to tabs on success
  } catch (error) {
    console.error('Verification failed:', error);
  }
};
```

### Google OAuth Example

```typescript
import googleLogin from '@/hooks/useGoogleAuth';

const handleGoogleLogin = async () => {
  try {
    await googleLogin();
    // User will go through Google auth flow
  } catch (error) {
    console.error('Google login failed:', error);
  }
};
```

### Authentication State Hook

```typescript
import useAuthenticationState from '@/hooks/useAuthenticationState';

const MyComponent = () => {
  const { user, loading, error, isAuthenticated, userRole } = useAuthenticationState();

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!isAuthenticated) return <LoginScreen />;

  return <AppContent user={user} role={userRole} />;
};
```

## Helper Utilities

### Email Validation

```typescript
import { isValidEmail } from '@/hooks/authHelpers';

if (isValidEmail('test@example.com')) {
  // Email is valid
}
```

### Password Validation

```typescript
import { validatePassword } from '@/hooks/authHelpers';

const result = validatePassword('myPassword');
if (result.valid) {
  // Password meets requirements
} else {
  console.log(result.message);
}
```

### Form Validation

```typescript
import { validateRegistrationForm } from '@/hooks/authHelpers';

const validation = validateRegistrationForm(email, password, confirmPassword);
if (!validation.valid) {
  console.log(validation.errors); // Array of error messages
}
```

### Error Parsing

```typescript
import { parseAuthError } from '@/hooks/authHelpers';

try {
  await someAuthFunction();
} catch (error) {
  const userFriendlyMessage = parseAuthError(error);
  Toast.show({ text1: userFriendlyMessage });
}
```

## Security Features

1. **Password Requirements**
   - Minimum 6 characters (enforced by Supabase)
   - Can be extended with custom validation

2. **Email Verification**
   - OTP sent to email
   - Prevents unverified accounts from accessing app

3. **Role-Based Access**
   - Automatic vendor role assignment
   - Only from this app registration
   - Row-level security in database

4. **PKCE Flow**
   - Used for OAuth (Google)
   - Enhanced security for mobile apps

5. **Session Management**
   - Automatic token refresh
   - Persistent sessions via AsyncStorage
   - Secure session exchange

## Database Triggers

The system relies on these Supabase database functions:

### `handle_new_user()`
- Automatically creates `user_profiles` entry when user signs up
- Sets default role to 'vendor'
- Triggered on `auth.users` INSERT

### `set_vendor_role(user_id_param UUID)`
- Callable function to set vendor role
- Can be invoked from client if needed

## Error Handling

All authentication hooks provide comprehensive error handling:

- **User-friendly messages** via Toast notifications
- **Specific error cases** handled individually
- **Logging** for debugging
- **Graceful fallbacks** when operations fail

### Common Error Cases

| Error | User Message | Action |
|-------|--------------|--------|
| User already exists | "Account already exists..." | Redirect to login |
| Invalid credentials | "Incorrect email or password..." | Allow retry |
| Email not verified | "Please verify your email..." | Redirect to OTP |
| Rate limit exceeded | "Too many attempts..." | Wait before retry |
| Network error | "Please check connection..." | Allow retry |

## TypeScript Types

### AuthState Interface

```typescript
interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
}
```

### ValidationResult Interface

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

## Best Practices

1. **Always validate input** before calling auth functions
2. **Use helper utilities** for validation and error parsing
3. **Handle loading states** to prevent multiple submissions
4. **Show user-friendly errors** instead of technical messages
5. **Log errors** for debugging but don't expose sensitive info
6. **Call setRole()** after successful authentication for new users
7. **Check authentication state** before accessing protected resources

## Testing

### Manual Testing Checklist

- [ ] Register new user with valid email/password
- [ ] Verify OTP code works correctly
- [ ] Login with registered user
- [ ] Try login with wrong password
- [ ] Try registering with existing email
- [ ] Test Google OAuth flow
- [ ] Verify vendor role is assigned
- [ ] Check user profile in database
- [ ] Test email verification requirement
- [ ] Test rate limiting (too many attempts)

### Edge Cases to Test

- [ ] Registration with invalid email format
- [ ] Password too short (< 6 characters)
- [ ] Expired OTP code
- [ ] Network interruption during auth
- [ ] Google OAuth cancellation
- [ ] Session expiration
- [ ] Multiple simultaneous login attempts

## Troubleshooting

### Issue: User can't log in after registration
**Solution:** Check if email verification is required. User may need to verify email first.

### Issue: Vendor role not assigned
**Solution:** Check database triggers are enabled. Manually call `setRole()` function.

### Issue: Google OAuth not working
**Solution:** Verify OAuth redirect URLs in Supabase dashboard match app configuration.

### Issue: OTP not received
**Solution:** Check spam folder. Verify email service is configured in Supabase.

### Issue: "User already registered" but can't login
**Solution:** User may have unverified email. Direct them to OTP verification page.

## Configuration

### Supabase Setup

1. Enable Email authentication in Supabase dashboard
2. Configure Google OAuth provider
3. Set up email templates for OTP
4. Add database triggers (`handle_new_user`)
5. Configure RLS policies on `user_profiles`

### Environment Variables

Located in `/app/utils/supabase.ts`:
- `supabaseUrl` - Your Supabase project URL
- `supabaseAnonKey` - Your Supabase anonymous key

## Future Enhancements

- [ ] Multi-factor authentication (MFA)
- [ ] Biometric authentication
- [ ] Social login (Facebook, Apple)
- [ ] Password reset via email
- [ ] Account deletion
- [ ] Session management UI
- [ ] Login history tracking
- [ ] Suspicious activity detection

## Support

For issues or questions:
1. Check this documentation first
2. Review Supabase Auth documentation
3. Check application logs for error details
4. Contact development team

---

**Last Updated:** 2025
**Version:** 1.0.0
**Maintained by:** Dutuk Development Team
