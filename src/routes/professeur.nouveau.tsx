import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/professeur/nouveau")({
  component: NouveauCours,
  head: () => ({ meta: [{ title: "Nouveau cours — Professeur CampusLink" }] }),
});

function NouveauCours() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ titre: "", description: "", matiere: "", niveau: "", prix: "0", video_url: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    if (!auth.user || !form.titre || !form.matiere) return;
    setBusy(true);
    setMsg("");
    const { error } = await supabase.from("cours_en_ligne").insert({
      professeur_id: auth.user.id,
      titre: form.titre,
      description: form.description || null,
      matiere: form.matiere,
      niveau: form.niveau || null,
      prix: Number(form.prix) || 0,
      video_url: form.video_url || null,
      statut: "en_attente",
    });
    if (error) { setMsg("Erreur : " + error.message); setBusy(false); return; }
    setMsg("✓ Cours créé. Il sera examiné par l'administrateur avant publication.");
    setForm({ titre: "", description: "", matiere: "", niveau: "", prix: "0", video_url: "" });
    setBusy(false);
    setTimeout(() => navigate({ to: "/professeur" }), 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Nouveau cours</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Créer un cours en ligne</h1>
        <p className="mt-1 text-sm text-muted-foreground">Votre cours sera examiné par l'administrateur avant d'être publié.</p>
      </div>

      <div className="max-w-xl space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <label className="text-xs font-medium">Titre du cours</label>
          <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Algorithmique avancée" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Matière</label>
          <input value={form.matiere} onChange={(e) => setForm({ ...form, matiere: e.target.value })} placeholder="Ex: Informatique" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Niveau</label>
          <input value={form.niveau} onChange={(e) => setForm({ ...form, niveau: e.target.value })} placeholder="Ex: Licence 3, Master 1..." className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Décrivez le contenu de votre cours" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Prix (FCFA)</label>
          <input type="number" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Lien vidéo (URL)</label>
          <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
        </div>
        <button disabled={busy || !form.titre || !form.matiere} onClick={submit} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? "Création…" : "Créer le cours"}
        </button>
        {msg && <p className="text-xs">{msg}</p>}
      </div>
    </div>
  );
}
