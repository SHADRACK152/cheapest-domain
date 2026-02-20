import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Get Current User API Route
 * Validates session and returns user data
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Use TrueHost API if configured
    if (process.env.TRUEHOST_API_KEY) {
      try {
        const apiUrl = process.env.TRUEHOST_API_URL || 'https://api.truehost.co.ke/v1';
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${session.value}`,
          },
        });

        if (!response.ok) {
          throw new Error('Session invalid');
        }

        const result = await response.json();

        return NextResponse.json({
          success: true,
          user: {
            id: result.data.id,
            email: result.data.email,
            name: result.data.name,
            phone: result.data.phone,
            accountType: result.data.account_type,
          },
        });
      } catch (error) {
        console.error('TrueHost me endpoint failed:', error);
        // Clear invalid session
        cookieStore.delete('session');
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }
    }

    // Demo mode - for development without API
    if (process.env.NODE_ENV === 'development') {
      try {
        // Decode user data from session
        const userData = JSON.parse(Buffer.from(session.value, 'base64').toString('utf-8'));
        return NextResponse.json({
          success: true,
          user: userData,
        });
      } catch (decodeError) {
        console.error('Failed to decode session:', decodeError);
        // Fallback to default demo user
        return NextResponse.json({
          success: true,
          user: {
            id: 'demo-user-id',
            email: 'demo@example.com',
            name: 'Demo User',
            accountType: 'personal',
          },
        });
      }
    }

    // No valid session
    cookieStore.delete('session');
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
