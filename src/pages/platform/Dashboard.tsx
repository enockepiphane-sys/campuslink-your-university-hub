import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PlatformDashboard() {
  const [stats, setStats] = useState({ etabs: 0, admins: 0, etudiants: 0 });

  useEffect(() => {
    (async () => {
      const [e, a, et] = await Promise.all([
        supabase.from("etablissements").select("*", { count: "exact", head: true }),
        supabase.from("admins").select("*", { count: "exact", head: true }),
        supabase.from("etudiants").select("*", { count: "exact", head: true }),
      ]);
      setStats({ etabs: e.count ?? 0, admins: a.count ?? 0, etudiants: et.count ?? 0 });
    })();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--terracotta)" }}>Console</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>Vue d'ensemble</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { l: "Établissements", v: stats.etabs, i: "🏛️" },
          { l: "Administrateurs", v: stats.admins, i: "👤" },
          { l: "Étudiants", v: stats.etudiants, i: "🎓" },
        ].map((s) => (
          <div key={s.l} className="card" style={{ padding: 20 }}>
            <span style={{ fontSize: 28 }}>{s.i}</span>
            <p style={{ fontSize: 32, fontWeight: 800, marginTop: 12 }}>{s.v}</p>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
