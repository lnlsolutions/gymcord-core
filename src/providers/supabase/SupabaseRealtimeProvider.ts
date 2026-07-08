import type { EventType, GymCordEvent, GymCordEventMap } from "../../core/events";
import { eventBus } from "../../core/events";
import type { Unsubscribe } from "../../core/events/EventSubscriber";
import { getSupabaseClient, requireSupabaseEnvironment } from "../../config/supabase";
import type { RealtimeService } from "../../services/realtime";

export class SupabaseRealtimeProvider implements RealtimeService {
  readonly name = "supabase-realtime";
  private channel: ReturnType<ReturnType<typeof getSupabaseClient>["channel"]> | null = null;

  async connect(): Promise<void> {
    if (this.channel) return;
    const env = requireSupabaseEnvironment();
    this.channel = getSupabaseClient().channel(env.realtimeChannel).on("broadcast", { event: "gymcord_event" }, ({ payload }) => {
      eventBus.publish((payload as { type: EventType }).type, (payload as { payload: GymCordEventMap[EventType] }).payload, (payload as { source?: string }).source ?? this.name);
    });
    await this.channel.subscribe();
  }

  async disconnect(): Promise<void> {
    if (!this.channel) return;
    await getSupabaseClient().removeChannel(this.channel);
    this.channel = null;
  }

  async publish<TType extends EventType>(type: TType, payload: GymCordEventMap[TType], source = this.name): Promise<GymCordEvent<TType>> {
    await this.connect();
    const event = await eventBus.publish(type, payload, source);
    await this.channel?.send({ type: "broadcast", event: "gymcord_event", payload: event });
    return event;
  }

  subscribe<TType extends EventType>(type: TType | "*", handler: (event: GymCordEvent<TType>) => void | Promise<void>): Unsubscribe {
    return eventBus.subscribe(type, handler);
  }
}
