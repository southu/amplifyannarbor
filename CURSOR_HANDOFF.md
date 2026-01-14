# Amplify Ann Arbor - Cursor Session Handoff

> **IMPORTANT**: Update this file at the end of each session so the next session can pick up where you left off.

---

## Last Updated
**Date**: January 14, 2026  
**Session**: Desktop (Jason's main computer)

---

## Project Overview

Amplify Ann Arbor is a charity concert website supporting Ann Arbor Meals on Wheels. Rebuilt from WordPress to a modern stack.

### Tech Stack
- **Frontend**: Next.js 15.5.2, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe (donations)
- **Commerce**: Shopify Storefront API + Printful (print-on-demand merch)
- **Hosting**: Cloudflare Pages
- **Repo**: https://github.com/southu/amplifyannarbor

### Live Site
- **Staging**: https://amplifyannarbor.pages.dev
- **Production**: https://amplifyannarbor.com (domain to be connected)

---

## Current Status

### ✅ Completed
1. **Core Setup** - Next.js project with Tailwind, TypeScript
2. **All Pages Built** - Home, About, Events, Sponsors, Gallery, Blog, Merch, Donate, Admin
3. **Cloudflare Pages Deployment** - Working with edge runtime
4. **Supabase Integration** - Database schema created, storage configured
5. **Photo Gallery** - 59 photos from 2025 event uploaded to Supabase Storage with SEO-optimized filenames
6. **Shopify/Printful Merch Store** - Connected to Shopify Storefront API, 4 products synced from Printful
7. **Stripe Donations** - Checkout flow ready (needs webhook testing in production)

### 🔄 In Progress
- None currently

### 📋 TODO / Not Yet Done
1. **Connect custom domain** - amplifyannarbor.com needs to be connected in Cloudflare Pages
2. **Test Stripe webhooks** - Need to verify webhooks work in production
3. **Admin authentication** - Login page exists but auth flow not fully implemented
4. **Blog content** - Using placeholder content, needs real posts
5. **Sponsors page** - Using placeholder data, needs real sponsor info
6. **Events page** - Using placeholder data for 2026 event
7. **Contact form** - Not yet implemented
8. **Email notifications** - Ticket QR codes, donation receipts not set up

---

## Environment Variables

The `.env` file contains (DO NOT commit actual values):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
NEXT_PUBLIC_SITE_URL=https://amplifyannarbor.com
```

These are also set in Cloudflare Pages environment variables.

---

## Key Files & Architecture

### API Routes (Edge Runtime)
- `/app/api/create-checkout/route.ts` - Stripe donation checkout
- `/app/api/webhooks/stripe/route.ts` - Stripe webhook handler
- `/app/api/shopify-checkout/route.ts` - Shopify cart checkout

### Data Fetching
- `/lib/supabase.ts` - Supabase client
- `/lib/shopify.ts` - Shopify Storefront API client
- `/lib/stripe.ts` - Stripe server client

### Dynamic Routes
- `/app/gallery/page.tsx` - Fetches from Supabase `photo_gallery` table
- `/app/merch/page.tsx` - Fetches products from Shopify
- `/app/merch/[handle]/page.tsx` - Individual product pages from Shopify
- `/app/blog/[slug]/page.tsx` - Blog posts (currently static data)

### Database Schema
Located in `/supabase/schema.sql` - includes tables for:
- events, blog_posts, sponsors, photo_gallery, donations, tickets, contact_messages

---

## Deployment

### Build Commands
```bash
npm run build          # Standard Next.js build
npm run pages:build    # Cloudflare Pages build
```

### Cloudflare Pages Settings
- Build command: `npm run pages:build`
- Output directory: `.vercel/output/static`

---

## Recent Changes (for context)

1. Downgraded to Next.js 15.5.2 for Cloudflare Pages compatibility
2. Added edge runtime to all dynamic routes
3. Uploaded 59 event photos (compressed from 2.3GB to 37MB)
4. Connected Shopify Storefront API for merch

---

## Notes for Next Session

- If adding new dynamic routes that fetch data, add `export const runtime = "edge";`
- Photos are in Supabase Storage bucket "gallery" under /2025/ folder
- The `photos-2025/` folder is in .gitignore (photos stored in Supabase, not git)
- Printful products auto-sync to Shopify, which auto-reflects on the site

---

## Session Log

### Session 1 - Jan 14, 2026 (Desktop)
- Initial project setup and full site build
- Deployed to Cloudflare Pages
- Set up Supabase, Stripe, Shopify integrations
- Uploaded 2025 event photos to gallery
- Connected Printful/Shopify merch store

*Add new session entries below:*

### Session 2 - [DATE] ([DEVICE])
- [What was worked on]
- [What was completed]
- [Any issues encountered]


