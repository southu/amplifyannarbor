# Amplify Ann Arbor - Cursor Session Handoff

> **IMPORTANT**: Update this file at the end of each session so the next session can pick up where you left off.

---

## Last Updated
**Date**: January 14, 2026  
**Session**: Desktop (Jason's main computer) - Session 2

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
6. **Shopify/Printful Merch Store** - Connected via tokenless Storefront API, 4 products synced
7. **Stripe Donations** - Checkout flow working with fetch-based API (edge-compatible)
8. **Blog Admin CMS** - Full admin with AI-powered content generation using GPT-5.2

### 🔄 In Progress
- None currently

### 📋 TODO / Not Yet Done
1. **Connect custom domain** - amplifyannarbor.com needs to be connected in Cloudflare Pages
2. **Test Stripe webhooks** - Need to verify webhooks work in production
3. **Add OpenAI API key** - Add `OPENAI_API_KEY` to Cloudflare Pages env vars for blog AI features
4. **Add Perplexity API key** - Add `PERPLEXITY_API_KEY` to Cloudflare Pages for research features
5. **Run database migration** - Run the ALTER TABLE statements in Supabase to add new blog columns
6. **Create blog-images storage bucket** - In Supabase Storage, create a public bucket called `blog-images`
7. **Sponsors page** - Using placeholder data, needs real sponsor info
8. **Events page** - Using placeholder data for 2026 event
9. **Contact form** - Not yet implemented
10. **Email notifications** - Ticket QR codes, donation receipts not set up

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
NEXT_PUBLIC_SITE_URL=https://amplifyannarbor.com
OPENAI_API_KEY=  # For blog AI features (GPT-5.2)
PERPLEXITY_API_KEY=  # For research features
```

Note: `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is no longer needed - using tokenless API access.

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
- `/lib/stripe.ts` - Stripe client helper (publishable key only)
- `/lib/stripe-server.ts` - Stripe server client (secret key, server-only)

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
5. **Fixed Shopify API version** - Updated from expired `2024-01` to `2026-01`

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
- Fixed Shopify API version (2024-01 → 2026-01) - merch was showing "Coming Soon"
- Created this handoff document

*Add new session entries below:*

### Session 2 - Jan 14, 2026 (Desktop)
- Fixed Shopify merch page - switched to tokenless Storefront API (products were returning empty)
- Fixed Stripe donations - switched to fetch-based API for edge runtime compatibility
- Fixed checkout URL issue - added request host header fallback
- Built complete Blog Admin CMS with AI features:
  - GPT-5.2 integration for article generation and enhancement
  - AI Article Generator (raw content → complete article)
  - AI Enhance buttons for title, description, content
  - SEO Analyzer with basic checks and AI analysis
  - Rich text editor with HTML/Preview toggle
  - Full article editor with 4 tabs
  - **Image upload** - drag & drop or click to upload to Supabase Storage
  - **Perplexity Research** - Research tab with real-time info and citations
    - Deep research, find sources, local (Ann Arbor), trending angles, fact-check
    - GPT enhances research prompts for better results
    - Copy sources as markdown links
- Updated database schema for new blog columns
- **Needs**: Add OPENAI_API_KEY + PERPLEXITY_API_KEY to Cloudflare, run DB migration, create blog-images bucket

### Session 3 - [DATE] ([DEVICE])
- [What was worked on]
- [What was completed]
- [Any issues encountered]


