import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

type Ev = { id: string; titre: string; description: string | null; date_evt: string | null; lieu: string | null; categorie: string | null };

export default function AdminEvents() {
  const auth = useAuth();
  const eid = auth.etablissementId;
  const [rows, setRows] = useState<Ev[]>([]);
  const [form, setForm] = useState({ titre: "", description: "", date_evt: "", lieu: "", categorie: "" });

  async function refresh() {
    if (!eid) return;
    const { data } = await supabase.from("evenements").select("*").eq("etablissement_id", eid).order("date_evt", { ascending: true });
    setRows(data ?? []);
  }
  useEffect(() => { refresh(); }, [eid]);

  async function add() {
    if (!eid || !form.titre) return;
    const { error } = await supabase.from("evenements").insert({
      titre: form.titre, description: form.description || null,
      date_evt: form.date_evt || null, lieu: form.lieu || null, categorie: form.categorie || null,
      etablissement_id: eid,
    });
    if (error) { alert(error.message); return; }
    setForm({ titre: "", description: "", date_evt: "", lieu: "", categorie: "" });
    refresh();
  }

  async function remove(id: string) { await supabase.from("evenements").delete().eq("id", id); refresh(); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--terracotta)" }}>Vie universitaire</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>Événements</h1>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>Événements visibles par tous les étudiants de votre établissement.</p>
      </div>
      <div className="card" style={{ padding: 20, display: "grid", gap: 12, gridTemplateColumns: "repeat(2, 1fr)" }}>
        <input className="field" placeholder="Titre" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
        <input className="field" placeholder="Catégorie" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} />
        <textarea className="field" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ gridColumn: "1/-1" }} />
        <input className="field" type="datetime-local" value={form.date_evt} onChange={(e) => setForm({ ...form, date_evt: e.target.value })} />
        <input className="field" placeholder="Lieu" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} />
        <button className="btn-primary" style={{ gridColumn: "1/-1" }} onClick={add}>Créer l'événement</button>
      </div>
      {rows.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)", borderStyle: "dashed" }}>Aucun événement.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {rows.map((e) => (
            <div key={e.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--terracotta)" }}>{e.categorie ?? "Événement"}</p>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{e.titre}</h2>
                  {e.date_evt && <p style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(e.date_evt).toLocaleString("fr-FR")}</p>}
                  {e.lieu && <p style={{ fontSize: 12, color: "var(--muted)" }}>📍 {e.lieu}</p>}
                </div>
                <button onClick={() => remove(e.id)} style={{ fontSize: 12, color: "var(--error)", background: "none", border: "none" }}>×</button>
              </div>
              {e.description && <p style={{ marginTop: 8, fontSize: 14, color: "var(--muted)" }}>{e.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
