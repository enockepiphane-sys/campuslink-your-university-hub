import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo, KenteBar } from "@/components/campus/ui";

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
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/20 text-2xl">🎓</div>
            <h3 className="mt-4 font-display text-lg font-semibold">Pour les étudiants</h3>
            <p className="mt-2 text-sm text-muted-foreground">Catalogue de cours filtrable par matière et niveau. Achat sécurisé via Mobile Money ou carte bancaire.</p>
          </div>
          <div className="rounded-3xl border border-border bg-surface p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-terracotta/20 text-2xl">👨‍🏫</div>
            <h3 className="mt-4 font-display text-lg font-semibold">Vous êtes professeur ?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Proposez vos cours en ligne, touchez des revenus sur chaque vente. Notre équipe valide votre profil.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
