import { ProductDetail } from "@/components/merch/ProductDetail";

// Sample products - will be replaced with Shopify API data
const products = [
  {
    id: "1",
    title: "Amplify Ann Arbor Logo T-Shirt",
    handle: "amplify-logo-tshirt",
    description:
      "Classic black t-shirt featuring the Amplify Ann Arbor logo. Made from 100% premium cotton for a comfortable fit that lasts. Perfect for showing your support at concerts, casual outings, or everyday wear.",
    price: 25.0,
    compareAtPrice: null,
    images: [],
    variants: [
      { id: "v1", title: "S", available: true },
      { id: "v2", title: "M", available: true },
      { id: "v3", title: "L", available: true },
      { id: "v4", title: "XL", available: true },
      { id: "v5", title: "2XL", available: false },
    ],
    available: true,
  },
  {
    id: "2",
    title: "Grunge Rock Hoodie",
    handle: "grunge-rock-hoodie",
    description:
      "Stay warm while showing your support with this heavy-weight hoodie. Features a front kangaroo pocket, adjustable drawstring hood, and ribbed cuffs. Made from a cotton-polyester blend for durability and comfort.",
    price: 45.0,
    compareAtPrice: 55.0,
    images: [],
    variants: [
      { id: "v6", title: "S", available: true },
      { id: "v7", title: "M", available: true },
      { id: "v8", title: "L", available: true },
      { id: "v9", title: "XL", available: false },
    ],
    available: true,
  },
  {
    id: "3",
    title: "Support Local Seniors Cap",
    handle: "support-local-seniors-cap",
    description:
      "Embroidered cap with adjustable strap for a perfect fit. Features the Amplify Ann Arbor logo on the front and 'Support Local Seniors' text on the side.",
    price: 20.0,
    compareAtPrice: null,
    images: [],
    variants: [{ id: "v10", title: "One Size", available: true }],
    available: true,
  },
  {
    id: "4",
    title: "Meals on Wheels Tote Bag",
    handle: "meals-on-wheels-tote",
    description:
      "Eco-friendly canvas tote bag perfect for groceries, books, or everyday carry. Features sturdy handles and ample space inside.",
    price: 15.0,
    compareAtPrice: null,
    images: [],
    variants: [{ id: "v11", title: "One Size", available: true }],
    available: true,
  },
  {
    id: "5",
    title: "Event Poster 2026",
    handle: "event-poster-2026",
    description:
      "Limited edition 18x24 event poster printed on premium heavyweight paper. Features custom artwork created specifically for Amplify Ann Arbor 2026.",
    price: 12.0,
    compareAtPrice: null,
    images: [],
    variants: [{ id: "v12", title: "18x24", available: false }],
    available: false,
  },
  {
    id: "6",
    title: "Amplify Sticker Pack",
    handle: "amplify-sticker-pack",
    description:
      "Set of 5 vinyl stickers featuring various Amplify Ann Arbor designs. Weather-resistant and perfect for laptops, water bottles, and more.",
    price: 8.0,
    compareAtPrice: null,
    images: [],
    variants: [{ id: "v13", title: "One Size", available: true }],
    available: true,
  },
];

export function generateStaticParams() {
  return products.map((product) => ({
    handle: product.handle,
  }));
}

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = products.find((p) => p.handle === handle) || null;

  return <ProductDetail product={product} />;
}
