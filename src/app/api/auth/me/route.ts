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

    // Always try to decode as a local base64 JSON session first.
    // This covers the admin account which is stored locally regardless of
    // whether TRUEHOST_API_KEY is configured.
    try {
      const userData = JSON.parse(Buffer.from(session.value, 'base64').toString('utf-8'));
      if (userData && userData.id && userData.email) {
        return NextResponse.json({ success: true, user: userData });
      }
    } catch {
      // Not a local session token — fall through to TrueHost API
    }

    // Use TrueHost API if configured (for users authenticated via TrueHost)
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
        cookieStore.delete('session');
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }
    }

    // No valid session could be decoded
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
