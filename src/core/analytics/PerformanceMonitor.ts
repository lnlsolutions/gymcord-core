import type { MetricsCollector } from "./MetricsCollector";

export class PerformanceMonitor {
  constructor(private metrics: MetricsCollector) {}

  trackRender(viewName: string, startedAt = performance.now()) {
    requestAnimationFrame(() => this.metrics.record("Render time", performance.now() - startedAt, "ms", { view: viewName }));
  }

  trackApiLatency(endpoint: string, durationMs: number, status = "unknown") {
    return this.metrics.record("API latency", durationMs, "ms", { endpoint, status });
  }

  trackEventProcessing(eventName: string, durationMs: number) {
    return this.metrics.record("Event processing time", durationMs, "ms", { event: eventName });
  }

  trackMemoryUsage() {
    const perf = performance as Performance & { memory?: { usedJSHeapSize: number } };
    const mb = perf.memory ? perf.memory.usedJSHeapSize / 1024 / 1024 : 0;
    return this.metrics.record("Memory usage", mb, "mb", { abstraction: perf.memory ? "browser-js-heap" : "unavailable" });
  }

  trackOfflineSync(durationMs: number) {
    return this.metrics.record("Offline sync duration", durationMs, "ms");
  }

  trackQueueDepth(depth: number) {
    return this.metrics.incrementQueueDepth(depth);
  }
}
