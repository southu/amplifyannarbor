import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  User,
  ArrowLeft,
  Facebook,
  Twitter,
  BookOpen,
} from "lucide-react";

export const runtime = "edge";
export const revalidate = 60;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  featured_image: string | null;
  published_at: string | null;
  created_at: string;
}

async function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getRelatedPosts(currentId: string, category: string | null): Promise<BlogPost[]> {
  const supabase = await getSupabaseClient();

  let query = supabase
    .from("blog_posts")
    .select("id, title, slug, description, featured_image, published_at, created_at, author, category, content, tags")
    .eq("status", "published")
    .neq("id", currentId)
    .limit(2);

  if (category) {
    query = query.eq("category", category);
  }

  const { data } = await query.order("published_at", { ascending: false });

  return data || [];
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description || undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id, post.category);

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
              {/* Category Badge */}
              {post.category && (
                <span className="inline-block px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-medium rounded-full mb-4">
                  {post.category}
                </span>
              )}

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--color-accent)]" />
                  {formatDate(post.published_at || post.created_at)}
                </span>
                {post.author && (
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[var(--color-accent)]" />
                    {post.author}
                  </span>
                )}
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              </div>
            )}

            {/* Content - HTML from admin editor */}
            <div
              className="blog-content prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <style jsx global>{`
              .blog-content h2 {
                font-size: 1.75rem;
                font-weight: 700;
                color: white;
                margin-top: 2.5rem;
                margin-bottom: 1rem;
                line-height: 1.3;
              }
              .blog-content h3 {
                font-size: 1.375rem;
                font-weight: 600;
                color: white;
                margin-top: 2rem;
                margin-bottom: 0.75rem;
                line-height: 1.4;
              }
              .blog-content p {
                color: var(--color-text-secondary);
                line-height: 1.8;
                margin-bottom: 1.25rem;
              }
              .blog-content strong {
                color: white;
                font-weight: 600;
              }
              .blog-content em {
                color: var(--color-text-muted);
              }
              .blog-content a {
                color: var(--color-accent);
                text-decoration: none;
              }
              .blog-content a:hover {
                text-decoration: underline;
              }
              .blog-content ul, .blog-content ol {
                color: var(--color-text-secondary);
                margin-bottom: 1.25rem;
                padding-left: 1.5rem;
              }
              .blog-content li {
                margin-bottom: 0.5rem;
                line-height: 1.7;
              }
              .blog-content li::marker {
                color: var(--color-accent);
              }
              .blog-content blockquote {
                border-left: 4px solid var(--color-accent);
                padding-left: 1.25rem;
                margin: 1.5rem 0;
                font-style: italic;
                color: var(--color-text-muted);
              }
              .blog-content hr {
                border-color: rgba(255, 255, 255, 0.1);
                margin: 2rem 0;
              }
              .blog-content img {
                border-radius: 0.75rem;
                margin: 1.5rem 0;
              }
              .blog-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5rem 0;
              }
              .blog-content th {
                background: var(--color-bg-elevated);
                padding: 0.75rem 1rem;
                text-align: left;
                color: white;
                font-weight: 600;
                border: 1px solid rgba(255, 255, 255, 0.1);
              }
              .blog-content td {
                padding: 0.75rem 1rem;
                color: var(--color-text-secondary);
                border: 1px solid rgba(255, 255, 255, 0.1);
              }
            `}</style>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/10 text-[var(--color-text-secondary)] rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="mt-8 pt-8 border-t border-white/10">
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
                      {formatDate(relatedPost.published_at || relatedPost.created_at)}
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
                      {relatedPost.description}
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
