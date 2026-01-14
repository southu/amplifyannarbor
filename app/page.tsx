import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
  Music,
  Users,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/20 via-transparent to-[var(--color-secondary)]/30" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--color-gold)]/10 rounded-full blur-3xl" />
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-6">
              <Heart className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-sm font-medium text-[var(--color-accent)]">
                100% of proceeds go to Ann Arbor Meals on Wheels
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Amplify</span>{" "}
              <span className="text-white">Your</span>
              <br />
              <span className="text-white">Community Impact</span>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              Experience an evening of live grunge-rock performances at The Blind
              Pig. All proceeds benefit Ann Arbor Meals on Wheels, helping deliver
              essential meals to seniors in need.
            </p>

            {/* Event Details */}
            <div className="flex flex-wrap gap-6 mb-10">
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <Calendar className="w-5 h-5 text-[var(--color-accent)]" />
                <span>July 30th, 2026</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <Clock className="w-5 h-5 text-[var(--color-accent)]" />
                <span>Doors at 6:30 PM</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <MapPin className="w-5 h-5 text-[var(--color-accent)]" />
                <span>The Blind Pig, Ann Arbor</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/donate">
                <Button variant="gold" size="lg">
                  Donate Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" size="lg">
                  View Lineup
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section bg-[var(--color-bg-card)]/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="gradient-text">Why</span>{" "}
                <span className="text-white">It Matters</span>
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] mb-6 leading-relaxed">
                Many seniors in our community rely on Meals on Wheels for daily
                nourishment and companionship. Your participation in this event
                helps ensure they receive the meals they depend on to stay healthy
                and connected.
              </p>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                This benefit concert was created by Lexi and Jason Harper,
                committed to making a difference in our community. Featuring
                talented grunge-rock bands, it&apos;s a night of great music for a
                great cause.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center animate-fade-in stagger-1 opacity-0">
                <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">100%</h3>
                <p className="text-[var(--color-text-secondary)]">
                  Goes to Charity
                </p>
              </Card>

              <Card className="p-6 text-center animate-fade-in stagger-2 opacity-0">
                <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">500+</h3>
                <p className="text-[var(--color-text-secondary)]">
                  Seniors Served
                </p>
              </Card>

              <Card className="p-6 text-center animate-fade-in stagger-3 opacity-0">
                <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-4">
                  <Music className="w-7 h-7 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">2</h3>
                <p className="text-[var(--color-text-secondary)]">Live Bands</p>
              </Card>

              <Card className="p-6 text-center animate-fade-in stagger-4 opacity-0">
                <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">Ann Arbor</h3>
                <p className="text-[var(--color-text-secondary)]">Local Impact</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bands Preview */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Featured</span>{" "}
              <span className="gradient-text">Performers</span>
            </h2>
            <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Get ready for a night of gritty tunes with these incredible local
              artists
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 group hover:shadow-[0_0_30px_rgba(233,69,96,0.2)] transition-all">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center text-2xl font-bold text-white">
                    N*D
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">N*D</h3>
                    <p className="text-[var(--color-accent)]">Headliner</p>
                  </div>
                </div>
                <p className="text-[var(--color-text-secondary)]">
                  An epic reunion show of Ann Arbor&apos;s own! Don&apos;t miss this
                  legendary local band back on stage.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 group hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] flex items-center justify-center text-lg font-bold text-[var(--color-bg-dark)]">
                    JWB
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Jimmy Was Busy
                    </h3>
                    <p className="text-[var(--color-gold)]">Opening Act</p>
                  </div>
                </div>
                <p className="text-[var(--color-text-secondary)]">
                  Grunge rock cover band bringing the raw energy and classic hits
                  to kick off the night.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-10">
            <Link href="/events">
              <Button variant="secondary" size="lg">
                Full Lineup Details
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/20 to-[var(--color-gold)]/20" />
        <div className="container relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Ready to Make a</span>{" "}
            <span className="gradient-text">Difference?</span>
          </h2>
          <p className="text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Your donation directly supports delivering warm, nutritious meals to
            local seniors. Every dollar counts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/donate">
              <Button variant="gold" size="lg">
                Donate Now
                <Heart className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/sponsors">
              <Button variant="outline" size="lg">
                View Sponsors
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
