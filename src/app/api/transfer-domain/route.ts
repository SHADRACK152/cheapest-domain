import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, authCode } = body;

    if (!domain || !authCode) {
      return NextResponse.json(
        { error: 'Missing required fields "domain" and "authCode"' },
        { status: 400 }
      );
    }

    // Simulate auth code validation
    if (authCode.length < 4) {
      return NextResponse.json(
        { error: 'Invalid authorization code' },
        { status: 400 }
      );
    }

    // Use TrueHost API if configured
    if (process.env.TRUEHOST_API_KEY) {
      try {
        const apiUrl = process.env.TRUEHOST_API_URL || 'https://api.truehost.co.ke/v1';
        const response = await fetch(`${apiUrl}/domains/transfer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TRUEHOST_API_KEY}`,
          },
          body: JSON.stringify({ domain, authCode }),
        });

        const result = await response.json();
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            message: `Transfer initiated for ${domain} via TrueHost`,
            data: {
              domain,
              transferId: result.data?.transfer_id || `TRF-${Date.now()}`,
              status: 'pending',
              estimatedCompletion: result.data?.estimated_completion || '5-7 business days',
              initiatedAt: new Date().toISOString(),
              provider: 'TrueHost',
            },
          });
        } else {
          throw new Error(result.message || 'Transfer initiation failed');
        }
      } catch (error) {
        console.error('TrueHost transfer failed:', error);
        return NextResponse.json(
          { 
            error: 'Domain transfer failed', 
            message: error instanceof Error ? error.message : 'Unknown error' 
          },
          { status: 500 }
        );
      }
    }

    // No API configured - return error
    return NextResponse.json(
      { 
        error: 'API not configured',
        message: 'Domain transfer requires TrueHost API credentials. Please contact administrator.' 
      },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
