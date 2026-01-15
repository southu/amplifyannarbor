"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Search,
  Globe,
  MapPin,
  TrendingUp,
  CheckCircle,
  Loader2,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Link as LinkIcon,
} from "lucide-react";

interface Citation {
  url: string;
  title?: string;
}

interface ResearchResult {
  content: string;
  citations: Citation[];
  relatedQuestions: string[];
}

interface ResearchPanelProps {
  onInsertContent?: (content: string) => void;
  onInsertLink?: (url: string, title: string) => void;
  articleContext?: {
    title?: string;
    content?: string;
  };
}

type ResearchType = "research" | "fact-check" | "find-sources" | "local-research" | "trending";

const RESEARCH_TYPES: { type: ResearchType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: "research", label: "Deep Research", icon: <Search className="w-4 h-4" />, description: "Comprehensive research on a topic" },
  { type: "find-sources", label: "Find Sources", icon: <LinkIcon className="w-4 h-4" />, description: "Find credible sources to cite" },
  { type: "local-research", label: "Local (Ann Arbor)", icon: <MapPin className="w-4 h-4" />, description: "Ann Arbor & Michigan focus" },
  { type: "trending", label: "Trending Angles", icon: <TrendingUp className="w-4 h-4" />, description: "Find timely hooks & news angles" },
  { type: "fact-check", label: "Fact Check", icon: <CheckCircle className="w-4 h-4" />, description: "Verify claims in your content" },
];

export function ResearchPanel({ onInsertContent, onInsertLink, articleContext }: ResearchPanelProps) {
  const [query, setQuery] = useState("");
  const [researchType, setResearchType] = useState<ResearchType>("research");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [showCitations, setShowCitations] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Use ChatGPT to enhance the research prompt
  const enhancePrompt = async () => {
    if (!query.trim()) return;

    setIsEnhancingPrompt(true);
    try {
      const response = await fetch("/api/ai-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom",
          value: query,
          context: `You are helping write a research prompt for Perplexity AI. The user wants to research: "${query}"

The research is for a blog article on Amplify Ann Arbor, a charity concert supporting Meals on Wheels.

Enhance this prompt to be more specific and likely to return useful, well-sourced information. Add:
- Specific aspects to investigate
- Time frame preferences (recent data)
- Types of sources to prioritize
- Related angles that would enrich the article

Return ONLY the enhanced prompt, nothing else.`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          setQuery(data.result);
        }
      }
    } catch (err) {
      console.error("Failed to enhance prompt:", err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const doResearch = async () => {
    if (!query.trim() && researchType !== "fact-check") return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: researchType,
          topic: researchType === "fact-check" ? articleContext?.content || query : query,
          context: articleContext?.title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Research failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatCitationForMarkdown = (citation: Citation, index: number) => {
    const title = citation.title || new URL(citation.url).hostname;
    return `[${title}](${citation.url})`;
  };

  return (
    <div className="space-y-4">
      {/* Research Type Selector */}
      <div className="flex flex-wrap gap-2">
        {RESEARCH_TYPES.map(({ type, label, icon, description }) => (
          <button
            key={type}
            onClick={() => setResearchType(type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
              researchType === type
                ? "bg-[var(--color-accent)] text-black"
                : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:bg-white/10"
            }`}
            title={description}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Query Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                researchType === "fact-check"
                  ? "Paste content to fact-check, or leave empty to check the current article..."
                  : "What would you like to research?"
              }
              rows={3}
              className="w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={enhancePrompt}
            disabled={!query.trim() || isEnhancingPrompt}
            variant="outline"
            className="text-sm"
          >
            {isEnhancingPrompt ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Enhance with GPT
          </Button>

          <Button
            onClick={doResearch}
            disabled={isLoading || (!query.trim() && researchType !== "fact-check")}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Globe className="w-4 h-4 mr-2" />
            )}
            Research with Perplexity
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Main Content */}
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
                  Research Findings
                </h3>
                {onInsertContent && (
                  <Button
                    onClick={() => onInsertContent(result.content)}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Insert into Article
                  </Button>
                )}
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-[var(--color-text-secondary)] leading-relaxed">
                  {result.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Citations */}
          {result.citations.length > 0 && (
            <Card className="p-4">
              <CardContent className="p-0">
                <button
                  onClick={() => setShowCitations(!showCitations)}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-[var(--color-accent)]" />
                    Sources ({result.citations.length})
                  </h3>
                  {showCitations ? (
                    <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                  )}
                </button>

                {showCitations && (
                  <div className="space-y-2">
                    {result.citations.map((citation, index) => {
                      const displayTitle = citation.title || new URL(citation.url).hostname;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-[var(--color-bg)] rounded-lg group"
                        >
                          <span className="text-xs text-[var(--color-accent)] font-mono w-6">
                            [{index + 1}]
                          </span>
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] truncate"
                          >
                            {displayTitle}
                          </a>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyToClipboard(citation.url, index)}
                              className="p-1 hover:bg-white/10 rounded"
                              title="Copy URL"
                            >
                              {copiedIndex === index ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-[var(--color-text-muted)]" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                copyToClipboard(formatCitationForMarkdown(citation, index), index + 100)
                              }
                              className="p-1 hover:bg-white/10 rounded"
                              title="Copy as Markdown link"
                            >
                              <LinkIcon className="w-3 h-3 text-[var(--color-text-muted)]" />
                            </button>
                            <a
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <ExternalLink className="w-3 h-3 text-[var(--color-text-muted)]" />
                            </a>
                          </div>
                        </div>
                      );
                    })}

                    {/* Copy all as markdown */}
                    <Button
                      onClick={() => {
                        const allLinks = result.citations
                          .map((c, i) => formatCitationForMarkdown(c, i))
                          .join("\n");
                        copyToClipboard(allLinks, -1);
                      }}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy All as Markdown
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Related Questions */}
          {result.relatedQuestions && result.relatedQuestions.length > 0 && (
            <Card className="p-4">
              <CardContent className="p-0">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-[var(--color-accent)]" />
                  Related Questions
                </h3>
                <div className="space-y-2">
                  {result.relatedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(question);
                        doResearch();
                      }}
                      className="w-full text-left p-2 bg-[var(--color-bg)] rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Research Suggestions */}
      {!result && !isLoading && (
        <div className="text-center py-8 text-[var(--color-text-muted)]">
          <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            Research any topic with Perplexity AI
            <br />
            <span className="text-xs">Get real-time information with citations</span>
          </p>
        </div>
      )}
    </div>
  );
}
