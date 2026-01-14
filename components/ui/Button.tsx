"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)] shadow-md hover:shadow-lg",
        secondary:
          "bg-[var(--color-bg-elevated)] text-white border border-white/10 hover:bg-[var(--color-bg-card)] hover:border-white/20",
        outline:
          "border-2 border-[var(--color-accent)] text-[var(--color-accent)] bg-transparent hover:bg-[var(--color-accent)] hover:text-white",
        ghost:
          "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5",
        gold:
          "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-bg-dark)] font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]",
        danger:
          "bg-[var(--color-error)] text-white hover:bg-red-600",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-md",
        default: "h-11 px-6 text-base rounded-lg",
        lg: "h-14 px-8 text-lg rounded-xl",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

