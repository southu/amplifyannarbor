import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Package, ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Merch Store",
  description:
    "Shop Amplify Ann Arbor merchandise. All proceeds support Ann Arbor Meals on Wheels.",
};

export const runtime = "edge";
export const revalidate = 300; // Revalidate every 5 minutes

export default async function MerchPage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let error: string | null = null;

  try {
    products = await getProducts();
  } catch (e) {
    console.error("Error fetching products:", e);
    error = "Unable to load products. Please try again later.";
  }

  return (
    <>
      {/* Hero Section */}
      <section className="section pt-24 md:pt-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-6">
              <ShoppingBag className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-sm font-medium text-[var(--color-accent)]">
                Support the Cause
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Merch</span>{" "}
              <span className="gradient-text">Store</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)]">
              Rock the gear, support the mission. All proceeds from merchandise
              sales benefit Ann Arbor Meals on Wheels.
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-10">
              <p className="text-[var(--color-accent)]">{error}</p>
            </div>
          )}

          {/* Products Grid */}
          {products.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => {
                const price = parseFloat(product.priceRange.minVariantPrice.amount);
                const hasVariants = product.variants.edges.length > 1;
                const isAvailable = product.variants.edges.some(v => v.node.availableForSale);
                const variantTitles = product.variants.edges
                  .map(v => v.node.title)
                  .filter(t => t !== "Default Title");

                return (
                  <Card
                    key={product.id}
                    className={`group overflow-hidden animate-fade-in opacity-0 ${
                      !isAvailable ? "opacity-60" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Product Image */}
                    <div className="relative h-64 bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-accent)]/10 flex items-center justify-center overflow-hidden">
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText || product.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-[var(--color-text-muted)]" />
                      )}

                      {/* Sold Out Badge */}
                      {!isAvailable && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-[var(--color-text-muted)] text-white text-sm font-bold rounded-full">
                          Sold Out
                        </div>
                      )}

                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Link href={`/merch/${product.handle}`}>
                          <Button variant="default">View Details</Button>
                        </Link>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                        <Link href={`/merch/${product.handle}`}>{product.title}</Link>
                      </h3>

                      {/* Description */}
                      <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-bold text-white">
                          {formatCurrency(price)}
                        </span>
                      </div>

                      {/* Variants Preview */}
                      {hasVariants && variantTitles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {variantTitles.slice(0, 4).map((variant) => (
                            <span
                              key={variant}
                              className="px-2 py-1 text-xs bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] rounded"
                            >
                              {variant}
                            </span>
                          ))}
                          {variantTitles.length > 4 && (
                            <span className="px-2 py-1 text-xs bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] rounded">
                              +{variantTitles.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <Link href={`/merch/${product.handle}`}>
                        <Button
                          variant={isAvailable ? "secondary" : "ghost"}
                          className="w-full"
                          disabled={!isAvailable}
                        >
                          {isAvailable ? (
                            <>
                              View Product
                              <ArrowRight className="w-4 h-4" />
                            </>
                          ) : (
                            "Sold Out"
                          )}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {products.length === 0 && !error && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-[var(--color-text-muted)]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Coming Soon
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
                Our merch store is coming soon. Check back for awesome gear!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="section pt-0">
        <div className="container">
          <Card className="p-8 bg-gradient-to-r from-[var(--color-bg-card)] to-[var(--color-gold)]/10 border-[var(--color-gold)]/20">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    100% of Proceeds Go to Charity
                  </h3>
                  <p className="text-[var(--color-text-secondary)]">
                    Every purchase directly supports Ann Arbor Meals on Wheels and
                    helps deliver meals to seniors in need.
                  </p>
                </div>
                <Link href="/donate">
                  <Button variant="gold">
                    Donate Directly
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
