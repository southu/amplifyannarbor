import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
} from "lucide-react";

// Sample blog posts - will be replaced with Supabase data
const blogPosts = [
  {
    id: "1",
    title: "Announcing Amplify Ann Arbor 2026",
    slug: "announcing-amplify-ann-arbor-2026",
    excerpt:
      "We're thrilled to announce that Amplify Ann Arbor is returning for another year of great music and community support.",
    content: `
# Announcing Amplify Ann Arbor 2026

We're thrilled to announce that **Amplify Ann Arbor** is returning for another incredible year of live music and community support!

## Mark Your Calendars

**Date:** July 30th, 2026  
**Time:** Doors at 6:30 PM  
**Venue:** The Blind Pig, Ann Arbor

## What to Expect

This year's event promises to be our biggest yet. We're bringing back the legendary **N*D** for an epic reunion show, along with the high-energy opening act **Jimmy Was Busy**.

### The Lineup

1. **N*D** (Headliner) - Ann Arbor's own returning for a special reunion performance
2. **Jimmy Was Busy** (Opening Act) - Grunge rock covers to get the night started right

## Supporting Our Community

As always, **100% of all proceeds** go directly to Ann Arbor Meals on Wheels. Your support helps deliver warm, nutritious meals to seniors in our community who need them most.

## How to Participate

- **Donate** - Make a contribution at the door or online
- **Attend** - Come for the music, stay for the cause
- **Share** - Spread the word on social media
- **Volunteer** - Help us make the event a success

We can't wait to see you there!

*- The Amplify Ann Arbor Team*
    `,
    author: "Lexi Harper",
    published_at: "2026-01-10",
    featured_image: null,
    status: "published",
  },
  {
    id: "2",
    title: "Thank You to Our 2025 Supporters",
    slug: "thank-you-2025-supporters",
    excerpt:
      "A heartfelt thank you to everyone who made last year's event a success.",
    content: `
# Thank You to Our 2025 Supporters

Last year's Amplify Ann Arbor was an incredible success, and it's all thanks to **you** - our amazing community of supporters, sponsors, and music lovers.

## By the Numbers

- **$10,000+** raised for Ann Arbor Meals on Wheels
- **200+** attendees
- **500+** meals delivered to seniors
- **2** incredible bands

## Our Sponsors Made It Possible

A special thank you to our Title Sponsor **Ready Signal** and all of our supporting sponsors who made this event possible.

## Looking Ahead

We're already planning for 2026, and we can't wait to bring you another night of great music for a great cause.

Stay tuned for announcements about next year's lineup and how you can get involved!

*- Jason & Lexi Harper*
    `,
    author: "Jason Harper",
    published_at: "2025-08-15",
    featured_image: null,
    status: "published",
  },
  {
    id: "3",
    title: "Meet Our Headliners: N*D",
    slug: "meet-our-headliners-nd",
    excerpt:
      "Get to know the legendary Ann Arbor band making their epic reunion.",
    content: `
# Meet Our Headliners: N*D

We're honored to announce that **N*D** will be headlining Amplify Ann Arbor 2026 in what promises to be an epic reunion show!

## A Brief History

N*D has been a cornerstone of the Ann Arbor music scene for years. Their unique blend of grunge and alternative rock has earned them a devoted local following.

## Why This Show Is Special

This reunion marks a rare opportunity to see N*D perform live. The band has been on hiatus, making this benefit concert even more special.

## What to Expect

Fans can look forward to:
- Classic hits from their catalog
- High-energy performance
- Special surprises we can't reveal yet!

## Listen Now

Can't wait for the show? Check out N*D on [Spotify](https://open.spotify.com/artist/1LXpXMShpDw3ekiEzMRW3S) to get ready for the night!

*See you at The Blind Pig!*
    `,
    author: "Lexi Harper",
    published_at: "2025-07-20",
    featured_image: null,
    status: "published",
  },
  {
    id: "4",
    title: "The Impact of Your Donations",
    slug: "impact-of-your-donations",
    excerpt:
      "See how your contributions directly help Ann Arbor seniors.",
    content: `
# The Impact of Your Donations

Every dollar you contribute to Amplify Ann Arbor goes directly to **Ann Arbor Meals on Wheels**. Here's how your generosity makes a difference.

## What Meals on Wheels Does

Ann Arbor Meals on Wheels provides:
- **Nutritious meals** delivered to homebound seniors
- **Friendly visits** that combat isolation
- **Safety checks** on vulnerable community members
- **Connection** to additional resources and services

## Your Impact

When you donate to Amplify Ann Arbor:

| Donation | Impact |
|----------|--------|
| $10 | Provides 2 nutritious meals |
| $50 | Feeds a senior for a week |
| $100 | Covers meals for 2 weeks |
| $500 | Supports a senior for a month |

## Real Stories

> "The daily meal delivery is more than just food - it's knowing someone cares enough to check on me every day." - *Local Senior Recipient*

## How to Give

- **At the Event** - Donate at the door
- **Online** - Use our secure donation link
- **Sponsor** - Become a corporate sponsor

Together, we can ensure no senior in our community goes hungry.

*Thank you for your support!*
    `,
    author: "Jason Harper",
    published_at: "2025-06-10",
    featured_image: null,
    status: "published",
  },
];

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Get related posts (excluding current)
  const relatedPosts = blogPosts
    .filter((p) => p.id !== post.id && p.status === "published")
    .slice(0, 2);

  return (
    <>
      <article className="section pt-24 md:pt-32">
        <div className="container">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--color-accent)]" />
                  {formatDate(post.published_at)}
                </span>
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[var(--color-accent)]" />
                  {post.author}
                </span>
              </div>
            </header>

            {/* Featured Image Placeholder */}
            {post.featured_image && (
              <div className="h-64 md:h-96 bg-[var(--color-bg-elevated)] rounded-xl mb-8" />
            )}

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-white mt-8 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-white mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-[var(--color-text-secondary)] mb-4 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-[var(--color-text-secondary)] mb-4 space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-[var(--color-text-secondary)]">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[var(--color-accent)] pl-4 my-4 italic text-[var(--color-text-secondary)]">
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">
                      {children}
                    </strong>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-accent)] hover:text-[var(--color-accent-light)] transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-[var(--color-bg-elevated)] px-4 py-2 text-left text-white font-semibold border border-white/10">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 text-[var(--color-text-secondary)] border border-white/10">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="border-white/10 my-8" />,
                  em: ({ children }) => (
                    <em className="text-[var(--color-text-muted)]">{children}</em>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-[var(--color-text-secondary)]">
                  Share this post:
                </span>
                <div className="flex gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://amplifyannarbor.com/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://amplifyannarbor.com/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="section bg-[var(--color-bg-card)]/50">
          <div className="container">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Related Posts
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="p-6">
                  <CardContent className="p-0">
                    <span className="text-sm text-[var(--color-text-muted)] mb-2 block">
                      {formatDate(relatedPost.published_at)}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-2">
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="hover:text-[var(--color-accent)] transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-sm line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

