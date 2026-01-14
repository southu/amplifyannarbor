import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Clock,
  MapPin,
  Music,
  Ticket,
  ExternalLink,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Lineup & Events",
  description:
    "View the lineup for Amplify Ann Arbor featuring N*D and Jimmy Was Busy at The Blind Pig on July 30th.",
};

const eventDetails = {
  title: "Amplify Ann Arbor 2026",
  date: "July 30th, 2026",
  time: "Doors at 6:30 PM",
  venue: "The Blind Pig",
  address: "208 S 1st St, Ann Arbor, MI 48104",
  description:
    "Join us for a night of gritty tunes supporting local seniors with essential meals. Experience the raw energy of grunge rock while making a difference in your community.",
};

const bands = [
  {
    name: "N*D",
    role: "Headliner",
    description:
      "An epic reunion show of Ann Arbor's own! N*D brings their legendary sound back to the stage for one unforgettable night. Don't miss this rare opportunity to see a piece of Ann Arbor music history.",
    spotifyUrl:
      "https://open.spotify.com/artist/1LXpXMShpDw3ekiEzMRW3S?si=coFqSP46TwqW8l0lE3RK1A",
    image: null,
    setTime: "8:30 PM",
    isHeadliner: true,
  },
  {
    name: "Jimmy Was Busy",
    role: "Opening Act",
    description:
      "Grunge rock cover band Jimmy Was Busy opens the show with high-energy performances of classic hits. Get ready to sing along and feel the raw power of 90s rock.",
    spotifyUrl: null,
    image: null,
    setTime: "7:00 PM",
    isHeadliner: false,
  },
];

export default function EventsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section pt-24 md:pt-32 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 via-transparent to-[var(--color-secondary)]/20" />

        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-6">
              <Music className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-sm font-medium text-[var(--color-accent)]">
                Charity Concert
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Lineup</span>{" "}
              <span className="gradient-text">Details</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)]">
              {eventDetails.description}
            </p>
          </div>

          {/* Event Info Card */}
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-accent)]/5 border-[var(--color-accent)]/20 mb-16">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {eventDetails.title}
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="text-[var(--color-text-muted)] text-sm">Date</p>
                    <p className="text-white font-medium">{eventDetails.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="text-[var(--color-text-muted)] text-sm">Time</p>
                    <p className="text-white font-medium">{eventDetails.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:col-span-2">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="text-[var(--color-text-muted)] text-sm">Venue</p>
                    <p className="text-white font-medium">{eventDetails.venue}</p>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {eventDetails.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/donate">
                  <Button variant="gold" size="lg">
                    <Ticket className="w-5 h-5" />
                    Get Tickets
                  </Button>
                </Link>
                <a
                  href="https://maps.google.com/?q=The+Blind+Pig+Ann+Arbor"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="lg">
                    <MapPin className="w-5 h-5" />
                    Directions
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Lineup Section */}
      <section className="section bg-[var(--color-bg-card)]/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">The</span>{" "}
              <span className="gradient-text">Performers</span>
            </h2>
            <p className="text-xl text-[var(--color-text-secondary)]">
              Two incredible bands, one unforgettable night
            </p>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {bands.map((band, index) => (
              <Card
                key={band.name}
                className={`p-8 md:p-10 animate-fade-in opacity-0 ${
                  band.isHeadliner
                    ? "bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-accent)]/10 border-[var(--color-accent)]/30"
                    : ""
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Band Icon */}
                    <div
                      className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        band.isHeadliner
                          ? "bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)]"
                          : "bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)]"
                      }`}
                    >
                      <span
                        className={`text-3xl md:text-4xl font-bold ${
                          band.isHeadliner
                            ? "text-white"
                            : "text-[var(--color-bg-dark)]"
                        }`}
                      >
                        {band.name === "N*D" ? "N*D" : "JWB"}
                      </span>
                    </div>

                    {/* Band Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-2xl md:text-3xl font-bold text-white">
                          {band.name}
                        </h3>
                        {band.isHeadliner && (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30">
                            <Star className="w-4 h-4 text-[var(--color-accent)]" />
                            <span className="text-sm font-medium text-[var(--color-accent)]">
                              Headliner
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-[var(--color-text-secondary)]">
                        <Clock className="w-4 h-4" />
                        <span>{band.setTime}</span>
                        <span className="mx-2">•</span>
                        <span>{band.role}</span>
                      </div>

                      <p className="text-[var(--color-text-secondary)] text-lg mb-6">
                        {band.description}
                      </p>

                      {band.spotifyUrl && (
                        <a
                          href={band.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="secondary">
                            <Music className="w-4 h-4" />
                            Listen on Spotify
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Spotify Embed */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              Preview N*D on Spotify
            </h3>
            <div className="rounded-xl overflow-hidden">
              <iframe
                src="https://open.spotify.com/embed/artist/1LXpXMShpDw3ekiEzMRW3S?utm_source=generator&theme=0"
                width="100%"
                height="352"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Don&apos;t Miss</span>{" "}
            <span className="gradient-text">This Night!</span>
          </h2>
          <p className="text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Admission is a suggested donation made directly to Ann Arbor Meals on
            Wheels. 100% of proceeds support local seniors.
          </p>
          <Link href="/donate">
            <Button variant="gold" size="lg">
              <Ticket className="w-5 h-5" />
              Reserve Your Spot
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

