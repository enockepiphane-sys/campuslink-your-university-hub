import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Chip } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/admin/niveau/$niveauId")({
  component: NiveauDetailPage,
  head: () => ({ meta: [{ title: "Espace niveau — Admin CampusLink" }] }),
});

type Tab = "students" | "annonces" | "emploi" | "notes";

type Niveau = { id: string; nom: string; filiere_id: string | null; etablissement_id: string };
type Filiere = { id: string; nom: string };
type Etudiant = { id: string; nom_complet: string; email: string | null; matricule: string | null; date_naissance: string | null };
type Annonce = { id: string; titre: string; contenu: string; tag: string | null; urgent: boolean | null; created_at: string };
type Emploi = { id: string; matiere: string; jour: string; heure_debut: string | null; heure_fin: string | null; salle: string | null; enseignant: string | null };
type Matiere = { id: string; nom: string; code: string | null; credit: number | null };
type Note = { id: string; etudiant_id: string; matiere_id: string; note: number | null; published: boolean | null };

function NiveauDetailPage() {
  const { niveauId } = useParams({ from: "/admin/niveau/$niveauId" });
  const auth = useAuth();
  const eid = auth.etablissementId;
  const [tab, setTab] = useState<Tab>("students");
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [filiere, setFiliere] = useState<Filiere | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!niveauId) return;
    (async () => {
      const { data: n } = await supabase.from("niveaux").select("id,nom,filiere_id,etablissement_id").eq("id", niveauId).maybeSingle();
      setNiveau(n);
      if (n?.filiere_id) {
        const { data: f } = await supabase.from("filieres").select("id,nom").eq("id", n.filiere_id).maybeSingle();
        setFiliere(f);
      }
      setLoading(false);
    })();
  }, [niveauId]);

  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Chargement…</div>;
  if (!niveau) return <div className="p-8 text-center text-sm text-muted-foreground">Niveau introuvable.</div>;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "students", label: "Étudiants", icon: "🎓" },
    { key: "annonces", label: "Annonces", icon: "📣" },
    { key: "emploi", label: "Emploi du temps", icon: "📅" },
    { key: "notes", label: "Notes", icon: "📊" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/filieres" className="text-xs font-medium text-muted-foreground hover:text-foreground">← Filières & Niveaux</Link>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-terracotta">
          {filiere?.nom ?? "—"} · {niveau.nom}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">{filiere?.nom} — {niveau.nom}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Espace dédié et cloisonné. Les données ne sont visibles que par les étudiants de ce niveau.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${tab === t.key ? "bg-primary text-primary-foreground shadow-elegant" : "bg-surface border border-border hover:bg-muted"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "students" && <StudentsTab niveauId={niveauId} eid={eid} filiereId={niveau.filiere_id} />}
      {tab === "annonces" && <AnnoncesTab niveauId={niveauId} eid={eid} filiereId={niveau.filiere_id} />}
      {tab === "emploi" && <EmploiTab niveauId={niveauId} eid={eid} filiereId={niveau.filiere_id} />}
      {tab === "notes" && <NotesTab niveauId={niveauId} eid={eid} filiereId={niveau.filiere_id} />}
    </div>
  );
}

