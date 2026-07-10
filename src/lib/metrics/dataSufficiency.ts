export type MetricValue = number | string | null | undefined | unknown[] | Record<string, unknown>;

export interface MemberMetricData {
  workoutsCompleted?: number;
  workoutSessions?: unknown[];
  nutritionEntries?: unknown[];
  mealsWithMacros?: number;
  sleepEntries?: unknown[];
  recoveryEntries?: unknown[];
  bodyMeasurements?: Record<string, MetricValue>;
  progressPhotos?: unknown[];
  activityDays?: unknown[];
}

const count = (value?: unknown[]) => Array.isArray(value) ? value.length : 0;
const hasObjectValue = (value?: Record<string, MetricValue>) => Boolean(value && Object.values(value).some((entry) => entry !== null && entry !== undefined && entry !== ""));

export function hasMinimumWorkoutData(data: MemberMetricData) { return (data.workoutsCompleted ?? 0) >= 1 || count(data.workoutSessions) >= 1; }
export function hasMinimumNutritionData(data: MemberMetricData) { return (data.mealsWithMacros ?? 0) >= 1 || count(data.nutritionEntries) >= 2; }
export function hasMinimumSleepData(data: MemberMetricData) { return count(data.sleepEntries) >= 3; }
export function hasMinimumRecoveryData(data: MemberMetricData) { return count(data.recoveryEntries) >= 3; }
export function hasMinimumBodyData(data: MemberMetricData) { return hasObjectValue(data.bodyMeasurements); }
export function hasMinimumProgressData(data: MemberMetricData) { return hasMinimumBodyData(data) || count(data.progressPhotos) >= 2; }
export function hasMinimumActivityData(data: MemberMetricData) { return count(data.activityDays) >= 3; }
