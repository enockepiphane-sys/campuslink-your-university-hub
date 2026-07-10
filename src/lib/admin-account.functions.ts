import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server fn : le super admin invite un administrateur d'établissement.
 * L'admin recevra un email avec un lien OTP pour créer son compte.
 */
export const inviteEtablissementAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({
      email: z.string().email(),
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

    // Créer l'utilisateur sans mot de passe (sera défini par l'admin via OTP)
    // Utiliser inviteUserByEmail pour envoyer un email d'invitation
    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { nom_complet: data.nom_complet, etablissement_id: data.etablissement_id, role: "admin_etablissement" },
      redirectTo: `${process.env.SITE_URL || "http://localhost:3000"}/admin-verify`,
    });
    if (error) throw new Error(error.message);

    if (!invited?.user) throw new Error("Erreur lors de l'invitation");

    // Créer le profil
    await supabaseAdmin.from("profiles").upsert({
      id: invited.user.id,
      nom_complet: data.nom_complet,
      email: data.email,
      etablissement_id: data.etablissement_id,
    });

    // Créer le rôle (en attente de vérification)
    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: invited.user.id,
      role: "admin_etablissement",
      etablissement_id: data.etablissement_id,
    });
    if (roleErr) throw new Error(roleErr.message);

    return { user_id: invited.user.id, invited: true };
  });

/**
 * Server fn : vérifier et finaliser le compte admin après OTP.
 * L'admin doit confirmer son nom complet et date de naissance.
 */
export const verifyAdminOTP = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({
      nom_complet: z.string().min(1).max(200),
      date_naissance: z.string(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Vérifier que l'utilisateur a un rôle admin_etablissement en attente
    const { data: role } = await supabaseAdmin.from("user_roles")
      .select("etablissement_id")
      .eq("user_id", context.userId)
      .eq("role", "admin_etablissement")
      .maybeSingle();

    if (!role) throw new Error("Compte non autorisé");

    // Mettre à jour le profil avec les informations vérifiées
    const { error: profileErr } = await supabaseAdmin.from("profiles").update({
      nom_complet: data.nom_complet,
      date_naissance: data.date_naissance,
    }).eq("id", context.userId);

    if (profileErr) throw new Error(profileErr.message);

    // Mettre à jour les métadonnées utilisateur
    await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      user_metadata: { nom_complet: data.nom_complet, date_naissance: data.date_naissance, verified: true },
    });

    return { verified: true, etablissement_id: role.etablissement_id };
  });

// Note: la fonction `claimSuperAdminIfEmpty` a été supprimée pour éviter
// l'auto-promotion du premier compte en super_admin. Les super_admins sont
// désormais provisionnés uniquement via la table `super_admins` (seed / migration).


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
