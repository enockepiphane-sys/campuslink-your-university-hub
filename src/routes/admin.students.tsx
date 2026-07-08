import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Avatar, Chip } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/admin/students")({
  component: StudentsPage,
  head: () => ({ meta: [{ title: "Étudiants — Admin CampusLink" }] }),
});

type Student = { id:string; nom_complet:string; matricule:string|null; email:string|null; statut:string|null };
type Ref = { id: string; nom: string };

function StudentsPage() {
  const auth = useAuth();
  const eid = auth.etablissementId;
  const [rows, setRows] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filieres, setFilieres] = useState<Ref[]>([]);
  const [niveaux, setNiveaux] = useState<Ref[]>([]);
  const [form, setForm] = useState({ nom_complet:"", email:"", matricule:"", filiere_id:"", niveau_id:"", date_naissance:"" });
  const [importText, setImportText] = useState("");
  const [importReport, setImportReport] = useState<string>("");

  async function refresh() {
    if (!eid) return;
    setLoading(true);
    const { data } = await supabase.from("etudiants").select("id,nom_complet,matricule,email,statut").eq("etablissement_id", eid).order("nom_complet");
    setRows(data ?? []); setLoading(false);
  }
  useEffect(() => { refresh(); }, [eid]);
  useEffect(() => {
    if (!eid) return;
    supabase.from("filieres").select("id,nom").eq("etablissement_id", eid).then(({data})=>setFilieres(data??[]));
    supabase.from("niveaux").select("id,nom").eq("etablissement_id", eid).then(({data})=>setNiveaux(data??[]));
  }, [eid]);

  async function add() {
    if (!eid || !form.nom_complet) return;
    const { error } = await supabase.from("etudiants").insert({ ...form, etablissement_id: eid, filiere_id: form.filiere_id||null, niveau_id: form.niveau_id||null, date_naissance: form.date_naissance||null });
    if (!error) { setForm({ nom_complet:"", email:"", matricule:"", filiere_id:"", niveau_id:"", date_naissance:"" }); refresh(); }
    else alert(error.message);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet étudiant ?")) return;
    await supabase.from("etudiants").delete().eq("id", id);
    refresh();
  }

  async function importCsv() {
    if (!eid || !importText.trim()) return;
    const lines = importText.trim().split(/\r?\n/);
    const rows = lines.slice(1).map(line => {
      const cols = line.split(/[,;\t]/).map(s=>s.trim());
      return { nom_complet: cols[0], date_naissance: cols[1]||null, filiere_id: null, niveau_id: null, matricule: cols[2]||null, email: cols[3]||null };
    }).filter(r => r.nom_complet);
    const inserts = rows.map(r => ({ ...r, etablissement_id: eid }));
    const { error, data } = await supabase.from("liste_officielle").insert(inserts).select();
    if (error) setImportReport("Erreur : " + error.message);
    else setImportReport(`✓ ${data?.length ?? 0} étudiants ajoutés à la liste officielle. Ils pourront désormais créer leur compte.`);
    setImportText("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Gestion</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Étudiants</h1>
        <p className="mt-1 text-sm text-muted-foreground">{rows.length} étudiants inscrits</p>
      </div>

      {/* Import zone */}
      <details className="rounded-2xl border-2 border-dashed border-border bg-surface p-6">
        <summary className="cursor-pointer font-display text-base font-semibold">📥 Importer une liste officielle (CSV)</summary>
        <p className="mt-2 text-xs text-muted-foreground">Format : une ligne d'en-tête, puis <code>nom_complet;date_naissance(AAAA-MM-JJ);matricule;email</code>. Ces étudiants pourront ensuite créer leur compte via l'inscription.</p>
        <textarea value={importText} onChange={e=>setImportText(e.target.value)} rows={5} placeholder="nom_complet;date_naissance;matricule;email&#10;Awa Diagne;2003-05-14;M001;awa@example.com" className="mt-3 w-full rounded-xl border border-input bg-background p-3 text-xs font-mono" />
        <div className="mt-3 flex items-center gap-3">
          <button onClick={importCsv} className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background">Importer</button>
          {importReport && <p className="text-xs text-muted-foreground">{importReport}</p>}
        </div>
      </details>

      {/* Add form */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-display text-sm font-semibold">Ajouter un étudiant</p>
        <div className="grid gap-3 md:grid-cols-6">
          <input value={form.nom_complet} onChange={e=>setForm({...form, nom_complet:e.target.value})} placeholder="Nom complet" className="md:col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="md:col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.matricule} onChange={e=>setForm({...form, matricule:e.target.value})} placeholder="Matricule" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input type="date" value={form.date_naissance} onChange={e=>setForm({...form, date_naissance:e.target.value})} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <select value={form.filiere_id} onChange={e=>setForm({...form, filiere_id:e.target.value})} className="rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="">Filière</option>{filieres.map(f=><option key={f.id} value={f.id}>{f.nom}</option>)}</select>
          <select value={form.niveau_id} onChange={e=>setForm({...form, niveau_id:e.target.value})} className="rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="">Niveau</option>{niveaux.map(n=><option key={n.id} value={n.id}>{n.nom}</option>)}</select>
          <button onClick={add} className="md:col-span-2 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">Ajouter</button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {loading ? <div className="p-8 text-center text-sm text-muted-foreground">Chargement…</div>
        : rows.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">Aucun étudiant inscrit.</div>
        : <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Étudiant</th>
              <th className="px-5 py-3 text-left">Matricule</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Statut</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => {
              const init = r.nom_complet.split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase();
              return (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={init} className="h-9 w-9 text-xs" />
                      <p className="font-semibold">{r.nom_complet}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{r.matricule ?? "—"}</td>
                  <td className="px-5 py-3">{r.email ?? "—"}</td>
                  <td className="px-5 py-3"><Chip tone={r.statut==="actif" ? "success" : "muted"}>{r.statut ?? "actif"}</Chip></td>
                  <td className="px-5 py-3 text-right"><button onClick={()=>remove(r.id)} className="text-xs font-semibold text-red-600">Supprimer</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
