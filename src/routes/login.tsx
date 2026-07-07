import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo, KenteBar } from "@/components/campus/ui";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Connexion — CampusLink" }] }),
});

function LoginPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="relative hidden overflow-hidden md:block">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 opacity-30 kente-stripe" style={{ maskImage: "linear-gradient(180deg, transparent, black 20%, black 80%, transparent)" }} />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Logo className="[&_span]:text-primary-foreground [&_.text-primary]:text-gold" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Étudiants & Universités</p>
            <h1 className="mt-3 max-w-md font-display text-4xl font-bold leading-tight">
              Ta scolarité, en un seul endroit.
            </h1>
            <p className="mt-4 max-w-md text-sm opacity-80">
              Consulte tes notes, ne rate aucun événement et reste connecté à ton université — partout, à tout moment.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
            <p className="text-sm italic opacity-90">"CampusLink a changé notre manière de communiquer avec les étudiants. Enfin un outil pensé pour nous."</p>
            <p className="mt-3 text-xs font-semibold text-gold">— Pr. Mamadou Sarr, UCAD</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <KenteBar />
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <div className="md:hidden mb-8"><Logo /></div>
            <h2 className="font-display text-3xl font-bold">Bienvenue 👋</h2>
            <p className="mt-2 text-sm text-muted-foreground">Connecte-toi à ton espace CampusLink.</p>

            <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-xs font-medium text-foreground">Email ou matricule</label>
                <input type="text" defaultValue="UCAD-2024-1187" className="mt-1.5 w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Mot de passe</label>
                  <a href="#" className="text-xs font-medium text-primary hover:underline">Oublié ?</a>
                </div>
                <input type="password" defaultValue="••••••••" className="mt-1.5 w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" />
              </div>
              <Link to="/app" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-95">
                Se connecter
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">ou</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Link to="/admin" className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3 text-sm font-semibold text-foreground hover:bg-muted">
                Accéder à l'espace admin
              </Link>
            </form>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Pas encore de compte ? <a href="#" className="font-semibold text-primary hover:underline">Créer un compte étudiant</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
