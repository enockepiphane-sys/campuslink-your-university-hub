import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Chip } from "@/components/campus/ui";

export const Route = createFileRoute("/admin/students")({
  component: StudentsPage,
  head: () => ({ meta: [{ title: "Étudiants — Admin CampusLink" }] }),
});

const rows = [
  { m: "UCAD-2024-1187", n: "Aminata Diallo", f: "Économie", l: "L2", s: "Actif", init: "AD" },
  { m: "UCAD-2024-0942", n: "Ousmane Sy", f: "Droit", l: "L1", s: "Actif", init: "OS" },
  { m: "UCAD-2023-2201", n: "Mariam Konaté", f: "Sciences", l: "L3", s: "Actif", init: "MK" },
  { m: "UCAD-2024-1450", n: "Ibrahima Ndiaye", f: "Économie", l: "L2", s: "Inactif", init: "IN" },
  { m: "UCAD-2023-1109", n: "Fatou Bâ", f: "Lettres", l: "M1", s: "Actif", init: "FB" },
  { m: "UCAD-2024-0788", n: "Cheikh Fall", f: "Droit", l: "L1", s: "Actif", init: "CF" },
  { m: "UCAD-2024-1662", n: "Awa Diagne", f: "Sciences", l: "L2", s: "Actif", init: "AD" },
  { m: "UCAD-2022-0421", n: "Modou Gueye", f: "Économie", l: "M2", s: "Diplômé", init: "MG" },
];

function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Gestion</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Étudiants</h1>
          <p className="mt-1 text-sm text-muted-foreground">4 218 étudiants inscrits · 6 facultés</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium">Exporter CSV</button>
          <button className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium">📥 Importer une liste</button>
          <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">+ Ajouter un étudiant</button>
        </div>
      </div>

      {/* Import zone */}
      <div className="rounded-2xl border-2 border-dashed border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-xl">📄</div>
          <div className="flex-1">
            <p className="font-display text-base font-semibold">Importer une liste d'étudiants</p>
            <p className="text-xs text-muted-foreground">Format accepté : CSV, XLSX. Colonnes requises : matricule, nom, email, filière, niveau.</p>
          </div>
          <button className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background">Choisir un fichier</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["Tous", "Économie", "Droit", "Sciences", "Lettres"].map((c, i) => (
          <button key={c} className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${i===0 ? "bg-primary text-primary-foreground" : "border border-border bg-surface"}`}>{c}</button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Étudiant</th>
              <th className="px-5 py-3 text-left">Matricule</th>
              <th className="px-5 py-3 text-left">Filière</th>
              <th className="px-5 py-3 text-left">Niveau</th>
              <th className="px-5 py-3 text-left">Statut</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.m} className="hover:bg-muted/30">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={r.init} className="h-9 w-9 text-xs" />
                    <div>
                      <p className="font-semibold">{r.n}</p>
                      <p className="text-xs text-muted-foreground">{r.n.toLowerCase().replace(" ",".")}@ucad.sn</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-xs">{r.m}</td>
                <td className="px-5 py-3">{r.f}</td>
                <td className="px-5 py-3">{r.l}</td>
                <td className="px-5 py-3">
                  <Chip tone={r.s === "Actif" ? "success" : r.s === "Diplômé" ? "gold" : "muted"}>{r.s}</Chip>
                </td>
                <td className="px-5 py-3 text-right"><button className="text-xs font-semibold text-primary">Gérer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span>Affichage 1–8 sur 4 218</span>
          <div className="flex gap-1">
            <button className="rounded-md border border-border px-2.5 py-1">‹</button>
            <button className="rounded-md bg-primary px-2.5 py-1 text-primary-foreground">1</button>
            <button className="rounded-md border border-border px-2.5 py-1">2</button>
            <button className="rounded-md border border-border px-2.5 py-1">3</button>
            <button className="rounded-md border border-border px-2.5 py-1">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
