"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Mode, Idea } from "@/lib/types";

const modeLabels: Record<Mode, string> = {
  domain: "Domain Explorer",
  trend: "Trend Scanner",
  refine: "Idea Refiner",
};

const modePlaceholders: Record<Mode, string> = {
  domain: "Enter a domain or vertical (e.g., healthcare compliance, supply chain AI, dev tools)...",
  trend: "Trend Scanner runs autonomously. Optionally add focus areas or constraints...",
  refine: "Describe your rough idea (e.g., AI tool that reads contracts and flags risky clauses)...",
};

const pipelineStages = [
  "Searching the web for market intelligence...",
  "Loading context documents...",
  "Claude is generating ideas...",
  "Gemini is generating ideas...",
  "Merging and deduplicating...",
  "Running validation pipeline (this takes a few minutes)...",
  "Scoring and ranking...",
];

function GenerateForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = (searchParams.get("mode") as Mode) || "domain";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedIdeas([]);
    setStageIndex(0);

    // Advance stage indicator periodically
    const stageTimer = setInterval(() => {
      setStageIndex((prev) => Math.min(prev + 1, pipelineStages.length - 1));
    }, 8000);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input }),
      });

      clearInterval(stageTimer);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.details || "Generation failed");
      }

      const data = await response.json();
      setGeneratedIdeas(data.ideas || []);

      if (data.ideas?.length > 0) {
        // Navigate to results after a brief pause to show success
        setTimeout(() => router.push("/results"), 1500);
      }
    } catch (err) {
      clearInterval(stageTimer);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Generate Ideas</h1>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-8">
        {(Object.keys(modeLabels) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => !isGenerating && setMode(m)}
            className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
              mode === m
                ? "bg-foreground text-background"
                : "border border-card-border text-muted hover:text-foreground"
            } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="border border-card-border bg-card rounded-lg p-6 mb-6">
        <label className="block text-sm font-mono text-muted mb-3">
          {modeLabels[mode]}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={modePlaceholders[mode]}
          rows={4}
          disabled={isGenerating}
          className="w-full bg-background border border-card-border rounded-md p-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-muted resize-none disabled:opacity-50"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || (mode !== "trend" && !input.trim())}
        className="w-full py-3 rounded-lg font-mono text-sm font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {isGenerating ? "Pipeline Running..." : "Generate & Validate Ideas"}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-6 border border-accent-red/30 bg-accent-red/5 rounded-lg p-4">
          <div className="text-sm text-accent-red font-mono">{error}</div>
        </div>
      )}

      {/* Pipeline Progress */}
      {isGenerating && (
        <div className="mt-8 border border-card-border bg-card rounded-lg p-6">
          <div className="space-y-3">
            {pipelineStages.map((stage, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-sm font-mono transition-opacity duration-500 ${
                  i <= stageIndex ? "opacity-100" : "opacity-20"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  i < stageIndex
                    ? "bg-accent-green"
                    : i === stageIndex
                    ? "bg-accent-amber animate-pulse"
                    : "bg-card-border"
                }`} />
                <span className={i <= stageIndex ? "text-foreground" : "text-muted"}>
                  {stage}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success state */}
      {!isGenerating && generatedIdeas.length > 0 && (
        <div className="mt-8 border border-accent-green/30 bg-accent-green/5 rounded-lg p-6">
          <div className="text-sm font-mono text-accent-green mb-2">
            Generated {generatedIdeas.length} ideas. Redirecting to results...
          </div>
          <div className="text-xs text-muted">
            {generatedIdeas.map((idea) => idea.name).join(" / ")}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="text-muted font-mono text-sm">Loading...</div>}>
      <GenerateForm />
    </Suspense>
  );
}
