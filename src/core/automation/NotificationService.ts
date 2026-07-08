import type { QueuedNotification } from "./types";

export class NotificationService {
  async deliver(notification: QueuedNotification): Promise<void> {
    switch (notification.action.type) {
      case "in_app":
      case "push":
      case "email":
      case "atlas_message":
      case "sms":
      case "webhook":
        return;
      default: {
        const exhaustive: never = notification.action.type;
        throw new Error(`Unsupported notification action: ${exhaustive}`);
      }
    }
  }
}
