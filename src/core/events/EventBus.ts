import { appConfig } from "../../config";
import type { EventPublisher } from "./EventPublisher";
import type { EventHandler, Unsubscribe } from "./EventSubscriber";
import type { EventType, GymCordEvent, GymCordEventMap } from "./EventTypes";

type AnyHandler = (event: GymCordEvent) => void | Promise<void>;

function createEventId(type: EventType) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export class EventBus implements EventPublisher {
  private handlers = new Map<EventType | "*", Set<AnyHandler>>();

  subscribe<TType extends EventType>(type: TType | "*", handler: EventHandler<TType>): Unsubscribe {
    const subscribers = this.handlers.get(type) ?? new Set<AnyHandler>();
    subscribers.add(handler as AnyHandler);
    this.handlers.set(type, subscribers);

    return () => subscribers.delete(handler as AnyHandler);
  }

  publish<TType extends EventType>(type: TType, payload: GymCordEventMap[TType], source = "gymcord-core"): GymCordEvent<TType> {
    const event: GymCordEvent<TType> = {
      id: createEventId(type),
      type,
      payload,
      occurredAt: new Date().toISOString(),
      source,
    } as GymCordEvent<TType>;

    this.log("publish", event);
    this.deliver(type, event as GymCordEvent);
    this.deliver("*", event as GymCordEvent);

    return event;
  }

  private deliver(type: EventType | "*", event: GymCordEvent) {
    this.handlers.get(type)?.forEach((handler) => {
      void Promise.resolve(handler(event)).catch((error) => {
        this.log("subscriber_error", event, error);
      });
    });
  }

  private log(action: string, event: GymCordEvent, error?: unknown) {
    if (appConfig.environment !== "development") return;
    console.debug(`[GymCord Events] ${action}`, { event, error });
  }
}

export const eventBus = new EventBus();
