import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { BookOpen, Calendar, ArrowRight, User } from "lucide-react";

export const runtime = "edge";
export const revalidate = 60; // Revalidate every minute

export const metadata: Metadata = {
  title: "Blog",
  description:
    "News, updates, and stories from Amplify Ann Arbor. Stay connected with our community initiatives.",
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  excerpt: string | null;
  author: string | null;
  category: string | null;
  featured_image: string | null;
  published_at: string | null;
  created_at: string;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, description, excerpt, author, category, featured_image, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }

  return data || [];
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

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
          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {posts.map((post, index) => (
                <Card
                  key={post.id}
                  className="group hover:shadow-[0_0_30px_rgba(233,69,96,0.15)] animate-fade-in opacity-0"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Featured Image */}
                  <div className="h-48 bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-accent)]/10 flex items-center justify-center rounded-t-xl overflow-hidden relative">
                    {post.featured_image ? (
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-[var(--color-text-muted)]" />
                    )}
                  </div>

                  <CardContent className="p-6">
                    {/* Category Badge */}
                    {post.category && (
                      <span className="inline-block px-2 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium rounded mb-3">
                        {post.category}
                      </span>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.published_at || post.created_at)}
                      </span>
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-[var(--color-accent)] transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {/* Excerpt/Description */}
                    <p className="text-[var(--color-text-secondary)] mb-4 line-clamp-3">
                      {post.description || post.excerpt || ""}
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
          ) : (
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
