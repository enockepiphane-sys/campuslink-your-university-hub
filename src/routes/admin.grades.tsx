import { createFileRoute } from "@tanstack/react-router";
import { Chip } from "@/components/campus/ui";

export const Route = createFileRoute("/admin/grades")({
  component: AdminGrades,
  head: () => ({ meta: [{ title: "Notes — Admin CampusLink" }] }),
});

const students = [
  { m: "UCAD-2024-1187", n: "Aminata Diallo", notes: [14, 11, 15.5, null, 13, null] },
  { m: "UCAD-2024-0942", n: "Ousmane Sy", notes: [12, 13, 10, null, 14, null] },
  { m: "UCAD-2023-2201", n: "Mariam Konaté", notes: [16, 15, 17, null, 15, null] },
  { m: "UCAD-2024-1450", n: "Ibrahima Ndiaye", notes: [9, 12, 11, null, 10, null] },
  { m: "UCAD-2024-0788", n: "Cheikh Fall", notes: [13, 14, 12, null, 15, null] },
];
const modules = ["Micro.", "Maths fin.", "Compta.", "Droit civ.", "Anglais", "Stats"];

function AdminGrades() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Résultats</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Saisie & publication des notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Licence 2 — Économie · Semestre 1 · 2024-2025</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium">Importer un fichier</button>
          <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Publier les modifications</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <select className="rounded-xl border border-input bg-surface px-3 py-2 text-sm"><option>Faculté d'économie</option></select>
        <select className="rounded-xl border border-input bg-surface px-3 py-2 text-sm"><option>Licence 2</option></select>
        <select className="rounded-xl border border-input bg-surface px-3 py-2 text-sm"><option>Semestre 1</option></select>
        <select className="rounded-xl border border-input bg-surface px-3 py-2 text-sm"><option>Tous les modules</option></select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Étudiant</th>
              {modules.map((m) => <th key={m} className="px-3 py-3 text-center">{m}</th>)}
              <th className="px-4 py-3 text-right">Moy.</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s) => {
              const valid = s.notes.filter((n): n is number => n != null);
              const avg = valid.length ? (valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(1) : "—";
              return (
                <tr key={s.m} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{s.n}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{s.m}</p>
                  </td>
                  {s.notes.map((n, i) => (
                    <td key={i} className="px-2 py-2 text-center">
                      <input
                        defaultValue={n ?? ""}
                        placeholder="—"
                        className={`w-14 rounded-lg border border-input bg-background px-2 py-1.5 text-center text-sm outline-none ring-primary/20 focus:ring-4 ${n==null ? "text-muted-foreground" : n<10 ? "text-destructive" : n>=14 ? "text-emerald-700 font-semibold" : ""}`}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-display font-bold text-primary">{avg}</td>
                  <td className="px-4 py-3 text-right">
                    <Chip tone="success">Publié</Chip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span>Les modifications sont enregistrées automatiquement — publiez pour les rendre visibles aux étudiants.</span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">● Sauvegardé</span>
        </div>
      </div>
    </div>
  );
}
