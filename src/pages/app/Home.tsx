import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

type Etu = { nom_complet: string; etablissement_id: string; filiere_id: string; niveau_id: string };
type Etab = { nom: string };

export default function AppHome() {
  const auth = useAuth();
  const [etu, setEtu] = useState<Etu | null>(null);
  const [etab, setEtab] = useState<Etab | null>(null);
  const [annCount, setAnnCount] = useState(0);
  const [evCount, setEvCount] = useState(0);
  const [annonces, setAnnonces] = useState<{ id: string; titre: string; tag: string | null; urgent: boolean | null; created_at: string }[]>([]);
  const [events, setEvents] = useState<{ id: string; titre: string; date_evt: string | null }[]>([]);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: e } = await supabase.from("etudiants").select("nom_complet,etablissement_id,filiere_id,niveau_id").eq("user_id", auth.user!.id).maybeSingle();
      setEtu(e);
      if (e?.etablissement_id) {
        const { data: et } = await supabase.from("etablissements").select("nom").eq("id", e.etablissement_id).maybeSingle();
        setEtab(et);
        const { data: a } = await supabase.from("annonces").select("id,titre,tag,urgent,created_at")
          .eq("etablissement_id", e.etablissement_id)
          .or(`and(filiere_id.eq.${e.filiere_id},niveau_id.eq.${e.niveau_id}),and(filiere_id.is.null,niveau_id.is.null)`)
          .order("created_at", { ascending: false }).limit(3);
        setAnnonces(a ?? []);
        setAnnCount(a?.length ?? 0);
        const { data: ev } = await supabase.from("evenements").select("id,titre,date_evt").eq("etablissement_id", e.etablissement_id).order("date_evt").limit(3);
        setEvents(ev ?? []);
        setEvCount(ev?.length ?? 0);
      }
    })();
  }, [auth.user]);

  const name = etu?.nom_complet ?? "Étudiant";
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      <div className="phone-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 12, opacity: 0.8 }}>Bonjour,</p>
            <p style={{ fontSize: 20, fontWeight: 700 }}>{name} 👋</p>
            {etab && <p style={{ fontSize: 11, opacity: 0.8 }}>{etab.nom}</p>}
          </div>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--gold)", color: "var(--gold-fg)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16 }}>{initials}</div>
        </div>
      </div>
      <div style={{ padding: "0 1.25rem", marginTop: -24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, textAlign: "center", fontSize: 12 }}>
            <div><div style={{ fontSize: 18 }}>📣</div><div style={{ fontWeight: 800, fontSize: 18 }}>{annCount}</div><div style={{ fontSize: 10, color: "var(--muted)" }}>Annonces</div></div>
            <div><div style={{ fontSize: 18 }}>📅</div><div style={{ fontWeight: 800, fontSize: 18 }}>{evCount}</div><div style={{ fontSize: 10, color: "var(--muted)" }}>Événements</div></div>
            <Link to="/app/emploi" style={{ textDecoration: "none" }}><div style={{ fontSize: 18 }}>📅</div><div style={{ fontWeight: 800, fontSize: 18 }}>→</div><div style={{ fontSize: 10, color: "var(--muted)" }}>Emploi</div></Link>
          </div>
        </div>
      </div>
      <div style={{ padding: "1.25rem", marginTop: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--terracotta)", marginBottom: 8 }}>Accès rapide</p>
        <Link to="/app/emploi" className="card" style={{ padding: 12, display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <span style={{ fontSize: 20 }}>📅</span>
          <div><p style={{ fontWeight: 600, fontSize: 14 }}>Emploi du temps</p><p style={{ fontSize: 11, color: "var(--muted)" }}>Vos cours cette semaine</p></div>
          <span style={{ marginLeft: "auto", color: "var(--muted)" }}>→</span>
        </Link>
      </div>
      <div style={{ padding: "0 1.25rem", marginTop: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--terracotta)", marginBottom: 8 }}>Dernières annonces</p>
        {annonces.length === 0 ? (
          <div className="card" style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 12, borderStyle: "dashed" }}>Aucune annonce disponible.</div>
        ) : annonces.map((a) => (
          <div key={a.id} className="card" style={{ padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {a.tag && <span className="chip chip-default">{a.tag}</span>}
              {a.urgent && <span className="chip chip-terracotta">Urgent</span>}
              <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--muted)" }}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            <p style={{ marginTop: 4, fontWeight: 600, fontSize: 14 }}>{a.titre}</p>
          </div>
        ))}
      </div>
      <div style={{ padding: "1.25rem", marginTop: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--terracotta)", marginBottom: 8 }}>Prochains événements</p>
        {events.length === 0 ? (
          <div className="card" style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 12, borderStyle: "dashed" }}>Aucun événement disponible.</div>
        ) : events.map((e) => (
          <div key={e.id} className="card" style={{ padding: 12, marginBottom: 8, background: "var(--accent)" }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: "var(--accent-fg)" }}>{e.titre}</p>
            {e.date_evt && <p style={{ fontSize: 11, color: "var(--accent-fg)", opacity: 0.8 }}>{new Date(e.date_evt).toLocaleString("fr-FR")}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
