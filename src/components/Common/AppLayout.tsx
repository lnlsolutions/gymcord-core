import type { ReactNode } from "react";
import type { Page, Profile } from "../../types/gymcord";
import { BottomNav } from "./BottomNav";
import type { Organization } from "../../types/domain";

const drawerSections = [
  ["Training", "Programs", "Exercise Library"],
  ["Journal", "Meals", "Sleep", "Recovery", "Progress", "Calendar"],
  ["Community", "Messages", "Trainer", "Gym"],
  ["Profile", "Billing", "Subscription", "Settings", "Sign Out"],
];

export function AppLayout({ profile, organization, page, setPage, children }: { profile: Profile; organization?: Organization; page: Page; setPage: (page: Page) => void; children: ReactNode; }) {
  return (
    <div className="app">
      <main className="screen">
        <header className="topbar premium-topbar">
          <div>
            <p className="eyebrow">{organization?.brand.appName ?? "GymCord"}</p>
            <h1>{profile.name ? `Hi, ${profile.name.split(" ")[0]}` : "Welcome"}</h1>
          </div>
          <div className="avatar">{profile.name ? profile.name.slice(0, 2).toUpperCase() : "GC"}</div>
        </header>
        {children}
        {page === "menu" && <aside className="menu-drawer" aria-label="Menu drawer">
          <div className="drawer-header"><p className="eyebrow">Menu</p><h2>Everything else</h2></div>
          {drawerSections.map((section, index) => <div className="drawer-section" key={index}>{section.map((item) => <button key={item}>{item}</button>)}</div>)}
        </aside>}
      </main>
      <button className="atlas-fab" onClick={() => setPage("atlas")} aria-label="Chat with Atlas">✦</button>
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}
