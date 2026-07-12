import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo, KenteBar } from "@/components/campus/ui";

export const Route = createFileRoute("/confidentialite")({
  component: PrivacyPage,
  head: () => ({ meta: [
    { title: "Politique de confidentialité — CampusLink" },
    { name: "description", content: "Comment CampusLink collecte, utilise et protège les données des étudiants et des établissements partenaires." },
    { property: "og:title", content: "Politique de confidentialité — CampusLink" },
    { property: "og:description", content: "Notre engagement pour la protection de vos données." },
  ]}),
});

function PrivacyPage() {
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

      <article className="mx-auto max-w-3xl px-6 py-10 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Confidentialité</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-5xl">Politique de confidentialité</h1>
        <p className="mt-3 text-sm text-muted-foreground">Dernière mise à jour : juillet 2026</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">1. Données collectées</h2>
            <p className="mt-2">CampusLink collecte uniquement les données nécessaires au fonctionnement du service : nom, email, date de naissance, établissement, filière, niveau, notes, ainsi que les informations transmises par votre établissement pour vérifier votre identité.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">2. Utilisation des données</h2>
            <p className="mt-2">Vos données servent exclusivement à fournir les services universitaires (consultation des notes, annonces, événements, gestion administrative). Elles ne sont jamais revendues à des tiers.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">3. Cloisonnement multi-établissements</h2>
            <p className="mt-2">Chaque établissement partenaire dispose d'un espace strictement isolé. Aucune donnée n'est partagée entre établissements sans consentement explicite.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">4. Sécurité</h2>
            <p className="mt-2">Les données sont chiffrées en transit (HTTPS) et au repos. L'accès est protégé par des règles de sécurité au niveau des lignes (RLS) et un contrôle d'accès basé sur les rôles.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">5. Vos droits</h2>
            <p className="mt-2">Vous pouvez à tout moment consulter, corriger ou demander la suppression de vos données personnelles en contactant l'administration de votre établissement ou l'équipe CampusLink.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">6. Contact</h2>
            <p className="mt-2">Pour toute question relative à cette politique, écrivez-nous à <a className="text-primary underline" href="mailto:privacy@campuslink.africa">privacy@campuslink.africa</a>.</p>
          </section>
        </div>
      </article>
    </div>
  );
}
