import { EventBus, type EventType, type GymCordEvent, type GymCordEventMap } from "../../core/events";
import type { RealtimeService } from "./RealtimeService";
import type { Unsubscribe } from "../../core/events/EventSubscriber";

export class MockRealtimeService implements RealtimeService {
  private connected = false;

  constructor(private readonly bus = new EventBus()) {}

  async connect() {
    this.connected = true;
  }

  async disconnect() {
    this.connected = false;
  }

  async publish<TType extends EventType>(type: TType, payload: GymCordEventMap[TType], source = "mock-realtime"): Promise<GymCordEvent<TType>> {
    if (!this.connected) await this.connect();
    return this.bus.publish(type, payload, source);
  }

  subscribe<TType extends EventType>(type: TType | "*", handler: (event: GymCordEvent<TType>) => void | Promise<void>): Unsubscribe {
    return this.bus.subscribe(type, handler);
  }
}
