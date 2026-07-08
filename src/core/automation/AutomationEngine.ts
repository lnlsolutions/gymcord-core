import { EventTypes, type EventBus, type GymCordEvent } from "../events";
import { NotificationQueue } from "./NotificationQueue";
import type { AutomationExecution, AutomationRule, AutomationSnapshot, AutomationTrigger, QueuedNotification } from "./types";

const storageKey = "gymcord.automation.snapshot.v1";
const maxHistory = 50;

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function payloadText(event: GymCordEvent) {
  const payload = event.payload as unknown as Record<string, unknown>;
  return String(payload.title ?? payload.reason ?? payload.completedAt ?? event.type);
}

export const defaultAutomationRules: AutomationRule[] = [
  { id: "workout-complete-in-app", name: "Workout completion celebration", trigger: "WorkoutCompleted", enabled: true, priority: "high", maxRetries: 3, ttlMs: 86_400_000, dedupeWindowMs: 60_000, actions: [{ type: "in_app", title: "Workout complete", body: "Great job finishing today's training block." }, { type: "push", title: "Workout complete", body: "Your effort is logged and Atlas is recalibrating." }] },
  { id: "mission-complete-atlas", name: "Mission completion Atlas message", trigger: "MissionCompleted", enabled: true, priority: "high", maxRetries: 3, ttlMs: 86_400_000, dedupeWindowMs: 60_000, actions: [{ type: "atlas_message", title: "Daily mission complete", body: "Atlas has marked your daily mission as complete." }] },
  { id: "xp-earned-in-app", name: "XP earned notice", trigger: "XpEarned", enabled: true, priority: "normal", maxRetries: 2, ttlMs: 43_200_000, dedupeWindowMs: 30_000, actions: [{ type: "in_app", title: "XP earned", body: "New XP was added to your progression." }] },
  { id: "achievement-email", name: "Achievement celebration", trigger: "AchievementUnlocked", enabled: true, priority: "critical", maxRetries: 3, ttlMs: 172_800_000, dedupeWindowMs: 300_000, actions: [{ type: "email", title: "Achievement unlocked", body: "Celebrate your latest GymCord achievement." }, { type: "push", title: "Achievement unlocked", body: "You unlocked a new milestone." }] },
  { id: "streak-at-risk", name: "Streak at risk recovery", trigger: "StreakAtRisk", enabled: true, priority: "critical", maxRetries: 3, ttlMs: 21_600_000, dedupeWindowMs: 3_600_000, actions: [{ type: "push", title: "Streak at risk", body: "A quick session can protect your momentum." }, { type: "sms", title: "Streak reminder", body: "Future SMS reminder for streak recovery." }] },
  { id: "workout-missed", name: "Missed workout follow-up", trigger: "WorkoutMissed", enabled: true, priority: "high", delayMs: 3_600_000, maxRetries: 3, ttlMs: 86_400_000, dedupeWindowMs: 86_400_000, actions: [{ type: "email", title: "Workout missed", body: "Atlas can help you reschedule your missed training." }] },
  { id: "atlas-insight-webhook", name: "Atlas insight downstream sync", trigger: "AtlasInsightGenerated", enabled: true, priority: "normal", maxRetries: 2, ttlMs: 86_400_000, dedupeWindowMs: 30_000, actions: [{ type: "webhook", title: "Atlas insight generated", body: "Send the latest insight to connected systems." }] },
  { id: "member-joined", name: "Member welcome automation", trigger: "MemberJoined", enabled: true, priority: "high", maxRetries: 3, ttlMs: 86_400_000, dedupeWindowMs: 300_000, actions: [{ type: "in_app", title: "Welcome to GymCord", body: "Your member profile is ready." }, { type: "email", title: "Welcome to GymCord", body: "Start your first mission from Mission Control." }] },
  { id: "trainer-assigned", name: "Trainer assignment notification", trigger: "TrainerAssigned", enabled: true, priority: "high", maxRetries: 3, ttlMs: 86_400_000, dedupeWindowMs: 300_000, actions: [{ type: "push", title: "Trainer assigned", body: "Your trainer connection is ready." }] },
];

