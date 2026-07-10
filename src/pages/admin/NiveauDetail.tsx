import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

type Tab = "students" | "annonces" | "emploi" | "notes";
type Niveau = { id: string; nom: string; filiere_id: string; etablissement_id: string };
type Filiere = { id: string; nom: string };

export default function AdminNiveau() {
  const { niveauId } = useParams();
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

  if (loading) return <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>;
  if (!niveau) return <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>Niveau introuvable.</div>;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "students", label: "Étudiants", icon: "🎓" },
    { key: "annonces", label: "Annonces", icon: "📣" },
    { key: "emploi", label: "Emploi du temps", icon: "📅" },
    { key: "notes", label: "Notes", icon: "📊" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <Link to="/admin/filieres" style={{ fontSize: 12, color: "var(--muted)" }}>← Filières & Niveaux</Link>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--terracotta)", marginTop: 8 }}>
          {filiere?.nom ?? "—"} · {niveau.nom}
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>{filiere?.nom} — {niveau.nom}</h1>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>Espace dédié et cloisonné. Les données ne sont visibles que par les étudiants de ce niveau.</p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: "0.5rem 1rem", borderRadius: "0.625rem", fontSize: 14, fontWeight: 600, transition: "all 0.15s",
              background: tab === t.key ? "var(--primary)" : "var(--surface)", color: tab === t.key ? "var(--primary-fg)" : "var(--fg)",
              boxShadow: tab === t.key ? "var(--shadow)" : "none", border: tab === t.key ? "none" : "1px solid var(--border)" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "students" && <StudentsTab niveauId={niveauId!} eid={eid} filiereId={niveau.filiere_id} />}
      {tab === "annonces" && <AnnoncesTab niveauId={niveauId!} eid={eid} filiereId={niveau.filiere_id} />}
      {tab === "emploi" && <EmploiTab niveauId={niveauId!} eid={eid} filiereId={niveau.filiere_id} />}
      {tab === "notes" && <NotesTab niveauId={niveauId!} eid={eid} filiereId={niveau.filiere_id} />}
    </div>
  );
}

// ============ STUDENTS ============
function StudentsTab({ niveauId, eid, filiereId }: { niveauId: string; eid: string | null; filiereId: string }) {
  const [rows, setRows] = useState<{ id: string; nom_complet: string; email: string | null; matricule: string | null; date_naissance: string | null }[]>([]);
  const [importText, setImportText] = useState("");
  const [report, setReport] = useState("");

  async function refresh() {
    const { data } = await supabase.from("etudiants").select("id,nom_complet,email,matricule,date_naissance")
      .eq("niveau_id", niveauId).eq("filiere_id", filiereId).order("nom_complet");
    setRows(data ?? []);
  }
  useEffect(() => { refresh(); }, [niveauId]);

  async function importCsv() {
    if (!eid || !importText.trim()) return;
    const lines = importText.trim().split(/\r?\n/);
    const parsed = lines.slice(1).map((line) => {
      const cols = line.split(/[,;\t]/).map((s) => s.trim());
      return { nom_complet: cols[0], email: cols[1] || null, date_naissance: cols[2] || null, matricule: cols[3] || null };
    }).filter((r) => r.nom_complet);

    if (parsed.length === 0) { setReport("Aucune ligne valide trouvée."); return; }

    const { data, error } = await supabase.from("liste_officielle").insert(
      parsed.map((r) => ({ ...r, etablissement_id: eid, filiere_id: filiereId, niveau_id: niveauId }))
    ).select();
    if (error) { setReport("Erreur : " + error.message); return; }
    setReport(`✓ ${data?.length ?? 0} étudiants importés. Ils pourront se connecter avec leur email et date de naissance.`);
    setImportText("");
    refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20, borderStyle: "dashed", borderWidth: 2 }}>
        <p style={{ fontWeight: 700, fontSize: 14 }}>📥 Importer des étudiants (CSV)</p>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Format : nom_complet;email;date_naissance(AAAA-MM-JJ);matricule</p>
        <textarea className="field" rows={5} value={importText} onChange={(e) => setImportText(e.target.value)}
          placeholder={"nom_complet;email;date_naissance;matricule\nAwa DIENG;awa@gmail.com;2003-05-14;M001"}
          style={{ marginTop: 12, fontFamily: "monospace", fontSize: 12 }} />
        <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn-primary" onClick={importCsv}>Importer</button>
          {report && <span style={{ fontSize: 12, color: "var(--muted)" }}>{report}</span>}
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted)", borderStyle: "dashed" }}>Aucun étudiant inscrit dans ce niveau.</div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead style={{ background: "var(--muted-bg)", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>
              <tr><th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Nom</th><th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Email</th><th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Matricule</th><th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Naissance</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{r.nom_complet}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: 12 }}>{r.email ?? "—"}</td>
                  <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: 12 }}>{r.matricule ?? "—"}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: 12 }}>{r.date_naissance ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============ ANNONCES ============
function AnnoncesTab({ niveauId, eid, filiereId }: { niveauId: string; eid: string | null; filiereId: string }) {
  const [rows, setRows] = useState<{ id: string; titre: string; contenu: string; tag: string | null; urgent: boolean | null; created_at: string }[]>([]);
  const [form, setForm] = useState({ titre: "", contenu: "", tag: "", urgent: false });

  async function refresh() {
    const { data } = await supabase.from("annonces").select("id,titre,contenu,tag,urgent,created_at")
      .eq("filiere_id", filiereId).eq("niveau_id", niveauId).order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { refresh(); }, [niveauId]);

  async function add() {
    if (!eid || !form.titre) return;
    const { error } = await supabase.from("annonces").insert({
      titre: form.titre, contenu: form.contenu, tag: form.tag || null, urgent: form.urgent,
      etablissement_id: eid, filiere_id: filiereId, niveau_id: niveauId,
    });
    if (error) { alert(error.message); return; }
    setForm({ titre: "", contenu: "", tag: "", urgent: false });
    refresh();
  }

  async function remove(id: string) { await supabase.from("annonces").delete().eq("id", id); refresh(); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontWeight: 700, fontSize: 14 }}>Nouvelle annonce (visible uniquement par ce niveau)</p>
        <input className="field" placeholder="Titre" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
        <textarea className="field" rows={3} placeholder="Contenu" value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input className="field" placeholder="Tag" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
          <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} /> Urgent
          </label>
        </div>
        <button className="btn-primary" onClick={add}>Publier</button>
      </div>
      {rows.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted)", borderStyle: "dashed" }}>Aucune annonce pour ce niveau.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((a) => (
            <article key={a.id} className="card" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
              {a.urgent && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "var(--terracotta)" }} />}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {a.tag && <span className="chip chip-default">{a.tag}</span>}
                {a.urgent && <span className="chip chip-terracotta">Urgent</span>}
                <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--muted)" }}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
                <button onClick={() => remove(a.id)} style={{ fontSize: 12, color: "var(--error)", background: "none", border: "none" }}>Supprimer</button>
              </div>
              <h2 style={{ marginTop: 8, fontWeight: 700, fontSize: 16 }}>{a.titre}</h2>
              <p style={{ marginTop: 4, fontSize: 14, color: "var(--muted)" }}>{a.contenu}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ EMPLOI ============
