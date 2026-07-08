import type { Organization } from "../../types/domain";

export class ThemeEngine {
  static apply(organization: Organization, root: HTMLElement = document.documentElement) {
    const { brand, theme } = organization;
    root.style.setProperty("--pink", brand.primaryColor);
    root.style.setProperty("--peach", brand.secondaryColor);
    root.style.setProperty("--pink-2", brand.accentColor);
    root.style.setProperty("--tenant-font", brand.typography);
    root.dataset.theme = theme.mode;
    root.dataset.radius = theme.radius;
  }
}
