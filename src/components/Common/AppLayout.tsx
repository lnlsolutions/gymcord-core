import type { ReactNode } from "react";
import type { Page, Profile } from "../../types/gymcord";
import { BottomNav } from "./BottomNav";
import type { Organization } from "../../types/domain";

export function AppLayout({
  profile,
  organization,
  page,
  setPage,
  children,
}: {
  profile: Profile;
  organization?: Organization;
  page: Page;
  setPage: (page: Page) => void;
  children: ReactNode;
}) {
  return (
    <div className="app">
      <main className="screen">
        <header className="topbar">
          <div>
            <p className="eyebrow">{organization?.brand.appName ?? "GymCord"} Beta</p>
            <h1>{profile.name || organization?.brand.appName || "GymCord"}</h1>
          </div>

          <div className="avatar">
            {organization?.brand.logoUrl ? <img src={organization.brand.logoUrl} alt="" /> : profile.name ? profile.name.slice(0, 2).toUpperCase() : (organization?.brand.appName ?? "GC").slice(0, 2).toUpperCase()}
          </div>
        </header>

        {children}
      </main>

      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}
