import { NOT_ENOUGH_DATA_LABEL } from "./scoreEligibility";

export interface GuardedMetric<T> { value: T | null; label: string; eligible: boolean; }

export function guardedScore(eligible: boolean, value: number | null | undefined): GuardedMetric<number> {
  if (!eligible || value === null || value === undefined) return { value: null, label: NOT_ENOUGH_DATA_LABEL, eligible: false };
  return { value, label: `${value}`, eligible: true };
}

export function zeroStateNumber(value: number | null | undefined) { return typeof value === "number" ? value : 0; }
export function zeroStateText(value: string | null | undefined, fallback = "No data yet") { return value && value.trim() ? value : fallback; }
