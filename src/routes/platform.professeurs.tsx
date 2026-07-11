import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Chip } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { createProfessor } from "@/lib/unified-auth.functions";

export const Route = createFileRoute("/platform/professeurs")({
  component: ProfesseursPage,
  head: () => ({ meta: [{ title: "Professeurs — Console CampusLink" }] }),
});

type D = { id: string; nom_complet: string; email: string; matiere: string; etablissement_origine: string | null; experience: string | null; statut: string; created_at: string };

function ProfesseursPage() {
  const [rows, setRows] = useState<D[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function refresh() {
    const { data } = await supabase.from("demandes_professeur").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  }

  useEffect(() => { refresh(); }, []);

  async function accept(d: D) {
    setBusy(d.id);
    setMsg("");
    try {
      await createProfessor({ data: { email: d.email, nom_complet: d.nom_complet, date_naissance: "1990-01-01", matiere: d.matiere } });
      await supabase.from("demandes_professeur").update({ statut: "accepte" }).eq("id", d.id);
      setMsg(`✓ ${d.nom_complet} accepté. Un email d'invitation a été envoyé.`);
      refresh();
    } catch (e: unknown) {
      setMsg("Erreur : " + (e instanceof Error ? e.message : "inconnue"));
    }
    setBusy(null);
  }

  async function reject(id: string) {
    await supabase.from("demandes_professeur").update({ statut: "rejete" }).eq("id", id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Espace professeur</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Candidatures professeurs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Validez les candidatures pour permettre aux professeurs de publier leurs cours.</p>
      </div>

      {msg && <div className="rounded-xl bg-primary-soft p-3 text-sm text-primary">{msg}</div>}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Aucune candidature pour le moment.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg font-semibold">{d.nom_complet}</p>
                  <p className="text-xs text-muted-foreground">{d.email}</p>
                  <p className="mt-1 text-sm font-medium text-terracotta">{d.matiere}</p>
                  {d.etablissement_origine && <p className="text-xs text-muted-foreground">🏫 {d.etablissement_origine}</p>}
                </div>
                <Chip tone={d.statut === "accepte" ? "success" : d.statut === "rejete" ? "terracotta" : "muted"}>
                  {d.statut}
                </Chip>
              </div>
              {d.experience && <p className="mt-3 text-sm text-muted-foreground">{d.experience}</p>}
              {d.statut === "nouveau" && (
                <div className="mt-4 flex gap-2 text-xs">
                  <button onClick={() => accept(d)} disabled={busy === d.id} className="rounded-md bg-primary px-4 py-1.5 font-semibold text-primary-foreground disabled:opacity-50">
                    {busy === d.id ? "Traitement…" : "Accepter"}
                  </button>
                  <button onClick={() => reject(d.id)} className="rounded-md border border-border px-4 py-1.5">Refuser</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
