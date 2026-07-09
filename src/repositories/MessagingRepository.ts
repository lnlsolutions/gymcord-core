import { apiClient } from "../api/client";
import { offlineEngine, type QueuedWrite } from "../services/sync";
import type { ListResult, QueryOptions, RepositoryResult } from "./base";
import type { EntityId, MessagingConversation, MessagingMessage } from "../types/domain";

export type CreateConversationInput = Omit<MessagingConversation, "id" | "createdAt" | "updatedAt" | "status"> & Partial<Pick<MessagingConversation, "id" | "createdAt" | "updatedAt" | "status">>;
export type CreateMessageInput = Omit<MessagingMessage, "id" | "createdAt" | "updatedAt" | "status" | "readBy" | "attachments"> & Partial<Pick<MessagingMessage, "id" | "createdAt" | "updatedAt" | "status" | "readBy" | "attachments">>;
export type EditMessageInput = Partial<Pick<MessagingMessage, "body" | "attachments" | "moderation" | "status">>;

const conversationsPath = "/messagingConversations";
const messagesPath = "/messagingMessages";
const now = () => new Date().toISOString();

function source(sourceName: string): RepositoryResult<unknown>["source"] {
  return sourceName === "mock" || sourceName === "cache" ? sourceName : "remote";
}

function normalizeConversation(input: CreateConversationInput): MessagingConversation {
  const timestamp = now();
  return {
    id: input.id ?? crypto.randomUUID(),
    organizationId: input.organizationId,
    title: input.title,
    kind: input.kind,
    participantIds: input.participantIds,
    participants: input.participants,
    status: input.status ?? "active",
    sourceModule: input.sourceModule,
    sourceId: input.sourceId,
    lastMessageAt: input.lastMessageAt,
    archivedAt: input.archivedAt,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

function normalizeMessage(input: CreateMessageInput): MessagingMessage {
  const timestamp = now();
  return {
    id: input.id ?? crypto.randomUUID(),
    organizationId: input.organizationId,
    conversationId: input.conversationId,
    senderId: input.senderId,
    body: input.body,
    status: input.status ?? "sent",
    readBy: input.readBy ?? [],
    editedAt: input.editedAt,
    attachments: input.attachments ?? [],
    moderation: input.moderation,
    system: input.system,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

export class MessagingRepository {
  getOfflineQueue(): QueuedWrite[] {
    return offlineEngine.getQueue().filter((item) => item.entity === conversationsPath || item.entity === messagesPath || item.entity.startsWith(`${messagesPath}/`) || item.entity.startsWith(`${conversationsPath}/`));
  }

  async listConversations(options?: QueryOptions): Promise<RepositoryResult<ListResult<MessagingConversation>>> {
    const response = await apiClient.get<ListResult<MessagingConversation>>(conversationsPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = response.data.items ?? [];
    const filtered = options?.organizationId ? items.filter((conversation) => conversation.organizationId === options.organizationId) : items;
    const visible = filtered.filter((conversation) => conversation.status !== "archived");
    return { data: { items: visible.slice(0, options?.limit ?? visible.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }

  async findConversationById(id: EntityId): Promise<RepositoryResult<MessagingConversation | null>> {
    const response = await apiClient.get<MessagingConversation | null>(`${conversationsPath}/${id}`);
    return { data: response.data, source: source(response.source) };
  }

  async createConversation(input: CreateConversationInput): Promise<RepositoryResult<MessagingConversation>> {
    const response = await apiClient.post<MessagingConversation, MessagingConversation>(conversationsPath, normalizeConversation(input), { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async archiveConversation(id: EntityId): Promise<RepositoryResult<MessagingConversation>> {
    const timestamp = now();
    const response = await apiClient.patch<MessagingConversation, Partial<MessagingConversation>>(`${conversationsPath}/${id}`, { status: "archived", archivedAt: timestamp, deletedAt: timestamp, updatedAt: timestamp }, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async deleteConversation(id: EntityId): Promise<RepositoryResult<MessagingConversation>> {
    return this.archiveConversation(id);
  }

  async markRead(conversationId: EntityId, userId: EntityId): Promise<RepositoryResult<MessagingMessage[]>> {
    const messages = await this.listMessages(conversationId);
    const readAt = now();
    const updated = await Promise.all(messages.data.items.map((message) => message.readBy.includes(userId) ? message : apiClient.patch<MessagingMessage, Partial<MessagingMessage>>(`${messagesPath}/${message.id}`, { readBy: [...message.readBy, userId], status: "read", updatedAt: readAt }, { queueWhenOffline: true }).then((response) => response.data)));
    return { data: updated, source: messages.source };
  }

  async listMessages(conversationId: EntityId, options?: QueryOptions): Promise<RepositoryResult<ListResult<MessagingMessage>>> {
    const response = await apiClient.get<ListResult<MessagingMessage>>(messagesPath, { headers: options?.organizationId ? { "x-organization-id": options.organizationId } : undefined });
    const items = (response.data.items ?? []).filter((message) => message.conversationId === conversationId);
    const ordered = items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return { data: { items: ordered.slice(0, options?.limit ?? ordered.length), nextCursor: response.data.nextCursor }, source: source(response.source) };
  }

  async sendMessage(input: CreateMessageInput): Promise<RepositoryResult<MessagingMessage>> {
    const message = normalizeMessage(input);
    const response = await apiClient.post<MessagingMessage, MessagingMessage>(messagesPath, message, { queueWhenOffline: true });
    await apiClient.patch<MessagingConversation, Partial<MessagingConversation>>(`${conversationsPath}/${message.conversationId}`, { lastMessageAt: message.createdAt, updatedAt: now() }, { queueWhenOffline: true }).catch(() => undefined);
    return { data: response.data, source: source(response.source) };
  }

  async editMessage(id: EntityId, input: EditMessageInput): Promise<RepositoryResult<MessagingMessage>> {
    const response = await apiClient.patch<MessagingMessage, EditMessageInput & { editedAt: string; updatedAt: string }>(`${messagesPath}/${id}`, { ...input, editedAt: now(), updatedAt: now() }, { queueWhenOffline: true });
    return { data: response.data, source: source(response.source) };
  }

  async searchMessages(conversationId: EntityId, query: string): Promise<RepositoryResult<ListResult<MessagingMessage>>> {
    const messages = await this.listMessages(conversationId);
    const needle = query.trim().toLowerCase();
    return { ...messages, data: { items: messages.data.items.filter((message) => message.body.toLowerCase().includes(needle)), nextCursor: undefined } };
  }
}

export const messagingRepository = new MessagingRepository();
