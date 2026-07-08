import type { EntityId, MembershipRole, Organization } from "../types/domain";

export interface TenantRouteTarget {
  organizationSlug?: string;
  customDomain?: string;
  subdomain?: string;
}

export class TenantContext {
  constructor(readonly organization: Organization, readonly role: MembershipRole = "owner") {}

  get organizationId(): EntityId {
    return this.organization.id;
  }

  static fromLocation(location: Location, organizations: Organization[]): TenantContext {
    const target = this.resolveRouteTarget(location);
    const organization = organizations.find((candidate) =>
      candidate.slug === target.organizationSlug ||
      candidate.routing.customDomains.includes(target.customDomain ?? "") ||
      candidate.routing.subdomains.includes(target.subdomain ?? "")
    ) ?? organizations[0];

    return new TenantContext(organization, "owner");
  }

  static resolveRouteTarget(location: Location): TenantRouteTarget {
    const host = location.hostname.toLowerCase();
    const firstPathSegment = location.pathname.split("/").filter(Boolean)[0];
    const subdomain = host.split(".").length > 2 ? host.split(".")[0] : undefined;

    return {
      organizationSlug: firstPathSegment === "org" ? location.pathname.split("/").filter(Boolean)[1] : undefined,
      customDomain: host,
      subdomain,
    };
  }
}
