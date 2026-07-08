import { eventBus } from "../../core/events";
import { appConfig } from "../../config";
import { FirebaseRealtimeService } from "./FirebaseRealtimeService";
import { MockRealtimeService } from "./MockRealtimeService";
import type { RealtimeService } from "./RealtimeService";
import { SupabaseRealtimeProvider } from "../../providers/supabase";

export type { RealtimeService } from "./RealtimeService";
export { FirebaseRealtimeService } from "./FirebaseRealtimeService";
export { MockRealtimeService } from "./MockRealtimeService";
export { SupabaseRealtimeProvider } from "../../providers/supabase";

export function createRealtimeService(): RealtimeService {
  if (appConfig.backend.provider === "supabase") return new SupabaseRealtimeProvider();
  if (appConfig.backend.provider === "firebase") return new FirebaseRealtimeService(eventBus);
  return new MockRealtimeService(eventBus);
}

export const realtimeService = createRealtimeService();
