import { describe, expect, it, vi } from "vitest";
import { EventBus, EventTypes } from "../../events";
import { NotificationEngine } from "../NotificationEngine";

describe("NotificationEngine", () => {
  it("queues automation notifications for subscribed events", async () => {
    const bus = new EventBus();
    const engine = new NotificationEngine(bus);
    engine.start();
    bus.publish(EventTypes.StreakAtRisk, { memberId: "member-1", atRiskAt: "2026-01-01T00:00:00.000Z", reason: "No activity" });
    await vi.waitFor(() => expect(engine.snapshot().executionHistory.length).toBeGreaterThan(0));
    expect(engine.snapshot().executionHistory[0].ruleName).toContain("Streak");
    engine.stop();
  });
});
