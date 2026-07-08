import { eventBus } from "../events";
import { AutomationEngine } from "./AutomationEngine";

export class NotificationEngine extends AutomationEngine {}

export const notificationEngine = new NotificationEngine(eventBus);
