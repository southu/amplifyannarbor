"use client";

import { useState } from "react";
import Link from "next/link";
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

interface Variant {
  id: string;
  title: string;
  available: boolean;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  variants: Variant[];
  available: boolean;
}

interface ProductDetailProps {
  product: Product | null;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!product) {
    return (
      <section className="section pt-24 md:pt-32">
        <div className="container text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Product Not Found
          </h1>
          <Link href="/merch">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              Back to Merch
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.available) return;

    setIsAddingToCart(true);

    // Simulate API call - will be replaced with Shopify checkout
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For now, redirect to Shopify checkout would happen here
    alert(
      `Added ${quantity}x ${product.title} (${selectedVariant.title}) to cart!`
    );

    setIsAddingToCart(false);
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
            <div className="aspect-square bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-accent)]/10 rounded-xl flex items-center justify-center">
              <Package className="w-24 h-24 text-[var(--color-text-muted)]" />
            </div>

            {/* Thumbnail Gallery - Placeholder */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-[var(--color-bg-elevated)] rounded-lg flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[var(--color-accent)] transition-all"
                >
                  <Package className="w-8 h-8 text-[var(--color-text-muted)]" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {product.compareAtPrice && (
                <span className="px-3 py-1 bg-[var(--color-accent)] text-white text-sm font-bold rounded-full">
                  Sale
                </span>
              )}
              {!product.available && (
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
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-[var(--color-text-muted)] line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[var(--color-text-secondary)] text-lg mb-8">
              {product.description}
            </p>

            {/* Variant Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={!variant.available}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-all",
                      selectedVariant?.id === variant.id
                        ? "bg-[var(--color-accent)] text-white"
                        : variant.available
                          ? "bg-[var(--color-bg-elevated)] text-white hover:bg-[var(--color-bg-card)]"
                          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed line-through"
                    )}
                  >
                    {variant.title}
                  </button>
                ))}
              </div>
            </div>

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

            {/* Add to Cart */}
            <Button
              variant="gold"
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!product.available || !selectedVariant?.available}
              loading={isAddingToCart}
            >
              <ShoppingCart className="w-5 h-5" />
              {product.available ? "Add to Cart" : "Sold Out"}
            </Button>

            {/* Trust Badges */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                  <Truck className="w-5 h-5 text-[var(--color-accent)]" />
                  <span className="text-sm">Free shipping over $50</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                  <Shield className="w-5 h-5 text-[var(--color-accent)]" />
                  <span className="text-sm">Secure checkout</span>
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

