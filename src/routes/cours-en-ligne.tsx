import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cours-en-ligne")({
  component: CoursEnLignePage,
  head: () => ({ meta: [{ title: "Cours en ligne — CampusLink" }] }),
});

function CoursEnLignePage() {
  return (
    <div className="min-h-screen bg-background">
      <KenteBar />
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Logo />
          <Link to="/" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Cours en ligne</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl">Apprenez avec les meilleurs professeurs.</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Accédez à des cours en vidéo proposés par des professeurs qualifiés. Paiement via Orange Money, Moov Money ou carte bancaire.
        </p>

        {/* Two access buttons */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/20 text-2xl">🎓</div>
            <h3 className="mt-4 font-display text-lg font-semibold">Étudiants — Accéder aux cours</h3>
            <p className="mt-2 text-sm text-muted-foreground">Consultez le catalogue des cours disponibles, filtrable par matière et niveau. Achat sécurisé via Mobile Money ou carte bancaire.</p>
            <Link to="/login/etudiant" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Accéder aux cours →
            </Link>
          </div>
          <div className="rounded-3xl border border-border bg-surface p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-terracotta/20 text-2xl">👨‍🏫</div>
            <h3 className="mt-4 font-display text-lg font-semibold">Professeurs — Mon espace cours</h3>
            <p className="mt-2 text-sm text-muted-foreground">Accédez à votre espace pour gérer vos cours en ligne et consulter vos revenus. Uniquement pour les professeurs validés par l'administration.</p>
            <Link to="/login/etudiant" className="mt-4 inline-flex rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-white">
              Accéder à mon espace →
            </Link>
          </div>
        </div>

        <ProfessorApplicationForm />
      </section>
    </div>
  );
}

function ProfessorApplicationForm() {
  const [state, setState] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending"); setErr("");
    const f = new FormData(e.currentTarget);
    const payload = {
      nom_complet: String(f.get("nom_complet") || ""),
      email: String(f.get("email") || ""),
      matiere: String(f.get("matiere") || ""),
      etablissement_origine: String(f.get("etablissement_origine") || ""),
      experience: String(f.get("experience") || ""),
    };
    const { error } = await supabase.from("demandes_professeur").insert(payload);
    if (error) { setState("error"); setErr(error.message); return; }
    setState("sent");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="mt-12 grid gap-8 rounded-3xl border border-border bg-surface p-8 md:grid-cols-[1.1fr_1fr] md:p-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Espace professeur</p>
        <h3 className="mt-2 font-display text-3xl font-bold md:text-4xl">Proposez vos cours en ligne.</h3>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">Vous enseignez à l'université ou dans une école supérieure ? Devenez professeur CampusLink et proposez vos cours en vidéo aux étudiants de tout le pays.</p>
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          <li>✓ Uploadez vos cours en vidéo</li>
          <li>✓ Fixez vos prix par cours</li>
          <li>✓ Touchez des revenus sur chaque vente</li>
          <li>✓ Suivez vos statistiques de vente</li>
        </ul>
      </div>
      <form onSubmit={submit} className="space-y-3 rounded-2xl bg-muted/40 p-6">
        <input name="nom_complet" required placeholder="Nom complet" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        <input name="matiere" required placeholder="Matière enseignée" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        <input name="etablissement_origine" placeholder="Établissement d'origine" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        <textarea name="experience" rows={3} placeholder="Décrivez votre expérience d'enseignement" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        <button disabled={state==="sending"} className="w-full rounded-xl bg-terracotta py-3 text-sm font-semibold text-white disabled:opacity-60">
          {state==="sending" ? "Envoi…" : "Envoyer ma candidature"}
        </button>
        {state==="sent" && <p className="text-xs text-emerald-600">✓ Candidature envoyée. Notre équipe vous recontactera pour valider votre profil.</p>}
        {state==="error" && <p className="text-xs text-red-600">Erreur : {err}</p>}
      </form>
    </div>
  );
}
