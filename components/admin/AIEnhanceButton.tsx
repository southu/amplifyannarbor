"use client";

import { useState } from "react";
import { Sparkles, Check, X, Loader2 } from "lucide-react";

interface AIEnhanceButtonProps {
  type: "title" | "description" | "content";
  value: string;
  context?: {
    title?: string;
    description?: string;
    content?: string;
  };
  onEnhanced: (newValue: string) => void;
}

export function AIEnhanceButton({
  type,
  value,
  context,
  onEnhanced,
}: AIEnhanceButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!value || value.trim().length < 10) {
      setError("Add more content first");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/ai-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value, context }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Enhancement failed");
      }

      onEnhanced(data.result);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("AI enhance error:", err);
      setError(err instanceof Error ? err.message : "Enhancement failed");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleEnhance}
        disabled={status === "loading"}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          status === "loading"
            ? "bg-purple-500/20 text-purple-400 cursor-wait"
            : status === "success"
            ? "bg-green-500/20 text-green-400"
            : status === "error"
            ? "bg-red-500/20 text-red-400"
            : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
        }`}
        title={error || `Enhance ${type} with AI`}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enhancing...
          </>
        ) : status === "success" ? (
          <>
            <Check className="w-4 h-4" />
            Done!
          </>
        ) : status === "error" ? (
          <>
            <X className="w-4 h-4" />
            Error
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Enhance {type.charAt(0).toUpperCase() + type.slice(1)}
          </>
        )}
      </button>

      {/* Error tooltip */}
      {status === "error" && error && (
        <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-red-500/90 text-white text-xs rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}
