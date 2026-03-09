import fs from "fs";
import path from "path";
import type { Idea } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "ideas.json");

export function loadIdeas(): Idea[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, "utf-8").trim();
  if (!raw) return [];
  return JSON.parse(raw) as Idea[];
}

export function saveIdeas(ideas: Idea[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(ideas, null, 2));
}

export function saveIdea(idea: Idea): void {
  const ideas = loadIdeas();
  const existingIndex = ideas.findIndex((i) => i.id === idea.id);
  if (existingIndex >= 0) {
    ideas[existingIndex] = idea;
  } else {
    ideas.push(idea);
  }
  saveIdeas(ideas);
}

export function getIdea(id: string): Idea | undefined {
  return loadIdeas().find((i) => i.id === id);
}
