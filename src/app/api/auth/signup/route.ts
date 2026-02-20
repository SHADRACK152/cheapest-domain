import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Signup API Route
 * Integrates with TrueHost API for user registration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, accountType } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Use TrueHost API if configured
    if (process.env.TRUEHOST_API_KEY) {
      try {
        const apiUrl = process.env.TRUEHOST_API_URL || 'https://api.truehost.co.ke/v1';
        const response = await fetch(`${apiUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TRUEHOST_API_KEY}`,
          },
          body: JSON.stringify({
            name,
            email,
            password,
            phone,
            account_type: accountType,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Registration failed');
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
        console.error('TrueHost signup failed:', error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Registration failed' },
          { status: 400 }
        );
      }
    }

    // Demo mode - for development without API
    if (process.env.NODE_ENV === 'development') {
      const userId = 'demo-user-' + Date.now();
      const userData = {
        id: userId,
        email: email,
        name: name,
        phone: phone,
        accountType: accountType || 'personal',
      };
      
      // Store user data in session
      const sessionData = JSON.stringify(userData);
      const cookieStore = await cookies();
      cookieStore.set('session', Buffer.from(sessionData).toString('base64'), {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        user: userData,
      });
    }

    // No API configured and not in demo mode
    return NextResponse.json(
      { 
        error: 'Authentication service not configured',
        message: 'Please configure TRUEHOST_API_KEY in environment variables' 
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
