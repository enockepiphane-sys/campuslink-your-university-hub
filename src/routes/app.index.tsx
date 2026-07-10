import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Chip, Avatar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/app/")({
  component: Home,
  head: () => ({ meta: [{ title: "Accueil — CampusLink" }] }),
});

type Etudiant = { nom_complet: string; etablissement_id: string; filiere_id: string | null; niveau_id: string | null };
type Etab = { nom: string };
type A = { id: string; titre: string; contenu: string; tag: string | null; urgent: boolean | null; created_at: string };
type Ev = { id: string; titre: string; date_evt: string | null; lieu: string | null };

function Home() {
  const auth = useAuth();
  const [etu, setEtu] = useState<Etudiant | null>(null);
  const [etab, setEtab] = useState<Etab | null>(null);
  const [annonces, setAnn] = useState<A[]>([]);
  const [events, setEv] = useState<Ev[]>([]);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: e } = await supabase.from("etudiants").select("nom_complet,etablissement_id,filiere_id,niveau_id").eq("user_id", auth.user!.id).maybeSingle();
      setEtu(e);
      if (e?.etablissement_id) {
        const { data: et } = await supabase.from("etablissements").select("nom").eq("id", e.etablissement_id).maybeSingle();
        setEtab(et);
        // Annonces: niveau + établissement-wide
        const { data: a } = await supabase.from("annonces")
          .select("id,titre,contenu,tag,urgent,created_at")
          .eq("etablissement_id", e.etablissement_id)
          .or(`and(filiere_id.eq.${e.filiere_id},niveau_id.eq.${e.niveau_id}),and(filiere_id.is.null,niveau_id.is.null)`)
          .order("created_at", { ascending: false })
          .limit(3);
        setAnn(a ?? []);
        // Événements: établissement-wide
        const { data: ev } = await supabase.from("evenements").select("id,titre,date_evt,lieu").eq("etablissement_id", e.etablissement_id).order("date_evt").limit(3);
        setEv(ev ?? []);
      }
    })();
  }, [auth.user]);

  const name = etu?.nom_complet ?? auth.user?.user_metadata?.nom_complet ?? "Étudiant";
  const initials = name.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="pb-2">
      <header className="bg-primary px-5 pt-6 pb-8 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">Bonjour,</p>
            <p className="font-display text-xl font-bold">{name} 👋</p>
            {etab && <p className="text-[11px] opacity-80">{etab.nom}</p>}
          </div>
          <Avatar initials={initials} className="h-11 w-11 bg-gold text-gold-foreground" />
        </div>
      </header>

      <section className="px-5 -mt-6">
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { l: "Annonces", v: annonces.length, i: "📣" },
              { l: "Événements", v: events.length, i: "📅" },
              { l: "Notes", v: "—", i: "📊" },
            ].map((s) => (
              <div key={s.l}><div className="text-lg">{s.i}</div><div className="font-display text-lg font-bold">{s.v}</div><div className="text-[10px] text-muted-foreground">{s.l}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-terracotta">Accès rapide</p>
        <Link to="/app/emploi" className="block rounded-xl bg-surface p-3 shadow-card transition hover:shadow-elegant">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-lg">📅</span>
            <div><p className="text-sm font-semibold">Emploi du temps</p><p className="text-[11px] text-muted-foreground">Vos cours cette semaine</p></div>
            <span className="ml-auto text-muted-foreground">→</span>
          </div>
        </Link>
      </section>

      <section className="px-5 mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-terracotta">Dernières annonces</p>
        {annonces.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Aucune annonce disponible.</p>
        ) : annonces.map((a) => (
          <div key={a.id} className="mb-2 rounded-xl bg-surface p-3 shadow-card">
            <div className="flex items-center gap-2">
              {a.tag && <Chip tone={a.urgent ? "terracotta" : "default"}>{a.tag}</Chip>}
              <span className="ml-auto text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            <p className="mt-1 text-sm font-semibold">{a.titre}</p>
          </div>
        ))}
      </section>

      <section className="px-5 mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-terracotta">Prochains événements</p>
        {events.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Aucun événement disponible.</p>
        ) : events.map((e) => (
          <div key={e.id} className="mb-2 rounded-xl bg-accent p-3">
            <p className="text-sm font-semibold text-accent-foreground">{e.titre}</p>
            {e.date_evt && <p className="text-[11px] text-accent-foreground/80">{new Date(e.date_evt).toLocaleString("fr-FR")}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
