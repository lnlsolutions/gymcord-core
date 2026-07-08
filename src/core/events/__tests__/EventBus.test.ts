import { describe, expect, it, vi } from "vitest";
import { EventBus } from "../EventBus";
import { EventTypes } from "../EventTypes";

describe("EventBus", () => {
  it("publishes to typed and wildcard subscribers", () => {
    const bus = new EventBus();
    const typed = vi.fn();
    const wildcard = vi.fn();
    bus.subscribe(EventTypes.XpEarned, typed);
    bus.subscribe("*", wildcard);
    const event = bus.publish(EventTypes.XpEarned, { amount: 10, totalXp: 20, snapshot: { totalXp: 20, currentXp: 20, currentLevel: 1, xpNeededForNextLevel: 260, progressPercentage: 8 }, reason: "test" });
    expect(event.id).toContain(EventTypes.XpEarned);
    expect(typed).toHaveBeenCalledOnce();
    expect(wildcard).toHaveBeenCalledOnce();
  });
});
