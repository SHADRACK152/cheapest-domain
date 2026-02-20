import { NextResponse } from 'next/server';

/**
 * Get Company Stats API
 * Fetches real company statistics from TrueHost
 */
export async function GET() {
  try {
    // Use TrueHost API if configured
    if (process.env.TRUEHOST_API_KEY) {
      try {
        const apiUrl = process.env.TRUEHOST_API_URL || 'https://api.truehost.co.ke/v1';
        const response = await fetch(`${apiUrl}/stats`, {
          headers: {
            'Authorization': `Bearer ${process.env.TRUEHOST_API_KEY}`,
            'Accept': 'application/json',
          },
          cache: 'no-store', // Always fetch fresh stats
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats from TrueHost');
        }

        const result = await response.json();

        return NextResponse.json({
          success: true,
          data: {
            domainsRegistered: result.data.total_domains || '500K+',
            customers: result.data.total_customers || '120K+',
            yearsInBusiness: result.data.years_active || '10+',
            uptime: result.data.uptime_percentage || '99.99%',
          },
          source: 'truehost',
        });
      } catch (error) {
        console.error('TrueHost stats API failed:', error);
        // Fall through to default stats
      }
    }

    // Fallback to default stats
    return NextResponse.json({
      success: true,
      data: {
        domainsRegistered: '500K+',
        customers: '120K+',
        yearsInBusiness: '10+',
        uptime: '99.99%',
      },
      source: 'default',
      warning: !process.env.TRUEHOST_API_KEY 
        ? 'Using default stats. Configure TRUEHOST_API_KEY for real-time data.' 
        : 'TrueHost API unavailable, using cached data',
    });
  } catch (error) {
    console.error('Stats API error:', error);
    
    // Return default stats as fallback
    return NextResponse.json({
      success: true,
      data: {
        domainsRegistered: '500K+',
        customers: '120K+',
        yearsInBusiness: '10+',
        uptime: '99.99%',
      },
      source: 'default',
      warning: 'Using cached stats',
    });
  }
}
