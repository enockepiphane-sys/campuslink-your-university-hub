import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="kente-bar" />
      <header style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <span style={{ fontWeight: 800, fontSize: 20 }}>CampusLink</span>
        </div>
        <Link to="/login" className="btn-primary" style={{ borderRadius: 999, padding: "0.625rem 1.5rem" }}>
          Se connecter
        </Link>
      </header>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem", display: "grid", gap: "3rem", gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--terracotta)" }} />
            Plateforme SaaS multi-établissements
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.05, marginTop: 20 }}>
            Toute la vie universitaire <span style={{ color: "var(--primary)" }}>dans une seule app.</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--muted)", marginTop: 20, maxWidth: 480, lineHeight: 1.6 }}>
            CampusLink connecte les universités burkinabè et leurs étudiants. Notes, annonces, événements, scolarité — un espace numérique complet pour chaque établissement partenaire.
          </p>
          <Link to="/login" className="btn-primary" style={{ marginTop: 32, display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "0.875rem 1.75rem" }}>
            Accéder à mon espace →
          </Link>
        </div>
        <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "var(--shadow-lg)", background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div style={{ background: "var(--primary)", color: "var(--primary-fg)", padding: "2rem 1.5rem" }}>
            <p style={{ fontSize: 12, opacity: 0.8 }}>Espace étudiant</p>
            <p style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>Bonjour, Awa 👋</p>
          </div>
          <div style={{ padding: "1.5rem", display: "grid", gap: "0.75rem" }}>
            <div className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>📣</span><div><p style={{ fontWeight: 700, fontSize: 14 }}>Nouvelle annonce</p><p style={{ fontSize: 12, color: "var(--muted)" }}>Rentrée scolaire 2025-2026</p></div>
            </div>
            <div className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>📊</span><div><p style={{ fontWeight: 700, fontSize: 14 }}>Notes publiées</p><p style={{ fontSize: 12, color: "var(--muted)" }}>Algorithmique: 16/20</p></div>
            </div>
            <div className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>📅</span><div><p style={{ fontWeight: 700, fontSize: 14 }}>Événement à venir</p><p style={{ fontSize: 12, color: "var(--muted)" }}>Forum de l'emploi</p></div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 1.5rem", textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
        © CampusLink — Burkina Faso
      </footer>
    </div>
  );
}
