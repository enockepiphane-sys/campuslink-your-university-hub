import { createFileRoute } from "@tanstack/react-router";
import { Chip } from "@/components/campus/ui";
import { events } from "@/lib/campus-data";

export const Route = createFileRoute("/app/events")({
  component: EventsPage,
  head: () => ({ meta: [{ title: "Événements — CampusLink" }] }),
});

function EventsPage() {
  const categories = ["Tous", "Carrière", "Conférence", "Concours", "Formation"];
  return (
    <div className="pb-4">
      <header className="bg-primary px-5 pt-6 pb-6 text-primary-foreground">
        <p className="text-xs opacity-80">Vie universitaire</p>
        <h1 className="font-display text-2xl font-bold">Événements</h1>
      </header>

      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((c, i) => (
            <button key={c} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium ${i===0 ? "bg-primary text-primary-foreground" : "bg-surface border border-border text-foreground"}`}>{c}</button>
          ))}
        </div>
      </div>

      <section className="mt-4 space-y-4 px-5">
        {events.map((e) => (
          <article key={e.id} className="overflow-hidden rounded-3xl bg-surface shadow-card">
            <div className="relative h-40" style={{ background: e.cover }}>
              <div className="absolute inset-0 opacity-20 kente-stripe" style={{ maskImage: "linear-gradient(180deg, transparent 60%, black)" }}/>
              <div className="absolute left-3 top-3 rounded-xl bg-white/95 px-3 py-1.5 text-center text-foreground shadow">
                <p className="font-display text-lg font-bold leading-none">{e.day}</p>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">{e.month}</p>
              </div>
              <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">{e.category}</span>
              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="font-display text-lg font-bold text-white drop-shadow">{e.title}</h2>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">{e.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <InfoRow icon="🕐" label={e.time} />
                <InfoRow icon="📍" label={e.place} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map((n) => (
                      <div key={n} className="grid h-6 w-6 place-items-center rounded-full border-2 border-surface bg-primary text-[9px] font-bold text-primary-foreground">{["AD","MK","OS"][n-1]}</div>
                    ))}
                  </div>
                  <Chip tone="muted">{e.attendees} inscrits</Chip>
                </div>
                <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">S'inscrire</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function InfoRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
      <span>{icon}</span><span className="text-foreground">{label}</span>
    </div>
  );
}
