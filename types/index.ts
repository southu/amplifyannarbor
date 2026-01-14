// Database types for Supabase

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  ticket_price: number | null;
  image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author_id: string | null;
  published_at: string | null;
  featured_image: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: 'title' | 'supporting';
  logo_url: string;
  description: string | null;
  website_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PhotoGallery {
  id: string;
  event_id: string | null;
  image_url: string;
  caption: string | null;
  photographer: string | null;
  upload_date: string;
  created_at: string;
}

export interface Donation {
  id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  stripe_payment_id: string;
  event_id: string | null;
  message: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  donor_name: string;
  donor_email: string;
  quantity: number;
  donation_id: string | null;
  qr_code: string | null;
  checked_in: boolean;
  created_at: string;
}

// Shopify types
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  variants: {
    edges: Array<{
      node: ShopifyVariant;
    }>;
  };
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
}

export interface CartItem {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  quantity: number;
  price: number;
  image: string | null;
}

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface DonationFormData {
  amount: number;
  name: string;
  email: string;
  message?: string;
  eventId?: string;
}

