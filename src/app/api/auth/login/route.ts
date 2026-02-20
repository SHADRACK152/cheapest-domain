import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Login API Route
 * Integrates with TrueHost API for authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Use TrueHost API if configured
    if (process.env.TRUEHOST_API_KEY) {
      try {
        const apiUrl = process.env.TRUEHOST_API_URL || 'https://api.truehost.co.ke/v1';
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TRUEHOST_API_KEY}`,
          },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Invalid credentials');
        }

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set('session', result.data.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return NextResponse.json({
          success: true,
          user: {
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.name,
            phone: result.data.user.phone,
            accountType: result.data.user.account_type,
          },
        });
      } catch (error) {
        console.error('TrueHost login failed:', error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Authentication failed' },
          { status: 401 }
        );
      }
    }

    // Admin-only authentication (no user accounts allowed)
    // Admin credentials: admin@truehost.co.ke
    const ADMIN_EMAIL = 'admin@truehost.co.ke';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Change via env variable
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminData = {
        id: 'admin-1',
        email: ADMIN_EMAIL,
        name: 'Admin',
        accountType: 'business' as const,
      };
      
      // Store admin session
      const sessionData = JSON.stringify(adminData);
      const cookieStore = await cookies();
      cookieStore.set('session', Buffer.from(sessionData).toString('base64'), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({
        success: true,
        user: adminData,
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials. Only admin access is allowed.' },
      { status: 401 }
    );

    // No API configured and not in demo mode
    return NextResponse.json(
      { 
        error: 'Authentication service not configured',
        message: 'Please configure TRUEHOST_API_KEY in environment variables' 
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
