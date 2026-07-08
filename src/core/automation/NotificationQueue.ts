import type { NotificationPriority, QueuedNotification } from "./types";
import { NotificationService } from "./NotificationService";

const priorityWeight: Record<NotificationPriority, number> = { critical: 4, high: 3, normal: 2, low: 1 };

export class NotificationQueue {
  private notifications: QueuedNotification[] = [];
  private service: NotificationService;

  constructor(service = new NotificationService()) {
    this.service = service;
  }

  enqueue(notification: QueuedNotification, dedupeWindowMs: number): QueuedNotification {
    const createdAt = new Date(notification.createdAt).getTime();
    const duplicate = this.notifications.find((item) => item.dedupeKey === notification.dedupeKey && createdAt - new Date(item.createdAt).getTime() <= dedupeWindowMs && item.status !== "expired");
    if (duplicate) return { ...notification, status: "deduped" };
    this.notifications = [...this.notifications, notification].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
    return notification;
  }

  async processDue(now = new Date()): Promise<QueuedNotification[]> {
    const completed: QueuedNotification[] = [];
    for (const notification of this.notifications) {
      if (!["queued", "scheduled", "failed"].includes(notification.status)) continue;
      if (new Date(notification.expiresAt) <= now) {
        notification.status = "expired";
        completed.push(notification);
        continue;
      }
      if (new Date(notification.scheduledFor) > now) {
        notification.status = "scheduled";
        continue;
      }
      notification.status = "processing";
      notification.attempts += 1;
      try {
        await this.service.deliver(notification);
        notification.status = "delivered";
        notification.deliveredAt = now.toISOString();
      } catch (error) {
        notification.lastError = error instanceof Error ? error.message : "Unknown notification failure";
        notification.status = notification.attempts >= notification.maxRetries ? "failed" : "queued";
        notification.failedAt = now.toISOString();
        if (notification.status === "queued") notification.scheduledFor = new Date(now.getTime() + notification.attempts * 30_000).toISOString();
      }
      completed.push(notification);
    }
    return completed;
  }

  retry(id: string): boolean {
    const job = this.notifications.find((item) => item.id === id);
    if (!job || job.status !== "failed") return false;
    job.status = "queued";
    job.scheduledFor = new Date().toISOString();
    job.lastError = undefined;
    return true;
  }

  list() {
    return [...this.notifications];
  }

  failed() {
    return this.notifications.filter((item) => item.status === "failed");
  }
}
