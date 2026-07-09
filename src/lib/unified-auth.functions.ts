import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LookupResult = {
  role: "super_admin" | "admin_etablissement" | "etudiant";
  etablissement_id: string | null;
  filiere_id: string | null;
  niveau_id: string | null;
  nom_complet: string;
};

/**
 * Recherche un utilisateur par email + date de naissance dans super_admins → admins → liste_officielle.
 * Appelée côté client (avant l'envoi de l'OTP) pour vérifier qu'un compte existe.
 */
export const lookupUser = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({
      email: z.string().email(),
      date_naissance: z.string(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await supabaseAdmin.rpc("lookup_user_by_email_birthdate", {
      _email: data.email,
      _date_naissance: data.date_naissance,
    });

    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) {
      return { found: false } as const;
    }

    const row = rows[0] as LookupResult;
    return {
      found: true,
      role: row.role,
      etablissement_id: row.etablissement_id,
      filiere_id: row.filiere_id,
      niveau_id: row.niveau_id,
      nom_complet: row.nom_complet,
    } as const;
  });

/**
 * Finalise le compte après vérification OTP.
 * - super_admin : insère dans user_roles
 * - admin_etablissement : insère dans user_roles + met à jour admins.user_id
 * - etudiant : crée profile + user_roles + fiche etudiants + marque liste_officielle
 */
export const finalizeUnifiedLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({
      email: z.string().email(),
      date_naissance: z.string(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: rows } = await supabaseAdmin.rpc("lookup_user_by_email_birthdate", {
      _email: data.email,
      _date_naissance: data.date_naissance,
    });

    if (!rows || rows.length === 0) {
      throw new Error("Aucun compte trouvé avec ces informations.");
    }

    const row = rows[0] as LookupResult;

    // Profil commun
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: data.email,
      nom_complet: row.nom_complet,
      etablissement_id: row.etablissement_id,
      date_naissance: data.date_naissance,
    }, { onConflict: "id" });

    if (row.role === "super_admin") {
      // Créer / mettre à jour le rôle
      await supabaseAdmin.from("user_roles").upsert({
        user_id: userId,
        role: "super_admin" as never,
      }, { onConflict: "user_id,role,etablissement_id" });

      // Lier user_id dans super_admins
      await supabaseAdmin.from("super_admins")
        .update({ user_id: userId })
        .eq("email", data.email);

    } else if (row.role === "admin_etablissement") {
      await supabaseAdmin.from("user_roles").upsert({
        user_id: userId,
        role: "admin_etablissement" as never,
        etablissement_id: row.etablissement_id!,
      }, { onConflict: "user_id,role,etablissement_id" });

      // Lier user_id dans admins
      await supabaseAdmin.from("admins")
        .update({ user_id: userId })
        .eq("email", data.email)
        .eq("etablissement_id", row.etablissement_id!);

    } else if (row.role === "etudiant") {
      await supabaseAdmin.from("user_roles").upsert({
        user_id: userId,
        role: "etudiant" as never,
        etablissement_id: row.etablissement_id!,
      }, { onConflict: "user_id,role,etablissement_id" });

      // Créer la fiche étudiant si elle n'existe pas
      const { data: existing } = await supabaseAdmin.from("etudiants")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from("etudiants").insert({
          user_id: userId,
          etablissement_id: row.etablissement_id!,
          filiere_id: row.filiere_id!,
          niveau_id: row.niveau_id!,
          nom_complet: row.nom_complet,
          email: data.email,
          date_naissance: data.date_naissance,
        });
      }

      // Marquer comme utilisé dans liste_officielle
      await supabaseAdmin.from("liste_officielle")
        .update({ utilise: true })
        .eq("etablissement_id", row.etablissement_id!)
        .eq("filiere_id", row.filiere_id!)
        .eq("niveau_id", row.niveau_id!)
        .eq("date_naissance", data.date_naissance)
        .ilike("email", data.email.trim());
    }

    return {
      role: row.role,
      etablissement_id: row.etablissement_id,
      filiere_id: row.filiere_id,
      niveau_id: row.niveau_id,
    };
  });

/**
 * Crée un administrateur d'établissement (appelé par super_admin).
 */
export const createEtablissementAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({
      email: z.string().email(),
      nom_complet: z.string().min(1).max(200),
      date_naissance: z.string(),
      etablissement_id: z.string().uuid(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Vérifier super_admin
    const { data: isSuper } = await supabaseAdmin.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isSuper) throw new Error("Accès refusé : super admin uniquement.");

    // Vérifier que l'email n'est pas déjà super_admin
    const { data: existingSA } = await supabaseAdmin.from("super_admins")
      .select("email")
      .ilike("email", data.email)
      .maybeSingle();
    if (existingSA) throw new Error("Cet email est déjà super administrateur.");

    // Créer l'admin
    const { error } = await supabaseAdmin.from("admins").upsert({
      email: data.email,
      nom_complet: data.nom_complet,
      date_naissance: data.date_naissance,
      etablissement_id: data.etablissement_id,
      statut: "actif",
    }, { onConflict: "email,etablissement_id" });

    if (error) throw new Error(error.message);

    return { created: true };
  });
