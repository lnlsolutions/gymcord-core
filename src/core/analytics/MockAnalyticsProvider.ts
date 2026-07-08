import type { AnalyticsProvider } from "./AnalyticsProvider";
import type { AnalyticsEvent, CrashReport, PerformanceMetric } from "./types";

export class MockAnalyticsProvider implements AnalyticsProvider {
  readonly name = "mock" as const;
  private ready = false;

  async initialize() {
    this.ready = true;
  }

  async track(event: AnalyticsEvent) {
    if (import.meta.env.DEV) console.debug("[GymCord Analytics] event", event);
  }

  async recordMetric(metric: PerformanceMetric) {
    if (import.meta.env.DEV) console.debug("[GymCord Analytics] metric", metric);
  }

  async reportCrash(report: CrashReport) {
    console.error("[GymCord Analytics] crash", report);
  }

  async flush() {
    this.ready = true;
  }

  isReady() {
    return this.ready;
  }
}
