import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Heart, Share2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Thank You for Your Donation",
  description:
    "Thank you for supporting Ann Arbor Meals on Wheels through Amplify Ann Arbor.",
};

export default function DonationSuccessPage() {
  return (
    <section className="section pt-24 md:pt-32">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-8 animate-fade-in">
            <CheckCircle className="w-12 h-12 text-[var(--color-success)]" />
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in stagger-1 opacity-0">
            Thank You!
          </h1>

          <p className="text-xl text-[var(--color-text-secondary)] mb-8 animate-fade-in stagger-2 opacity-0">
            Your generous donation will help deliver warm, nutritious meals to
            seniors in our community who need them most.
          </p>

          {/* Confirmation Card */}
          <Card className="p-8 mb-8 animate-fade-in stagger-3 opacity-0">
            <CardContent className="p-0">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-[var(--color-accent)]" />
                <span className="text-lg font-semibold text-white">
                  Donation Confirmed
                </span>
              </div>
              <p className="text-[var(--color-text-secondary)]">
                A receipt has been sent to your email address. Your contribution
                goes directly to{" "}
                <span className="text-white font-medium">
                  Ann Arbor Meals on Wheels
                </span>
                .
              </p>
            </CardContent>
          </Card>

          {/* What's Next */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 animate-fade-in stagger-4 opacity-0">
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="font-bold text-white mb-2">Join Us July 30th</h3>
                <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                  Don't forget to attend the concert at The Blind Pig!
                </p>
                <Link href="/events">
                  <Button variant="secondary" size="sm">
                    View Event Details
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="font-bold text-white mb-2">Spread the Word</h3>
                <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                  Share with friends and help us reach more supporters!
                </p>
                <div className="flex gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I just donated to support Ann Arbor Meals on Wheels through @AmplifyAA! Join me in helping local seniors. 🎸❤️")}&url=${encodeURIComponent("https://amplifyannarbor.com/donate")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back to Home */}
          <Link href="/">
            <Button variant="outline" size="lg" className="animate-fade-in stagger-5 opacity-0">
              Back to Home
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

