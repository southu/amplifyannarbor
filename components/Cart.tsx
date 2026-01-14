"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, cn } from "@/lib/utils";
import { X, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (item: CartItem) => {
    setItems((current) => {
      const existing = current.find((i) => i.variantId === item.variantId);
      if (existing) {
        return current.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...current, item];
    });
    setIsOpen(true);
  };

  const removeItem = (variantId: string) => {
    setItems((current) => current.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(variantId);
      return;
    }
    setItems((current) =>
      current.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartButton() {
  const { itemCount, setIsOpen } = useCart();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="relative p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-accent)] text-white text-xs font-bold rounded-full flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </button>
  );
}

export function CartDrawer() {
  const { items, removeItem, updateQuantity, isOpen, setIsOpen, total } =
    useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);

    // Here you would create a Shopify checkout and redirect
    // For now, we'll simulate the process
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Redirect to Shopify checkout would happen here
    alert("Redirecting to checkout...");
    setIsCheckingOut(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-md bg-[var(--color-bg-dark)] border-l border-white/10 z-50 transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Cart
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)]">
                Your cart is empty
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-4 bg-[var(--color-bg-card)] rounded-lg"
                >
                  {/* Image Placeholder */}
                  <div className="w-20 h-20 bg-[var(--color-bg-elevated)] rounded-lg flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">
                      {item.productTitle}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {item.variantTitle}
                    </p>
                    <p className="text-[var(--color-accent)] font-medium">
                      {formatCurrency(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="p-1 rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="p-1 rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="ml-auto p-1 rounded text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="text-[var(--color-text-secondary)]">Total</span>
              <span className="text-white font-bold">
                {formatCurrency(total)}
              </span>
            </div>
            <Button
              variant="gold"
              className="w-full"
              onClick={handleCheckout}
              loading={isCheckingOut}
            >
              Checkout
            </Button>
            <p className="text-xs text-center text-[var(--color-text-muted)]">
              You will be redirected to our secure Shopify checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}

