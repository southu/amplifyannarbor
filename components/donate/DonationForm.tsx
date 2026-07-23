"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn, formatCurrency } from "@/lib/utils";
import { liveDonateUrl } from "@/lib/stripe-live-links";
import { Lock, Heart } from "lucide-react";

const donationSchema = z.object({
  amount: z.number().min(1, "Please enter an amount"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationSchema>;

const presetAmounts = [10, 25, 50, 100, 250, 500];

/**
 * Ask the server to create a live Stripe Checkout Session (with an explicit
 * cancel_url back to /donate). Returns the checkout.stripe.com URL, or null if
 * the endpoint is not live (404) or otherwise unavailable, in which case the
 * caller falls back to the live Payment Links.
 */
async function createLiveCheckoutSession(payload: {
  amount: number;
  email: string;
  name: string;
  message?: string;
  custom: boolean;
}): Promise<string | null> {
  try {
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data: { url?: string } = await res.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}

export function DonationForm() {
  const [customAmount, setCustomAmount] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: 50,
    },
  });

  const handleAmountSelect = (amount: number) => {
    setCustomAmount(false);
    setSelectedAmount(amount);
    setValue("amount", amount);
  };

  const handleCustomAmount = () => {
    setCustomAmount(true);
    setSelectedAmount(null);
  };

  const onSubmit = async (data: DonationFormData) => {
    setIsProcessing(true);

    try {
      const isPreset =
        !customAmount &&
        selectedAmount != null &&
        presetAmounts.includes(selectedAmount);
      const amountKey: number | "custom" = isPreset
        ? selectedAmount!
        : "custom";

      // Preferred path: live server-side Stripe Checkout Session. This lets us
      // set an explicit cancel_url back to /donate (Payment Links cannot). The
      // endpoint only responds when a live secret key is configured; otherwise
      // it 404s and we fall back to the live Payment Links below.
      const liveSession = await createLiveCheckoutSession({
        amount: data.amount,
        email: data.email,
        name: data.name,
        message: data.message,
        custom: !isPreset,
      });
      if (liveSession && liveSession.startsWith("https://checkout.stripe.com/")) {
        window.location.href = liveSession;
        return;
      }

      // Fallback: LIVE Stripe Payment Links (donate.stripe.com). Preset amounts
      // map 1:1; custom amount uses the adjustable live link (donor confirms
      // amount on Stripe Checkout — live mode, not sandbox).
      const refParts = [
        data.name?.trim(),
        data.message?.trim() ? `msg:${data.message.trim().slice(0, 80)}` : "",
      ].filter(Boolean);
      const url = liveDonateUrl(amountKey, {
        email: data.email,
        clientReferenceId: refParts.join("|").slice(0, 200) || undefined,
      });

      // Hard-fail if we somehow still have a test Payment Link.
      if (url.includes("/test_") || url.includes("test.stripe.com")) {
        throw new Error("Refusing to open a test-mode Stripe link on production");
      }

      window.location.href = url;
    } catch (error) {
      console.error("Donation error:", error);
      alert("There was an error processing your donation. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-8">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
              Select Donation Amount
            </label>
            <div className="grid grid-cols-3 gap-3">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAmountSelect(amount)}
                  className={cn(
                    "p-4 rounded-lg font-bold text-lg transition-all",
                    selectedAmount === amount && !customAmount
                      ? "bg-[var(--color-accent)] text-white ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-dark)]"
                      : "bg-[var(--color-bg-elevated)] text-white hover:bg-[var(--color-bg-card)]"
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleCustomAmount}
                className={cn(
                  "w-full p-4 rounded-lg font-medium transition-all text-left",
                  customAmount
                    ? "bg-[var(--color-accent)] text-white ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-dark)]"
                    : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-white"
                )}
              >
                Custom Amount
              </button>

              {customAmount && (
                <div className="mt-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter amount"
                      className="w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none"
                      {...register("amount", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}
            </div>

            {errors.amount && (
              <p className="mt-2 text-sm text-[var(--color-error)]">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your name"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              helperText="We'll send your receipt to this email"
              {...register("email")}
            />

            <Textarea
              label="Message (Optional)"
              placeholder="Leave a message of support..."
              {...register("message")}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            loading={isProcessing}
          >
            <Heart className="w-5 h-5" />
            Donate{" "}
            {selectedAmount && !customAmount
              ? formatCurrency(selectedAmount)
              : "Now"}
          </Button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-[var(--color-text-muted)] text-sm">
            <Lock className="w-4 h-4" />
            <span>Secure payment powered by Stripe</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

