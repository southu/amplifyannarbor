"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, cn } from "@/lib/utils";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Package,
  Truck,
  Shield,
} from "lucide-react";

interface ProductImage {
  url: string;
  altText: string | null;
}

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  available: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface ProductOption {
  name: string;
  values: string[];
}

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  price: number;
  images: ProductImage[];
  featuredImage: ProductImage | null;
  variants: ProductVariant[];
  options: ProductOption[];
}

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const isAvailable = product.variants.some((v) => v.available);
  const displayPrice = selectedVariant?.price || product.price;
  const images = product.images.length > 0 ? product.images : 
    product.featuredImage ? [product.featuredImage] : [];

  const handleBuyNow = async () => {
    if (!selectedVariant?.available) return;

    setIsAddingToCart(true);

    try {
      // Create Shopify checkout
      const response = await fetch("/api/shopify-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: [
            {
              variantId: selectedVariant.id,
              quantity,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Failed to create checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("There was an error creating your checkout. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <section className="section pt-24 md:pt-32">
      <div className="container">
        {/* Back Button */}
        <Link
          href="/merch"
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Merch
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-accent)]/10 rounded-xl flex items-center justify-center overflow-hidden relative">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage]?.url || images[0].url}
                  alt={images[selectedImage]?.altText || product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <Package className="w-24 h-24 text-[var(--color-text-muted)]" />
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(0, 4).map((image, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "aspect-square bg-[var(--color-bg-elevated)] rounded-lg flex items-center justify-center cursor-pointer overflow-hidden relative transition-all",
                      selectedImage === i
                        ? "ring-2 ring-[var(--color-accent)]"
                        : "hover:ring-2 hover:ring-[var(--color-accent)]/50"
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `${product.title} - Image ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {!isAvailable && (
                <span className="px-3 py-1 bg-[var(--color-text-muted)] text-white text-sm font-bold rounded-full">
                  Sold Out
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-white">
                {formatCurrency(displayPrice)}
              </span>
            </div>

            {/* Description */}
            <p className="text-[var(--color-text-secondary)] text-lg mb-8">
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.options.map((option) => (
              <div key={option.name} className="mb-6">
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                  {option.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const variant = product.variants.find((v) =>
                      v.selectedOptions.some(
                        (o) => o.name === option.name && o.value === value
                      )
                    );
                    const isSelected = selectedVariant?.selectedOptions.some(
                      (o) => o.name === option.name && o.value === value
                    );

                    return (
                      <button
                        key={value}
                        onClick={() => variant && setSelectedVariant(variant)}
                        disabled={!variant?.available}
                        className={cn(
                          "px-4 py-2 rounded-lg font-medium transition-all",
                          isSelected
                            ? "bg-[var(--color-accent)] text-white"
                            : variant?.available
                              ? "bg-[var(--color-bg-elevated)] text-white hover:bg-[var(--color-bg-card)]"
                              : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed line-through"
                        )}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-[var(--color-bg-elevated)] rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-[var(--color-text-secondary)] hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-white font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-[var(--color-text-secondary)] hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Buy Now */}
            <Button
              variant="gold"
              size="lg"
              className="w-full"
              onClick={handleBuyNow}
              disabled={!isAvailable || !selectedVariant?.available}
              loading={isAddingToCart}
            >
              <ShoppingCart className="w-5 h-5" />
              {isAvailable ? "Buy Now" : "Sold Out"}
            </Button>

            {/* Trust Badges */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                  <Truck className="w-5 h-5 text-[var(--color-accent)]" />
                  <span className="text-sm">Printed & shipped by Printful</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                  <Shield className="w-5 h-5 text-[var(--color-accent)]" />
                  <span className="text-sm">Secure Shopify checkout</span>
                </div>
              </div>
            </div>

            {/* Charity Note */}
            <Card className="mt-8 p-4 bg-[var(--color-gold)]/5 border-[var(--color-gold)]/20">
              <CardContent className="p-0">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-gold)] font-semibold">
                    100% of proceeds
                  </span>{" "}
                  from this purchase go directly to Ann Arbor Meals on Wheels.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

