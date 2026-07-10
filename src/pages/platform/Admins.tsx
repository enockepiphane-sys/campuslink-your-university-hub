import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Etab = { id: string; nom: string };
type Admin = { id: string; email: string; nom_complet: string; date_naissance: string; statut: string; etablissement_id: string };

export default function PlatformAdmins() {
  const [etabs, setEtabs] = useState<Etab[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [form, setForm] = useState({ nom_complet: "", email: "", date_naissance: "", etablissement_id: "" });
  const [msg, setMsg] = useState("");

  async function refresh() {
    const [{ data: e }, { data: a }] = await Promise.all([
      supabase.from("etablissements").select("id,nom").order("nom"),
      supabase.from("admins").select("id,email,nom_complet,date_naissance,statut,etablissement_id").order("nom_complet"),
    ]);
    setEtabs(e ?? []);
    setAdmins(a ?? []);
  }
  useEffect(() => { refresh(); }, []);

  async function create() {
    if (!form.etablissement_id || !form.email || !form.nom_complet || !form.date_naissance) return;
    const { error } = await supabase.from("admins").upsert({
      email: form.email, nom_complet: form.nom_complet, date_naissance: form.date_naissance,
      etablissement_id: form.etablissement_id, statut: "actif",
    }, { onConflict: "email,etablissement_id" });
    if (error) { setMsg("Erreur : " + error.message); return; }
    setMsg(`✓ Administrateur créé. ${form.email} pourra se connecter avec son email et sa date de naissance.`);
    setForm({ nom_complet: "", email: "", date_naissance: "", etablissement_id: "" });
    refresh();
  }

  const etabName = (id: string) => etabs.find((e) => e.id === id)?.nom ?? "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--terracotta)" }}>Comptes</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>Administrateurs d'établissement</h1>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
          L'administrateur se connectera avec son email et sa date de naissance, puis recevra un code OTP.
        </p>
      </div>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, maxWidth: 500 }}>
        <select className="field" value={form.etablissement_id} onChange={(e) => setForm({ ...form, etablissement_id: e.target.value })}>
          <option value="">— Établissement —</option>
          {etabs.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
        </select>
        <input className="field" placeholder="Nom complet" value={form.nom_complet} onChange={(e) => setForm({ ...form, nom_complet: e.target.value })} />
        <input className="field" type="email" placeholder="Email professionnel" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="field" type="date" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
        <button className="btn-primary" onClick={create}>Créer l'administrateur</button>
        {msg && <p style={{ fontSize: 13 }}>{msg}</p>}
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--muted-bg)", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>
            <tr><th style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Nom</th><th style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Email</th><th style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Établissement</th><th style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Statut</th></tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.75rem 1.25rem", fontWeight: 600 }}>{a.nom_complet}</td>
                <td style={{ padding: "0.75rem 1.25rem", fontSize: 12 }}>{a.email}</td>
                <td style={{ padding: "0.75rem 1.25rem", fontSize: 12, color: "var(--muted)" }}>{etabName(a.etablissement_id)}</td>
                <td style={{ padding: "0.75rem 1.25rem" }}><span className="chip chip-success">{a.statut}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
