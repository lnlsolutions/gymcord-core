import type { AtlasConversationEntry } from "../../types/gymcord";

function categorize(question: string): AtlasConversationEntry["category"] {
  const q = question.toLowerCase();
  if (q.includes("protein") || q.includes("meal") || q.includes("calorie")) return "nutrition";
  if (q.includes("sleep") || q.includes("recovery") || q.includes("sore")) return "recovery";
  if (q.includes("progress") || q.includes("weight") || q.includes("pr")) return "progress";
  if (q.includes("workout") || q.includes("train") || q.includes("exercise")) return "training";
  return "general";
}

export function answerAtlasQuestion(question: string, contextMessages: string[]) {
  const firstContext = contextMessages[0] || "Start with the highest-impact basic: train, protein, water, and sleep.";
  return `${firstContext} For your question: "${question}", Atlas recommends one focused action in the next hour and one recovery action tonight.`;
}

export function createConversationEntry(question: string, answer: string): AtlasConversationEntry {
  return {
    id: crypto.randomUUID(),
    question,
    answer,
    timestamp: new Date().toISOString(),
    category: categorize(question),
  };
}
