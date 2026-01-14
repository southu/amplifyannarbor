import Link from "next/link";
import { Music, Instagram, Facebook, Heart } from "lucide-react";

const navigation = {
  main: [
    { name: "Home", href: "/" },
    { name: "Sponsors", href: "/sponsors" },
    { name: "Lineup", href: "/events" },
    { name: "About", href: "/about" },
  ],
  support: [
    { name: "Donate", href: "/donate" },
    { name: "Merch", href: "/merch" },
    { name: "Contact", href: "/about#contact" },
  ],
  social: [
    {
      name: "Instagram",
      href: "https://instagram.com/amplifyannarbor",
      icon: Instagram,
    },
    {
      name: "Facebook",
      href: "https://facebook.com/amplifyannarbor",
      icon: Facebook,
    },
    {
      name: "Spotify",
      href: "https://open.spotify.com/artist/1LXpXMShpDw3ekiEzMRW3S",
      icon: Music,
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[var(--color-bg-dark)] border-t border-white/5">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                <span className="gradient-text">Amplify</span>
                <span className="text-white ml-1">Ann Arbor</span>
              </span>
            </Link>
            <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">
              A charity concert supporting Ann Arbor Meals on Wheels. Experience
              an evening of live grunge-rock performances while helping deliver
              essential meals to seniors in need.
            </p>
            <div className="flex gap-4">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all"
                  aria-label={item.name}
                >
                  <item.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-4">Navigate</h3>
            <ul className="space-y-2">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--color-text-muted)] text-sm">
            © {new Date().getFullYear()} Amplify Ann Arbor. All rights reserved.
          </p>
          <p className="text-[var(--color-text-muted)] text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-[var(--color-accent)]" /> for
            our community
          </p>
        </div>
      </div>
    </footer>
  );
}

