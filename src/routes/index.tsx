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
  return (
    <div className="min-h-screen bg-background">
      <KenteBar />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Logo />
          <BurkinaFlag />
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Fonctionnalités</a>
          <a href="#partenariat" className="hover:text-foreground">Devenir partenaire</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/register" className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-muted md:inline-flex">Créer un compte étudiant</Link>
          <Link to="/login" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant transition hover:opacity-95">Se connecter</Link>
        </div>
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
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant">
              Je suis étudiant · créer mon compte
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

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Fonctionnalités</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl">Une plateforme pensée pour les universités du Burkina Faso.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { t: "Multi-établissements", d: "Chaque université dispose de son propre espace, ses filières et ses utilisateurs — isolés et sécurisés.", i: "🏛️" },
            { t: "App étudiant mobile", d: "Notes, annonces, événements, profil. Une expérience fluide sur Android et iOS.", i: "📱" },
            { t: "Back-office web", d: "Gestion des étudiants, import CSV/Excel, publication centralisée pour l'administration.", i: "🖥️" },
            { t: "Vérification d'identité", d: "L'étudiant s'inscrit seul, comparé à la liste officielle importée par l'administration.", i: "🔐" },
            { t: "Notes contrôlées", d: "Publication décidée par l'admin, visibilité stricte pour chaque étudiant.", i: "📊" },
            { t: "Évolutif", d: "Enseignants, emplois du temps, notifications, paiement, bibliothèque — l'architecture est prête.", i: "🚀" },
          ].map((f) => (
            <div key={f.t} className="group rounded-3xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:shadow-card">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-2xl">{f.i}</div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <PartnershipSection />

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
