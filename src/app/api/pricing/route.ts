import { NextResponse } from 'next/server';
import { DOMAIN_EXTENSIONS } from '@/lib/constants';

/**
 * Get Domain Pricing API
 * Fetches real-time domain pricing from TrueHost
 */
export async function GET() {
  try {
    // Use TrueHost API if configured
    if (process.env.TRUEHOST_API_KEY) {
      try {
        const apiUrl = process.env.TRUEHOST_API_URL || 'https://api.truehost.co.ke/v1';
        const response = await fetch(`${apiUrl}/domains/pricing`, {
          headers: {
            'Authorization': `Bearer ${process.env.TRUEHOST_API_KEY}`,
            'Accept': 'application/json',
          },
          cache: 'no-store', // Always fetch fresh pricing
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pricing from TrueHost');
        }

        const result = await response.json();

        // Transform TrueHost pricing data to our format
        const pricing = result.data.map((item: any) => ({
          extension: item.extension,
          price: parseFloat(item.registration_price),
          renewPrice: parseFloat(item.renewal_price),
          popular: item.is_popular || false,
          description: item.description || '',
        }));

        return NextResponse.json({
          success: true,
          data: pricing,
          source: 'truehost',
        });
      } catch (error) {
        console.error('TrueHost pricing API failed:', error);
        // Fall through to local pricing with warning
      }
    }

    // Fallback to local constants if API not configured or failed
    // But try to fetch individual extension pricing
    const pricingWithRealData = await Promise.all(
      DOMAIN_EXTENSIONS.map(async (ext) => {
        if (process.env.TRUEHOST_API_KEY) {
          try {
            const apiUrl = process.env.TRUEHOST_API_URL || 'https://api.truehost.co.ke/v1';
            const response = await fetch(
              `${apiUrl}/domains/pricing/${encodeURIComponent(ext.extension)}`,
              {
                headers: {
                  'Authorization': `Bearer ${process.env.TRUEHOST_API_KEY}`,
                },
              }
            );

            if (response.ok) {
              const result = await response.json();
              return {
                ...ext,
                price: parseFloat(result.data.registration_price) || ext.price,
                renewPrice: parseFloat(result.data.renewal_price) || ext.renewPrice,
              };
            }
          } catch (err) {
            // Use local pricing on error
          }
        }
        return ext;
      })
    );

    return NextResponse.json({
      success: true,
      data: pricingWithRealData,
      source: process.env.TRUEHOST_API_KEY ? 'truehost-partial' : 'local',
      warning: !process.env.TRUEHOST_API_KEY 
        ? 'Using local pricing. Configure TRUEHOST_API_KEY for real-time pricing.' 
        : undefined,
    });
  } catch (error) {
    console.error('Pricing API error:', error);
    
    // Return local pricing as fallback
    return NextResponse.json({
      success: true,
      data: DOMAIN_EXTENSIONS,
      source: 'local',
      warning: 'Using cached pricing',
    });
  }
}
