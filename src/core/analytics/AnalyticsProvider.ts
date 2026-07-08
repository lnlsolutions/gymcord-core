import type { AnalyticsEvent, AnalyticsProviderName, PerformanceMetric, CrashReport } from "./types";

export interface AnalyticsProvider {
  readonly name: AnalyticsProviderName;
  initialize(): Promise<void>;
  track(event: AnalyticsEvent): Promise<void>;
  recordMetric(metric: PerformanceMetric): Promise<void>;
  reportCrash(report: CrashReport): Promise<void>;
  flush(): Promise<void>;
  isReady(): boolean;
}
