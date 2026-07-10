import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Etab = { id: string; nom: string; statut: string; type_etablissement: string | null };

export default function PlatformEtabs() {
  const [rows, setRows] = useState<Etab[]>([]);
  const [form, setForm] = useState({ nom: "", type_etablissement: "Université", ville: "" });
  const [msg, setMsg] = useState("");

  async function refresh() {
    const { data } = await supabase.from("etablissements").select("id,nom,statut,type_etablissement").order("nom");
    setRows(data ?? []);
  }
  useEffect(() => { refresh(); }, []);

  async function create() {
    if (!form.nom.trim()) return;
    const { error } = await supabase.from("etablissements").insert({
      nom: form.nom.trim(), type_etablissement: form.type_etablissement || null,
      statut: "actif",
    });
    if (error) { setMsg("Erreur : " + error.message); return; }
    setMsg("✓ Établissement créé");
    setForm({ nom: "", type_etablissement: "Université", ville: "" });
    refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--terracotta)" }}>Gestion</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>Établissements</h1>
      </div>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, maxWidth: 500 }}>
        <input className="field" placeholder="Nom de l'établissement" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        <select className="field" value={form.type_etablissement} onChange={(e) => setForm({ ...form, type_etablissement: e.target.value })}>
          <option>Université</option><option>Institut</option><option>École</option>
        </select>
        <button className="btn-primary" onClick={create}>Créer</button>
        {msg && <p style={{ fontSize: 13 }}>{msg}</p>}
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--muted-bg)", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>
            <tr><th style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Nom</th><th style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Type</th><th style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Statut</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.75rem 1.25rem", fontWeight: 600 }}>{r.nom}</td>
                <td style={{ padding: "0.75rem 1.25rem", color: "var(--muted)" }}>{r.type_etablissement ?? "—"}</td>
                <td style={{ padding: "0.75rem 1.25rem" }}><span className="chip chip-success">{r.statut}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
