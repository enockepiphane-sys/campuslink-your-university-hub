import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

type E = { id: string; matiere: string; jour: string; heure_debut: string | null; heure_fin: string | null; salle: string | null; enseignant: string | null };
const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export default function AppEmploi() {
  const auth = useAuth();
  const [rows, setRows] = useState<E[]>([]);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: e } = await supabase.from("etudiants").select("filiere_id,niveau_id").eq("user_id", auth.user!.id).maybeSingle();
      if (!e?.filiere_id || !e?.niveau_id) return;
      const { data } = await supabase.from("emplois_du_temps").select("id,matiere,jour,heure_debut,heure_fin,salle,enseignant")
        .eq("filiere_id", e.filiere_id).eq("niveau_id", e.niveau_id).order("heure_debut");
      setRows(data ?? []);
    })();
  }, [auth.user]);

  return (
    <div>
      <div className="phone-header">
        <p style={{ fontSize: 12, opacity: 0.8 }}>Organisation hebdomadaire</p>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Emploi du temps</h1>
        <Link to="/app" style={{ fontSize: 12, opacity: 0.8, marginTop: 4, display: "inline-block" }}>← Accueil</Link>
      </div>
      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14, borderStyle: "dashed" }}>Aucun cours programmé pour votre niveau.</div>
        ) : jours.map((j) => {
          const jrows = rows.filter((r) => r.jour === j);
          if (jrows.length === 0) return null;
          return (
            <div key={j} className="card" style={{ padding: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--terracotta)", marginBottom: 8 }}>{j}</p>
              {jrows.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg)", fontSize: 12, marginTop: 4 }}>
                  <span style={{ fontFamily: "monospace", color: "var(--muted)" }}>{r.heure_debut ?? "?"}–{r.heure_fin ?? "?"}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.matiere}</span>
                  {r.salle && <span style={{ color: "var(--muted)" }}>📍 {r.salle}</span>}
                  {r.enseignant && <span style={{ color: "var(--muted)" }}>👤 {r.enseignant}</span>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
