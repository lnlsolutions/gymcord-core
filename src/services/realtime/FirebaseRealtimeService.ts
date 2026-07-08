import type { EventType, GymCordEvent, GymCordEventMap } from "../../core/events";
import { MockRealtimeService } from "./MockRealtimeService";

export class FirebaseRealtimeService extends MockRealtimeService {
  async publish<TType extends EventType>(type: TType, payload: GymCordEventMap[TType], source = "firebase-realtime-adapter:future"): Promise<GymCordEvent<TType>> {
    return super.publish(type, payload, source);
  }
}
