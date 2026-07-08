import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profil — CampusLink" }] }),
});

type Info = { nom_complet:string|null; email:string|null; matricule:string|null; date_naissance:string|null; etablissement:string|null; filiere:string|null; niveau:string|null };

function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [info, setInfo] = useState<Info|null>(null);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: e } = await supabase.from("etudiants").select("nom_complet,email,matricule,date_naissance,etablissement_id,filiere_id,niveau_id").eq("user_id", auth.user!.id).maybeSingle();
      if (!e) { setInfo({ nom_complet: auth.user?.user_metadata?.nom_complet ?? null, email: auth.user?.email ?? null, matricule: null, date_naissance: null, etablissement:null, filiere:null, niveau:null }); return; }
      const [et, f, n] = await Promise.all([
        e.etablissement_id ? supabase.from("etablissements").select("nom").eq("id", e.etablissement_id).maybeSingle() : Promise.resolve({ data: null }),
        e.filiere_id ? supabase.from("filieres").select("nom").eq("id", e.filiere_id).maybeSingle() : Promise.resolve({ data: null }),
        e.niveau_id ? supabase.from("niveaux").select("nom").eq("id", e.niveau_id).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      setInfo({
        nom_complet: e.nom_complet, email: e.email, matricule: e.matricule, date_naissance: e.date_naissance,
        etablissement: et.data?.nom ?? null, filiere: f.data?.nom ?? null, niveau: n.data?.nom ?? null,
      });
    })();
  }, [auth.user]);

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  const initials = (info?.nom_complet ?? "?").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase();

  return (
    <div className="pb-6">
      <header className="bg-primary px-5 pt-6 pb-10 text-primary-foreground text-center">
        <Avatar initials={initials} className="mx-auto h-20 w-20 bg-gold text-gold-foreground text-2xl" />
        <h1 className="mt-3 font-display text-xl font-bold">{info?.nom_complet ?? "—"}</h1>
        <p className="text-xs opacity-80">{info?.email ?? "—"}</p>
      </header>

      <section className="mt-4 space-y-2 px-5">
        {[
          ["Établissement", info?.etablissement],
          ["Filière", info?.filiere],
          ["Niveau", info?.niveau],
          ["Matricule", info?.matricule],
          ["Date de naissance", info?.date_naissance],
        ].map(([l, v]) => (
          <div key={l as string} className="flex items-center justify-between rounded-xl bg-surface p-3 shadow-card">
            <span className="text-xs text-muted-foreground">{l}</span>
            <span className="text-sm font-semibold">{v ?? "—"}</span>
          </div>
        ))}

        <button onClick={logout} className="mt-6 w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700">Se déconnecter</button>
      </section>
    </div>
  );
}
