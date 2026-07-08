import { describe, expect, it } from "vitest";
import { TenantContext } from "../tenant";

const organization = { id: "org-1", name: "GymCord", slug: "gymcord", routing: { customDomains: ["train.example.com"], subdomains: ["gymcord"] } } as never;

describe("TenantContext", () => {
  it("resolves organization routes and custom domains", () => {
    const routeTarget = TenantContext.resolveRouteTarget(new URL("https://app.example.com/org/gymcord") as unknown as Location);
    expect(routeTarget.organizationSlug).toBe("gymcord");
    expect(TenantContext.fromLocation(new URL("https://train.example.com/") as unknown as Location, [organization]).organizationId).toBe("org-1");
  });
});
