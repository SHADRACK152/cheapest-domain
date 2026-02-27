# Deploying Cheapest Domain App to Vercel

## 1. Prerequisites
- Ensure your project is a Next.js app (already set up)
- All environment variables are in `.env.local` (move sensitive keys to Vercel dashboard)

## 2. Prepare for Deployment
- Remove hardcoded URLs in `.env.local` (use `NEXT_PUBLIC_SITE_URL` for production)
- Add any secrets (API keys, DB credentials) to Vercel's Environment Variables

## 3. Static Assets
- Ensure all files in `/public` are accessible
- For uploads, use external storage (Vercel does not persist uploads)

## 4. Build & Test Locally
- Run `npm run build` and `npm start` to verify production build

## 5. Deploy to Vercel
- Push your code to GitHub/GitLab/Bitbucket
- Connect your repo to Vercel (https://vercel.com/import)
- Set environment variables in Vercel dashboard
- Deploy

## 6. Post-Deployment
- Update DNS records or domain settings to point to Vercel
- Test your site on the Vercel URL

## 7. Troubleshooting
- Check Vercel build logs for errors
- Use Vercel's support/docs for help

---

For custom domains, static uploads, or API integrations, see Vercel docs: https://vercel.com/docs
