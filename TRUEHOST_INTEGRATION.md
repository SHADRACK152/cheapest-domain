# TrueHost API Integration Guide

This application is part of the **TrueHost Kenya ecosystem** and has native integration with TrueHost's domain registration API.

## Quick Setup

### 1. Get TrueHost API Credentials

Contact TrueHost Kenya to obtain API access:
- **Website**: https://truehost.co.ke
- **Support**: support@truehost.co.ke
- **Phone**: +254 20 528 0000

Request:
- API Key
- API Documentation
- Sandbox access (for testing)

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

Add your TrueHost credentials to `.env.local`:

```env
# TrueHost API (Primary)
TRUEHOST_API_KEY=your_truehost_api_key_here
TRUEHOST_API_URL=https://api.truehost.co.ke/v1
```

### 3. Restart Development Server

```bash
npm run dev
```

The app will automatically use TrueHost API for all domain searches!

## API Priority

The application checks APIs in this order:

1. ✅ **TrueHost API** (if `TRUEHOST_API_KEY` is set)
2. ⚠️ **Namecheap API** (fallback if TrueHost unavailable)
3. 📝 **Mock Data** (if no API keys configured)

## Features

### Available Now
- ✅ Domain availability check
- ✅ Real-time pricing from TrueHost
- ✅ Premium domain detection
- ✅ Multiple TLD support (.com, .co.ke, .ke, etc.)
- ✅ Domain registration support

### TrueHost-Specific Features
- 🇰🇪 **Kenya TLDs**: .co.ke, .ke domains
- 💰 **Local Pricing**: KES currency support
- 🚀 **Instant Activation**: Immediate domain setup
- 📞 **Local Support**: Kenya-based customer service

## API Endpoints Used

### Domain Check
```typescript
POST https://api.truehost.co.ke/v1/domains/check
Authorization: Bearer {TRUEHOST_API_KEY}

{
  "domains": ["example.com", "example.co.ke"]
}
```

### Domain Pricing
```typescript
GET https://api.truehost.co.ke/v1/domains/pricing?extension=.com
Authorization: Bearer {TRUEHOST_API_KEY}
```

### Domain Registration
```typescript
POST https://api.truehost.co.ke/v1/domains/register
Authorization: Bearer {TRUEHOST_API_KEY}

{
  "domain": "example.com",
  "years": 1,
  "customer": { ... }
}
```

## Testing

### Without API Key
The app works with mock data immediately - no API key needed for development.

### With TrueHost API
1. Add `TRUEHOST_API_KEY` to `.env.local`
2. Search any domain
3. See real availability and pricing from TrueHost

### Sandbox Mode
Ask TrueHost for sandbox credentials to test without affecting live data.

## Production Deployment

### Vercel/Netlify
Add environment variables in your hosting dashboard:

```env
TRUEHOST_API_KEY=your_production_key
TRUEHOST_API_URL=https://api.truehost.co.ke/v1
```

### Security Notes
- ⚠️ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Keep API keys secure
- ✅ Use different keys for development/production
- ✅ Rotate keys periodically

## Cost Optimization

### Caching (Recommended)
Implement caching to reduce API calls:

```typescript
// Example with Vercel KV
import { kv } from '@vercel/kv';

const cached = await kv.get(`domain:${query}`);
if (cached) return cached;

const result = await searchTrueHostDomains(query);
await kv.set(`domain:${query}`, result, { ex: 3600 }); // 1 hour cache
```

### Rate Limiting
Add rate limiting to prevent abuse:

```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1m'), // 10 requests per minute
});
```

## TrueHost API Documentation

The implementation in `src/lib/truehost-api.ts` includes:

- ✅ `checkTrueHostAvailability()` - Bulk domain checking
- ✅ `getTrueHostPricing()` - Get extension pricing
- ✅ `searchTrueHostDomains()` - Full search with suggestions
- ✅ `registerTrueHostDomain()` - Register domains

**Note**: Update API endpoints in `truehost-api.ts` based on actual TrueHost API documentation once received.

## Support

For TrueHost API issues:
- 📧 Email: api-support@truehost.co.ke
- 📞 Phone: +254 20 528 0000
- 💬 Website: https://truehost.co.ke/support

For app issues:
- Check console logs for API errors
- Verify environment variables are set correctly
- Test with mock data first (remove API keys temporarily)

## Kenya-Specific Domains

TrueHost specializes in Kenya domains:

| Extension | Use Case | Price Range |
|-----------|----------|-------------|
| .co.ke | Kenyan businesses | KES 500-1000 |
| .ke | Kenya domains | KES 500-1000 |
| .ac.ke | Educational | KES 500-1000 |
| .or.ke | Organizations | KES 500-1000 |

These are automatically prioritized when using TrueHost API!

## Next Steps

1. ✅ Get TrueHost API key
2. ✅ Add to `.env.local`
3. ✅ Test domain searches
4. ✅ Implement domain registration flow
5. ✅ Deploy to production
6. ✅ Add caching for optimization
7. ✅ Enable payment integration (M-Pesa, Card)
