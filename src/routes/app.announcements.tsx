import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Chip } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/app/announcements")({
  component: Page,
  head: () => ({ meta: [{ title: "Annonces — CampusLink" }] }),
});

type A = { id: string; titre: string; contenu: string; tag: string | null; urgent: boolean | null; auteur: string | null; created_at: string };

function Page() {
  const auth = useAuth();
  const [rows, setRows] = useState<A[]>([]);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: e } = await supabase.from("etudiants").select("etablissement_id,filiere_id,niveau_id").eq("user_id", auth.user!.id).maybeSingle();
      if (!e?.etablissement_id) return;
      // Annonces du niveau (filiere+niveau) + annonces établissement-wide (filiere_id IS NULL AND niveau_id IS NULL)
      const { data } = await supabase.from("annonces")
        .select("*")
        .eq("etablissement_id", e.etablissement_id)
        .or(`and(filiere_id.eq.${e.filiere_id},niveau_id.eq.${e.niveau_id}),and(filiere_id.is.null,niveau_id.is.null)`)
        .order("created_at", { ascending: false });
      setRows(data ?? []);
    })();
  }, [auth.user]);

  return (
    <div className="pb-4">
      <header className="bg-primary px-5 pt-6 pb-6 text-primary-foreground">
        <p className="text-xs opacity-80">Communications officielles</p>
        <h1 className="font-display text-2xl font-bold">Annonces</h1>
      </header>
      <section className="mt-4 space-y-3 px-5">
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Aucune annonce disponible.</p>
        ) : rows.map((a) => (
          <article key={a.id} className="relative overflow-hidden rounded-2xl bg-surface p-4 shadow-card">
            {a.urgent && <span className="absolute left-0 top-0 h-full w-1 bg-terracotta" />}
            <div className="flex items-center gap-2">
              {a.tag && <Chip tone={a.urgent ? "terracotta" : "default"}>{a.tag}</Chip>}
              {a.urgent && <Chip tone="terracotta">Urgent</Chip>}
              <span className="ml-auto text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            <h2 className="mt-2 font-display text-base font-semibold">{a.titre}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{a.contenu}</p>
            {a.auteur && <p className="mt-2 text-[11px] text-muted-foreground">Par {a.auteur}</p>}
          </article>
        ))}
      </section>
    </div>
  );
}
