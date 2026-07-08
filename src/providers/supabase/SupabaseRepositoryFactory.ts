import { OrganizationRepository } from "../../repositories";
import { SupabaseDatabaseProvider } from "./SupabaseDatabaseProvider";

export class SupabaseRepositoryFactory {
  readonly database = new SupabaseDatabaseProvider();

  createOrganizationRepository(): OrganizationRepository {
    return new OrganizationRepository(this.database);
  }
}
