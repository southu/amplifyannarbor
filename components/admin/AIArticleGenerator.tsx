"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles, RefreshCw, Check, FileText } from "lucide-react";

interface GeneratedArticle {
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
}

interface AIArticleGeneratorProps {
  onGenerated: (article: GeneratedArticle) => void;
}

export function AIArticleGenerator({ onGenerated }: AIArticleGeneratorProps) {
  const [rawContent, setRawContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (rawContent.trim().length < 100) {
      setError("Please enter at least 100 characters of content");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedArticle(null);

    try {
      const response = await fetch("/api/ai-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "generate",
          value: rawContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      if (data.result && typeof data.result === "object") {
        setGeneratedArticle(data.result);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseArticle = () => {
    if (generatedArticle) {
      onGenerated(generatedArticle);
    }
  };

  const handleStartOver = () => {
    setRawContent("");
    setGeneratedArticle(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">AI Article Generator</h2>
        <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
          Paste your raw content below and let AI transform it into a complete, SEO-optimized
          blog article with title, description, tags, and fully formatted content.
        </p>
      </div>

      {!generatedArticle ? (
        <>
          {/* Input Area */}
          <Card className="p-6">
            <CardContent className="p-0">
              <label className="block text-sm font-medium text-white mb-2">
                Raw Content Input
              </label>
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder={`Paste your raw content, notes, or topic outline here...

Examples of what you can paste:
- Rough draft of an article
- Meeting notes or interview transcripts
- Bullet points on a topic
- Research findings or data summaries
- Event details and announcements`}
                className="w-full h-64 p-4 bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none resize-y"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-[var(--color-text-muted)]">
                  {rawContent.length} characters (minimum 100)
                </span>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || rawContent.length < 100}
                  loading={isGenerating}
                  variant="gold"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? "Generating..." : "Generate Complete Article"}
                </Button>
              </div>
              {error && (
                <p className="mt-3 text-sm text-[var(--color-error)]">{error}</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Generated Article Preview */}
          <Card className="p-6 border-green-500/30 bg-green-500/5">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">Article Generated Successfully!</span>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                  TITLE
                </label>
                <p className="text-xl font-bold text-white">{generatedArticle.title}</p>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                  URL SLUG
                </label>
                <p className="text-[var(--color-text-secondary)] font-mono text-sm">
                  /{generatedArticle.slug}/
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                  META DESCRIPTION ({generatedArticle.description.length} chars)
                </label>
                <p className="text-[var(--color-text-secondary)]">
                  {generatedArticle.description}
                </p>
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                    CATEGORY
                  </label>
                  <span className="inline-block px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full text-sm">
                    {generatedArticle.category}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                    TAGS
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {generatedArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-white/10 text-[var(--color-text-secondary)] rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                  CONTENT PREVIEW
                </label>
                <div
                  className="p-4 bg-[var(--color-bg-elevated)] rounded-lg max-h-64 overflow-y-auto prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatedArticle.content }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <Button onClick={handleUseArticle} variant="gold" className="flex-1">
                  <FileText className="w-4 h-4" />
                  Use This Article
                </Button>
                <Button onClick={handleStartOver} variant="secondary">
                  <RefreshCw className="w-4 h-4" />
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