// ============ STUDENTS TAB ============
function StudentsTab({ niveauId, eid, filiereId }: { niveauId: string; eid: string | null; filiereId: string | null }) {
  const [rows, setRows] = useState<Etudiant[]>([]);
  const [importText, setImportText] = useState("");
  const [report, setReport] = useState("");

  async function refresh() {
    const { data } = await supabase.from("etudiants")
      .select("id,nom_complet,email,matricule,date_naissance")
      .eq("niveau_id", niveauId)
      .eq("filiere_id", filiereId ?? "")
      .order("nom_complet");
    setRows(data ?? []);
  }

  useEffect(() => { refresh(); }, [niveauId]);

  async function importCsv() {
    if (!eid || !importText.trim()) return;
    const lines = importText.trim().split(/\r?\n/);
    const parsed = lines.slice(1).map((line) => {
      const cols = line.split(/[,;\t]/).map((s) => s.trim());
      return {
        nom_complet: cols[0],
        email: cols[1] || null,
        date_naissance: cols[2] || null,
        matricule: cols[3] || null,
      };
    }).filter((r) => r.nom_complet);

    if (parsed.length === 0) { setReport("Aucune ligne valide trouvée."); return; }

    // Insert into liste_officielle (for self-registration) AND etudiants
    const officielInserts = parsed.map((r) => ({
      ...r,
      etablissement_id: eid,
      filiere_id: filiereId ?? null,
      niveau_id: niveauId,
    }));

    const { data, error } = await supabase.from("liste_officielle").insert(officielInserts).select();
    if (error) { setReport("Erreur : " + error.message); return; }
    setReport(`✓ ${data?.length ?? 0} étudiants importés dans la liste officielle. Ils pourront créer leur compte avec leur email et date de naissance.`);
    setImportText("");
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("Retirer cet étudiant de ce niveau ?")) return;
    await supabase.from("etudiants").delete().eq("id", id);
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-border bg-surface p-5">
        <p className="font-display text-sm font-semibold">📥 Importer des étudiants (CSV)</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Format : en-tête puis <code>nom_complet;email;date_naissance(AAAA-MM-JJ);matricule</code>
        </p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={5}
          placeholder={"nom_complet;email;date_naissance;matricule\nAwa DIENG;awa@gmail.com;2003-05-14;M001"}
          className="mt-3 w-full rounded-xl border border-input bg-background p-3 text-xs font-mono"
        />
        <div className="mt-3 flex items-center gap-3">
          <button onClick={importCsv} className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background">Importer</button>
          {report && <p className="text-xs text-muted-foreground">{report}</p>}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucun étudiant inscrit dans ce niveau.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Nom</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Matricule</th><th className="px-4 py-3 text-left">Naissance</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold">{r.nom_complet}</td>
                  <td className="px-4 py-3 text-xs">{r.email ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.matricule ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{r.date_naissance ?? "—"}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => remove(r.id)} className="text-xs text-red-600">Retirer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============ ANNONCES TAB ============
function AnnoncesTab({ niveauId, eid, filiereId }: { niveauId: string; eid: string | null; filiereId: string | null }) {
  const [rows, setRows] = useState<Annonce[]>([]);
  const [form, setForm] = useState({ titre: "", contenu: "", tag: "", urgent: false });

  async function refresh() {
    const { data } = await supabase.from("annonces")
      .select("id,titre,contenu,tag,urgent,created_at")
      .eq("filiere_id", filiereId ?? "")
      .eq("niveau_id", niveauId)
      .order("created_at", { ascending: false });
    setRows(data ?? []);
  }

  useEffect(() => { refresh(); }, [niveauId]);

  async function add() {
    if (!eid || !form.titre) return;
    const { error } = await supabase.from("annonces").insert({
      titre: form.titre, contenu: form.contenu, tag: form.tag || null, urgent: form.urgent,
      etablissement_id: eid, filiere_id: filiereId ?? null, niveau_id: niveauId,
    });
    if (error) { alert(error.message); return; }
    setForm({ titre: "", contenu: "", tag: "", urgent: false });
    refresh();
  }

  async function remove(id: string) {
    await supabase.from("annonces").delete().eq("id", id);
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-display text-sm font-semibold">Nouvelle annonce (visible uniquement par ce niveau)</p>
        <div className="grid gap-3">
          <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Titre" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} placeholder="Contenu" rows={3} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <div className="flex gap-3">
            <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Tag" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} /> Urgent</label>
          </div>
          <button onClick={add} className="rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">Publier</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucune annonce pour ce niveau.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((a) => (
            <article key={a.id} className="relative overflow-hidden rounded-2xl bg-surface p-4 shadow-card">
              {a.urgent && <span className="absolute left-0 top-0 h-full w-1 bg-terracotta" />}
              <div className="flex items-center gap-2">
                {a.tag && <Chip tone={a.urgent ? "terracotta" : "default"}>{a.tag}</Chip>}
                {a.urgent && <Chip tone="terracotta">Urgent</Chip>}
                <span className="ml-auto text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
                <button onClick={() => remove(a.id)} className="text-xs text-red-600">Supprimer</button>
              </div>
              <h2 className="mt-2 font-display text-base font-semibold">{a.titre}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{a.contenu}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ EMPLOI DU TEMPS TAB ============
function EmploiTab({ niveauId, eid, filiereId }: { niveauId: string; eid: string | null; filiereId: string | null }) {
  const [rows, setRows] = useState<Emploi[]>([]);
  const [form, setForm] = useState({ matiere: "", jour: "Lundi", heure_debut: "", heure_fin: "", salle: "", enseignant: "" });
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  async function refresh() {
    const { data } = await supabase.from("emplois_du_temps")
      .select("id,matiere,jour,heure_debut,heure_fin,salle,enseignant")
      .eq("filiere_id", filiereId ?? "")
      .eq("niveau_id", niveauId)
      .order("heure_debut");
    setRows(data ?? []);
  }

  useEffect(() => { refresh(); }, [niveauId]);

  async function add() {
    if (!eid || !form.matiere) return;
    const { error } = await supabase.from("emplois_du_temps").insert({
      etablissement_id: eid, filiere_id: filiereId ?? null, niveau_id: niveauId,
      matiere: form.matiere, jour: form.jour,
      heure_debut: form.heure_debut || null, heure_fin: form.heure_fin || null,
      salle: form.salle || null, enseignant: form.enseignant || null,
    });
    if (error) { alert(error.message); return; }
    setForm({ matiere: "", jour: "Lundi", heure_debut: "", heure_fin: "", salle: "", enseignant: "" });
    refresh();
  }

  async function remove(id: string) {
    await supabase.from("emplois_du_temps").delete().eq("id", id);
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-display text-sm font-semibold">Nouveau créneau (visible uniquement par ce niveau)</p>
        <div className="grid gap-3 md:grid-cols-3">
          <input value={form.matiere} onChange={(e) => setForm({ ...form, matiere: e.target.value })} placeholder="Matière" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <select value={form.jour} onChange={(e) => setForm({ ...form, jour: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            {jours.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>
          <input value={form.enseignant} onChange={(e) => setForm({ ...form, enseignant: e.target.value })} placeholder="Enseignant" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input type="time" value={form.heure_debut} onChange={(e) => setForm({ ...form, heure_debut: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input type="time" value={form.heure_fin} onChange={(e) => setForm({ ...form, heure_fin: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.salle} onChange={(e) => setForm({ ...form, salle: e.target.value })} placeholder="Salle" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={add} className="md:col-span-3 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">Ajouter le créneau</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucun créneau pour ce niveau.</div>
      ) : (
        <div className="space-y-2">
          {jours.map((j) => {
            const jrows = rows.filter((r) => r.jour === j);
            if (jrows.length === 0) return null;
            return (
              <div key={j} className="rounded-2xl border border-border bg-surface p-4">
                <p className="mb-2 font-display text-sm font-semibold text-terracotta">{j}</p>
                <div className="space-y-1">
                  {jrows.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 rounded-lg bg-background p-2 text-sm">
                      <span className="font-mono text-xs text-muted-foreground">{r.heure_debut ?? "?"}–{r.heure_fin ?? "?"}</span>
                      <span className="font-semibold">{r.matiere}</span>
                      {r.salle && <span className="text-xs text-muted-foreground">📍 {r.salle}</span>}
                      {r.enseignant && <span className="text-xs text-muted-foreground">👤 {r.enseignant}</span>}
                      <button onClick={() => remove(r.id)} className="ml-auto text-xs text-red-600">×</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ NOTES TAB ============
function NotesTab({ niveauId, eid, filiereId }: { niveauId: string; eid: string | null; filiereId: string | null }) {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selMat, setSelMat] = useState("");
  const [newMat, setNewMat] = useState({ nom: "", code: "", credit: 0 });

  async function refresh() {
    if (!eid) return;
    const [e, m, n] = await Promise.all([
      supabase.from("etudiants").select("id,nom_complet,email,matricule,date_naissance").eq("etablissement_id", eid).eq("filiere_id", filiereId ?? "").eq("niveau_id", niveauId).order("nom_complet"),
      supabase.from("matieres").select("id,nom,code,credit").eq("etablissement_id", eid).eq("filiere_id", filiereId ?? "").eq("niveau_id", niveauId).order("nom"),
      supabase.from("notes").select("id,etudiant_id,matiere_id,note,published"),
    ]);
    setEtudiants(e.data ?? []);
    setMatieres(m.data ?? []);
    setNotes(n.data ?? []);
  }

  useEffect(() => { refresh(); }, [niveauId, eid]);

  async function addMatiere() {
    if (!eid || !newMat.nom) return;
    const { error } = await supabase.from("matieres").insert({
      nom: newMat.nom, code: newMat.code || null, credit: newMat.credit || null,
      etablissement_id: eid, filiere_id: filiereId ?? null, niveau_id: niveauId,
    });
    if (error) { alert(error.message); return; }
    setNewMat({ nom: "", code: "", credit: 0 });
    refresh();
  }

  async function setNote(etudiantId: string, matiereId: string, value: string) {
    const existing = notes.find((n) => n.etudiant_id === etudiantId && n.matiere_id === matiereId);
    const num = value === "" ? null : Number(value);
    if (existing) await supabase.from("notes").update({ note: num }).eq("id", existing.id);
    else await supabase.from("notes").insert({ etudiant_id: etudiantId, matiere_id: matiereId, note: num });
    refresh();
  }

  async function togglePublish(id: string, cur: boolean) {
    await supabase.from("notes").update({ published: !cur }).eq("id", id);
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-display text-sm font-semibold">Nouvelle matière (pour ce niveau)</p>
        <div className="grid gap-3 md:grid-cols-4">
          <input value={newMat.nom} onChange={(e) => setNewMat({ ...newMat, nom: e.target.value })} placeholder="Nom" className="rounded-lg border border-input bg-background px-3 py-2 text-sm md:col-span-2" />
          <input value={newMat.code} onChange={(e) => setNewMat({ ...newMat, code: e.target.value })} placeholder="Code" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input type="number" value={newMat.credit} onChange={(e) => setNewMat({ ...newMat, credit: Number(e.target.value) })} placeholder="Crédits" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={addMatiere} className="md:col-span-4 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">Ajouter la matière</button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <p className="font-display text-sm font-semibold">Saisir les notes de :</p>
          <select value={selMat} onChange={(e) => setSelMat(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">— Matière —</option>
            {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}{m.code ? ` (${m.code})` : ""}</option>)}
          </select>
        </div>
        {selMat && etudiants.length > 0 && (
          <table className="mt-4 w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr><th className="py-2 text-left">Étudiant</th><th className="py-2 text-left">Note /20</th><th className="py-2 text-left">Statut</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {etudiants.map((e) => {
                const n = notes.find((x) => x.etudiant_id === e.id && x.matiere_id === selMat);
                return (
                  <tr key={e.id}>
                    <td className="py-2">{e.nom_complet}</td>
                    <td className="py-2">
                      <input
                        defaultValue={n?.note ?? ""}
                        onBlur={(ev) => setNote(e.id, selMat, ev.target.value)}
                        type="number" step="0.25" min="0" max="20"
                        className="w-24 rounded-lg border border-input bg-background px-3 py-1 text-sm"
                      />
                    </td>
                    <td className="py-2">
                      {n ? (
                        <button onClick={() => togglePublish(n.id, !!n.published)}>
                          <Chip tone={n.published ? "success" : "muted"}>{n.published ? "Publiée" : "En attente"}</Chip>
                        </button>
                      ) : <Chip tone="muted">—</Chip>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {selMat && etudiants.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Aucun étudiant dans ce niveau.</p>}
      </div>
    </div>
  );
}
