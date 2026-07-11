import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo, KenteBar } from "@/components/campus/ui";

export const Route = createFileRoute("/politique-confidentialite")({
  component: PolitiqueConfidentialitePage,
  head: () => ({ meta: [{ title: "Politique de confidentialité — CampusLink" }] }),
});

function PolitiqueConfidentialitePage() {
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
        <div className="rounded-3xl border border-border bg-surface p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Confidentialité</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Politique de confidentialité</h1>
          <div className="mt-6 space-y-4 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Collecte des données.</strong> CampusLink collecte les informations nécessaires au fonctionnement du service : nom, email, date de naissance, établissement, filière et niveau. Ces données sont fournies par votre établissement ou par vous-même lors de l'inscription.</p>
            <p><strong className="text-foreground">Utilisation.</strong> Vos données sont utilisées uniquement pour vous identifier, afficher vos informations académiques (notes, annonces, événements) et vous permettre d'accéder aux services CampusLink.</p>
            <p><strong className="text-foreground">Sécurité.</strong> Chaque établissement dispose d'un espace isolé. Les données d'un établissement ne sont jamais visibles par un autre. L'accès est contrôlé par des politiques de sécurité au niveau de la base de données (RLS).</p>
            <p><strong className="text-foreground">Paiements.</strong> Les paiements pour les cours en ligne sont traités par des tiers (Orange Money, Moov Money, stripe). CampusLink ne stocke pas vos informations de carte bancaire.</p>
            <p><strong className="text-foreground">Vos droits.</strong> Vous pouvez demander l'accès, la modification ou la suppression de vos données à tout moment en contactant votre établissement ou l'équipe CampusLink.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
