import type { ReactNode } from "react";
import type { Page, Profile } from "../../types/gymcord";
import { BottomNav } from "./BottomNav";

export function AppLayout({
  profile,
  page,
  setPage,
  children,
}: {
  profile: Profile;
  page: Page;
  setPage: (page: Page) => void;
  children: ReactNode;
}) {
  return (
    <div className="app">
      <main className="screen">
        <header className="topbar">
          <div>
            <p className="eyebrow">GymCord Beta</p>
            <h1>{profile.name || "GymCord"}</h1>
          </div>

          <div className="avatar">
            {profile.name ? profile.name.slice(0, 2).toUpperCase() : "GC"}
          </div>
        </header>

        {children}
      </main>

      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}
