import { describe, expect, it, vi } from "vitest";
import { AnalyticsEngine } from "../AnalyticsEngine";
import type { AnalyticsProvider } from "../AnalyticsProvider";

function provider(): AnalyticsProvider {
  return { name: "test", initialize: vi.fn(async () => undefined), isReady: vi.fn(() => true), track: vi.fn(async () => undefined), identify: vi.fn(async () => undefined), recordMetric: vi.fn(async () => undefined), reportCrash: vi.fn(async () => undefined), flush: vi.fn(async () => undefined) };
}

describe("AnalyticsEngine", () => {
  it("tracks events, flushes providers, and snapshots metrics", async () => {
    const mockProvider = provider();
    const engine = new AnalyticsEngine([mockProvider]);
    const event = engine.track("Smoke Test", { ok: true }, "test");
    await engine.flush();
    expect(event.name).toBe("Smoke Test");
    expect(mockProvider.track).toHaveBeenCalled();
    expect(engine.snapshot().events[0].name).toBe("Smoke Test");
  });
});
