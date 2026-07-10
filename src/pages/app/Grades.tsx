import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

type Row = { id: string; note: number | null; matiere: { nom: string; code: string | null; credit: number | null } | null };

export default function AppGrades() {
  const auth = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: et } = await supabase.from("etudiants").select("id").eq("user_id", auth.user!.id).maybeSingle();
      if (!et) return;
      const { data } = await supabase.from("notes").select("id,note,matiere:matieres(nom,code,credit)").eq("etudiant_id", et.id).eq("published", true);
      setRows((data as unknown as Row[]) ?? []);
    })();
  }, [auth.user]);

  const validNotes = rows.filter((r) => r.note != null);
  const moy = validNotes.length > 0 ? validNotes.reduce((a, r) => a + (r.note ?? 0), 0) / validNotes.length : 0;

  return (
    <div>
      <div className="phone-header">
        <p style={{ fontSize: 12, opacity: 0.8 }}>Résultats académiques</p>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Mes notes</h1>
        {rows.length > 0 && (
          <div style={{ marginTop: 12, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 12 }}>
            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7 }}>Moyenne</p>
            <p style={{ fontSize: 30, fontWeight: 800 }}>{moy.toFixed(2)}<span style={{ fontSize: 14, opacity: 0.7 }}>/20</span></p>
          </div>
        )}
      </div>
      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14, borderStyle: "dashed" }}>Aucune note disponible.</div>
        ) : rows.map((r) => (
          <div key={r.id} className="card" style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{r.matiere?.nom ?? "—"}</p>
              <p style={{ fontSize: 11, color: "var(--muted)" }}>{r.matiere?.code} · {r.matiere?.credit ?? 0} crédits</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: 800, fontSize: 18 }}>{r.note ?? "—"}<span style={{ fontSize: 12, opacity: 0.6 }}>/20</span></p>
              <span className="chip chip-success">Publiée</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
