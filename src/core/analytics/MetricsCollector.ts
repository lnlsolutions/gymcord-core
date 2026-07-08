import type { PerformanceMetric } from "./types";

const MAX_METRICS = 120;

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class MetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private subscribers = new Set<() => void>();

  record(name: PerformanceMetric["name"], value: number, unit: PerformanceMetric["unit"] = "ms", tags?: Record<string, string>) {
    const metric: PerformanceMetric = { id: id("metric"), name, value: Number(value.toFixed(2)), unit, tags, recordedAt: new Date().toISOString() };
    this.metrics = [metric, ...this.metrics].slice(0, MAX_METRICS);
    this.emit();
    return metric;
  }

  incrementQueueDepth(depth: number) {
    return this.record("Queue depth", depth, "count", { queue: "analytics" });
  }

  snapshot() {
    return [...this.metrics];
  }

  subscribe(listener: () => void) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  private emit() {
    this.subscribers.forEach((listener) => listener());
  }
}
