import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Heart,
  Users,
  Music,
  Calendar,
  MapPin,
  Mail,
  Share2,
  HandHeart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Amplify Ann Arbor, a benefit concert supporting Ann Arbor Meals on Wheels. Created by Lexi and Jason Harper.",
};

const impactStats = [
  {
    icon: Heart,
    value: "100%",
    label: "Proceeds to Charity",
    description: "Every dollar goes directly to Ann Arbor Meals on Wheels",
  },
  {
    icon: Users,
    value: "500+",
    label: "Seniors Served",
    description: "Providing essential meals to homebound community members",
  },
  {
    icon: Music,
    value: "2",
    label: "Live Bands",
    description: "Featuring local grunge-rock talent",
  },
  {
    icon: Calendar,
    value: "July 30",
    label: "Event Date",
    description: "Mark your calendar for this special evening",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section pt-24 md:pt-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 via-transparent to-[var(--color-gold)]/10" />

        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-6">
              <Heart className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-sm font-medium text-[var(--color-accent)]">
                Our Story
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Our Benefit</span>
              <br />
              <span className="gradient-text">Concert</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)]">
              Break up your week with a night of fierce grunge-rock energy for an
              incredible local cause.
            </p>
          </div>
        </div>
      </section>

      {/* Main About Content */}
      <section className="section pt-0">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Story */}
            <div className="space-y-8">
              <Card className="p-8">
                <CardContent className="p-0">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    The Event Story
                  </h2>
                  <div className="space-y-4 text-[var(--color-text-secondary)]">
                    <p>
                      Featuring powerhouse headliners <strong className="text-white">N*D</strong> and
                      special guests <strong className="text-white">Jimmy Was Busy</strong>, this
                      midweek benefit supports Ann Arbor Meals on Wheels, helping
                      deliver essential meals and supportive services to local
                      neighbors who are homebound due to their health.
                    </p>
                    <p>
                      <strong className="text-[var(--color-accent)]">
                        100% of the proceeds go directly to Ann Arbor Meals on
                        Wheels.
                      </strong>
                    </p>
                    <p>
                      This benefit concert was created by{" "}
                      <strong className="text-white">Lexi and Jason Harper</strong>,
                      committed to making a difference in our community. Featuring
                      talented grunge-rock bands, it&apos;s a night of great music for a
                      great cause—delivering vital meals and support to our
                      community&apos;s seniors.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-accent)]/5 border-[var(--color-accent)]/20">
                <CardContent className="p-0">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Our Mission
                  </h2>
                  <p className="text-[var(--color-text-secondary)] text-lg">
                    Join us for a live music night at The Blind Pig to support Ann
                    Arbor Meals on Wheels. Every ticket helps deliver warm,
                    nutritious meals to local seniors who need them most.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-8">
                <CardContent className="p-0">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Why It Matters
                  </h2>
                  <p className="text-[var(--color-text-secondary)]">
                    Many seniors in our community rely on Meals on Wheels for daily
                    nourishment and companionship. Your participation in this event
                    helps to ensure they receive the meals they depend on to stay
                    healthy and connected.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Impact & How to Help */}
            <div className="space-y-8">
              {/* Impact Stats */}
              <div className="grid grid-cols-2 gap-4">
                {impactStats.map((stat, index) => (
                  <Card
                    key={stat.label}
                    className="p-6 text-center animate-fade-in opacity-0"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-0">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-3">
                        <stat.icon className="w-6 h-6 text-[var(--color-accent)]" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-[var(--color-accent)] font-medium text-sm mb-2">
                        {stat.label}
                      </p>
                      <p className="text-[var(--color-text-muted)] text-xs">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* How to Support */}
              <Card className="p-8">
                <CardContent className="p-0">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    How to Support
                  </h2>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center flex-shrink-0">
                        <HandHeart className="w-6 h-6 text-[var(--color-gold)]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-1">Donate</h3>
                        <p className="text-[var(--color-text-secondary)] text-sm">
                          Admission is a suggested donation made directly to Ann
                          Arbor Meals on Wheels using our donation link or at the
                          door.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-[var(--color-accent)]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-1">Join Us</h3>
                        <p className="text-[var(--color-text-secondary)] text-sm">
                          Be part of this meaningful event on July 30th. Doors open
                          at 6:30PM—your presence and support will help make a real
                          difference.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                        <Share2 className="w-6 h-6 text-[var(--color-accent)]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-1">Get Involved</h3>
                        <p className="text-[var(--color-text-secondary)] text-sm">
                          Volunteer or spread the word! Every share and helping hand
                          brings us closer to ensuring every senior receives the care
                          they deserve.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link href="/donate">
                      <Button variant="gold" className="w-full">
                        Donate Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section bg-[var(--color-bg-card)]/50">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-6">
                <Mail className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-sm font-medium text-[var(--color-accent)]">
                  Get in Touch
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-white">Contact</span>{" "}
                <span className="gradient-text">Us</span>
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Have questions? Want to sponsor or volunteer? We&apos;d love to hear from
                you.
              </p>
            </div>

            <Card className="p-8">
              <CardContent className="p-0">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Name"
                      type="text"
                      placeholder="Your name"
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <Textarea
                    label="Message"
                    placeholder="How can we help?"
                    rows={5}
                    required
                  />
                  <Button type="submit" variant="default" className="w-full">
                    Send Message
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[var(--color-accent)]" />
                      <span>Ann Arbor, Michigan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[var(--color-accent)]" />
                      <a
                        href="mailto:hello@amplifyannarbor.com"
                        className="hover:text-[var(--color-accent)] transition-colors"
                      >
                        hello@amplifyannarbor.com
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

