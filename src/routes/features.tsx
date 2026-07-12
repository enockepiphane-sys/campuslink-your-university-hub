import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo, KenteBar } from "@/components/campus/ui";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({ meta: [
    { title: "Fonctionnalités — CampusLink" },
    { name: "description", content: "Découvrez les fonctionnalités de CampusLink : multi-établissements, app étudiante, back-office, vérification d'identité, notes et bien plus." },
    { property: "og:title", content: "Fonctionnalités — CampusLink" },
    { property: "og:description", content: "Toutes les fonctionnalités de la plateforme universitaire CampusLink." },
  ]}),
});

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <KenteBar />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Retour
        </Link>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Fonctionnalités</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-5xl">Une plateforme pensée pour les universités africaines.</h1>
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
    </div>
  );
}
