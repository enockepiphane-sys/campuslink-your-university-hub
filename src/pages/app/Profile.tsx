import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

export default function AppProfile() {
  const auth = useAuth();
  const [etu, setEtu] = useState<{ nom_complet: string; email: string | null; matricule: string | null; date_naissance: string | null } | null>(null);
  const [etab, setEtab] = useState<{ nom: string } | null>(null);
  const [filiere, setFiliere] = useState<{ nom: string } | null>(null);
  const [niveau, setNiveau] = useState<{ nom: string } | null>(null);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: e } = await supabase.from("etudiants").select("nom_complet,email,matricule,date_naissance,etablissement_id,filiere_id,niveau_id").eq("user_id", auth.user!.id).maybeSingle();
      setEtu(e);
      if (e?.etablissement_id) {
        const { data } = await supabase.from("etablissements").select("nom").eq("id", e.etablissement_id).maybeSingle();
        setEtab(data);
      }
      if (e?.filiere_id) {
        const { data } = await supabase.from("filieres").select("nom").eq("id", e.filiere_id).maybeSingle();
        setFiliere(data);
      }
      if (e?.niveau_id) {
        const { data } = await supabase.from("niveaux").select("nom").eq("id", e.niveau_id).maybeSingle();
        setNiveau(data);
      }
    })();
  }, [auth.user]);

  return (
    <div>
      <div className="phone-header">
        <p style={{ fontSize: 12, opacity: 0.8 }}>Mon compte</p>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Profil</h1>
      </div>
      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gold)", color: "var(--gold-fg)", display: "grid", placeItems: "center", margin: "0 auto", fontWeight: 800, fontSize: 24 }}>
            {(etu?.nom_complet ?? "E").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <p style={{ fontWeight: 700, fontSize: 18, marginTop: 12 }}>{etu?.nom_complet ?? "—"}</p>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>{etu?.email ?? auth.user?.email}</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          {[
            { l: "Établissement", v: etab?.nom },
            { l: "Filière", v: filiere?.nom },
            { l: "Niveau", v: niveau?.nom },
            { l: "Matricule", v: etu?.matricule },
            { l: "Date de naissance", v: etu?.date_naissance },
          ].map((row) => (
            <div key={row.l} style={{ display: "flex", justifyContent: "space-between", padding: "0.625rem 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{row.l}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{row.v ?? "—"}</span>
            </div>
          ))}
        </div>
        <button onClick={() => auth.signOut()} className="btn-ghost" style={{ color: "var(--error)" }}>Déconnexion</button>
      </div>
    </div>
  );
}
