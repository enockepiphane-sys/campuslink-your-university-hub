import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Chip } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/professeur/")({
  component: ProfesseurHome,
  head: () => ({ meta: [{ title: "Mes cours — Professeur CampusLink" }] }),
});

type Cours = { id: string; titre: string; description: string | null; matiere: string; niveau: string | null; prix: number; statut: string; created_at: string };

function ProfesseurHome() {
  const auth = useAuth();
  const [rows, setRows] = useState<Cours[]>([]);

  async function refresh() {
    if (!auth.user) return;
    const { data } = await supabase.from("cours_en_ligne")
      .select("*")
      .eq("professeur_id", auth.user!.id)
      .order("created_at", { ascending: false });
    setRows(data ?? []);
  }

  useEffect(() => { refresh(); }, [auth.user]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Espace professeur</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Mes cours en ligne</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gérez vos cours, leurs prix et leur statut de publication.</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Aucun cours créé pour le moment. Cliquez sur « Nouveau cours » pour commencer.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-terracotta">{c.matiere}</p>
                  <h2 className="mt-1 font-display text-lg font-semibold">{c.titre}</h2>
                  {c.niveau && <p className="text-xs text-muted-foreground">Niveau : {c.niveau}</p>}
                </div>
                <Chip tone={c.statut === "publie" ? "success" : c.statut === "rejete" ? "terracotta" : "muted"}>
                  {c.statut === "publie" ? "Publié" : c.statut === "rejete" ? "Rejeté" : "En attente"}
                </Chip>
              </div>
              {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
              <p className="mt-3 font-display text-lg font-bold">{c.prix.toLocaleString()} FCFA</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
