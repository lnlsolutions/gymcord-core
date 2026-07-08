import { analyticsEngine } from "./AnalyticsEngine";
import { AnalyticsEventNames } from "./types";
import type { AnalyticsEventName } from "./types";

export class TelemetryService {
  initialize() { return analyticsEngine.initialize(); }
  track(name: AnalyticsEventName | string, properties?: Record<string, unknown>, source?: string) { return analyticsEngine.track(name, properties, source); }
  snapshot() { return analyticsEngine.snapshot(); }
  subscribe(listener: () => void) { return analyticsEngine.subscribe(listener); }
  get performance() { return analyticsEngine.performance; }
  get logger() { return analyticsEngine.logger; }
  get crashReporter() { return analyticsEngine.crashReporter; }
}

export const telemetryService = new TelemetryService();
export { AnalyticsEventNames };
