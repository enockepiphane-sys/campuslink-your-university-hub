import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-elegant">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10l9-5 9 5-9 5-9-5z" />
          <path d="M7 12v4c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-4" />
        </svg>
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-background" />
      </div>
      <span className="font-display text-lg font-700 tracking-tight text-foreground">
        Campus<span className="text-primary">Link</span>
      </span>
    </div>
  );
}

export function BurkinaFlag({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex overflow-hidden rounded-sm shadow-sm ${className}`}>
      <svg viewBox="0 0 30 20" className="h-5 w-auto">
        <rect x="0" y="0" width="30" height="10" fill="#CE1126" />
        <rect x="0" y="10" width="30" height="10" fill="#009639" />
        <polygon points="15,6 16.5,10.5 21,10.5 17.5,13 19,17.5 15,14.5 11,17.5 12.5,13 9,10.5 13.5,10.5" fill="#FCD116" />
      </svg>
    </div>
  );
}

export function Avatar({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <div className={`grid place-items-center rounded-full bg-primary text-primary-foreground font-display font-semibold ${className}`}>
      {initials}
    </div>
  );
}

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "gold" | "terracotta" | "success" | "muted" }) {
  const tones: Record<string, string> = {
    default: "bg-primary-soft text-primary",
    gold: "bg-gold/25 text-gold-foreground",
    terracotta: "bg-accent text-accent-foreground",
    success: "bg-emerald-100 text-emerald-800",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function MobileTabBar({ current }: { current: "home" | "grades" | "events" | "announcements" | "profile" }) {
  const items = [
    { key: "home", label: "Accueil", to: "/app", icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
    ) },
    { key: "grades", label: "Notes", to: "/app/grades", icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M4 4h12l4 4v12H4z"/><path d="M8 12h8M8 16h5"/></svg>
    ) },
    { key: "events", label: "Événements", to: "/app/events", icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
    ) },
    { key: "announcements", label: "Annonces", to: "/app/announcements", icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M3 11l14-6v14L3 13z"/><path d="M7 13v5"/></svg>
    ) },
    { key: "profile", label: "Profil", to: "/app/profile", icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
    ) },
  ] as const;
  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
        {items.map((it) => {
          const active = current === it.key;
          return (
            <li key={it.key}>
              <Link to={it.to} className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${active ? "bg-primary-soft" : ""}`}>{it.icon}</span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      {children}
    </div>
  );
}

export function KenteBar() {
  return <div className="h-1.5 kente-stripe" />;
}
