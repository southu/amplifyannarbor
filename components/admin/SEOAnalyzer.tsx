"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";

interface SEOAnalyzerProps {
  title: string;
  description: string;
  content: string;
  slug: string;
  onApplyTitle: (title: string) => void;
  onApplyDescription: (description: string) => void;
}

interface SEOCheck {
  label: string;
  status: "good" | "warning" | "error";
  message: string;
}

interface AIAnalysis {
  score: number;
  suggestedTitle: string;
  suggestedDescription: string;
  keywords: string[];
  improvements: string[];
}

export function SEOAnalyzer({
  title,
  description,
  content,
  slug,
  onApplyTitle,
  onApplyDescription,
}: SEOAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [appliedTitle, setAppliedTitle] = useState(false);
  const [appliedDescription, setAppliedDescription] = useState(false);

  // Basic SEO checks (client-side, instant)
  const basicChecks = useMemo((): SEOCheck[] => {
    const checks: SEOCheck[] = [];

    // Title length
    if (!title) {
      checks.push({ label: "Title", status: "error", message: "Add a title" });
    } else if (title.length < 30) {
      checks.push({ label: "Title", status: "warning", message: `Too short (${title.length}/60 chars)` });
    } else if (title.length > 60) {
      checks.push({ label: "Title", status: "warning", message: `May be truncated (${title.length}/60 chars)` });
    } else {
      checks.push({ label: "Title", status: "good", message: `Good length (${title.length}/60 chars)` });
    }

    // Description length
    if (!description) {
      checks.push({ label: "Description", status: "error", message: "Add a meta description" });
    } else if (description.length < 120) {
      checks.push({ label: "Description", status: "warning", message: `Too short (${description.length}/160 chars)` });
    } else if (description.length > 160) {
      checks.push({ label: "Description", status: "warning", message: `Will be truncated (${description.length}/160 chars)` });
    } else {
      checks.push({ label: "Description", status: "good", message: `Perfect length (${description.length}/160 chars)` });
    }

    // Content word count
    const wordCount = content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
    if (wordCount < 300) {
      checks.push({ label: "Content", status: "warning", message: `Short content (${wordCount} words, aim for 300+)` });
    } else if (wordCount >= 1000) {
      checks.push({ label: "Content", status: "good", message: `Excellent length (${wordCount} words)` });
    } else {
      checks.push({ label: "Content", status: "good", message: `Good length (${wordCount} words)` });
    }

    // Heading structure
    const h2Count = (content.match(/<h2/gi) || []).length;
    if (h2Count === 0) {
      checks.push({ label: "Headings", status: "error", message: "Add H2 headings for structure" });
    } else {
      checks.push({ label: "Headings", status: "good", message: `${h2Count} H2 heading${h2Count > 1 ? "s" : ""} found` });
    }

    // Images
    const imgCount = (content.match(/<img/gi) || []).length;
    const imgWithAlt = (content.match(/<img[^>]*alt="[^"]+"/gi) || []).length;
    if (imgCount === 0) {
      checks.push({ label: "Images", status: "warning", message: "Add images for engagement" });
    } else if (imgWithAlt < imgCount) {
      checks.push({ label: "Images", status: "warning", message: `${imgCount - imgWithAlt} image(s) missing alt text` });
    } else {
      checks.push({ label: "Images", status: "good", message: `${imgCount} image${imgCount > 1 ? "s" : ""} with alt text` });
    }

    // URL slug
    if (!slug) {
      checks.push({ label: "URL", status: "error", message: "Add a URL slug" });
    } else if (slug.includes("--") || slug.includes("_")) {
      checks.push({ label: "URL", status: "warning", message: "Use single hyphens only" });
    } else if (slug.length > 50) {
      checks.push({ label: "URL", status: "warning", message: "Keep URL shorter (under 50 chars)" });
    } else {
      checks.push({ label: "URL", status: "good", message: "Clean URL structure" });
    }

    // Links
    const linkCount = (content.match(/<a /gi) || []).length;
    if (linkCount === 0) {
      checks.push({ label: "Links", status: "warning", message: "Add internal or external links" });
    } else {
      checks.push({ label: "Links", status: "good", message: `${linkCount} link${linkCount > 1 ? "s" : ""} found` });
    }

    return checks;
  }, [title, description, content, slug]);

  // Calculate basic score
  const basicScore = useMemo(() => {
    const good = basicChecks.filter((c) => c.status === "good").length;
    return Math.round((good / basicChecks.length) * 100);
  }, [basicChecks]);

  // AI Analysis
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    setAppliedTitle(false);
    setAppliedDescription(false);

    try {
      const response = await fetch("/api/ai-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "seo",
          value: content,
          context: { title, description, content },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      if (data.result && typeof data.result === "object") {
        setAiAnalysis(data.result);
      }
    } catch (err) {
      console.error("SEO analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyTitle = () => {
    if (aiAnalysis?.suggestedTitle) {
      onApplyTitle(aiAnalysis.suggestedTitle);
      setAppliedTitle(true);
      setTimeout(() => setAppliedTitle(false), 2000);
    }
  };

  const handleApplyDescription = () => {
    if (aiAnalysis?.suggestedDescription) {
      onApplyDescription(aiAnalysis.suggestedDescription);
      setAppliedDescription(true);
      setTimeout(() => setAppliedDescription(false), 2000);
    }
  };

  const StatusIcon = ({ status }: { status: SEOCheck["status"] }) => {
    switch (status) {
      case "good":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Basic Checks */}
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Basic SEO Checks</h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                basicScore >= 80
                  ? "bg-green-500/10 text-green-400"
                  : basicScore >= 50
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {basicScore}%
            </div>
          </div>

          <div className="space-y-3">
            {basicChecks.map((check) => (
              <div
                key={check.label}
                className="flex items-center gap-3 p-3 bg-[var(--color-bg-elevated)] rounded-lg"
              >
                <StatusIcon status={check.status} />
                <div className="flex-1">
                  <span className="text-sm font-medium text-white">{check.label}</span>
                  <p className="text-xs text-[var(--color-text-muted)]">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">AI Analysis</h3>
            <Button
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              variant="secondary"
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze with AI
                </>
              )}
            </Button>
          </div>

          {!aiAnalysis && !isAnalyzing && (
            <div className="text-center py-8 text-[var(--color-text-muted)]">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Click "Analyze with AI" for detailed recommendations</p>
            </div>
          )}

          {aiAnalysis && (
            <div className="space-y-4">
              {/* AI Score */}
              <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-elevated)] rounded-lg">
                <div
                  className={`text-2xl font-bold ${
                    aiAnalysis.score >= 80
                      ? "text-green-400"
                      : aiAnalysis.score >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {aiAnalysis.score}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">AI SEO Score</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Based on content analysis</p>
                </div>
              </div>

              {/* Suggested Title */}
              {aiAnalysis.suggestedTitle && (
                <div className="p-3 bg-[var(--color-bg-elevated)] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--color-text-muted)]">SUGGESTED TITLE</span>
                    <button
                      onClick={handleApplyTitle}
                      className={`text-xs font-medium ${
                        appliedTitle ? "text-green-400" : "text-[var(--color-accent)] hover:underline"
                      }`}
                    >
                      {appliedTitle ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" /> Applied
                        </span>
                      ) : (
                        "Use this"
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-white">{aiAnalysis.suggestedTitle}</p>
                </div>
              )}

              {/* Suggested Description */}
              {aiAnalysis.suggestedDescription && (
                <div className="p-3 bg-[var(--color-bg-elevated)] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--color-text-muted)]">SUGGESTED DESCRIPTION</span>
                    <button
                      onClick={handleApplyDescription}
                      className={`text-xs font-medium ${
                        appliedDescription ? "text-green-400" : "text-[var(--color-accent)] hover:underline"
                      }`}
                    >
                      {appliedDescription ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" /> Applied
                        </span>
                      ) : (
                        "Use this"
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {aiAnalysis.suggestedDescription}
                  </p>
                </div>
              )}

              {/* Keywords */}
              {aiAnalysis.keywords && aiAnalysis.keywords.length > 0 && (
                <div className="p-3 bg-[var(--color-bg-elevated)] rounded-lg">
                  <span className="text-xs text-[var(--color-text-muted)] block mb-2">TARGET KEYWORDS</span>
                  <div className="flex flex-wrap gap-1">
                    {aiAnalysis.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-0.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {aiAnalysis.improvements && aiAnalysis.improvements.length > 0 && (
                <div className="p-3 bg-[var(--color-bg-elevated)] rounded-lg">
                  <span className="text-xs text-[var(--color-text-muted)] block mb-2">IMPROVEMENTS</span>
                  <ul className="space-y-1">
                    {aiAnalysis.improvements.map((improvement, i) => (
                      <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                        <span className="text-[var(--color-accent)]">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
