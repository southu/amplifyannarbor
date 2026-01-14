import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import { ProductDetailClient } from "@/components/merch/ProductDetailClient";

export const runtime = "edge";
export const revalidate = 300; // Revalidate every 5 minutes

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  
  try {
    const product = await getProductByHandle(handle);
    if (!product) {
      return { title: "Product Not Found" };
    }
    return {
      title: product.title,
      description: product.description,
    };
  } catch {
    return { title: "Product Not Found" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  
  let product;
  try {
    product = await getProductByHandle(handle);
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Transform product data for the client component
  const transformedProduct = {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    price: parseFloat(product.priceRange.minVariantPrice.amount),
    images: product.images.edges.map((edge) => ({
      url: edge.node.url,
      altText: edge.node.altText,
    })),
    featuredImage: product.featuredImage,
    variants: product.variants.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      price: parseFloat(edge.node.price.amount),
      available: edge.node.availableForSale,
      selectedOptions: edge.node.selectedOptions,
    })),
    options: product.options,
  };

  return <ProductDetailClient product={transformedProduct} />;
}
