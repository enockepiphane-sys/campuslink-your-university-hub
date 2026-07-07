import { createFileRoute } from "@tanstack/react-router";
import { Chip } from "@/components/campus/ui";
import { events } from "@/lib/campus-data";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
  head: () => ({ meta: [{ title: "Événements — Admin CampusLink" }] }),
});

function AdminEvents() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Vie universitaire</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Événements</h1>
          <p className="mt-1 text-sm text-muted-foreground">Créez, publiez et suivez les événements de votre université.</p>
        </div>
        <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">+ Créer un événement</button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {events.map((e) => (
          <div key={e.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="relative h-32" style={{ background: e.cover }}>
              <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white backdrop-blur">{e.category}</span>
              <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-center text-foreground">
                <p className="font-display text-base font-bold leading-none">{e.day}</p>
                <p className="text-[9px] font-semibold uppercase text-muted-foreground">{e.month}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-semibold">{e.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{e.time} · {e.place}</p>
                </div>
                <Chip tone="success">Publié</Chip>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs">
                <div><p className="font-display text-base font-bold">{e.attendees}</p><p className="text-[10px] text-muted-foreground">Inscrits</p></div>
                <div><p className="font-display text-base font-bold">1.2k</p><p className="text-[10px] text-muted-foreground">Vues</p></div>
                <div><p className="font-display text-base font-bold">86%</p><p className="text-[10px] text-muted-foreground">Confirmés</p></div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-lg border border-border py-1.5 text-xs font-medium">Modifier</button>
                <button className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground">Voir détails</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
