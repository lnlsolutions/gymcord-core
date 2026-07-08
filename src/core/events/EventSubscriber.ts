import type { EventType, GymCordEvent } from "./EventTypes";

export type EventHandler<TType extends EventType = EventType> = (event: GymCordEvent<TType>) => void | Promise<void>;

export interface EventSubscriber<TType extends EventType = EventType> {
  readonly eventType?: TType | "*";
  handle: EventHandler<TType>;
}

export type Unsubscribe = () => void;
