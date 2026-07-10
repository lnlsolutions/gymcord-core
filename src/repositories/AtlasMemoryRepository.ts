import type { AtlasMemory } from "../types/gymcord";
import { AtlasStore } from "../lib/atlasStore";
import { atlasRepository } from "./AtlasRepository";

export class AtlasMemoryRepository {
  load(fallback: AtlasMemory) { return AtlasStore.loadMemory(fallback); }
  save(memory: AtlasMemory) { AtlasStore.saveMemory(memory); }
  metadata(memory: AtlasMemory | null) { return atlasRepository.describeMemory(memory); }
}
export const atlasMemoryRepository = new AtlasMemoryRepository();
