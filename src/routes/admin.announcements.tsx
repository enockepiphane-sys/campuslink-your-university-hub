import { createFileRoute } from "@tanstack/react-router";
import { Chip } from "@/components/campus/ui";
import { announcements } from "@/lib/campus-data";

export const Route = createFileRoute("/admin/announcements")({
  component: AdminAnnouncements,
  head: () => ({ meta: [{ title: "Annonces — Admin CampusLink" }] }),
});

function AdminAnnouncements() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Communication</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Annonces</h1>
        </div>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-6">
        {/* Composer */}
        <form onSubmit={(e)=>e.preventDefault()} className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">Publier une nouvelle annonce</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium">Titre</label>
              <input placeholder="Ex. Ouverture des inscriptions" className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:ring-4" />
            </div>
            <div>
              <label className="text-xs font-medium">Contenu</label>
              <textarea rows={6} placeholder="Rédigez votre annonce…" className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:ring-4" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Catégorie</label>
                <select className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm">
                  <option>Scolarité</option><option>Cours</option><option>Examens</option><option>Bourses</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Audience</label>
                <select className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm">
                  <option>Tous les étudiants</option><option>Faculté d'économie</option><option>Licence 2</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="h-4 w-4 rounded border-input" />
              Marquer comme <span className="font-semibold text-terracotta">urgent</span>
            </label>
            <div className="flex gap-2 pt-2">
              <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Publier maintenant</button>
              <button className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium">Programmer</button>
            </div>
          </div>
        </form>

        {/* Recent */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">Publications récentes</h2>
          <ul className="mt-4 space-y-3">
            {announcements.map((a) => (
              <li key={a.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2">
                  <Chip tone={a.urgent ? "terracotta" : "default"}>{a.tag}</Chip>
                  {a.urgent && <Chip tone="terracotta">Urgent</Chip>}
                  <span className="ml-auto text-[10px] text-muted-foreground">{a.date}</span>
                </div>
                <p className="mt-2 text-sm font-semibold">{a.title}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs">
                  <span className="text-muted-foreground">Vue par 2 130 étudiants</span>
                  <div className="flex gap-2">
                    <button className="font-semibold text-primary">Modifier</button>
                    <button className="font-semibold text-destructive">Supprimer</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
