import type { AtlasConversationEntry, AtlasMemory } from "../types/gymcord";
import { saved, save } from "./storage";

const MEMORY_KEY = "gc.atlasMemory";
const CONVERSATION_KEY = "gc.atlasConversation";

export const AtlasStore = {
  loadMemory(fallback: AtlasMemory) {
    return saved<AtlasMemory>(MEMORY_KEY, fallback);
  },
  saveMemory(memory: AtlasMemory) {
    save(MEMORY_KEY, memory);
  },
  loadConversation() {
    return saved<AtlasConversationEntry[]>(CONVERSATION_KEY, []);
  },
  saveConversation(entries: AtlasConversationEntry[]) {
    save(CONVERSATION_KEY, entries);
  },
};
