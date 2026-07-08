import type { AnalyticsProvider } from "./AnalyticsProvider";
import type { CrashReport } from "./types";

const MAX_ERRORS = 50;

export class CrashReporter {
  private reports: CrashReport[] = [];

  constructor(private getProviders: () => AnalyticsProvider[]) {}

  report(error: unknown, context?: Record<string, unknown>, severity: "error" | "fatal" = "error") {
    const normalized = error instanceof Error ? error : new Error(String(error));
    const report: CrashReport = {
      id: `crash-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      severity,
      message: normalized.message,
      stack: normalized.stack,
      context,
      occurredAt: new Date().toISOString(),
    };
    this.reports = [report, ...this.reports].slice(0, MAX_ERRORS);
    this.getProviders().forEach((provider) => void provider.reportCrash(report));
    return report;
  }

  snapshot() {
    return [...this.reports];
  }
}
