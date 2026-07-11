import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileTabBar, PhoneFrame, KenteBar } from "@/components/campus/ui";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) navigate({ to: "/login/etudiant" });
    else if (auth.role !== "etudiant") {
      navigate({ to: auth.role === "super_admin" ? "/platform" : auth.role === "admin_etablissement" ? "/admin" : auth.role === "professeur" ? "/professeur" : "/login" });
    }
  }, [auth, navigate]);

  const current: "home" | "grades" | "events" | "announcements" | "profile" =
    pathname.startsWith("/app/grades") ? "grades" :
    pathname.startsWith("/app/events") ? "events" :
    pathname.startsWith("/app/announcements") ? "announcements" :
    pathname.startsWith("/app/profile") ? "profile" : "home";

  if (auth.loading || !auth.user) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Chargement…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="hidden md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Retour au site</Link>
          <span>Espace étudiant · vue mobile</span>
        </div>
      </div>
      <PhoneFrame>
        <KenteBar />
        <div className="flex-1 overflow-y-auto pb-4"><Outlet /></div>
        <MobileTabBar current={current} />
      </PhoneFrame>
    </div>
  );
}
