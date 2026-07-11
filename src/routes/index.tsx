import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, KenteBar, BurkinaFlag } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({ meta: [
    { title: "CampusLink — La plateforme universitaire multi-établissements" },
    { name: "description", content: "CampusLink connecte les universités et leurs étudiants. Notes, annonces, événements et gestion administrative en un seul endroit." },
    { property: "og:title", content: "CampusLink — La plateforme universitaire multi-établissements" },
    { property: "og:description", content: "CampusLink connecte les universités et leurs étudiants. Notes, annonces, événements et gestion administrative en un seul endroit." },
  ]}),
});

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Fonctionnalités", to: "/fonctionnalites" },
    { label: "Cours en ligne", to: "/cours-en-ligne" },
    { label: "Politique de confidentialité", to: "/politique-confidentialite" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <KenteBar />

      {/* Fixed navigation bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Logo />
            <BurkinaFlag />
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-foreground transition-colors">{l.label}</Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link to="/login" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant transition hover:opacity-95">Se connecter</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface lg:hidden"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-border bg-surface lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-3">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

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
            CampusLink connecte les universités burkinabè et leurs étudiants. Notes, annonces, événements, scolarité — un espace numérique complet pour chaque établissement partenaire.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant">
              Accéder à mon espace
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
            <a href="#partenariat" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">
              Devenir université partenaire
            </a>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -z-10 mx-auto my-auto h-[420px] w-[420px] rounded-full bg-gradient-to-br from-primary/20 via-gold/20 to-terracotta/20 blur-3xl" />
          <div className="relative w-[300px] rounded-[3rem] border-8 border-foreground/90 bg-background p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35)]">
            <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground/90" />
            <div className="overflow-hidden rounded-[2.2rem] bg-background">
              <div className="h-1.5 kente-stripe" />
              <div className="bg-primary px-5 pb-8 pt-10 text-primary-foreground">
                <p className="text-xs opacity-80">Bienvenue sur</p>
                <p className="font-display text-xl font-bold">CampusLink</p>
                <div className="mt-4 rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <p className="text-[10px] uppercase tracking-widest opacity-70">Votre espace</p>
                  <p className="font-display text-lg font-bold">Notes · Annonces · Événements</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                {["📊 Notes en temps réel","📣 Annonces officielles","📅 Événements du campus"].map((r) => (
                  <div key={r} className="rounded-xl border border-border bg-surface p-3 text-xs font-medium">{r}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PartnershipSection />
      <ProfessorSection />

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <Logo />
          <p>© 2026 CampusLink — La plateforme universitaire du Burkina Faso.</p>
        </div>
      </footer>
    </div>
  );
}

function PartnershipSection() {
  const [state, setState] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending"); setErr("");
    const f = new FormData(e.currentTarget);
    const payload = {
      nom_etablissement: String(f.get("nom_etablissement") || ""),
      responsable: String(f.get("responsable") || ""),
      email: String(f.get("email") || ""),
      telephone: String(f.get("telephone") || ""),
      message: String(f.get("message") || ""),
    };
    const { error } = await supabase.from("demandes_partenariat").insert(payload);
    if (error) { setState("error"); setErr(error.message); return; }
    setState("sent");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <section id="partenariat" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="grid gap-8 rounded-3xl bg-primary p-8 text-primary-foreground md:grid-cols-[1.1fr_1fr] md:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Devenir partenaire</p>
          <h3 className="mt-2 font-display text-3xl font-bold md:text-4xl">Rejoignez CampusLink.</h3>
          <p className="mt-4 max-w-md text-sm opacity-90">Universités, écoles supérieures, instituts : dites-nous quelques mots sur votre établissement. Notre équipe vous recontacte pour ouvrir votre espace CampusLink.</p>
          <ul className="mt-6 space-y-2 text-sm opacity-90">
            <li>✓ Espace administrateur dédié</li>
            <li>✓ Import de vos étudiants (CSV / Excel)</li>
            <li>✓ Notes, annonces, événements en un clic</li>
            <li>✓ Application mobile pour chaque étudiant</li>
          </ul>
        </div>
        <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white/8 p-6 backdrop-blur">
          <input name="nom_etablissement" required placeholder="Nom de l'établissement" className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-gold/40 focus:ring-2 placeholder:text-white/60" />
          <input name="responsable" required placeholder="Nom du responsable" className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-gold/40 focus:ring-2 placeholder:text-white/60" />
          <input name="email" type="email" required placeholder="Email professionnel" className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-gold/40 focus:ring-2 placeholder:text-white/60" />
          <input name="telephone" placeholder="Téléphone" className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-gold/40 focus:ring-2 placeholder:text-white/60" />
          <textarea name="message" rows={3} placeholder="Message" className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-gold/40 focus:ring-2 placeholder:text-white/60" />
          <button disabled={state==="sending"} className="w-full rounded-xl bg-gold py-3 text-sm font-semibold text-gold-foreground disabled:opacity-60">
            {state==="sending" ? "Envoi…" : "Envoyer ma demande"}
          </button>
          {state==="sent" && <p className="text-xs text-emerald-200">✓ Demande envoyée. Nous vous recontactons rapidement.</p>}
          {state==="error" && <p className="text-xs text-red-200">Erreur : {err}</p>}
        </form>
      </div>
    </section>
  );
}

function ProfessorSection() {
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
    <section id="candidature-professeur" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="grid gap-8 rounded-3xl border border-border bg-surface p-8 md:grid-cols-[1.1fr_1fr] md:p-12">
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
    </section>
  );
}


