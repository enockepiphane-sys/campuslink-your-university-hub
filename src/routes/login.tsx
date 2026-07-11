import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { useAuth, roleHomePath } from "@/lib/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginChoicePage,
  head: () => ({ meta: [{ title: "Connexion — CampusLink" }] }),
});

function LoginChoicePage() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.loading && auth.user && auth.role) {
      navigate({ to: roleHomePath(auth.role) });
    }
  }, [auth.loading, auth.user, auth.role, navigate]);

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="mx-auto max-w-lg px-4 py-10 md:py-16">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
          <h1 className="text-center font-display text-2xl font-bold">Bienvenue sur CampusLink</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">Choisissez votre type de connexion pour continuer.</p>
          <div className="mt-8 space-y-3">
            <Link to="/login/etudiant" className="block w-full rounded-xl bg-primary py-4 text-center text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-95">
              Se connecter au compte étudiant
            </Link>
            <Link to="/login/admin" className="block w-full rounded-xl border border-border bg-background py-4 text-center text-sm font-semibold text-foreground transition hover:bg-muted">
              Accéder au compte professionnel
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">© CampusLink — Plateforme du Burkina Faso</p>
      </div>
    </div>
  );
}
