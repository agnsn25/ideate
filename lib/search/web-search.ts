import type { SearchResult } from "@/lib/types";

// Trusted domains for market/competitor intelligence
const TRUSTED_DOMAINS = [
  "crunchbase.com",
  "pitchbook.com",
  "cbinsights.com",
  "techcrunch.com",
  "theinformation.com",
  "wired.com",
  "mckinsey.com",
  "a16z.com",
  "sequoiacap.com",
  "firstround.com",
  "arxiv.org",
  "paperswithcode.com",
  "ycombinator.com",
  "workatastartup.com",
];

export interface SearchOptions {
  /** Restrict to trusted domains only */
  trustedOnly?: boolean;
}

export async function searchWeb(
  query: string,
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("TAVILY_API_KEY not set, skipping web search");
    return [];
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000); // 30s for advanced depth

    const body: Record<string, unknown> = {
      api_key: apiKey,
      query,
      max_results: 10,
      search_depth: "advanced",
      days: 180, // last 6 months
    };

    if (options.trustedOnly) {
      body.include_domains = TRUSTED_DOMAINS;
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      console.error("Tavily search failed:", response.statusText);
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    return results.map((r: { title: string; url: string; content: string }) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
    }));
  } catch (err) {
    console.error("Tavily search error:", err instanceof Error ? err.message : err);
    return [];
  }
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) return "";

  return results
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.url}`)
    .join("\n\n");
}