export class AutomationEngine {
  private recentEvents: GymCordEvent[] = [];
  private executionHistory: AutomationExecution[] = [];
  private unsubscribe?: () => void;

  constructor(private readonly bus: EventBus, private readonly queue = new NotificationQueue(), private readonly rules = defaultAutomationRules) {}

  start() {
    if (this.unsubscribe) return;
    this.restore();
    this.unsubscribe = this.bus.subscribe("*", (event) => void this.handleEvent(event));
  }

  stop() { this.unsubscribe?.(); this.unsubscribe = undefined; }

  async handleEvent(event: GymCordEvent) {
    this.recentEvents = [event, ...this.recentEvents].slice(0, maxHistory);
    const rules = this.rules.filter((rule) => rule.enabled && rule.trigger === this.toTrigger(event.type));
    for (const rule of rules) this.executeRule(rule, event);
    await this.queue.processDue();
    this.persist();
  }

  retry(notificationId: string) {
    const didRetry = this.queue.retry(notificationId);
    void this.queue.processDue().then(() => this.persist());
    return didRetry;
  }

  snapshot(): AutomationSnapshot {
    return { recentEvents: this.recentEvents, queuedNotifications: this.queue.list(), executionHistory: this.executionHistory, failedJobs: this.queue.failed() };
  }

  private executeRule(rule: AutomationRule, event: GymCordEvent) {
    const now = Date.now();
    for (const action of rule.actions) {
      const notification: QueuedNotification = { id: id("notification"), ruleId: rule.id, eventId: event.id, eventType: rule.trigger, action: { ...action, body: `${action.body} (${payloadText(event)})` }, priority: rule.priority, status: rule.delayMs ? "scheduled" : "queued", attempts: 0, maxRetries: rule.maxRetries ?? 3, dedupeKey: `${rule.id}:${action.type}:${event.type}:${event.id}`, createdAt: new Date(now).toISOString(), scheduledFor: new Date(now + (rule.delayMs ?? 0)).toISOString(), expiresAt: new Date(now + (rule.ttlMs ?? 86_400_000)).toISOString() };
      const queued = this.queue.enqueue(notification, rule.dedupeWindowMs ?? 60_000);
      this.record(rule, event, action.type, queued.status === "deduped" ? "skipped" : "queued", queued.status === "deduped" ? "Deduplicated matching notification" : "Notification queued", queued.id);
    }
  }

  private record(rule: AutomationRule, event: GymCordEvent, actionType: AutomationExecution["actionType"], status: AutomationExecution["status"], message: string, notificationId?: string) {
    this.executionHistory = [{ id: id("execution"), ruleId: rule.id, ruleName: rule.name, eventId: event.id, eventType: event.type, actionType, notificationId, status, message, executedAt: new Date().toISOString() }, ...this.executionHistory].slice(0, maxHistory);
  }

  private toTrigger(type: string): AutomationTrigger | undefined {
    if (type === EventTypes.AtlasUpdated) return "AtlasInsightGenerated";
    if (type === EventTypes.MemberUpdated) return "MemberJoined";
    return this.rules.find((rule) => rule.trigger === type)?.trigger;
  }

  private persist() { localStorage.setItem(storageKey, JSON.stringify(this.snapshot())); }
  private restore() {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const snapshot = JSON.parse(saved) as AutomationSnapshot;
      this.recentEvents = snapshot.recentEvents ?? [];
      this.executionHistory = snapshot.executionHistory ?? [];
      (snapshot.queuedNotifications ?? []).forEach((notification) => this.queue.enqueue(notification, 0));
    } catch { localStorage.removeItem(storageKey); }
  }
}
