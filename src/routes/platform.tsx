import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo, KenteBar, Avatar } from "@/components/campus/ui";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/platform")({ component: PlatformLayout });

function PlatformLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) navigate({ to: "/login" });
    else if (auth.role !== "super_admin") navigate({ to: auth.role === "admin_etablissement" ? "/admin" : "/app" });
  }, [auth, navigate]);

  if (auth.loading || !auth.user) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Chargement…</div>;

  const nav = [
    { l: "Vue d'ensemble", to: "/platform", exact: true, i: "🏠" },
    { l: "Établissements", to: "/platform/etablissements", i: "🏛️" },
    { l: "Administrateurs", to: "/platform/admins", i: "👤" },
    { l: "Demandes partenariat", to: "/platform/partenariats", i: "✉️" },
  ];

  const initials = (auth.user.user_metadata?.nom_complet || auth.user.email || "?").split(" ").map((s: string)=>s[0]).slice(0,2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="grid min-h-[calc(100vh-6px)] grid-cols-[260px_1fr]">
        <aside className="flex flex-col border-r border-border bg-surface">
          <div className="p-5"><Logo /></div>
          <div className="mx-4 rounded-xl bg-gold/20 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-foreground">Super administrateur</p>
            <p className="mt-1 text-sm font-semibold">Console CampusLink</p>
          </div>
          <nav className="mt-4 flex-1 space-y-0.5 px-3">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground shadow-elegant" : "text-foreground hover:bg-muted"}`}>
                  <span>{n.i}</span>{n.l}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 border-t border-border p-4">
            <Avatar initials={initials} className="h-9 w-9 bg-gold text-gold-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{auth.user.email}</p>
              <p className="truncate text-[11px] text-muted-foreground">Super admin</p>
            </div>
            <button onClick={()=>supabase.auth.signOut().then(()=>navigate({to:"/login"}))} className="text-xs">↪</button>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-8"><Outlet /></main>
      </div>
    </div>
  );
}
