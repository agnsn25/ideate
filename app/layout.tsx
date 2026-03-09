import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ideate AI",
  description: "AI Startup Idea Generator + Validator — Dual-LLM Consensus Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <nav className="border-b border-card-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-tight">
                Ideate AI
              </span>
              <span className="text-xs font-mono text-muted px-2 py-0.5 border border-card-border rounded">
                v0.1
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/generate"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Generate
              </Link>
              <Link
                href="/results"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Results
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
