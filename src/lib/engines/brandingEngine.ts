import type { Organization, OrganizationBrand } from "../../types/domain";

export interface BrandPreview {
  appName: string;
  logoUrl?: string;
  swatches: string[];
  typography: string;
}

export class BrandingEngine {
  static brandFor(organization: Organization): OrganizationBrand {
    return organization.brand;
  }

  static preview(brand: OrganizationBrand): BrandPreview {
    return {
      appName: brand.appName,
      logoUrl: brand.logoUrl || undefined,
      swatches: [brand.primaryColor, brand.secondaryColor, brand.accentColor],
      typography: brand.typography,
    };
  }
}
