import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

export default function AdminDashboard() {
  const auth = useAuth();
  const eid = auth.etablissementId;
  const [stats, setStats] = useState({ filieres: 0, niveaux: 0, etudiants: 0, evenements: 0 });

  useEffect(() => {
    if (!eid) return;
    (async () => {
      const [f, n, e, ev] = await Promise.all([
        supabase.from("filieres").select("*", { count: "exact", head: true }).eq("etablissement_id", eid),
        supabase.from("niveaux").select("*", { count: "exact", head: true }).eq("etablissement_id", eid),
        supabase.from("etudiants").select("*", { count: "exact", head: true }).eq("etablissement_id", eid),
        supabase.from("evenements").select("*", { count: "exact", head: true }).eq("etablissement_id", eid),
      ]);
      setStats({ filieres: f.count ?? 0, niveaux: n.count ?? 0, etudiants: e.count ?? 0, evenements: ev.count ?? 0 });
    })();
  }, [eid]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--terracotta)" }}>Tableau de bord</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>Vue d'ensemble</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { l: "Filières", v: stats.filieres, i: "📚", to: "/admin/filieres" },
          { l: "Niveaux", v: stats.niveaux, i: "🎓", to: "/admin/filieres" },
          { l: "Étudiants", v: stats.etudiants, i: "👤", to: "/admin/filieres" },
          { l: "Événements", v: stats.evenements, i: "📅", to: "/admin/events" },
        ].map((s) => (
          <Link key={s.l} to={s.to} className="card" style={{ padding: 20, textDecoration: "none" }}>
            <span style={{ fontSize: 24 }}>{s.i}</span>
            <p style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{s.v}</p>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>{s.l}</p>
          </Link>
        ))}
      </div>
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Organisation de votre établissement</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>
          Gérez vos filières et niveaux, puis accédez à l'espace de chaque niveau pour importer les étudiants, publier des annonces, créer l'emploi du temps et saisir les notes.
        </p>
        <Link to="/admin/filieres" className="btn-primary" style={{ marginTop: 16, display: "inline-block" }}>Gérer les filières →</Link>
      </div>
    </div>
  );
}
