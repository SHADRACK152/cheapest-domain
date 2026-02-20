import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, years = 1, idProtection = false, customer } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Missing required field "domain"' },
        { status: 400 }
      );
    }

    // Use TrueHost API if configured
    if (process.env.TRUEHOST_API_KEY && customer) {
      try {
        const { registerTrueHostDomain } = await import('@/lib/truehost-api');
        const result = await registerTrueHostDomain(domain, years, customer);
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            message: `Domain ${domain} registered successfully via TrueHost!`,
            data: {
              domain,
              years,
              orderId: result.orderId,
              registrationDate: new Date().toISOString(),
              expirationDate: new Date(
                Date.now() + years * 365 * 24 * 60 * 60 * 1000
              ).toISOString(),
              status: 'active',
              provider: 'TrueHost',
            },
          });
        }
      } catch (error) {
        console.error('TrueHost registration failed:', error);
        return NextResponse.json(
          { 
            error: 'Domain registration failed', 
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
        message: 'Domain registration requires TrueHost API credentials. Please contact administrator.' 
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
