import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { useEffect } from "react";

export default function AppLayout() {
  const auth = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.loading && auth.user && auth.role !== "etudiant") navigate("/login");
  }, [auth.loading, auth.user, auth.role, navigate]);

  if (auth.loading || !auth.user) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--muted)" }}>Chargement…</div>;

  const tabs = [
    { key: "home", to: "/app", icon: "🏠", label: "Accueil" },
    { key: "annonces", to: "/app/annonces", icon: "📣", label: "Annonces" },
    { key: "emploi", to: "/app/emploi", icon: "📅", label: "Emploi" },
    { key: "grades", to: "/app/grades", icon: "📊", label: "Notes" },
    { key: "profile", to: "/app/profile", icon: "👤", label: "Profil" },
  ];

  const current = loc.pathname.startsWith("/app/annonces") ? "annonces"
    : loc.pathname.startsWith("/app/emploi") ? "emploi"
    : loc.pathname.startsWith("/app/grades") ? "grades"
    : loc.pathname.startsWith("/app/profile") ? "profile" : "home";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="phone-frame">
        <div className="kente-bar" />
        <div style={{ flex: 1, overflowY: "auto" }}><Outlet /></div>
        <nav className="tab-bar">
          {tabs.map((t) => (
            <Link key={t.key} to={t.to} className={`tab-item ${current === t.key ? "active" : ""}`}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
