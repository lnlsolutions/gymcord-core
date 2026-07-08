import { OrganizationRepository, defaultOrganization } from "../repositories/OrganizationRepository";
import { TenantContext } from "../lib/tenant";
import { ThemeEngine } from "../lib/engines/themeEngine";
import type { Organization } from "../types/domain";

export class OrganizationService {
  constructor(private readonly repository = new OrganizationRepository()) {}

  async bootstrap(location: Location = window.location): Promise<TenantContext> {
    const result = await this.repository.list();
    const organizations = result.data.items.length ? result.data.items : [defaultOrganization];
    const tenant = TenantContext.fromLocation(location, organizations);
    ThemeEngine.apply(tenant.organization);
    return tenant;
  }

  async updateOrganization(organization: Organization): Promise<Organization> {
    const result = await this.repository.update(organization.id, organization);
    ThemeEngine.apply(result.data);
    return result.data;
  }
}

export const organizationService = new OrganizationService();