function EmploiTab({ niveauId, eid, filiereId }: { niveauId: string; eid: string | null; filiereId: string }) {
  const [rows, setRows] = useState<{ id: string; matiere: string; jour: string; heure_debut: string | null; heure_fin: string | null; salle: string | null; enseignant: string | null }[]>([]);
  const [form, setForm] = useState({ matiere: "", jour: "Lundi", heure_debut: "", heure_fin: "", salle: "", enseignant: "" });
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  async function refresh() {
    const { data } = await supabase.from("emplois_du_temps").select("id,matiere,jour,heure_debut,heure_fin,salle,enseignant")
      .eq("filiere_id", filiereId).eq("niveau_id", niveauId).order("heure_debut");
    setRows(data ?? []);
  }
  useEffect(() => { refresh(); }, [niveauId]);

  async function add() {
    if (!eid || !form.matiere) return;
    const { error } = await supabase.from("emplois_du_temps").insert({
      etablissement_id: eid, filiere_id: filiereId, niveau_id: niveauId,
      matiere: form.matiere, jour: form.jour, heure_debut: form.heure_debut || null, heure_fin: form.heure_fin || null,
      salle: form.salle || null, enseignant: form.enseignant || null,
    });
    if (error) { alert(error.message); return; }
    setForm({ matiere: "", jour: "Lundi", heure_debut: "", heure_fin: "", salle: "", enseignant: "" });
    refresh();
  }

  async function remove(id: string) { await supabase.from("emplois_du_temps").delete().eq("id", id); refresh(); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)" }}>
        <p style={{ fontWeight: 700, fontSize: 14, gridColumn: "1/-1" }}>Nouveau créneau (visible uniquement par ce niveau)</p>
        <input className="field" placeholder="Matière" value={form.matiere} onChange={(e) => setForm({ ...form, matiere: e.target.value })} />
        <select className="field" value={form.jour} onChange={(e) => setForm({ ...form, jour: e.target.value })}>
          {jours.map((j) => <option key={j}>{j}</option>)}
        </select>
        <input className="field" placeholder="Enseignant" value={form.enseignant} onChange={(e) => setForm({ ...form, enseignant: e.target.value })} />
        <input className="field" type="time" value={form.heure_debut} onChange={(e) => setForm({ ...form, heure_debut: e.target.value })} />
        <input className="field" type="time" value={form.heure_fin} onChange={(e) => setForm({ ...form, heure_fin: e.target.value })} />
        <input className="field" placeholder="Salle" value={form.salle} onChange={(e) => setForm({ ...form, salle: e.target.value })} />
        <button className="btn-primary" style={{ gridColumn: "1/-1" }} onClick={add}>Ajouter le créneau</button>
      </div>
      {rows.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted)", borderStyle: "dashed" }}>Aucun créneau pour ce niveau.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {jours.map((j) => {
            const jrows = rows.filter((r) => r.jour === j);
            if (jrows.length === 0) return null;
            return (
              <div key={j} className="card" style={{ padding: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--terracotta)", marginBottom: 8 }}>{j}</p>
                {jrows.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg)", fontSize: 14, marginTop: 4 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>{r.heure_debut ?? "?"}–{r.heure_fin ?? "?"}</span>
                    <span style={{ fontWeight: 600 }}>{r.matiere}</span>
                    {r.salle && <span style={{ fontSize: 12, color: "var(--muted)" }}>📍 {r.salle}</span>}
                    {r.enseignant && <span style={{ fontSize: 12, color: "var(--muted)" }}>👤 {r.enseignant}</span>}
                    <button onClick={() => remove(r.id)} style={{ marginLeft: "auto", fontSize: 12, color: "var(--error)", background: "none", border: "none" }}>×</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ NOTES ============
function NotesTab({ niveauId, eid, filiereId }: { niveauId: string; eid: string | null; filiereId: string }) {
  const [etudiants, setEtudiants] = useState<{ id: string; nom_complet: string }[]>([]);
  const [matieres, setMatieres] = useState<{ id: string; nom: string; code: string | null; credit: number | null }[]>([]);
  const [notes, setNotes] = useState<{ id: string; etudiant_id: string; matiere_id: string; note: number | null; published: boolean | null }[]>([]);
  const [selMat, setSelMat] = useState("");
  const [newMat, setNewMat] = useState({ nom: "", code: "", credit: 0 });

  async function refresh() {
    if (!eid) return;
    const [e, m, n] = await Promise.all([
      supabase.from("etudiants").select("id,nom_complet").eq("etablissement_id", eid).eq("filiere_id", filiereId).eq("niveau_id", niveauId).order("nom_complet"),
      supabase.from("matieres").select("id,nom,code,credit").eq("etablissement_id", eid).eq("filiere_id", filiereId).eq("niveau_id", niveauId).order("nom"),
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
      etablissement_id: eid, filiere_id: filiereId, niveau_id: niveauId,
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "grid", gap: 12, gridTemplateColumns: "repeat(4, 1fr)" }}>
        <p style={{ fontWeight: 700, fontSize: 14, gridColumn: "1/-1" }}>Nouvelle matière (pour ce niveau)</p>
        <input className="field" placeholder="Nom" value={newMat.nom} onChange={(e) => setNewMat({ ...newMat, nom: e.target.value })} style={{ gridColumn: "span 2" }} />
        <input className="field" placeholder="Code" value={newMat.code} onChange={(e) => setNewMat({ ...newMat, code: e.target.value })} />
        <input className="field" type="number" placeholder="Crédits" value={newMat.credit} onChange={(e) => setNewMat({ ...newMat, credit: Number(e.target.value) })} />
        <button className="btn-primary" style={{ gridColumn: "1/-1" }} onClick={addMatiere}>Ajouter la matière</button>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 14 }}>Saisir les notes de :</p>
          <select className="field" style={{ width: "auto" }} value={selMat} onChange={(e) => setSelMat(e.target.value)}>
            <option value="">— Matière —</option>
            {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}{m.code ? ` (${m.code})` : ""}</option>)}
          </select>
        </div>
        {selMat && etudiants.length > 0 && (
          <table style={{ width: "100%", fontSize: 14, marginTop: 16, borderCollapse: "collapse" }}>
            <thead style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>
              <tr><th style={{ padding: "0.5rem", textAlign: "left" }}>Étudiant</th><th style={{ padding: "0.5rem", textAlign: "left" }}>Note /20</th><th style={{ padding: "0.5rem", textAlign: "left" }}>Statut</th></tr>
            </thead>
            <tbody>
              {etudiants.map((e) => {
                const n = notes.find((x) => x.etudiant_id === e.id && x.matiere_id === selMat);
                return (
                  <tr key={e.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.5rem" }}>{e.nom_complet}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <input type="number" step="0.25" min="0" max="20" defaultValue={n?.note ?? ""}
                        onBlur={(ev) => setNote(e.id, selMat, ev.target.value)}
                        style={{ width: 80, border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.25rem 0.5rem", fontSize: 14 }} />
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {n ? (
                        <button onClick={() => togglePublish(n.id, !!n.published)} style={{ background: "none", border: "none" }}>
                          <span className={`chip ${n.published ? "chip-success" : "chip-muted"}`}>{n.published ? "Publiée" : "En attente"}</span>
                        </button>
                      ) : <span className="chip chip-muted">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {selMat && etudiants.length === 0 && <p style={{ marginTop: 16, fontSize: 14, color: "var(--muted)" }}>Aucun étudiant dans ce niveau.</p>}
      </div>
    </div>
  );
}
