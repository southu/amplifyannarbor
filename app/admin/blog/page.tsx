"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Search,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAuth();
    fetchPosts();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    
    // Placeholder data - would be fetched from Supabase
    setPosts([
      {
        id: "1",
        title: "Announcing Amplify Ann Arbor 2026",
        slug: "announcing-amplify-ann-arbor-2026",
        excerpt: "We're thrilled to announce that Amplify Ann Arbor is returning...",
        status: "published",
        published_at: "2026-01-10",
        created_at: "2026-01-10",
      },
      {
        id: "2",
        title: "Thank You to Our 2025 Supporters",
        slug: "thank-you-2025-supporters",
        excerpt: "A heartfelt thank you to everyone who made last year's event a success.",
        status: "published",
        published_at: "2025-08-15",
        created_at: "2025-08-15",
      },
      {
        id: "3",
        title: "Draft: Upcoming Announcements",
        slug: "upcoming-announcements",
        excerpt: "This is a draft post that will be published soon.",
        status: "draft",
        published_at: null,
        created_at: "2026-01-12",
      },
    ]);
    
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    // Would delete from Supabase
    setPosts(posts.filter(p => p.id !== id));
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activePage="blog" />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
            <p className="text-[var(--color-text-secondary)]">
              Manage your blog content
            </p>
          </div>
          <Link href="/admin/blog/new">
            <Button variant="default">
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="p-6">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white truncate">
                        {post.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          post.status === "published"
                            ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                            : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm mb-2 line-clamp-1">
                      {post.excerpt}
                    </p>
                    <p className="text-[var(--color-text-muted)] text-xs">
                      {post.status === "published" && post.published_at
                        ? `Published ${formatDate(post.published_at)}`
                        : `Created ${formatDate(post.created_at)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/blog/${post.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(post.id)}
                      className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPosts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)]">
                {searchQuery ? "No posts found" : "No blog posts yet"}
              </p>
              <Link href="/admin/blog/new" className="mt-4 inline-block">
                <Button variant="default">
                  <Plus className="w-4 h-4" />
                  Create Your First Post
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

