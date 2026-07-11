import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cours-en-ligne")({
  component: CoursEnLignePage,
  head: () => ({ meta: [{ title: "Cours en ligne — CampusLink" }] }),
});

function CoursEnLignePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <KenteBar />
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground md:flex">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Retour
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu Cours en ligne"
              className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface"
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-surface">
            <nav className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Cours en ligne</p>
              <Link to="/login/etudiant" onClick={() => setMenuOpen(false)} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
                🎓 Étudiants — Accéder aux cours en ligne
              </Link>
              <Link to="/professeur" onClick={() => setMenuOpen(false)} className="rounded-xl bg-terracotta px-4 py-3 text-sm font-semibold text-white">
                👨‍🏫 Professeurs — Accéder à mon espace cours
              </Link>
              <a href="#espace-professeur" onClick={() => setMenuOpen(false)} className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground">
                ✍️ Devenir professeur CampusLink
              </a>
              <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-xl border border-border px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                ← Retour à l'accueil
              </Link>
            </nav>
          </div>
        )}
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Cours en ligne</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl">Apprenez avec les meilleurs professeurs.</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Accédez à des cours en vidéo proposés par des professeurs qualifiés. Paiement via Orange Money, Moov Money ou carte bancaire.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          Utilisez le menu ☰ en haut à droite pour accéder à l'espace étudiant ou à l'espace professeur.
        </p>

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
