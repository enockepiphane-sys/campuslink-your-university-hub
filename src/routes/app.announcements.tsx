import { createFileRoute } from "@tanstack/react-router";
import { Chip } from "@/components/campus/ui";
import { announcements } from "@/lib/campus-data";

export const Route = createFileRoute("/app/announcements")({
  component: AnnouncementsPage,
  head: () => ({ meta: [{ title: "Annonces — CampusLink" }] }),
});

function AnnouncementsPage() {
  return (
    <div className="pb-4">
      <header className="bg-primary px-5 pt-6 pb-6 text-primary-foreground">
        <p className="text-xs opacity-80">Communications officielles</p>
        <h1 className="font-display text-2xl font-bold">Annonces</h1>
        <p className="mt-1 text-xs opacity-80">{announcements.length} nouvelles publications cette semaine</p>
      </header>

      <section className="mt-4 space-y-3 px-5">
        {announcements.map((a) => (
          <article key={a.id} className="relative overflow-hidden rounded-2xl bg-surface p-4 shadow-card">
            {a.urgent && <span className="absolute left-0 top-0 h-full w-1 bg-terracotta" />}
            <div className="flex items-center gap-2">
              <Chip tone={a.urgent ? "terracotta" : "default"}>{a.tag}</Chip>
              {a.urgent && <Chip tone="terracotta">Urgent</Chip>}
              <span className="ml-auto text-[10px] text-muted-foreground">{a.date}</span>
            </div>
            <h2 className="mt-2 font-display text-base font-semibold leading-snug">{a.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <p className="text-[11px] text-muted-foreground">Par <span className="font-semibold text-foreground">{a.author}</span></p>
              <button className="text-xs font-semibold text-primary">Lire plus →</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
