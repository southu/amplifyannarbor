import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { BookOpen, Calendar, ArrowRight, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "News, updates, and stories from Amplify Ann Arbor. Stay connected with our community initiatives.",
};

// Sample blog posts - will be replaced with Supabase data
const blogPosts = [
  {
    id: "1",
    title: "Announcing Amplify Ann Arbor 2026",
    slug: "announcing-amplify-ann-arbor-2026",
    excerpt:
      "We're thrilled to announce that Amplify Ann Arbor is returning for another year of great music and community support. Mark your calendars for July 30th!",
    content: "",
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
      "A heartfelt thank you to everyone who made last year's event a success. Together, we raised over $10,000 for Ann Arbor Meals on Wheels.",
    content: "",
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
      "Get to know the legendary Ann Arbor band making their epic reunion at this year's benefit concert. Their story is as inspiring as their music.",
    content: "",
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
      "See how your contributions directly help Ann Arbor seniors receive nutritious meals and friendly visits. Every dollar makes a difference.",
    content: "",
    author: "Jason Harper",
    published_at: "2025-06-10",
    featured_image: null,
    status: "published",
  },
];

export default function BlogPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section pt-24 md:pt-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-6">
              <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-sm font-medium text-[var(--color-accent)]">
                News & Updates
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Our</span>{" "}
              <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)]">
              Stories, updates, and insights from the Amplify Ann Arbor team.
              Stay connected with our community initiatives.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {blogPosts.map((post, index) => (
              <Card
                key={post.id}
                className="group hover:shadow-[0_0_30px_rgba(233,69,96,0.15)] animate-fade-in opacity-0"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Featured Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-accent)]/10 flex items-center justify-center rounded-t-xl">
                  <BookOpen className="w-12 h-12 text-[var(--color-text-muted)]" />
                </div>

                <CardContent className="p-6">
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.published_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-[var(--color-accent)] transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-[var(--color-text-secondary)] mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Read More */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-[var(--color-accent)] font-medium hover:gap-3 transition-all"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {blogPosts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-[var(--color-text-muted)]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                No Posts Yet
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
                Check back soon for news and updates from the Amplify Ann Arbor
                team.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

