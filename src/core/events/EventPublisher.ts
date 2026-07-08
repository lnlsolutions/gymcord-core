import type { EventType, GymCordEventMap, GymCordEvent } from "./EventTypes";

export interface EventPublisher {
  publish<TType extends EventType>(type: TType, payload: GymCordEventMap[TType], source?: string): GymCordEvent<TType>;
}
