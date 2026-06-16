import type { Metadata } from "next";
import { Oswald, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const displayFont = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Amplify Ann Arbor | Charity Concert for Meals on Wheels",
    template: "%s | Amplify Ann Arbor",
  },
  description:
    "Join us for a charity concert featuring local grunge-rock bands at The Blind Pig. All proceeds benefit Ann Arbor Meals on Wheels, helping deliver essential meals to seniors in need.",
  keywords: [
    "Amplify Ann Arbor",
    "charity concert",
    "Ann Arbor",
    "Meals on Wheels",
    "grunge rock",
    "The Blind Pig",
    "local music",
    "benefit concert",
  ],
  authors: [{ name: "Amplify Ann Arbor" }],
  creator: "Amplify Ann Arbor",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://amplifyannarbor.com",
    siteName: "Amplify Ann Arbor",
    title: "Amplify Ann Arbor | Charity Concert for Meals on Wheels",
    description:
      "Join us for a charity concert featuring local grunge-rock bands at The Blind Pig. All proceeds benefit Ann Arbor Meals on Wheels.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amplify Ann Arbor | Charity Concert for Meals on Wheels",
    description:
      "Join us for a charity concert featuring local grunge-rock bands at The Blind Pig. All proceeds benefit Ann Arbor Meals on Wheels.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} antialiased`}
      >
        <Header />
        <main className="min-h-screen pt-16 md:pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
