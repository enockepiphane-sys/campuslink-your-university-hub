import { createFileRoute, Link } from "@tanstack/react-router";
import { Chip } from "@/components/campus/ui";
import { announcements, events } from "@/lib/campus-data";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
  head: () => ({ meta: [{ title: "Tableau de bord — Admin CampusLink" }] }),
});

function AdminHome() {
  const stats = [
    { l: "Étudiants inscrits", v: "4 218", d: "+126 cette semaine", tone: "text-emerald-700" },
    { l: "Notes publiées", v: "18 490", d: "72% du semestre", tone: "text-primary" },
    { l: "Annonces actives", v: "24", d: "3 urgentes", tone: "text-terracotta" },
    { l: "Événements à venir", v: "12", d: "Prochain dans 4j", tone: "text-gold-foreground" },
  ];
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Vue d'ensemble</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Bonjour, Professeur Sarr 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Voici l'activité de votre université aujourd'hui.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium">Exporter</button>
          <Link to="/admin/announcements" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">+ Nouvelle annonce</Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs font-medium text-muted-foreground">{s.l}</p>
            <p className="mt-2 font-display text-3xl font-bold">{s.v}</p>
            <p className={`mt-1 text-xs font-medium ${s.tone}`}>{s.d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Activité des étudiants</h2>
            <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs">
              <option>7 derniers jours</option><option>30 jours</option>
            </select>
          </div>
          <div className="mt-5 flex h-48 items-end gap-3">
            {[45,62,58,71,80,66,88].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-primary/15" style={{ height: `${h*0.6}%` }}>
                  <div className="h-full rounded-t-lg bg-gradient-to-t from-primary to-primary/70" style={{ height: `${h}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{["L","M","M","J","V","S","D"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">Répartition</h2>
          <div className="mt-4 space-y-3">
            {[
              { l: "Économie", v: 34, c: "bg-primary" },
              { l: "Droit", v: 26, c: "bg-terracotta" },
              { l: "Sciences", v: 22, c: "bg-gold" },
              { l: "Lettres", v: 18, c: "bg-emerald-600" },
            ].map((r) => (
              <div key={r.l}>
                <div className="flex justify-between text-xs"><span className="font-medium">{r.l}</span><span className="text-muted-foreground">{r.v}%</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${r.c}`} style={{ width: `${r.v*2}%` }}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Annonces récentes</h2>
            <Link to="/admin/announcements" className="text-xs font-semibold text-primary">Gérer →</Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {announcements.slice(0,3).map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-sm">📣</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.date} · {a.author}</p>
                </div>
                <Chip tone={a.urgent ? "terracotta" : "muted"}>{a.urgent ? "Urgent" : a.tag}</Chip>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Prochains événements</h2>
            <Link to="/admin/events" className="text-xs font-semibold text-primary">Gérer →</Link>
          </div>
          <ul className="mt-4 space-y-3">
            {events.slice(0,3).map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="grid h-12 w-12 place-items-center rounded-lg text-center text-white" style={{ background: e.cover }}>
                  <div><p className="font-display text-sm font-bold leading-none">{e.day}</p><p className="text-[9px] uppercase">{e.month}</p></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.time} · {e.attendees} inscrits</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
