import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo, KenteBar } from "@/components/campus/ui";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <KenteBar />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Fonctionnalités</a>
          <a href="#universities" className="hover:text-foreground">Universités</a>
          <a href="#roadmap" className="hover:text-foreground">Feuille de route</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/admin" className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-muted md:inline-flex">Espace admin</Link>
          <Link to="/login" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant transition hover:opacity-95">Se connecter</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-10 md:grid-cols-2 md:py-20">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
            Nouveau · Version 1.0 disponible pour les universités partenaires
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            Toute la vie universitaire <span className="text-primary">dans une seule app.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            CampusLink connecte les étudiants africains à leur université. Notes, annonces, événements, scolarité — un seul endroit, du mobile à l'administration.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/app" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant">
              Ouvrir l'app étudiant
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">
              Voir le back-office
            </Link>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
            <div><dt className="text-xs text-muted-foreground">Universités</dt><dd className="mt-1 font-display text-2xl font-bold">12+</dd></div>
            <div><dt className="text-xs text-muted-foreground">Étudiants</dt><dd className="mt-1 font-display text-2xl font-bold">48k</dd></div>
            <div><dt className="text-xs text-muted-foreground">Pays</dt><dd className="mt-1 font-display text-2xl font-bold">6</dd></div>
          </dl>
        </div>

        {/* Phone mockup */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -z-10 mx-auto my-auto h-[420px] w-[420px] rounded-full bg-gradient-to-br from-primary/20 via-gold/20 to-terracotta/20 blur-3xl" />
          <div className="relative w-[300px] rounded-[3rem] border-8 border-foreground/90 bg-background p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35)]">
            <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground/90" />
            <div className="overflow-hidden rounded-[2.2rem] bg-background">
              <div className="h-1.5 kente-stripe" />
              <div className="bg-primary px-5 pb-8 pt-10 text-primary-foreground">
                <p className="text-xs opacity-80">Bonjour,</p>
                <p className="font-display text-xl font-bold">Aminata 👋</p>
                <div className="mt-4 rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <p className="text-[10px] uppercase tracking-widest opacity-70">Moyenne S1</p>
                  <p className="font-display text-3xl font-bold">13.4<span className="text-base opacity-70">/20</span></p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                {["Microéconomie · 14/20","Compta analytique · 15.5","Anglais des affaires · 13"].map((r) => (
                  <div key={r} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-xs">
                    <span className="font-medium">{r}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">Publié</span>
                  </div>
                ))}
                <div className="rounded-xl bg-accent p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta">Événement</p>
                  <p className="text-sm font-semibold text-accent-foreground">Forum Emploi · 28 Jan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Fonctionnalités</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl">Une plateforme pensée pour les universités africaines.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { t: "App étudiant mobile", d: "Notes, annonces, événements, profil. Une expérience fluide sur Android et iOS.", i: "📱" },
            { t: "Back-office web", d: "Gestion des étudiants, import CSV, publication centralisée pour l'administration.", i: "🖥️" },
            { t: "Multi-universités", d: "Chaque université gère son espace, ses filières, ses niveaux et ses utilisateurs.", i: "🎓" },
            { t: "Notes en temps réel", d: "Publication contrôlée par l'admin, visibilité stricte pour chaque étudiant.", i: "📊" },
            { t: "Annonces & événements", d: "Communication officielle, forums, formations, concours — tout est centralisé.", i: "📣" },
            { t: "Évolutif", d: "Paiement des frais, bibliothèque numérique, messagerie et stages — bientôt disponibles.", i: "🚀" },
          ].map((f) => (
            <div key={f.t} className="group rounded-3xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:shadow-card">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-2xl">{f.i}</div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roadmap" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl bg-primary p-8 text-primary-foreground md:p-12">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">Feuille de route</p>
              <h3 className="mt-2 font-display text-3xl font-bold md:text-4xl">Bientôt : paiement, bibliothèque numérique, messagerie & stages.</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Paiement des frais","Bibliothèque","Messagerie","Offres de stages","Emploi du temps"].map((t) => (
                <span key={t} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <Logo />
          <p>© 2025 CampusLink — Une plateforme panafricaine.</p>
        </div>
      </footer>
    </div>
  );
}
