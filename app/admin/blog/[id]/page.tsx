"use client";

export const runtime = "edge";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AIEnhanceButton } from "@/components/admin/AIEnhanceButton";
import { AIArticleGenerator } from "@/components/admin/AIArticleGenerator";
import { SEOAnalyzer } from "@/components/admin/SEOAnalyzer";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Eye,
  BarChart3,
  Save,
  Send,
  X,
  Plus,
} from "lucide-react";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featured_image: string;
  status: "draft" | "published";
  published_at: string | null;
}

const CATEGORIES = ["News", "Events", "Community", "Impact", "Music"];

const DEFAULT_POST: BlogPost = {
  title: "",
  slug: "",
  description: "",
  content: "",
  author: "Amplify Ann Arbor",
  category: "News",
  tags: [],
  featured_image: "",
  status: "draft",
  published_at: null,
};

type TabType = "generate" | "edit" | "preview" | "seo";

export default function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === "new";

  const [post, setPost] = useState<BlogPost>(DEFAULT_POST);
  const [activeTab, setActiveTab] = useState<TabType>(isNew ? "generate" : "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    checkAuth();
    if (!isNew) {
      fetchPost();
    }
  }, [resolvedParams.id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

      if (error) throw error;

      if (data) {
        setPost({
          id: data.id,
          title: data.title || "",
          slug: data.slug || "",
          description: data.description || "",
          content: data.content || "",
          author: data.author || "Amplify Ann Arbor",
          category: data.category || "News",
          tags: data.tags || [],
          featured_image: data.featured_image || "",
          status: data.status || "draft",
          published_at: data.published_at,
        });
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      alert("Failed to load article");
      router.push("/admin/blog");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setPost((prev) => ({
      ...prev,
      title,
      // Auto-generate slug for new posts
      slug: isNew && !prev.slug ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSave = async (publishStatus: "draft" | "published") => {
    if (!post.title || !post.slug || !post.content) {
      alert("Please fill in title, slug, and content");
      return;
    }

    setIsSaving(true);

    try {
      const postData = {
        title: post.title,
        slug: post.slug,
        description: post.description,
        content: post.content,
        author: post.author,
        category: post.category,
        tags: post.tags,
        featured_image: post.featured_image,
        status: publishStatus,
        published_at: publishStatus === "published" ? new Date().toISOString() : post.published_at,
        modified_at: new Date().toISOString(),
      };

      if (isNew) {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert([postData])
          .select()
          .single();

        if (error) throw error;

        // Redirect to edit page with new ID
        router.push(`/admin/blog/${data.id}`);
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", resolvedParams.id);

        if (error) throw error;

        setPost((prev) => ({ ...prev, status: publishStatus }));
      }

      alert(publishStatus === "published" ? "Article published!" : "Draft saved!");
    } catch (error: unknown) {
      console.error("Error saving post:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to save: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag && !post.tags.includes(newTag)) {
      setPost((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setPost((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleGeneratedArticle = (article: {
    title: string;
    slug: string;
    description: string;
    content: string;
    category: string;
    tags: string[];
  }) => {
    setPost((prev) => ({
      ...prev,
      title: article.title,
      slug: article.slug,
      description: article.description,
      content: article.content,
      category: article.category,
      tags: article.tags,
    }));
    setActiveTab("edit");
  };

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    ...(isNew ? [{ id: "generate" as TabType, label: "AI Generate", icon: Sparkles }] : []),
    { id: "edit", label: "Edit", icon: FileText },
    { id: "preview", label: "Preview", icon: Eye },
    { id: "seo", label: "SEO Analysis", icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--color-bg-card)] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/blog"
              className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="text-xl font-bold text-white">
              {isNew ? "New Article" : "Edit Article"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => handleSave("draft")}
              disabled={isSaving}
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button
              variant="default"
              onClick={() => handleSave("published")}
              disabled={isSaving}
              loading={isSaving}
            >
              <Send className="w-4 h-4" />
              Publish
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 border-b border-white/10 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                    : "border-transparent text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Generate Tab */}
        {activeTab === "generate" && (
          <AIArticleGenerator onGenerated={handleGeneratedArticle} />
        )}

        {/* Edit Tab */}
        {activeTab === "edit" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white">Title *</label>
                    <AIEnhanceButton
                      type="title"
                      value={post.title}
                      onEnhanced={(title) => setPost((prev) => ({ ...prev, title }))}
                    />
                  </div>
                  <input
                    type="text"
                    value={post.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter article title..."
                    className="w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg px-4 py-3 text-white text-lg placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
                  />
                </CardContent>
              </Card>

              {/* Slug */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <label className="block text-sm font-medium text-white mb-2">URL Slug *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--color-text-muted)]">/</span>
                    <input
                      type="text"
                      value={post.slug}
                      onChange={(e) => setPost((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="article-url-slug"
                      className="flex-1 bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg px-4 py-3 text-white font-mono placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
                    />
                    <span className="text-[var(--color-text-muted)]">/</span>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white">Description (for SEO)</label>
                    <AIEnhanceButton
                      type="description"
                      value={post.description}
                      context={{ title: post.title, content: post.content }}
                      onEnhanced={(description) => setPost((prev) => ({ ...prev, description }))}
                    />
                  </div>
                  <textarea
                    value={post.description}
                    onChange={(e) => setPost((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description for search engines (160 chars recommended)..."
                    rows={3}
                    className="w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none resize-none"
                  />
                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                    {post.description.length} / 160 characters
                  </p>
                </CardContent>
              </Card>

              {/* Content */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white">Content *</label>
                    <AIEnhanceButton
                      type="content"
                      value={post.content}
                      context={{ title: post.title, description: post.description }}
                      onEnhanced={(content) => setPost((prev) => ({ ...prev, content }))}
                    />
                  </div>
                  <RichTextEditor
                    value={post.content}
                    onChange={(content) => setPost((prev) => ({ ...prev, content }))}
                    placeholder="Write your article content here..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <label className="block text-sm font-medium text-white mb-3">Status</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPost((prev) => ({ ...prev, status: "draft" }))}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        post.status === "draft"
                          ? "bg-amber-500 text-white"
                          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-white"
                      }`}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setPost((prev) => ({ ...prev, status: "published" }))}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        post.status === "published"
                          ? "bg-green-500 text-white"
                          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-white"
                      }`}
                    >
                      Published
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Author & Date */}
              <Card className="p-6">
                <CardContent className="p-0 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Author</label>
                    <input
                      type="text"
                      value={post.author}
                      onChange={(e) => setPost((prev) => ({ ...prev, author: e.target.value }))}
                      placeholder="Author name"
                      className="w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Publish Date</label>
                    <input
                      type="date"
                      value={post.published_at?.split("T")[0] || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setPost((prev) => ({ ...prev, published_at: e.target.value }))}
                      className="w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[var(--color-accent)] focus:outline-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Category */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <label className="block text-sm font-medium text-white mb-2">Category</label>
                  <select
                    value={post.category}
                    onChange={(e) => setPost((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[var(--color-accent)] focus:outline-none appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <label className="block text-sm font-medium text-white mb-2">Tags</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag..."
                      className="flex-1 bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
                    />
                    <Button variant="secondary" onClick={handleAddTag} size="sm">
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <label className="block text-sm font-medium text-white mb-2">Featured Image</label>
                  <ImageUpload
                    value={post.featured_image}
                    onChange={(url) => setPost((prev) => ({ ...prev, featured_image: url }))}
                    folder="posts"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === "preview" && (
          <Card className="max-w-4xl mx-auto p-8">
            <CardContent className="p-0">
              {/* Category Badge */}
              {post.category && (
                <span className="inline-block px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full text-sm font-medium mb-4">
                  {post.category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-4xl font-bold text-white mb-4">
                {post.title || "Untitled Article"}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-[var(--color-text-secondary)] text-sm mb-8 pb-8 border-b border-white/10">
                <span>By {post.author || "Unknown"}</span>
                <span>•</span>
                <span>{new Date(post.published_at || Date.now()).toLocaleDateString()}</span>
              </div>

              {/* Featured Image */}
              {post.featured_image && (
                <div className="aspect-video rounded-xl overflow-hidden mb-8">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div
                className="prose prose-invert max-w-none
                  prose-headings:text-white prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-[var(--color-text-secondary)] prose-p:leading-relaxed
                  prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white prose-em:text-[var(--color-text-secondary)]
                  prose-ul:text-[var(--color-text-secondary)] prose-li:marker:text-[var(--color-accent)]"
                dangerouslySetInnerHTML={{ __html: post.content || "<p>No content yet</p>" }}
              />

              {/* Tags */}
              {post.tags.length > 0 && (
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
            </CardContent>
          </Card>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <SEOAnalyzer
            title={post.title}
            description={post.description}
            content={post.content}
            slug={post.slug}
            onApplyTitle={(title) => setPost((prev) => ({ ...prev, title }))}
            onApplyDescription={(description) => setPost((prev) => ({ ...prev, description }))}
          />
        )}
      </main>
    </div>
  );
}
