import type { EventType, GymCordEvent, GymCordEventMap } from "../../core/events";
import type { Unsubscribe } from "../../core/events/EventSubscriber";

export interface RealtimeService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish<TType extends EventType>(type: TType, payload: GymCordEventMap[TType], source?: string): Promise<GymCordEvent<TType>>;
  subscribe<TType extends EventType>(type: TType | "*", handler: (event: GymCordEvent<TType>) => void | Promise<void>): Unsubscribe;
}
