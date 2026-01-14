import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Crown, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Thank you to our incredible sponsors who make Amplify Ann Arbor possible. Your contributions support Ann Arbor Meals on Wheels.",
};

// Static sponsor data - will be replaced with Supabase data
const titleSponsor = {
  name: "Ready Signal",
  description:
    "Based in Ann Arbor, Ready Signal is a leader in AI-powered external data enrichment and forecasting. Their platform enables organizations to enhance predictive models by integrating real-time economic signals and behavioral insights.",
  logo: "/sponsors/ready-signal.png",
  website: "https://readysignal.com",
};

const supportingSponsors = [
  {
    name: "Goldman Sachs",
    description:
      "A global leader in investment banking and asset management, offering innovative financial solutions worldwide.",
    logo: "/sponsors/goldman-sachs.png",
    website: "https://goldmansachs.com",
  },
  {
    name: "Image Group",
    description:
      "Headquartered in Toledo, a branding and promotional products agency helping organizations connect through creative merchandise and design.",
    logo: "/sponsors/image-group.png",
    website: "https://imagegroup.com",
  },
  {
    name: "Belle Painting",
    description:
      "High-quality residential and commercial painting services with a focus on craftsmanship and care.",
    logo: "/sponsors/belle-painting.png",
    website: "#",
  },
  {
    name: "Earth Concepts",
    description:
      "Sustainable landscaping and environmental design firm providing eco-friendly outdoor solutions.",
    logo: "/sponsors/earth-concepts.png",
    website: "#",
  },
  {
    name: "Diag Partners",
    description:
      "Executive search and talent advisory firm helping build strong leadership teams in healthcare, tech, and more.",
    logo: "/sponsors/diag-partners.png",
    website: "https://diagpartners.com",
  },
  {
    name: "OneMagnify",
    description:
      "Global marketing, data, and technology firm connecting brands with customers through smart storytelling and insights.",
    logo: "/sponsors/onemagnify.png",
    website: "https://onemagnify.com",
  },
  {
    name: "Michigan Medicine",
    description:
      "The University of Michigan's academic medical center, known for top-tier care, research, and education.",
    logo: "/sponsors/michigan-medicine.png",
    website: "https://uofmhealth.org",
  },
  {
    name: "Ann Arbor SPARK",
    description:
      "Economic development organization growing innovation and business investment in the Ann Arbor region.",
    logo: "/sponsors/aa-spark.png",
    website: "https://annarborusa.org",
  },
  {
    name: "Belle Tire",
    description:
      "A Michigan-based tire and auto service company providing trusted products and care with community focus.",
    logo: "/sponsors/belle-tire.png",
    website: "https://belletire.com",
  },
  {
    name: "Drainage Kings",
    description:
      "Specialists in drainage solutions committed to protecting property with sustainable, effective water management systems.",
    logo: "/sponsors/drainage-kings.png",
    website: "#",
  },
];

export default function SponsorsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section pt-24 md:pt-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 mb-6">
              <Heart className="w-4 h-4 text-[var(--color-gold)]" />
              <span className="text-sm font-medium text-[var(--color-gold)]">
                Community Partners
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Thank You to Our</span>
              <br />
              <span className="gold-text">Sponsors</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)]">
              We are grateful for the incredible support of our sponsors. Your
              contributions make this event—and its impact—possible.
            </p>
          </div>

          {/* Title Sponsor */}
          <div className="mb-20">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Crown className="w-6 h-6 text-[var(--color-gold)]" />
              <h2 className="text-2xl font-bold gold-text">Title Sponsor</h2>
            </div>

            <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-gold)]/5 border-[var(--color-gold)]/20 hover:border-[var(--color-gold)]/40">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-48 h-48 relative flex-shrink-0 bg-white/10 rounded-2xl flex items-center justify-center p-6">
                    <div className="text-4xl font-bold gold-text">
                      {titleSponsor.name.charAt(0)}
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {titleSponsor.name}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-lg mb-6">
                      {titleSponsor.description}
                    </p>
                    <a
                      href={titleSponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="gold">
                        Visit Website
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supporting Sponsors */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-8">
              <Heart className="w-6 h-6 text-[var(--color-accent)]" />
              <h2 className="text-2xl font-bold gradient-text">
                Supporting Sponsors
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportingSponsors.map((sponsor, index) => (
                <Card
                  key={sponsor.name}
                  className="p-6 group hover:shadow-[0_0_30px_rgba(233,69,96,0.15)] animate-fade-in opacity-0"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                      <span className="text-2xl font-bold text-[var(--color-accent)]">
                        {sponsor.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {sponsor.name}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-3">
                      {sponsor.description}
                    </p>
                    {sponsor.website !== "#" && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--color-accent)] text-sm font-medium hover:text-[var(--color-accent-light)] transition-colors"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Become a Sponsor CTA */}
      <section className="section">
        <div className="container">
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-accent)]/5 border-[var(--color-accent)]/20">
            <CardContent className="p-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-white">Interested in</span>{" "}
                <span className="gradient-text">Sponsoring?</span>
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-2xl mx-auto">
                Join our community of sponsors and help make a difference in the
                lives of local seniors. Contact us to learn about sponsorship
                opportunities.
              </p>
              <Link href="/about#contact">
                <Button variant="default" size="lg">
                  Contact Us
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

