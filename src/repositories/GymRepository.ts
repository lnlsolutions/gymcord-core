import type { EntityId } from "../types/domain";
import { tenancyRepository, type TenantRelationship, type TenantBranding } from "./TenancyRepository";
import type { RepositoryResult } from "./base";

export class GymRepository {
  async listMemberships(userId: EntityId): Promise<RepositoryResult<TenantRelationship[]>> { const snapshot = await tenancyRepository.loadSnapshot(userId); return { data: snapshot.data.relationships.filter((item) => item.kind === "gym" || item.kind === "enterprise_gym"), source: snapshot.source }; }
  async listBranding(): Promise<RepositoryResult<TenantBranding[]>> { const snapshot = await tenancyRepository.loadSnapshot(); return { data: snapshot.data.branding.filter((item) => item.ownerType === "gym"), source: snapshot.source }; }
  endMembership(id: EntityId) { return tenancyRepository.endRelationship(id); }
  archiveMembership(id: EntityId) { return tenancyRepository.archiveRelationship(id); }
}
export const gymRepository = new GymRepository();
