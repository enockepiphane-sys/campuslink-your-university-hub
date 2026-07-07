import { createFileRoute, Link } from "@tanstack/react-router";
import { Avatar } from "@/components/campus/ui";
import { student } from "@/lib/campus-data";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Mon profil — CampusLink" }] }),
});

function ProfilePage() {
  return (
    <div className="pb-4">
      <header className="relative overflow-hidden bg-primary px-5 pt-6 pb-16 text-primary-foreground">
        <div className="absolute inset-0 opacity-20 kente-stripe" style={{ maskImage: "linear-gradient(180deg, black, transparent)" }}/>
        <div className="relative flex flex-col items-center text-center">
          <Avatar initials={student.avatar} className="h-20 w-20 bg-gold text-gold-foreground text-2xl ring-4 ring-white/20" />
          <h1 className="mt-3 font-display text-xl font-bold">{student.name}</h1>
          <p className="text-xs opacity-80">{student.email}</p>
          <span className="mt-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium">Matricule · {student.matricule}</span>
        </div>
      </header>

      <div className="-mt-10 space-y-3 px-5">
        <InfoCard title="Université" value={student.university} icon="🎓" />
        <InfoCard title="Faculté" value={student.faculty} icon="🏛️" />
        <InfoCard title="Filière" value={student.program} icon="📚" />
        <InfoCard title="Niveau" value={student.level} icon="📈" />
      </div>

      <div className="mt-6 divide-y divide-border rounded-2xl bg-surface px-1 mx-5 shadow-card">
        {[
          { l: "Paramètres du compte", i: "⚙️" },
          { l: "Notifications", i: "🔔" },
          { l: "Confidentialité", i: "🔒" },
          { l: "Centre d'aide", i: "💬" },
        ].map((r) => (
          <button key={r.l} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm hover:bg-muted">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft">{r.i}</span>
            <span className="flex-1 font-medium">{r.l}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        ))}
      </div>

      <div className="mt-6 px-5">
        <Link to="/" className="flex items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive">
          Se déconnecter
        </Link>
      </div>
      <p className="mt-4 text-center text-[11px] text-muted-foreground">CampusLink v1.0 · 2025</p>
    </div>
  );
}

function InfoCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-card">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-lg">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
