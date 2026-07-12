import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/partenariat")({
  component: PartnershipPage,
  head: () => ({ meta: [
    { title: "Devenir partenaire — CampusLink" },
    { name: "description", content: "Universités, écoles, instituts : rejoignez CampusLink et offrez à vos étudiants un espace numérique complet." },
    { property: "og:title", content: "Devenir partenaire — CampusLink" },
    { property: "og:description", content: "Rejoignez CampusLink et digitalisez votre établissement." },
  ]}),
});

function PartnershipPage() {
  const [state, setState] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending"); setErr("");
    const f = new FormData(e.currentTarget);
    const payload = {
      nom_etablissement: String(f.get("nom_etablissement") || ""),
      responsable: String(f.get("responsable") || ""),
      email: String(f.get("email") || ""),
      telephone: String(f.get("telephone") || ""),
      message: String(f.get("message") || ""),
    };
    const { error } = await supabase.from("demandes_partenariat").insert(payload);
    if (error) { setState("error"); setErr(error.message); return; }
    setState("sent");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="min-h-screen bg-background">
      <KenteBar />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Retour
        </Link>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-6">
        <div className="grid gap-8 rounded-3xl bg-primary p-8 text-primary-foreground md:grid-cols-[1.1fr_1fr] md:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Devenir partenaire</p>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">Rejoignez CampusLink.</h1>
            <p className="mt-4 max-w-md text-sm opacity-90">Universités, écoles supérieures, instituts : dites-nous quelques mots sur votre établissement. Notre équipe vous recontacte pour ouvrir votre espace CampusLink.</p>
            <ul className="mt-6 space-y-2 text-sm opacity-90">
              <li>✓ Espace administrateur dédié</li>
              <li>✓ Import de vos étudiants (CSV / Excel)</li>
              <li>✓ Notes, annonces, événements en un clic</li>
              <li>✓ Application mobile pour chaque étudiant</li>
            </ul>
          </div>
          <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white/8 p-6 backdrop-blur">
            <input name="nom_etablissement" required placeholder="Nom de l'établissement" className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-gold/40 focus:ring-2 placeholder:text-white/60" />
            <input name="responsable" required placeholder="Nom du responsable" className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-gold/40 focus:ring-2 placeholder:text-white/60" />
            <input name="email" type="email" required placeholder="Email professionnel" className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-gold/40 focus:ring-2 placeholder:text-white/60" />
            <input name="telephone" placeholder="Téléphone" className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-gold/40 focus:ring-2 placeholder:text-white/60" />
            <textarea name="message" rows={3} placeholder="Message" className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-gold/40 focus:ring-2 placeholder:text-white/60" />
            <button disabled={state==="sending"} className="w-full rounded-xl bg-gold py-3 text-sm font-semibold text-gold-foreground disabled:opacity-60">
              {state==="sending" ? "Envoi…" : "Envoyer ma demande"}
            </button>
            {state==="sent" && <p className="text-xs text-emerald-200">✓ Demande envoyée. Nous vous recontactons rapidement.</p>}
            {state==="error" && <p className="text-xs text-red-200">Erreur : {err}</p>}
          </form>
        </div>
      </section>
    </div>
  );
}
