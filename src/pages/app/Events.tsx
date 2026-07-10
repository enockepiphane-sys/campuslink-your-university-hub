import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

type Ev = { id: string; titre: string; description: string | null; date_evt: string | null; lieu: string | null; categorie: string | null };

export default function AppEvents() {
  const auth = useAuth();
  const [rows, setRows] = useState<Ev[]>([]);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: e } = await supabase.from("etudiants").select("etablissement_id").eq("user_id", auth.user!.id).maybeSingle();
      if (!e?.etablissement_id) return;
      const { data } = await supabase.from("evenements").select("*").eq("etablissement_id", e.etablissement_id).order("date_evt");
      setRows(data ?? []);
    })();
  }, [auth.user]);

  return (
    <div>
      <div className="phone-header">
        <p style={{ fontSize: 12, opacity: 0.8 }}>Vie universitaire</p>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Événements</h1>
      </div>
      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14, borderStyle: "dashed" }}>Aucun événement disponible.</div>
        ) : rows.map((e) => (
          <div key={e.id} className="card" style={{ padding: 16, background: "var(--accent)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--accent-fg)" }}>{e.categorie ?? "Événement"}</p>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: "var(--accent-fg)" }}>{e.titre}</h2>
            {e.date_evt && <p style={{ fontSize: 12, color: "var(--accent-fg)", opacity: 0.8 }}>{new Date(e.date_evt).toLocaleString("fr-FR")}</p>}
            {e.lieu && <p style={{ fontSize: 12, color: "var(--accent-fg)", opacity: 0.8 }}>📍 {e.lieu}</p>}
            {e.description && <p style={{ marginTop: 8, fontSize: 14, color: "var(--accent-fg)", opacity: 0.9 }}>{e.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
