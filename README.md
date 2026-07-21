# Amplify Ann Arbor Website

A modern Next.js website for Amplify Ann Arbor, a charity concert benefiting Ann Arbor Meals on Wheels.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe
- **Commerce**: Shopify Storefront API (headless)
- **Hosting**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account
- Shopify store (optional, for merch)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/amplifyannarbor.git
   cd amplifyannarbor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and fill in your values (test-mode keys only):
   ```bash
   cp .env.example .env.local
   ```

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL in `supabase/schema.sql` in the SQL Editor
   - Create storage buckets: `sponsor-logos`, `event-photos`, `blog-images`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Shopify (optional)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token

# Site
NEXT_PUBLIC_SITE_URL=https://amplifyannarbor.com
```

See [`.env.example`](.env.example) for a ready-to-copy template. Populate `.env.local`
(and CI) with **Stripe test-mode keys only** (`pk_test_…`, `sk_test_…`, test `whsec_…`).

### Stripe keys & secrets

- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are read **server-side only**
  (`process.env` inside API routes / edge functions) and are never imported into
  client components or shipped to the browser.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is the **only** Stripe value exposed to the
  client, via Next.js's `NEXT_PUBLIC_` public-env convention.
- **Live keys are configured ONLY in the Cloudflare Pages production environment's
  secret store** (the Pages dashboard, or `wrangler pages secret put …`). They are
  never committed to the repo and never embedded in client code. All `.env*` files
  except `.env.example` are gitignored.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes (Stripe webhook, etc.)
│   ├── blog/              # Blog pages
│   ├── donate/            # Donation flow
│   ├── events/            # Events/lineup page
│   ├── gallery/           # Photo gallery
│   ├── merch/             # Merchandise store
│   ├── sponsors/          # Sponsors page
│   └── about/             # About page
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── donate/           # Donation form components
│   ├── gallery/          # Gallery components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions and clients
├── types/                 # TypeScript type definitions
└── supabase/             # Database schema
```

## Features

### Public Pages
- **Home**: Hero section, mission info, featured performers
- **Sponsors**: Title and supporting sponsors showcase
- **Events/Lineup**: Event details, band information, Spotify embed
- **Gallery**: Photo gallery with lightbox
- **Blog**: News and updates with rich text content
- **Merch**: Headless Shopify store integration
- **Donate**: Stripe-powered donation flow
- **About**: Mission, story, and contact form

### Admin Panel
- Dashboard with stats overview
- Blog post management with rich text editor
- Photo gallery uploads
- Sponsor management
- Event management
- Donation tracking and export

## Deployment

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Add all environment variables in the Cloudflare dashboard
5. Deploy!

### Stripe Webhook

Set up a webhook endpoint in Stripe dashboard:
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `payment_intent.payment_failed`

## Development

```bash
# Run development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary to Amplify Ann Arbor.

## Support

For questions or issues, contact hello@amplifyannarbor.com
