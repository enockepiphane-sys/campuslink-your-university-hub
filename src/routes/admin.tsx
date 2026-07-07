import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Logo, Avatar, KenteBar } from "@/components/campus/ui";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = [
    { l: "Vue d'ensemble", to: "/admin", exact: true, i: "🏠" },
    { l: "Étudiants", to: "/admin/students", i: "🎓" },
    { l: "Annonces", to: "/admin/announcements", i: "📣" },
    { l: "Événements", to: "/admin/events", i: "📅" },
    { l: "Notes", to: "/admin/grades", i: "📊" },
  ];
  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="grid min-h-[calc(100vh-6px)] grid-cols-[260px_1fr]">
        <aside className="flex flex-col border-r border-border bg-surface">
          <div className="p-5"><Logo /></div>
          <div className="mx-4 rounded-xl bg-primary-soft p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Université</p>
            <p className="mt-1 text-sm font-semibold text-foreground">Cheikh Anta Diop</p>
            <p className="text-[11px] text-muted-foreground">Dakar · Sénégal</p>
          </div>
          <nav className="mt-4 flex-1 space-y-0.5 px-3">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground shadow-elegant" : "text-foreground hover:bg-muted"}`}>
                  <span className="text-base">{n.i}</span>{n.l}
                </Link>
              );
            })}
          </nav>
          <div className="m-3 rounded-2xl border border-border bg-background p-4">
            <p className="font-display text-sm font-semibold">Besoin d'aide ?</p>
            <p className="mt-1 text-xs text-muted-foreground">Consultez le guide d'administration CampusLink.</p>
            <button className="mt-3 w-full rounded-lg bg-foreground py-2 text-xs font-semibold text-background">Ouvrir la doc</button>
          </div>
          <div className="flex items-center gap-3 border-t border-border p-4">
            <Avatar initials="MS" className="h-9 w-9 bg-gold text-gold-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Pr. Mamadou Sarr</p>
              <p className="truncate text-[11px] text-muted-foreground">Directeur des études</p>
            </div>
          </div>
        </aside>

        <main className="flex flex-col">
          <header className="flex items-center gap-4 border-b border-border bg-surface px-8 py-4">
            <div className="relative flex-1 max-w-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
              <input placeholder="Rechercher un étudiant, une annonce…" className="w-full rounded-full border border-input bg-background py-2.5 pl-9 pr-4 text-sm outline-none ring-primary/20 focus:ring-4" />
            </div>
            <button className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted">Année 2024–2025</button>
            <Link to="/app" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Voir l'app étudiant</Link>
          </header>
          <div className="flex-1 overflow-y-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
