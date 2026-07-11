import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo, KenteBar } from "@/components/campus/ui";

export const Route = createFileRoute("/fonctionnalites")({
  component: FonctionnalitesPage,
  head: () => ({ meta: [{ title: "Fonctionnalités — CampusLink" }] }),
});

function FonctionnalitesPage() {
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
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Fonctionnalités</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl">Une plateforme pensée pour les universités du Burkina Faso.</h1>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { t: "Multi-établissements", d: "Chaque université dispose de son propre espace, ses filières et ses utilisateurs — isolés et sécurisés.", i: "🏛️" },
            { t: "App étudiant mobile", d: "Notes, annonces, événements, profil. Une expérience fluide sur Android et iOS.", i: "📱" },
            { t: "Back-office web", d: "Gestion des étudiants, import CSV/Excel, publication centralisée pour l'administration.", i: "🖥️" },
            { t: "Vérification d'identité", d: "L'étudiant s'inscrit seul, comparé à la liste officielle importée par l'administration.", i: "🔐" },
            { t: "Notes contrôlées", d: "Publication décidée par l'admin, visibilité stricte pour chaque étudiant.", i: "📊" },
            { t: "Cours en ligne", d: "Les professeurs publient des cours en vidéo, les étudiants achètent via Mobile Money ou carte bancaire. Revenus partagés entre professeur et plateforme.", i: "🎥" },
            { t: "Évolutif", d: "Enseignants, emplois du temps, notifications, paiement, bibliothèque — l'architecture est prête.", i: "🚀" },
          ].map((f) => (
            <div key={f.t} className="group rounded-3xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:shadow-card">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-2xl">{f.i}</div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-surface p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Focus — Cours en ligne</p>
          <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">Une marketplace de cours ouverte à tous les étudiants.</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            CampusLink intègre un espace de cours en ligne dédié : les professeurs partagent leurs cours vidéo,
            les étudiants les achètent et les consultent depuis leur téléphone.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-primary-soft p-5">
              <div className="text-2xl">🎓</div>
              <h3 className="mt-2 font-display text-lg font-semibold">Pour les étudiants</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>✓ Catalogue filtrable par matière et niveau</li>
                <li>✓ Paiement Orange Money, Moov Money ou carte</li>
                <li>✓ Lecture vidéo depuis l'app mobile</li>
                <li>✓ Accès à vie aux cours achetés</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-terracotta/10 p-5">
              <div className="text-2xl">👨‍🏫</div>
              <h3 className="mt-2 font-display text-lg font-semibold">Pour les professeurs</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>✓ Espace dédié pour publier vos cours vidéo</li>
                <li>✓ Fixez librement vos prix</li>
                <li>✓ Revenus partagés avec la plateforme</li>
                <li>✓ Accès accordé après validation du super administrateur</li>
              </ul>
            </div>
          </div>
          <Link to="/cours-en-ligne" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            Découvrir les cours en ligne →
          </Link>
        </div>
      </section>
    </div>
  );
}
