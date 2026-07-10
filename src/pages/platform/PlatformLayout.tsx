import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/auth";

export default function PlatformLayout() {
  const auth = useAuth();
  const loc = useLocation();
  const nav = [
    { l: "Vue d'ensemble", to: "/platform", exact: true, i: "🏠" },
    { l: "Établissements", to: "/platform/etabs", i: "🏛️" },
    { l: "Administrateurs", to: "/platform/admins", i: "👤" },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0.875rem 1rem" }}>
          <span style={{ fontSize: 24 }}>🎓</span>
          <span style={{ fontWeight: 800, fontSize: 16 }}>CampusLink</span>
        </div>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--terracotta)", padding: "0 0.875rem 0.5rem" }}>Super Admin</p>
        {nav.map((n) => {
          const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} className={`sidebar-link ${active ? "active" : ""}`}>
              <span className="icon" style={{ fontSize: 18 }}>{n.i}</span>
              <span>{n.l}</span>
            </Link>
          );
        })}
        <div style={{ marginTop: "auto", padding: "0.875rem" }}>
          <p style={{ fontSize: 11, color: "var(--muted)" }}>{auth.user?.email}</p>
          <button onClick={() => auth.signOut()} className="btn-ghost" style={{ width: "100%", marginTop: 8, fontSize: 12, padding: "0.5rem" }}>Déconnexion</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
