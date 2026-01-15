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
  Filter,
  ExternalLink,
  LogOut,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  author: string;
  category: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  published: number;
  draft: number;
}

const CATEGORIES = ["All Categories", "News", "Events", "Community", "Impact", "Music"];

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0 });

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
    
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, description, author, category, status, published_at, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const blogPosts = (data || []) as BlogPost[];
      setPosts(blogPosts);

      // Calculate stats
      setStats({
        total: blogPosts.length,
        published: blogPosts.filter((p) => p.status === "published").length,
        draft: blogPosts.filter((p) => p.status === "draft").length,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Use empty state on error
      setPosts([]);
      setStats({ total: 0, published: 0, draft: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPosts(posts.filter((p) => p.id !== id));
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
        published: posts.find((p) => p.id === id)?.status === "published" 
          ? prev.published - 1 
          : prev.published,
        draft: posts.find((p) => p.id === id)?.status === "draft" 
          ? prev.draft - 1 
          : prev.draft,
      }));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    
    const matchesCategory = categoryFilter === "All Categories" || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activePage="blog" />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Blog Admin</h1>
            <p className="text-[var(--color-text-secondary)]">
              Manage your blog articles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            <Link href="/admin/blog/new">
              <Button variant="default">
                <Plus className="w-4 h-4" />
                New Article
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <CardContent className="p-0">
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">Total Articles</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="p-6 border-green-500/20">
            <CardContent className="p-0">
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">Published</p>
              <p className="text-3xl font-bold text-green-400">{stats.published}</p>
            </CardContent>
          </Card>
          <Card className="p-6 border-amber-500/20">
            <CardContent className="p-0">
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">Drafts</p>
              <p className="text-3xl font-bold text-amber-400">{stats.draft}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[var(--color-text-muted)]" />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
              className="bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-accent)] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-accent)] focus:outline-none appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)]">Loading articles...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Title</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Category</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Author</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Date</th>
                    <th className="text-right p-4 text-sm font-medium text-[var(--color-text-secondary)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{post.title}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">/{post.slug}/</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            post.status === "published"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-[var(--color-text-secondary)]">
                        {post.category || "—"}
                      </td>
                      <td className="p-4 text-[var(--color-text-secondary)]">
                        {post.author || "—"}
                      </td>
                      <td className="p-4 text-[var(--color-text-secondary)]">
                        {formatDate(post.published_at || post.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" title="View Live">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/blog/${post.id}`}>
                            <Button variant="ghost" size="icon" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(post.id)}
                            className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-white/10 text-sm text-[var(--color-text-muted)]">
              Showing {filteredPosts.length} of {stats.total} articles
            </div>
          </Card>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] mb-4">
              {searchQuery || statusFilter !== "all" || categoryFilter !== "All Categories"
                ? "No articles match your filters"
                : "No blog articles yet"}
            </p>
            {!searchQuery && statusFilter === "all" && categoryFilter === "All Categories" && (
              <Link href="/admin/blog/new">
                <Button variant="default">
                  <Plus className="w-4 h-4" />
                  Create Your First Article
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
