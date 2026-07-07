import { createFileRoute, Link } from "@tanstack/react-router";
import { Avatar, Chip } from "@/components/campus/ui";
import { student, announcements, events, grades } from "@/lib/campus-data";

export const Route = createFileRoute("/app/")({
  component: Home,
  head: () => ({ meta: [{ title: "Accueil — CampusLink" }] }),
});

function Home() {
  const latestGrades = grades[0].items.filter((g) => g.status === "published").slice(0, 3);
  return (
    <div>
      {/* Header */}
      <header className="relative overflow-hidden bg-primary px-5 pt-6 pb-20 text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 0%, oklch(0.78 0.14 82) 0, transparent 40%), radial-gradient(circle at 100% 100%, oklch(0.62 0.15 40) 0, transparent 45%)" }} />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">Bonjour,</p>
            <h1 className="font-display text-2xl font-bold">{student.name.split(" ")[0]} 👋</h1>
            <p className="mt-0.5 text-xs opacity-80">{student.level}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3c0 .5-.2 1-.6 1.4L4 17h5"/><path d="M10 21h4"/></svg>
              <span className="absolute h-2 w-2 translate-x-3 -translate-y-3 rounded-full bg-terracotta ring-2 ring-primary" />
            </button>
            <Link to="/app/profile"><Avatar initials={student.avatar} className="h-10 w-10 bg-gold text-gold-foreground" /></Link>
          </div>
        </div>
      </header>

      {/* Overview card */}
      <div className="relative -mt-14 px-5">
        <div className="rounded-3xl bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Moyenne actuelle</p>
              <p className="mt-1 font-display text-4xl font-bold text-foreground">13.4<span className="text-lg text-muted-foreground">/20</span></p>
              <p className="mt-0.5 text-xs text-emerald-700">↑ +0.6 vs. semestre précédent</p>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="oklch(0.9 0.015 85)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke="oklch(0.32 0.06 160)" strokeWidth="3" strokeDasharray={`${(13.4/20)*94} 100`} strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
            <QuickStat label="Modules" value="6" />
            <QuickStat label="Publiés" value="4" />
            <QuickStat label="En attente" value="2" />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <section className="mt-5 px-5">
        <div className="grid grid-cols-4 gap-2">
          {[
            { l: "Notes", to: "/app/grades", i: "📊" },
            { l: "Événements", to: "/app/events", i: "🎉" },
            { l: "Annonces", to: "/app/announcements", i: "📣" },
            { l: "Profil", to: "/app/profile", i: "👤" },
          ].map((a) => (
            <Link key={a.l} to={a.to} className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface p-3 text-center shadow-card">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-lg">{a.i}</span>
              <span className="text-[11px] font-medium">{a.l}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section className="mt-6 px-5">
        <SectionTitle title="Dernières annonces" to="/app/announcements" />
        <div className="mt-3 space-y-3">
          {announcements.slice(0, 2).map((a) => (
            <div key={a.id} className="rounded-2xl bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2">
                <Chip tone={a.urgent ? "terracotta" : "default"}>{a.tag}</Chip>
                {a.urgent && <Chip tone="terracotta">Urgent</Chip>}
                <span className="ml-auto text-[10px] text-muted-foreground">{a.date}</span>
              </div>
              <h3 className="mt-2 font-display text-sm font-semibold leading-snug">{a.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section className="mt-6 px-5">
        <SectionTitle title="Prochains événements" to="/app/events" />
        <div className="mt-3 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {events.slice(0, 3).map((e) => (
            <div key={e.id} className="min-w-[240px] snap-start overflow-hidden rounded-2xl bg-surface shadow-card">
              <div className="relative h-24" style={{ background: e.cover }}>
                <div className="absolute bottom-2 left-2 rounded-lg bg-white/95 px-2 py-1 text-center text-foreground">
                  <p className="font-display text-base font-bold leading-none">{e.day}</p>
                  <p className="text-[9px] font-semibold uppercase text-muted-foreground">{e.month}</p>
                </div>
                <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">{e.category}</span>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 font-display text-sm font-semibold">{e.title}</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">📍 {e.place}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grades */}
      <section className="mt-6 px-5">
        <SectionTitle title="Dernières notes" to="/app/grades" />
        <div className="mt-3 divide-y divide-border rounded-2xl bg-surface shadow-card">
          {latestGrades.map((g) => (
            <div key={g.code} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold">{g.module}</p>
                <p className="text-[11px] text-muted-foreground">{g.code} · {g.credits} crédits</p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-primary">{g.note}<span className="text-xs text-muted-foreground">/20</span></p>
                <span className="text-[10px] font-medium text-emerald-700">Publié</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-4" />
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function SectionTitle({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <Link to={to} className="text-xs font-semibold text-primary">Voir tout →</Link>
    </div>
  );
}
