"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Idea } from "@/lib/types";

export default function ResultsPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [sortBy, setSortBy] = useState<string>("consensus");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ideas")
      .then((r) => r.json())
      .then((data) => {
        setIdeas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sorted = [...ideas].sort((a, b) => {
    switch (sortBy) {
      case "consensus":
        return b.scores.consensus - a.scores.consensus;
      case "moat":
        return b.moat.overall - a.moat.overall;
      case "tam":
        return 0; // TODO: parse TAM values for sorting
      default:
        return 0;
    }
  });

  const scoreColor = (score: number) => {
    if (score >= 75) return "text-accent-green";
    if (score >= 50) return "text-accent-amber";
    return "text-accent-red";
  };

  const agreementBadge = (agreement: string) => {
    switch (agreement) {
      case "high":
        return <span className="text-accent-green">High</span>;
      case "medium":
        return <span className="text-accent-amber">Med</span>;
      case "low":
        return <span className="text-accent-red">Low</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-muted font-mono text-sm">Loading results...</span>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <span className="text-muted font-mono text-sm">No ideas generated yet.</span>
        <Link
          href="/generate"
          className="text-sm text-accent-blue hover:underline"
        >
          Generate your first batch &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Results</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-mono">Sort by:</span>
          {["consensus", "moat"].map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1 rounded text-xs font-mono ${
                sortBy === s
                  ? "bg-foreground text-background"
                  : "border border-card-border text-muted hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-card-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border bg-card text-muted font-mono text-xs">
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">Idea</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Moat</th>
              <th className="text-right p-3">Feasibility</th>
              <th className="text-right p-3">Consensus</th>
              <th className="text-center p-3">Agreement</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((idea, i) => (
              <tr
                key={idea.id}
                className="border-b border-card-border hover:bg-card/50 transition-colors"
              >
                <td className="p-3 font-mono text-muted">{i + 1}</td>
                <td className="p-3">
                  <Link
                    href={`/idea/${idea.id}`}
                    className="hover:text-accent-blue transition-colors"
                  >
                    <div className="font-medium">{idea.name}</div>
                    <div className="text-xs text-muted mt-0.5">{idea.oneLiner}</div>
                  </Link>
                </td>
                <td className="p-3 font-mono text-xs text-muted uppercase">
                  {idea.market.category}
                </td>
                <td className={`p-3 text-right font-mono ${scoreColor(idea.moat.overall * 10)}`}>
                  {idea.moat.overall.toFixed(1)}
                </td>
                <td className="p-3 text-right font-mono text-xs text-muted">
                  {idea.feasibility.resourceIntensity}
                </td>
                <td className={`p-3 text-right font-mono font-medium ${scoreColor(idea.scores.consensus)}`}>
                  {idea.scores.consensus}
                </td>
                <td className="p-3 text-center font-mono text-xs">
                  {agreementBadge(idea.scores.agreement)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
