import { apiClient } from "../api/client";
import { appConfig } from "../config";
import { keyValueStorage } from "../services/storage";
import type { EntityId } from "../types/domain";

export type InvitationKind = "trainer" | "gym";
export type InvitationStatus = "pending" | "accepted" | "expired" | "rejected";

export interface InvitationRecord {
  id: EntityId;
  code: string;
  kind: InvitationKind;
  status: InvitationStatus;
  tenantId?: EntityId;
  tenantName?: string;
  inviterId?: EntityId;
  inviterName?: string;
  expiresAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  archivedAt?: string;
  metadata: Record<string, unknown>;
}

const storageKey = "gc.publicBeta.invitations";

function seedInvitations(): InvitationRecord[] {
  return [
    { id: "invite-trainer-demo", code: "TRAINER-DEMO", kind: "trainer", status: "pending", tenantId: "trainer-atlas", tenantName: "Atlas Strength Coaching", inviterId: "coach-maya", inviterName: "Maya Chen", expiresAt: "2027-01-01T00:00:00.000Z", metadata: { source: "demo" } },
    { id: "invite-gym-demo", code: "GYM-DEMO", kind: "gym", status: "pending", tenantId: "gym-summit", tenantName: "Summit Barbell Club", inviterId: "gym-admin", inviterName: "Summit Front Desk", expiresAt: "2027-01-01T00:00:00.000Z", metadata: { source: "demo" } },
  ];
}

function isExpired(invite: InvitationRecord) {
  return Boolean(invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now());
}

export class InvitationRepository {
  listLocal(): InvitationRecord[] {
    const current = keyValueStorage.get<InvitationRecord[]>(storageKey, []);
    if (current.length) return current.map((invite) => isExpired(invite) && invite.status === "pending" ? { ...invite, status: "expired" } : invite);
    keyValueStorage.set(storageKey, seedInvitations());
    return seedInvitations();
  }

  async validate(code: string, kind?: InvitationKind): Promise<InvitationRecord | null> {
    const normalized = code.trim().toUpperCase();
    const local = this.listLocal().find((invite) => invite.code.toUpperCase() === normalized && (!kind || invite.kind === kind));
    if (local) return isExpired(local) && local.status === "pending" ? { ...local, status: "expired" } : local;
    if (!normalized) return null;
    const result = await apiClient.get<InvitationRecord | null>(`/invitations/${normalized}`, { queueWhenOffline: true }).catch(() => ({ data: null }));
    return result.data;
  }

  async accept(invitation: InvitationRecord, userId: EntityId): Promise<InvitationRecord> {
    const accepted: InvitationRecord = { ...invitation, status: "accepted", acceptedAt: new Date().toISOString(), metadata: { ...invitation.metadata, acceptedBy: userId } };
    this.upsertLocal(accepted);
    await apiClient.patch(`/invitations/${invitation.id}`, accepted, { retryAttempts: appConfig.backend.retryAttempts, timeoutMs: appConfig.backend.timeoutMs, queueWhenOffline: true }).catch(() => undefined);
    return accepted;
  }

  async reject(invitation: InvitationRecord): Promise<InvitationRecord> {
    const rejected: InvitationRecord = { ...invitation, status: "rejected", rejectedAt: new Date().toISOString() };
    this.upsertLocal(rejected);
    await apiClient.patch(`/invitations/${invitation.id}`, rejected, { queueWhenOffline: true }).catch(() => undefined);
    return rejected;
  }

  async archive(invitationId: EntityId): Promise<void> {
    const invitations = this.listLocal().map((invite) => invite.id === invitationId ? { ...invite, archivedAt: new Date().toISOString() } : invite);
    keyValueStorage.set(storageKey, invitations);
    await apiClient.patch(`/invitations/${invitationId}`, { archivedAt: new Date().toISOString() }, { queueWhenOffline: true }).catch(() => undefined);
  }

  private upsertLocal(invitation: InvitationRecord) {
    const invitations = this.listLocal().filter((item) => item.id !== invitation.id);
    keyValueStorage.set(storageKey, [invitation, ...invitations]);
  }
}

export const invitationRepository = new InvitationRepository();
