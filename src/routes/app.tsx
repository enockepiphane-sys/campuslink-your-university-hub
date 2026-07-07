import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { MobileTabBar, PhoneFrame, KenteBar } from "@/components/campus/ui";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current: "home" | "grades" | "events" | "announcements" | "profile" =
    pathname.startsWith("/app/grades") ? "grades" :
    pathname.startsWith("/app/events") ? "events" :
    pathname.startsWith("/app/announcements") ? "announcements" :
    pathname.startsWith("/app/profile") ? "profile" : "home";

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Preview strip */}
      <div className="hidden md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Retour au site</Link>
          <span>Prototype de l'application étudiant · vue mobile</span>
          <Link to="/admin" className="rounded-full bg-primary px-3 py-1.5 text-primary-foreground">Voir le back-office</Link>
        </div>
      </div>
      <PhoneFrame>
        <KenteBar />
        <div className="flex-1 overflow-y-auto pb-4">
          <Outlet />
        </div>
        <MobileTabBar current={current} />
      </PhoneFrame>
    </div>
  );
}
