import fs from "fs";
import path from "path";
import type { ContextChunk } from "@/lib/types";

const CONTEXT_DIR = path.join(process.cwd(), "context-docs");
const CHUNK_SIZE = 1500; // characters per chunk

export function loadContextDocs(): ContextChunk[] {
  if (!fs.existsSync(CONTEXT_DIR)) return [];

  const files = fs.readdirSync(CONTEXT_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".md", ".txt"].includes(ext);
  });

  const chunks: ContextChunk[] = [];

  for (const file of files) {
    const filePath = path.join(CONTEXT_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");

    // Split into chunks
    const fileChunks = chunkText(content, CHUNK_SIZE);
    for (const chunk of fileChunks) {
      chunks.push({
        content: chunk,
        source: file,
      });
    }
  }

  return chunks;
}

function chunkText(text: string, maxSize: number): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxSize && current.length > 0) {
      chunks.push(current.trim());
      current = "";
    }
    current += para + "\n\n";
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

export function formatContextChunks(chunks: ContextChunk[]): string {
  if (chunks.length === 0) return "";

  return chunks
    .map((c) => `[Source: ${c.source}]\n${c.content}`)
    .join("\n\n---\n\n");
}
