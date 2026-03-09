import Link from "next/link";

const modes = [
  {
    title: "Domain Explorer",
    description: "Provide a theme or vertical, get 5-10 validated startup ideas within it.",
    example: '"healthcare compliance", "supply chain AI", "dev tools"',
    href: "/generate?mode=domain",
    accent: "text-accent-blue",
  },
  {
    title: "Trend Scanner",
    description: "Autonomous mode. Searches current AI news, funding, and emerging tech to find whitespace opportunities.",
    example: "No input needed — fully autonomous",
    href: "/generate?mode=trend",
    accent: "text-accent-purple",
  },
  {
    title: "Idea Refiner",
    description: "Pitch a rough idea. It gets pressure-tested, evolved, and scored by two competing LLMs.",
    example: '"AI tool that reads contracts and flags risky clauses"',
    href: "/generate?mode=refine",
    accent: "text-accent-green",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center pt-16 pb-20">
      <div className="text-center max-w-2xl mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Ideate AI
        </h1>
        <p className="text-lg text-muted leading-relaxed">
          Generate, refine, and rigorously validate AI-era startup ideas using a
          dual-LLM debate engine. Claude and Gemini evaluate independently, challenge
          each other, and produce investment-grade assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {modes.map((mode) => (
          <Link
            key={mode.title}
            href={mode.href}
            className="group border border-card-border bg-card rounded-lg p-6 hover:border-muted transition-all duration-200"
          >
            <div className={`${mode.accent} font-mono text-sm font-medium mb-2`}>
              {mode.title}
            </div>
            <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
              {mode.description}
            </p>
            <p className="text-xs text-muted font-mono">
              {mode.example}
            </p>
            <div className="mt-4 text-xs text-muted group-hover:text-foreground transition-colors">
              Start &rarr;
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/results"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          View previous results &rarr;
        </Link>
      </div>
    </div>
  );
}
