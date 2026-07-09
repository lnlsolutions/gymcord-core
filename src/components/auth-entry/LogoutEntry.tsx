import { useEffect } from "react";
import { useAuth } from "../../auth";
export function LogoutEntry() { const auth = useAuth(); useEffect(() => { void auth.logout().then(() => { window.location.href = "/auth/login"; }); }, []); return <main className="screen public-beta-screen"><section className="hero-card"><p className="pill">Logout</p><h1>Signing out…</h1><p>Your account data remains owned by your user account.</p></section></main>; }
