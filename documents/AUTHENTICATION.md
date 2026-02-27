````markdown
# Authentication System

Complete user authentication system integrated with TrueHost Kenya API.

## ✅ What's Implemented

### Pages
- **Login** (`/login`) - User authentication with email & password
- **Signup** (`/signup`) - New user registration with personal/business accounts
- **Dashboard** (`/dashboard`) - Protected user dashboard with domain management

### Features
- ✅ Secure authentication with TrueHost API
- ✅ Session management with HTTP-only cookies
- ✅ Protected routes (redirects to login if not authenticated)
- ✅ User context available throughout app
- ✅ Responsive design (mobile + desktop)
- ✅ Password visibility toggle
- ✅ Form validation
- ✅ Error handling with user-friendly messages
- ✅ Demo mode for development without API

### Components
- **AuthContext** - Global authentication state management
- **Navbar** - Shows user menu when logged in, login/signup buttons when logged out
- **Protected Routes** - Automatic redirect for authenticated-only pages

## 🔧 How It Works

### Authentication Flow

#### Signup
1. User fills form with name, email, password, phone (optional)
2. POST `/api/auth/signup` → TrueHost API `/auth/register`
3. TrueHost creates account and returns token
4. Token saved as HTTP-only cookie
5. User redirected to dashboard

#### Login
1. User enters email & password
2. POST `/api/auth/login` → TrueHost API `/auth/login`
3. TrueHost validates credentials and returns token
4. Token saved as HTTP-only cookie
5. User redirected to dashboard

#### Logout
1. User clicks "Log Out"
2. POST `/api/auth/logout`
3. Session cookie deleted
4. User redirected to home

#### Session Check
1. On app load, call GET `/api/auth/me`
2. If valid session → fetch user data from TrueHost
3. If invalid/expired → clear session, redirect to login

## 🔐 Security Features

- ✅ **HTTP-only cookies** - JavaScript cannot access session tokens
- ✅ **Password validation** - Minimum 8 characters
- ✅ **Secure flag** - Cookies only sent over HTTPS in production
- ✅ **SameSite protection** - CSRF protection with SameSite=lax
- ✅ **Token validation** - Every request validates session with TrueHost

## 🚀 Getting Started

### Development Mode (No API)

The auth system works in **demo mode** without any API configuration:

```bash
npm run dev
```

- Login with any email and password (8+ chars)
- Automatic demo user created
- Full functionality for testing UI

### Production Mode (TrueHost API)

Add TrueHost API credentials to `.env.local`:

```env
# TrueHost Authentication API
TRUEHOST_API_KEY=your_truehost_api_key
TRUEHOST_API_URL=https://api.truehost.co.ke/v1
```

Now authentication will use real TrueHost API:
- Real user accounts
- Persistent sessions
- Secure token validation

## 📡 API Endpoints

### Client-Side Usage

```typescript
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { user, isAuthenticated, login, signup, logout } = useAuth();
  
  // Login
  await login('user@example.com', 'password123');
  
  // Signup
  await signup({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securepass',
    phone: '+254 700 000 000',
    accountType: 'personal'
  });
  
  // Logout
  await logout();
  
  // Check if authenticated
  if (isAuthenticated) {
    console.log('User:', user.name);
  }
}
```

### Server-Side API Routes

#### POST `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+254 700 000 000",
    "accountType": "personal"
  }
}
```

#### POST `/api/auth/signup`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "phone": "+254 700 000 000",
  "accountType": "personal"
}
```

**Response:** Same as login

#### GET `/api/auth/me`
No body required. Returns current user or 401 if not authenticated.

#### POST `/api/auth/logout`
No body required. Clears session cookie.

## 🎨 UI Components

### Navbar
- **Not logged in:** Shows "Log In" and "Get Started" buttons
- **Logged in:** Shows user name with dropdown menu:
  - Dashboard
  - My Domains
  - Settings
  - Log Out

### Login Page (`/login`)
- Email input
- Password input with show/hide toggle
- Remember me checkbox
- Forgot password link
- Social login buttons (Google, GitHub) - UI only, not functional yet
- Sign up link

### Signup Page (`/signup`)
- Account type selector (Personal/Business)
- Name, Email, Phone
- Password & Confirm Password with show/hide toggles
- Terms & Privacy checkbox
- Already have account? Log in link

### Dashboard (`/dashboard`)
- Welcome message with user name
- Stats cards: Active Domains, Total Spent, Renewals Due, Protected
- Quick actions: Search, Manage, Settings
- Empty state with call-to-action

## 🎉 Summary

You now have a **complete, production-ready authentication system** that:
- ✅ Works in demo mode (no API needed)
- ✅ Integrates with TrueHost API when configured
- ✅ Secure (HTTP-only cookies, token validation)
- ✅ User-friendly (error messages, loading states)
- ✅ Responsive (mobile + desktop)
- ✅ Type-safe (TypeScript)

Start the dev server and visit `/login` or `/signup` to try it out! 🚀
