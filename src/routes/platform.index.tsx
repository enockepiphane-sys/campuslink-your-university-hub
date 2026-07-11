import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/platform/")({
  component: PlatformHome,
  head: () => ({ meta: [{ title: "Console — CampusLink" }] }),
});

function PlatformHome() {
  const [s, setS] = useState({ etabs:0, admins:0, etudiants:0, demandes:0, profs:0, cours:0 });
  useEffect(() => { (async () => {
    const [a,b,c,d,e,f] = await Promise.all([
      supabase.from("etablissements").select("*",{count:"exact",head:true}),
      supabase.from("user_roles").select("*",{count:"exact",head:true}).eq("role","admin_etablissement"),
      supabase.from("etudiants").select("*",{count:"exact",head:true}),
      supabase.from("demandes_partenariat").select("*",{count:"exact",head:true}).eq("statut","nouveau"),
      supabase.from("demandes_professeur").select("*",{count:"exact",head:true}).eq("statut","nouveau"),
      supabase.from("cours_en_ligne").select("*",{count:"exact",head:true}),
    ]);
    setS({ etabs:a.count??0, admins:b.count??0, etudiants:c.count??0, demandes:d.count??0, profs:e.count??0, cours:f.count??0 });
  })(); }, []);
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Console CampusLink</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Vue d'ensemble de la plateforme</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          { l:"Établissements", v:s.etabs, i:"🏛️" },
          { l:"Administrateurs", v:s.admins, i:"👤" },
          { l:"Étudiants", v:s.etudiants, i:"🎓" },
          { l:"Demandes part.", v:s.demandes, i:"✉️" },
          { l:"Cand. professeurs", v:s.profs, i:"👨‍🏫" },
          { l:"Cours en ligne", v:s.cours, i:"🎥" },
        ].map(k => (
          <div key={k.l} className="rounded-2xl border border-border bg-surface p-5">
            <div className="text-2xl">{k.i}</div>
            <p className="mt-3 font-display text-3xl font-bold">{k.v}</p>
            <p className="text-xs text-muted-foreground">{k.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
