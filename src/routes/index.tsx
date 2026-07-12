import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({ meta: [
    { title: "CampusLink — La plateforme universitaire multi-établissements" },
    { name: "description", content: "CampusLink connecte les universités et leurs étudiants. Notes, annonces, événements et gestion administrative en un seul endroit." },
    { property: "og:title", content: "CampusLink — La plateforme universitaire multi-établissements" },
    { property: "og:description", content: "CampusLink connecte les universités et leurs étudiants." },
  ]}),
});

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <KenteBar />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground hover:bg-muted"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-sm bg-surface p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setMenuOpen(false)} aria-label="Fermer" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/></svg>
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-2">
              {[
                { to: "/features", label: "Fonctionnalités" },
                { to: "/partenariat", label: "Devenir partenaire" },
                { to: "/confidentialite", label: "Politique de confidentialité" },
              ].map((it) => (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background px-5 py-4 text-base font-medium text-foreground hover:bg-muted"
                >
                  {it.label}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-10 md:grid-cols-2 md:py-20">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
            Plateforme SaaS multi-établissements
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            Toute la vie universitaire <span className="text-primary">dans une seule app.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            CampusLink connecte les universités africaines et leurs étudiants. Notes, annonces, événements, scolarité — un espace numérique complet pour chaque établissement partenaire.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Bloc Étudiant */}
          <div className="rounded-3xl border-2 border-primary/30 bg-primary-soft p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M3 10l9-5 9 5-9 5-9-5z"/><path d="M7 12v4c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-4"/></svg>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Espace Étudiant</h2>
                <p className="text-xs text-muted-foreground">Accédez à votre vie universitaire</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2.5">
              <Link to="/register" className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-95">
                S'inscrire au compte étudiant
              </Link>
              <Link to="/login" search={{ role: "etudiant" }} className="inline-flex items-center justify-center rounded-xl border border-primary bg-background px-5 py-3 text-sm font-semibold text-primary hover:bg-primary-soft/60">
                Se connecter au compte étudiant
              </Link>
            </div>
          </div>

          {/* Bloc Administrateur */}
          <div className="rounded-3xl border-2 border-terracotta/40 bg-accent/40 p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-terracotta text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Espace Administrateur</h2>
                <p className="text-xs text-muted-foreground">Gestion de l'établissement</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2.5">
              <Link to="/login" search={{ mode: "signup", role: "admin_etablissement" }} className="inline-flex items-center justify-center rounded-xl bg-terracotta px-5 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95">
                S'inscrire à mon compte administrateur
              </Link>
              <Link to="/login" search={{ role: "admin_etablissement" }} className="inline-flex items-center justify-center rounded-xl border border-terracotta bg-background px-5 py-3 text-sm font-semibold text-terracotta hover:bg-accent/60">
                Se connecter à mon compte administrateur
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PartnershipSection />


      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <Logo />
          <p>© 2026 CampusLink — Une plateforme panafricaine.</p>
        </div>
      </footer>
    </div>
  );
}
