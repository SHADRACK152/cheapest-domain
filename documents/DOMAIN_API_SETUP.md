````markdown
# Domain API Integration Guide

## Setup Instructions

### Option 1: Namecheap API (Recommended)

1. **Create Namecheap Account**
   - Sign up at https://namecheap.com
   - Enable API access in your account settings
   - Add $50+ to your account balance for production

2. **Get Sandbox Credentials** (for testing)
   - Visit https://www.namecheap.com/support/api/intro/
   - Enable sandbox mode
   - Get your API key and username

3. **Configure Environment Variables**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Add Your Credentials to .env.local**
   ```env
   NAMECHEAP_API_KEY=your_api_key_here
   NAMECHEAP_API_USER=your_username_here
   NAMECHEAP_CLIENT_IP=your_ip_address_here
   NAMECHEAP_API_URL=https://api.sandbox.namecheap.com/xml.response
   ```

5. **Whitelist Your IP Address**
   - In Namecheap account, go to API settings
   - Add your server's IP address to the whitelist
   - For local development, add your public IP

### Option 2: RapidAPI Domain Services

1. **Sign Up for RapidAPI**
   - Visit https://rapidapi.com
   - Create free account

2. **Subscribe to Domain API**
   - Search for "Domain Availability" APIs
   - Popular options:
     - Domain Availability Checker
     - Whois API
     - Domain Search

3. **Update domain-api.ts**
   - Replace Namecheap implementation with RapidAPI calls
   - Example:
   ```typescript
   const response = await fetch('https://domain-availability.p.rapidapi.com/check', {
     headers: {
       'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
       'X-RapidAPI-Host': 'domain-availability.p.rapidapi.com'
     }
   });
   ```

### Option 3: WHOIS Lookup (Free, Limited)

1. **Get Free WHOIS API Key**
   - Visit https://whoisxmlapi.com
   - Sign up for free tier (500 requests/month)

2. **Add to .env.local**
   ```env
   WHOIS_API_KEY=your_whois_key_here
   ```

3. **Use WHOIS implementation**
   - Already included in domain-api.ts
   - Limited rate (slower than paid APIs)

## Testing

### With Mock Data (No API Key)
The app automatically falls back to mock data if no API keys are configured.

### With Real API
1. Add API credentials to `.env.local`
2. Restart development server: `npm run dev`
3. Search for a domain - you'll see real availability data

## API Comparison

| Service | Cost | Rate Limit | Features |
|---------|------|------------|----------|
| **Namecheap** | Free sandbox, $0.01-0.05/query prod | High | Full availability, pricing |
| **RapidAPI** | $0-50/month | Varies | Multiple providers |
| **WHOIS** | Free-$50/month | 500-10k/month | Basic availability |

## Production Considerations

1. **Caching**: Implement Redis/Vercel KV to cache results (24h TTL)
2. **Rate Limiting**: Add rate limiting to prevent API abuse
3. **Error Handling**: Always fallback to mock data on API failures
4. **Monitoring**: Track API usage and costs
5. **IP Whitelisting**: Configure production server IPs in Namecheap

## Cost Optimization

```typescript
// Add caching in route.ts
import { kv } from '@vercel/kv';

export async function GET(request: NextRequest) {
  const query = searchParams.get('q');
  
  // Check cache first
  const cached = await kv.get(`domain:${query}`);
  if (cached) return NextResponse.json(cached);
  
  // Call API
  const results = await searchDomain(query);
  
  // Cache for 24 hours
  await kv.set(`domain:${query}`, results, { ex: 86400 });
  
  return NextResponse.json(results);
}
```

## Next Steps

1. Choose your API provider
2. Get API credentials
3. Update `.env.local`
4. Test with real searches
5. Implement caching for production
6. Monitor usage and costs
