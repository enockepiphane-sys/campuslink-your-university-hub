import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server fn : le super admin crée un compte administrateur d'établissement.
 * Utilise l'API Admin (service role) après vérification du rôle super_admin.
 */
export const createEtablissementAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      email: z.string().email(),
      password: z.string().min(8).max(72),
      nom_complet: z.string().min(1).max(200),
      etablissement_id: z.string().uuid(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    // Vérifier super_admin
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId, _role: "super_admin",
    });
    if (!isSuper) throw new Error("Accès refusé");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { nom_complet: data.nom_complet },
    });
    if (error || !created?.user) throw new Error(error?.message ?? "Création impossible");

    await supabaseAdmin.from("profiles").upsert({
      id: created.user.id,
      nom_complet: data.nom_complet,
      email: data.email,
      etablissement_id: data.etablissement_id,
    });

    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: created.user.id,
      role: "admin_etablissement",
      etablissement_id: data.etablissement_id,
    });
    if (roleErr) throw new Error(roleErr.message);

    return { user_id: created.user.id };
  });

/**
 * Bootstrap : promeut l'utilisateur courant en super_admin si aucun n'existe.
 * Sert à créer le tout premier compte de la plateforme.
 */
export const claimSuperAdminIfEmpty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "super_admin");
    if ((count ?? 0) > 0) return { claimed: false };
    const { error } = await supabaseAdmin.from("user_roles").insert({
      user_id: context.userId, role: "super_admin",
    });
    if (error) throw new Error(error.message);
    return { claimed: true };
  });

/**
 * Finalise l'inscription d'un étudiant après vérification de son identité.
 * Utilise service role pour créer le rôle et lier au profil.
 */
export const finalizeStudentSignup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      etablissement_id: z.string().uuid(),
      filiere_id: z.string().uuid(),
      niveau_id: z.string().uuid(),
      nom_complet: z.string().min(1),
      date_naissance: z.string(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Re-vérifier l'identité côté serveur
    const { data: verified, error: vErr } = await supabaseAdmin.rpc("verify_student_identity", {
      _etablissement_id: data.etablissement_id,
      _filiere_id: data.filiere_id,
      _niveau_id: data.niveau_id,
      _nom_complet: data.nom_complet,
      _date_naissance: data.date_naissance,
    });
    if (vErr || !verified) throw new Error("Informations introuvables dans la liste officielle de votre établissement.");

    // Profil + rôle + fiche étudiant
    await supabaseAdmin.from("profiles").update({
      nom_complet: data.nom_complet,
      etablissement_id: data.etablissement_id,
      date_naissance: data.date_naissance,
    }).eq("id", context.userId);

    await supabaseAdmin.from("user_roles").upsert({
      user_id: context.userId,
      role: "etudiant",
      etablissement_id: data.etablissement_id,
    }, { onConflict: "user_id,role,etablissement_id" });

    const { data: userRow } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    await supabaseAdmin.from("etudiants").insert({
      user_id: context.userId,
      etablissement_id: data.etablissement_id,
      filiere_id: data.filiere_id,
      niveau_id: data.niveau_id,
      nom_complet: data.nom_complet,
      email: userRow?.user?.email ?? null,
      date_naissance: data.date_naissance,
    });

    // Marquer la ligne officielle comme utilisée
    await supabaseAdmin.from("liste_officielle")
      .update({ utilise: true })
      .eq("etablissement_id", data.etablissement_id)
      .eq("filiere_id", data.filiere_id)
      .eq("niveau_id", data.niveau_id)
      .eq("date_naissance", data.date_naissance)
      .ilike("nom_complet", data.nom_complet.trim());

    return { ok: true };
  });
