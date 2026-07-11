import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/professeur/revenus")({
  component: RevenusPage,
  head: () => ({ meta: [{ title: "Mes revenus — Professeur CampusLink" }] }),
});

type Achat = { id: string; montant: number; methode_paiement: string | null; statut: string; created_at: string; cours_id: string };
type Cours = { id: string; titre: string };

function RevenusPage() {
  const auth = useAuth();
  const [achats, setAchats] = useState<Achat[]>([]);
  const [cours, setCours] = useState<Map<string, string>>(new Map());
  const [commission, setCommission] = useState(20);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: c } = await supabase.from("cours_en_ligne").select("id,titre").eq("professeur_id", auth.user!.id);
      const cMap = new Map<string, string>();
      (c ?? []).forEach((x: Cours) => cMap.set(x.id, x.titre));
      setCours(cMap);

      const { data: a } = await supabase.from("cours_achats").select("*").order("created_at", { ascending: false });
      // Filter to only purchases of this professor's courses
      const filtered = (a ?? []).filter((x: Achat) => cMap.has(x.cours_id));
      setAchats(filtered);

      const { data: p } = await supabase.from("parametres_plateforme").select("commission_percentage").limit(1).maybeSingle();
      if (p?.commission_percentage) setCommission(Number(p.commission_percentage));
    })();
  }, [auth.user]);

  const total = achats.filter(a => a.statut === "paye").reduce((sum, a) => sum + Number(a.montant), 0);
  const revenuProf = total * (1 - commission / 100);
  const revenuPlateforme = total * (commission / 100);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Revenus</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Mes revenus</h1>
        <p className="mt-1 text-sm text-muted-foreground">Commission plateforme : {commission}%. Votre part : {100 - commission}%.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted-foreground">Revenu total (ventes payées)</p>
          <p className="mt-2 font-display text-2xl font-bold">{total.toLocaleString()} FCFA</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted-foreground">Votre part ({100 - commission}%)</p>
          <p className="mt-2 font-display text-2xl font-bold text-primary">{revenuProf.toLocaleString()} FCFA</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted-foreground">Part plateforme ({commission}%)</p>
          <p className="mt-2 font-display text-2xl font-bold text-muted-foreground">{revenuPlateforme.toLocaleString()} FCFA</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <p className="border-b border-border p-4 font-display text-sm font-semibold">Historique des ventes</p>
        {achats.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Aucune vente pour le moment.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Cours</th>
                <th className="px-4 py-3 text-left">Montant</th>
                <th className="px-4 py-3 text-left">Paiement</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {achats.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-semibold">{cours.get(a.cours_id) ?? "—"}</td>
                  <td className="px-4 py-3">{Number(a.montant).toLocaleString()} FCFA</td>
                  <td className="px-4 py-3 text-xs">{a.methode_paiement ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.statut === "paye" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                      {a.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
