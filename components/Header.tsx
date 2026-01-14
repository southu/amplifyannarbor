"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Menu, X, Music } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Sponsors", href: "/sponsors" },
  { name: "Lineup", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "Blog", href: "/blog" },
  { name: "Merch", href: "/merch" },
  { name: "About", href: "/about" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg-dark)]/90 backdrop-blur-md border-b border-white/5">
      <nav className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(233,69,96,0.5)] transition-shadow">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight">
            <span className="gradient-text">Amplify</span>
            <span className="text-white ml-1">Ann Arbor</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === item.href
                  ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/donate">
            <Button variant="gold" size="sm">
              Donate Now
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 top-16 md:top-20 bg-[var(--color-bg-dark)]/95 backdrop-blur-md border-b border-white/5 transition-all duration-300",
          mobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="container py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "block px-4 py-3 text-base font-medium rounded-lg transition-colors",
                pathname === item.href
                  ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 pb-2">
            <Link href="/donate" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="gold" className="w-full">
                Donate Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

