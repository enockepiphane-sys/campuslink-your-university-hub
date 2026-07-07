import { createFileRoute } from "@tanstack/react-router";
import { Chip } from "@/components/campus/ui";
import { grades } from "@/lib/campus-data";

export const Route = createFileRoute("/app/grades")({
  component: GradesPage,
  head: () => ({ meta: [{ title: "Mes notes — CampusLink" }] }),
});

function GradesPage() {
  return (
    <div className="pb-4">
      <header className="bg-primary px-5 pt-6 pb-8 text-primary-foreground">
        <p className="text-xs opacity-80">Mes résultats</p>
        <h1 className="font-display text-2xl font-bold">Notes & moyennes</h1>
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {grades.map((s, i) => (
            <button key={s.semester} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${i===0 ? "bg-gold text-gold-foreground" : "bg-white/10"}`}>{s.semester}</button>
          ))}
        </div>
      </header>

      {grades.map((sem, idx) => (
        <section key={sem.semester} className={`px-5 ${idx===0 ? "mt-4" : "mt-8"}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold">{sem.semester}</h2>
            {sem.average != null && (
              <div className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                Moy. {sem.average}/20
              </div>
            )}
          </div>

          <div className="mt-3 space-y-2">
            {sem.items.map((g) => (
              <div key={g.code} className="rounded-2xl bg-surface p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{g.code}</span>
                      <span className="text-[10px] text-muted-foreground">{g.credits} crédits</span>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold">{g.module}</p>
                    <p className="text-[11px] text-muted-foreground">{g.teacher}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {g.status === "published" ? (
                      <>
                        <p className={`font-display text-2xl font-bold ${gradeColor(g.note!)}`}>{g.note}<span className="text-xs text-muted-foreground">/20</span></p>
                        <Chip tone="success">Publié</Chip>
                      </>
                    ) : (
                      <>
                        <p className="font-display text-sm font-semibold text-muted-foreground">En attente</p>
                        <Chip tone="muted">Non publié</Chip>
                      </>
                    )}
                  </div>
                </div>
                {g.status === "published" && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(g.note!/20)*100}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="mx-5 mt-8 rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        🔒 Tes notes sont privées. Seul toi peux les consulter.
      </div>
    </div>
  );
}

function gradeColor(n: number) {
  if (n >= 14) return "text-emerald-700";
  if (n >= 10) return "text-primary";
  return "text-destructive";
}
