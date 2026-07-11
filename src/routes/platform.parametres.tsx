import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/platform/parametres")({
  component: ParametresPage,
  head: () => ({ meta: [{ title: "Paramètres — Console CampusLink" }] }),
});

function ParametresPage() {
  const [commission, setCommission] = useState(20);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.from("parametres_plateforme").select("commission_percentage").limit(1).maybeSingle().then(({ data }) => {
      if (data?.commission_percentage) setCommission(Number(data.commission_percentage));
    });
  }, []);

  async function save() {
    setBusy(true);
    setMsg("");
    const { data: existing } = await supabase.from("parametres_plateforme").select("id").limit(1).maybeSingle();
    if (existing?.id) {
      const { error } = await supabase.from("parametres_plateforme").update({ commission_percentage: commission }).eq("id", existing.id);
      if (error) setMsg("Erreur : " + error.message);
      else setMsg("✓ Paramètres enregistrés.");
    } else {
      const { error } = await supabase.from("parametres_plateforme").insert({ commission_percentage: commission });
      if (error) setMsg("Erreur : " + error.message);
      else setMsg("✓ Paramètres enregistrés.");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Configuration</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Paramètres de la plateforme</h1>
      </div>

      <div className="max-w-lg space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <label className="text-sm font-medium">Commission plateforme (%)</label>
          <p className="mt-1 text-xs text-muted-foreground">Pourcentage prélevé par CampusLink sur chaque vente de cours en ligne. Le reste revient au professeur.</p>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={commission}
            onChange={(e) => setCommission(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
          />
        </div>
        <button onClick={save} disabled={busy} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
        {msg && <p className="text-xs">{msg}</p>}
      </div>
    </div>
  );
}
