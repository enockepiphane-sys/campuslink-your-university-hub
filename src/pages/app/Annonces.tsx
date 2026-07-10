import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

type A = { id: string; titre: string; contenu: string; tag: string | null; urgent: boolean | null; auteur: string | null; created_at: string };

export default function AppAnnonces() {
  const auth = useAuth();
  const [rows, setRows] = useState<A[]>([]);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: e } = await supabase.from("etudiants").select("etablissement_id,filiere_id,niveau_id").eq("user_id", auth.user!.id).maybeSingle();
      if (!e?.etablissement_id) return;
      const { data } = await supabase.from("annonces").select("*")
        .eq("etablissement_id", e.etablissement_id)
        .or(`and(filiere_id.eq.${e.filiere_id},niveau_id.eq.${e.niveau_id}),and(filiere_id.is.null,niveau_id.is.null)`)
        .order("created_at", { ascending: false });
      setRows(data ?? []);
    })();
  }, [auth.user]);

  return (
    <div>
      <div className="phone-header">
        <p style={{ fontSize: 12, opacity: 0.8 }}>Communications officielles</p>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Annonces</h1>
      </div>
      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14, borderStyle: "dashed" }}>Aucune annonce disponible.</div>
        ) : rows.map((a) => (
          <article key={a.id} className="card" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
            {a.urgent && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "var(--terracotta)" }} />}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {a.tag && <span className="chip chip-default">{a.tag}</span>}
              {a.urgent && <span className="chip chip-terracotta">Urgent</span>}
              <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--muted)" }}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            <h2 style={{ marginTop: 8, fontWeight: 700, fontSize: 16 }}>{a.titre}</h2>
            <p style={{ marginTop: 4, fontSize: 14, color: "var(--muted)" }}>{a.contenu}</p>
            {a.auteur && <p style={{ marginTop: 8, fontSize: 11, color: "var(--muted)" }}>Par {a.auteur}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
