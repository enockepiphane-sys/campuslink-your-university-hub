import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Chip } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/platform/cours")({
  component: CoursAdminPage,
  head: () => ({ meta: [{ title: "Cours en ligne — Console CampusLink" }] }),
});

type Cours = { id: string; titre: string; description: string | null; matiere: string; niveau: string | null; prix: number; statut: string; video_url: string | null; professeur_id: string; created_at: string };

function CoursAdminPage() {
  const [rows, setRows] = useState<Cours[]>([]);

  async function refresh() {
    const { data } = await supabase.from("cours_en_ligne").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  }

  useEffect(() => { refresh(); }, []);

  async function setStatut(id: string, statut: string) {
    await supabase.from("cours_en_ligne").update({ statut }).eq("id", id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Modération</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Cours en ligne</h1>
        <p className="mt-1 text-sm text-muted-foreground">Validez ou rejetez les cours proposés par les professeurs.</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Aucun cours pour le moment.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-terracotta">{c.matiere}</p>
                  <h2 className="mt-1 font-display text-lg font-semibold">{c.titre}</h2>
                  {c.niveau && <p className="text-xs text-muted-foreground">Niveau : {c.niveau}</p>}
                  {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
                  {c.video_url && <a href={c.video_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-primary underline">Voir la vidéo</a>}
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold">{Number(c.prix).toLocaleString()} FCFA</p>
                  <Chip tone={c.statut === "publie" ? "success" : c.statut === "rejete" ? "terracotta" : "muted"}>
                    {c.statut === "publie" ? "Publié" : c.statut === "rejete" ? "Rejeté" : "En attente"}
                  </Chip>
                </div>
              </div>
              {c.statut === "en_attente" && (
                <div className="mt-4 flex gap-2 text-xs">
                  <button onClick={() => setStatut(c.id, "publie")} className="rounded-md bg-primary px-4 py-1.5 font-semibold text-primary-foreground">Publier</button>
                  <button onClick={() => setStatut(c.id, "rejete")} className="rounded-md border border-border px-4 py-1.5">Rejeter</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
