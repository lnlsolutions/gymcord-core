import type { EventType, GymCordEvent, GymCordEventMap } from "../../core/events";
import { MockRealtimeService } from "./MockRealtimeService";

export class SupabaseRealtimeService extends MockRealtimeService {
  async publish<TType extends EventType>(type: TType, payload: GymCordEventMap[TType], source = "supabase-realtime-adapter:future"): Promise<GymCordEvent<TType>> {
    return super.publish(type, payload, source);
  }
}
