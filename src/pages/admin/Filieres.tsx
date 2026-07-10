import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

type Filiere = { id: string; nom: string };
type Niveau = { id: string; nom: string; filiere_id: string | null; ordre: number | null };

export default function AdminFilieres() {
  const auth = useAuth();
  const eid = auth.etablissementId;
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newFiliere, setNewFiliere] = useState("");
  const [newNiveau, setNewNiveau] = useState<{ nom: string; ordre: number; filiere_id: string }>({ nom: "", ordre: 0, filiere_id: "" });

  async function refresh() {
    if (!eid) return;
    const [{ data: f }, { data: n }] = await Promise.all([
      supabase.from("filieres").select("id,nom").eq("etablissement_id", eid).order("nom"),
      supabase.from("niveaux").select("id,nom,filiere_id,ordre").eq("etablissement_id", eid).order("ordre"),
    ]);
    setFilieres(f ?? []);
    setNiveaux(n ?? []);
  }
  useEffect(() => { refresh(); }, [eid]);

  async function addFiliere() {
    if (!eid || !newFiliere.trim()) return;
    const { error } = await supabase.from("filieres").insert({ nom: newFiliere.trim(), etablissement_id: eid });
    if (error) { alert(error.message); return; }
    setNewFiliere("");
    refresh();
  }

  async function deleteFiliere(id: string) {
    if (!confirm("Supprimer cette filière et tous ses niveaux et données associés ?")) return;
    await supabase.from("filieres").delete().eq("id", id);
    refresh();
  }

  async function addNiveau(filiereId: string) {
    if (!eid || !newNiveau.nom.trim()) return;
    const { error } = await supabase.from("niveaux").insert({
      nom: newNiveau.nom.trim(), etablissement_id: eid, filiere_id: filiereId, ordre: newNiveau.ordre || null,
    });
    if (error) { alert(error.message); return; }
    setNewNiveau({ nom: "", ordre: 0, filiere_id: "" });
    refresh();
  }

  async function deleteNiveau(id: string) {
    if (!confirm("Supprimer ce niveau et toutes ses données ?")) return;
    await supabase.from("niveaux").delete().eq("id", id);
    refresh();
  }

  if (!eid) return <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>Aucun établissement associé.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--terracotta)" }}>Organisation académique</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>Filières & Niveaux</h1>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>Créez vos filières, puis ajoutez les niveaux. Cliquez sur un niveau pour accéder à son espace dédié.</p>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Nouvelle filière</p>
        <div style={{ display: "flex", gap: 12 }}>
          <input className="field" placeholder="Ex: Informatique, Droit, Gestion..." value={newFiliere}
            onChange={(e) => setNewFiliere(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFiliere()} />
          <button className="btn-primary" onClick={addFiliere}>Ajouter</button>
        </div>
      </div>

      {filieres.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)", borderStyle: "dashed" }}>
          Aucune filière créée. Ajoutez votre première filière ci-dessus.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filieres.map((f) => {
            const fniveaux = niveaux.filter((n) => n.filiere_id === f.id);
            const isExpanded = expanded === f.id;
            return (
              <div key={f.id} className="card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16 }}>
                  <button onClick={() => setExpanded(isExpanded ? null : f.id)} style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", textAlign: "left" }}>
                    <span style={{ fontSize: 18, transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "none" }}>▶</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 18 }}>{f.nom}</p>
                      <p style={{ fontSize: 12, color: "var(--muted)" }}>{fniveaux.length} niveau(x)</p>
                    </div>
                  </button>
                  <button onClick={() => deleteFiliere(f.id)} style={{ fontSize: 12, color: "var(--error)", background: "none", border: "none" }}>Supprimer</button>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: 16 }}>
                    {fniveaux.length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
                        {fniveaux.map((n) => (
                          <Link key={n.id} to={`/admin/niveau/${n.id}`} className="card" style={{ padding: 16, textDecoration: "none", transition: "all 0.15s" }}>
                            <p style={{ fontWeight: 700, fontSize: 15 }}>{f.nom} — {n.nom}</p>
                            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Espace dédié →</p>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <input className="field" placeholder="Ex: Licence 1, L2, Master 1..."
                        value={newNiveau.filiere_id === f.id ? newNiveau.nom : ""}
                        onChange={(e) => setNewNiveau({ nom: e.target.value, ordre: newNiveau.ordre, filiere_id: f.id })}
                        onKeyDown={(e) => e.key === "Enter" && addNiveau(f.id)} />
                      <input className="field" type="number" placeholder="Ordre" style={{ width: 100 }}
                        value={newNiveau.filiere_id === f.id ? newNiveau.ordre : 0}
                        onChange={(e) => setNewNiveau({ nom: newNiveau.nom, ordre: Number(e.target.value), filiere_id: f.id })} />
                      <button className="btn-ghost" onClick={() => addNiveau(f.id)}>+ Niveau</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
