import type { AnalyticsProvider } from "./AnalyticsProvider";
import { MockAnalyticsProvider } from "./MockAnalyticsProvider";
import { MetricsCollector } from "./MetricsCollector";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { Logger } from "./Logger";
import { CrashReporter } from "./CrashReporter";
import type { AnalyticsEvent, AnalyticsEventName, AnalyticsSnapshot, QueueHealth } from "./types";

const MAX_EVENTS = 160;

export class AnalyticsEngine {
  readonly metrics = new MetricsCollector();
  readonly performance = new PerformanceMonitor(this.metrics);
  readonly logger = new Logger();
  readonly crashReporter = new CrashReporter(() => this.providers);
  private providers: AnalyticsProvider[];
  private events: AnalyticsEvent[] = [];
  private queue: AnalyticsEvent[] = [];
  private queueHealth: QueueHealth = { depth: 0, failed: 0, status: "idle" };
  private subscribers = new Set<() => void>();
  private initialized = false;

  constructor(providers: AnalyticsProvider[] = [new MockAnalyticsProvider()]) {
    this.providers = providers;
  }

  async initialize() {
    if (this.initialized) return;
    await Promise.all(this.providers.map((provider) => provider.initialize()));
    this.initialized = true;
    this.track("App Launch", { path: window.location.pathname, userAgent: navigator.userAgent }, "app");
    window.addEventListener("error", (event) => this.crashReporter.report(event.error ?? event.message, { source: "window.error" }, "fatal"));
    window.addEventListener("unhandledrejection", (event) => this.crashReporter.report(event.reason, { source: "unhandledrejection" }, "fatal"));
  }

  track(name: AnalyticsEventName | string, properties: Record<string, unknown> = {}, source = "gymcord-app") {
    const started = performance.now();
    const providerName = this.providers[0]?.name ?? "mock";
    const event: AnalyticsEvent = { id: `analytics-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, name, properties, occurredAt: new Date().toISOString(), source, provider: providerName };
    this.events = [{ ...event, processingTimeMs: 0 }, ...this.events].slice(0, MAX_EVENTS);
    this.queue.push(event);
    this.updateQueue("idle");
    void this.flush(started, name);
    this.emit();
    return event;
  }

  async flush(startedAt = performance.now(), eventName = "flush") {
    if (!this.queue.length) return;
    const pending = [...this.queue];
    this.queue = [];
    this.updateQueue("flushing");
    try {
      for (const event of pending) await Promise.all(this.providers.map((provider) => provider.track(event)));
      this.queueHealth.lastFlushAt = new Date().toISOString();
      this.updateQueue("idle");
    } catch (error) {
      this.queue = [...pending, ...this.queue];
      this.queueHealth.failed += pending.length;
      this.updateQueue("degraded");
      this.crashReporter.report(error, { operation: "analytics.flush" });
    } finally {
      const metric = this.performance.trackEventProcessing(String(eventName), performance.now() - startedAt);
      this.providers.forEach((provider) => void provider.recordMetric(metric));
      this.emit();
    }
  }

  snapshot(): AnalyticsSnapshot {
    const metrics = this.metrics.snapshot();
    return { events: [...this.events], metrics, errors: this.crashReporter.snapshot(), queue: { ...this.queueHealth }, realtime: { connected: this.initialized && this.providers.every((provider) => provider.isReady()), provider: this.providers[0]?.name ?? "mock", lastEventAt: this.events[0]?.occurredAt }, apiLatency: metrics.filter((metric) => metric.name === "API latency") };
  }

  subscribe(listener: () => void) {
    this.subscribers.add(listener);
    const unsubscribeMetrics = this.metrics.subscribe(listener);
    return () => { this.subscribers.delete(listener); unsubscribeMetrics(); };
  }

  private updateQueue(status: QueueHealth["status"]) {
    this.queueHealth = { ...this.queueHealth, depth: this.queue.length, status };
    this.performance.trackQueueDepth(this.queue.length);
  }

  private emit() { this.subscribers.forEach((listener) => listener()); }
}

export const analyticsEngine = new AnalyticsEngine();
