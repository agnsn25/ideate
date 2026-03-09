"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Idea } from "@/lib/types";

export default function IdeaDetailPage() {
  const params = useParams();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    fetch(`/api/ideas/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setIdea(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-muted font-mono text-sm">Loading...</span>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-muted font-mono text-sm">Idea not found.</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Overview */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{idea.name}</h1>
          <span className="text-xs font-mono px-2 py-0.5 border border-card-border rounded text-muted">
            {idea.generatedBy}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 border border-card-border rounded text-muted uppercase">
            {idea.market.category}
          </span>
        </div>
        <p className="text-muted">{idea.oneLiner}</p>
        <p className="mt-4 text-sm leading-relaxed">{idea.description}</p>
      </div>

      {/* Scores Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Claude", value: idea.scores.claude },
          { label: "Gemini", value: idea.scores.gemini },
          { label: "Consensus", value: idea.scores.consensus },
          { label: "Moat", value: idea.moat.overall * 10 },
        ].map((s) => (
          <div key={s.label} className="border border-card-border bg-card rounded-lg p-4 text-center">
            <div className="text-xs font-mono text-muted mb-1">{s.label}</div>
            <div className={`text-2xl font-mono font-bold ${
              s.value >= 75 ? "text-accent-green" : s.value >= 50 ? "text-accent-amber" : "text-accent-red"
            }`}>
              {Math.round(s.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Market */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 font-mono">Market</h2>
        <div className="grid grid-cols-3 gap-4">
          {(["tam", "sam", "som"] as const).map((key) => (
            <div key={key} className="border border-card-border bg-card rounded-lg p-4">
              <div className="text-xs font-mono text-muted uppercase mb-1">{key}</div>
              <div className="text-lg font-mono font-medium">{idea.market[key].value}</div>
              <div className="text-xs text-muted mt-1">
                Confidence: {idea.market[key].confidence}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm text-muted font-mono">
          Growth Rate: {idea.market.growthRate}
        </div>
      </section>

      {/* Competitors */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 font-mono">Competitors</h2>
        <div className="border border-card-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border bg-card text-muted font-mono text-xs">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Stage</th>
                <th className="text-left p-3">Threat</th>
                <th className="text-left p-3">Differentiation</th>
              </tr>
            </thead>
            <tbody>
              {idea.competitors.map((c, i) => (
                <tr key={i} className="border-b border-card-border">
                  <td className="p-3 font-medium">
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
                        {c.name}
                      </a>
                    ) : c.name}
                  </td>
                  <td className="p-3 text-xs font-mono text-muted">{c.stage}</td>
                  <td className={`p-3 text-xs font-mono ${
                    c.threat === "high" ? "text-accent-red" : c.threat === "medium" ? "text-accent-amber" : "text-accent-green"
                  }`}>
                    {c.threat}
                  </td>
                  <td className="p-3 text-xs text-muted">{c.differentiation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Moat */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 font-mono">Moat Analysis</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Data Network Effects", value: idea.moat.dataNetworkEffects },
            { label: "Regulatory Barrier", value: idea.moat.regulatoryBarrier },
            { label: "Domain Expertise", value: idea.moat.domainExpertise },
            { label: "Switching Costs", value: idea.moat.switchingCosts },
            { label: "Won't Build Filter", value: idea.moat.wontBuildFilter },
            { label: "Time to Value", value: idea.moat.timeToValue },
          ].map((m) => (
            <div key={m.label} className="border border-card-border bg-card rounded-lg p-3">
              <div className="text-xs text-muted mb-1">{m.label}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      m.value >= 7 ? "bg-accent-green" : m.value >= 4 ? "bg-accent-amber" : "bg-accent-red"
                    }`}
                    style={{ width: `${m.value * 10}%` }}
                  />
                </div>
                <span className="text-sm font-mono w-6 text-right">{m.value}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">{idea.moat.reasoning}</p>
      </section>

      {/* Feasibility */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 font-mono">Feasibility</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Resources", value: idea.feasibility.resourceIntensity },
            { label: "Tech Readiness", value: idea.feasibility.techReadiness.replace(/_/g, " ") },
            { label: "MVP Cost", value: idea.feasibility.estimatedMvpCost },
            { label: "Team Size", value: idea.feasibility.teamSize },
          ].map((f) => (
            <div key={f.label} className="border border-card-border bg-card rounded-lg p-4">
              <div className="text-xs font-mono text-muted mb-1">{f.label}</div>
              <div className="text-sm font-medium">{f.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm text-muted">
          <strong>Revenue Model:</strong> {idea.feasibility.revenueModel}
        </div>
      </section>

      {/* Trajectory */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 font-mono">Growth Trajectory</h2>
        <div className="space-y-4">
          {(["phase1", "phase2", "phase3", "phase4"] as const).map((phase, i) => {
            const p = idea.trajectory[phase];
            const timeframes = ["0-6 months", "6-18 months", "18-36 months", "3-5 years"];
            return (
              <div key={phase} className="border border-card-border bg-card rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 bg-accent-blue/10 text-accent-blue rounded">
                    Phase {i + 1}
                  </span>
                  <span className="text-xs text-muted font-mono">{timeframes[i]}</span>
                </div>
                <div className="font-medium text-sm mb-1">{p.label}</div>
                <p className="text-xs text-muted mb-2">{p.description}</p>
                <ul className="text-xs text-muted space-y-1">
                  {p.milestones.map((m, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-accent-green mt-0.5">-</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* LLM Disagreements */}
      {idea.scores.disagreements.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 font-mono">Key Disagreements</h2>
          <div className="border border-accent-amber/30 bg-accent-amber/5 rounded-lg p-4">
            <ul className="space-y-2 text-sm">
              {idea.scores.disagreements.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent-amber">!</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
