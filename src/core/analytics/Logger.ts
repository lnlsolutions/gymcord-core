import type { AnalyticsSeverity, LogEntry } from "./types";

const MAX_LOGS = 80;

export class Logger {
  private logs: LogEntry[] = [];

  log(severity: AnalyticsSeverity, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = { id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, severity, message, context, occurredAt: new Date().toISOString() };
    this.logs = [entry, ...this.logs].slice(0, MAX_LOGS);
    if (severity === "error" || severity === "fatal") console.error(`[GymCord] ${message}`, context);
    else if (severity === "warn") console.warn(`[GymCord] ${message}`, context);
    else if (import.meta.env.DEV) console.info(`[GymCord] ${message}`, context);
    return entry;
  }

  snapshot() {
    return [...this.logs];
  }
}
