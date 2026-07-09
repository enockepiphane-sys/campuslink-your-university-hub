import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/admin/filieres")({
  component: FilieresPage,
  head: () => ({ meta: [{ title: "Filières — Admin CampusLink" }] }),
});

type Filiere = { id: string; nom: string };
type Niveau = { id: string; nom: string; filiere_id: string | null; ordre: number | null };

function FilieresPage() {
  const auth = useAuth();
  const eid = auth.etablissementId;
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [expandedFiliere, setExpandedFiliere] = useState<string | null>(null);
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
    if (!confirm("Supprimer cette filière et tous ses niveaux, étudiants et données associés ?")) return;
    await supabase.from("filieres").delete().eq("id", id);
    refresh();
  }

  async function addNiveau(filiereId: string) {
    if (!eid || !newNiveau.nom.trim()) return;
    const { error } = await supabase.from("niveaux").insert({
      nom: newNiveau.nom.trim(),
      etablissement_id: eid,
      filiere_id: filiereId,
      ordre: newNiveau.ordre || null,
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

  if (!eid) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucun établissement associé.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Organisation académique</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Filières & Niveaux</h1>
        <p className="mt-1 text-sm text-muted-foreground">Créez vos filières, puis ajoutez les niveaux de chacune. Cliquez sur un niveau pour accéder à son espace dédié.</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-display text-sm font-semibold">Nouvelle filière</p>
        <div className="flex gap-3">
          <input
            value={newFiliere}
            onChange={(e) => setNewFiliere(e.target.value)}
            placeholder="Ex: Informatique, Droit, Gestion..."
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addFiliere()}
          />
          <button onClick={addFiliere} className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground">Ajouter</button>
        </div>
      </div>

      {filieres.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Aucune filière créée. Ajoutez votre première filière ci-dessus.
        </div>
      ) : (
        <div className="space-y-4">
          {filieres.map((f) => {
            const fniveaux = niveaux.filter((n) => n.filiere_id === f.id);
            const isExpanded = expandedFiliere === f.id;
            return (
              <div key={f.id} className="rounded-2xl border border-border bg-surface">
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => setExpandedFiliere(isExpanded ? null : f.id)}
                    className="flex items-center gap-3 text-left"
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-lg transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                    <div>
                      <p className="font-display text-lg font-semibold">{f.nom}</p>
                      <p className="text-xs text-muted-foreground">{fniveaux.length} niveau(x)</p>
                    </div>
                  </button>
                  <button onClick={() => deleteFiliere(f.id)} className="text-xs text-red-600">Supprimer</button>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4">
                    {fniveaux.length > 0 && (
                      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {fniveaux.map((n) => (
                          <Link
                            key={n.id}
                            to="/admin/niveau/$niveauId"
                            params={{ niveauId: n.id }}
                            className="group rounded-xl border border-border bg-background p-4 transition hover:border-primary hover:shadow-card"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-display text-base font-semibold">{f.nom} — {n.nom}</p>
                                <p className="text-xs text-muted-foreground">Espace dédié →</p>
                              </div>
                              <span className="text-lg opacity-0 transition group-hover:opacity-100">→</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        value={newNiveau.filiere_id === f.id ? newNiveau.nom : ""}
                        onChange={(e) => setNewNiveau({ nom: e.target.value, ordre: newNiveau.ordre, filiere_id: f.id })}
                        placeholder="Ex: Licence 1, L2, Master 1..."
                        className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && addNiveau(f.id)}
                      />
                      <input
                        type="number"
                        value={newNiveau.filiere_id === f.id ? newNiveau.ordre : 0}
                        onChange={(e) => setNewNiveau({ nom: newNiveau.nom, ordre: Number(e.target.value), filiere_id: f.id })}
                        placeholder="Ordre"
                        className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                      <button onClick={() => addNiveau(f.id)} className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background">+ Niveau</button>
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
