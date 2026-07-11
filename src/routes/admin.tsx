import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, Avatar, KenteBar } from "@/components/campus/ui";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const auth = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) navigate({ to: "/login" });
    else if (auth.role !== "admin_etablissement" && auth.role !== "super_admin") {
      navigate({ to: auth.role === "etudiant" ? "/app" : "/login" });
    }
  }, [auth, navigate]);

  if (auth.loading || !auth.user) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Chargement…</div>;
  }

  const nav = [
    { l: "Vue d'ensemble", to: "/admin", exact: true, i: "🏠" },
    { l: "Étudiants", to: "/admin/students", i: "🎓" },
    { l: "Annonces", to: "/admin/announcements", i: "📣" },
    { l: "Événements", to: "/admin/events", i: "📅" },
    { l: "Notes", to: "/admin/grades", i: "📊" },
  ];

  const initials = (auth.user.user_metadata?.nom_complet || auth.user.email || "?").split(" ").map((s: string)=>s[0]).slice(0,2).join("").toUpperCase();

  const SidebarContent = (
    <>
      <div className="p-5"><Logo /></div>
      <nav className="mt-4 flex-1 space-y-0.5 px-3">
        {nav.map((n) => {
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} onClick={()=>setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground shadow-elegant" : "text-foreground hover:bg-muted"}`}>
              <span className="text-base">{n.i}</span>{n.l}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-3 border-t border-border p-4">
        <Avatar initials={initials} className="h-9 w-9 bg-gold text-gold-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{auth.user.user_metadata?.nom_complet || auth.user.email}</p>
          <p className="truncate text-[11px] text-muted-foreground">Administrateur</p>
        </div>
        <button onClick={()=>{supabase.auth.signOut().then(()=>navigate({to:"/login"}));}} title="Déconnexion" className="text-xs text-muted-foreground hover:text-foreground">↪</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />

      {/* Header mobile */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <button onClick={()=>setOpen(true)} aria-label="Ouvrir le menu" className="grid h-10 w-10 place-items-center rounded-lg border border-border">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
        <Logo />
        <div className="w-10" />
      </header>

      <div className="md:grid md:min-h-[calc(100vh-6px)] md:grid-cols-[260px_1fr]">
        {/* Sidebar desktop */}
        <aside className="hidden flex-col border-r border-border bg-surface md:flex">
          {SidebarContent}
        </aside>

        {/* Drawer mobile */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={()=>setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-xl">
              <div className="flex items-center justify-end px-2 pt-2">
                <button onClick={()=>setOpen(false)} aria-label="Fermer" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted">✕</button>
              </div>
              {SidebarContent}
            </aside>
          </div>
        )}

        <main className="flex flex-col">
          <header className="hidden items-center gap-4 border-b border-border bg-surface px-8 py-4 md:flex">
            <div className="relative flex-1 max-w-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
              <input placeholder="Rechercher…" className="w-full rounded-full border border-input bg-background py-2.5 pl-9 pr-4 text-sm outline-none ring-primary/20 focus:ring-4" />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
