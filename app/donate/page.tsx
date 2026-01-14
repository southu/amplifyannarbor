import { Metadata } from "next";
import { DonationForm } from "@/components/donate/DonationForm";
import { Card, CardContent } from "@/components/ui/Card";
import { Heart, Users, Utensils, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Ann Arbor Meals on Wheels by making a donation. 100% of proceeds help deliver meals to seniors in need.",
};

const impactItems = [
  {
    amount: "$10",
    description: "Provides 2 nutritious meals",
    icon: Utensils,
  },
  {
    amount: "$50",
    description: "Feeds a senior for one week",
    icon: Heart,
  },
  {
    amount: "$100",
    description: "Covers meals for two weeks",
    icon: Users,
  },
  {
    amount: "$500",
    description: "Supports a senior for a full month",
    icon: CheckCircle,
  },
];

export default function DonatePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section pt-24 md:pt-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/10 via-transparent to-[var(--color-accent)]/10" />

        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 mb-6">
              <Heart className="w-4 h-4 text-[var(--color-gold)]" />
              <span className="text-sm font-medium text-[var(--color-gold)]">
                Make a Difference
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Support Our</span>
              <br />
              <span className="gold-text">Community</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)]">
              Your donation directly supports Ann Arbor Meals on Wheels, helping
              deliver warm, nutritious meals to seniors who need them most.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Donation Form */}
            <div>
              <DonationForm />
            </div>

            {/* Impact Info */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-gold)]/5 border-[var(--color-gold)]/20">
                <CardContent className="p-0">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Your Impact
                  </h2>
                  <div className="space-y-4">
                    {impactItems.map((item) => (
                      <div
                        key={item.amount}
                        className="flex items-center gap-4 p-4 bg-[var(--color-bg-elevated)]/50 rounded-lg"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                          <item.icon className="w-6 h-6 text-[var(--color-gold)]" />
                        </div>
                        <div>
                          <span className="text-xl font-bold text-white">
                            {item.amount}
                          </span>
                          <p className="text-[var(--color-text-secondary)]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <h3 className="text-lg font-bold text-white mb-4">
                    About Ann Arbor Meals on Wheels
                  </h3>
                  <p className="text-[var(--color-text-secondary)] mb-4">
                    Ann Arbor Meals on Wheels provides nutritious meals and
                    friendly visits to homebound seniors in our community. Their
                    daily check-ins often provide vital social connection and
                    safety monitoring for vulnerable individuals.
                  </p>
                  <div className="flex items-center gap-2 text-[var(--color-accent)]">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">100% of proceeds donated</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20">
                <CardContent className="p-0">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Prefer to donate at the event?
                  </h3>
                  <p className="text-[var(--color-text-secondary)]">
                    Admission is a suggested donation that can also be made at the
                    door on July 30th at The Blind Pig. Every contribution helps!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

