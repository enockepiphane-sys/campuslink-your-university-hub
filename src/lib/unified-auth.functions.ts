import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LookupResult = {
  role: "super_admin" | "admin_etablissement" | "etudiant" | "professeur";
  etablissement_id: string | null;
  filiere_id: string | null;
  niveau_id: string | null;
  nom_complet: string;
};

/**
 * Étape 1 du login : détermine si l'utilisateur est "returning" (déjà vérifié) ou "first_time".
 * - Returning : email + date_naissance suffisent (user_id déjà lié).
 * - First time : email + date_naissance + etablissement/filiere/niveau requis.
 */
export const checkUserStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({
      email: z.string().email(),
      date_naissance: z.string(),
      etablissement_id: z.string().uuid().optional(),
      filiere_id: z.string().uuid().optional(),
      niveau_id: z.string().uuid().optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Check returning user (already has user_id linked)
    const { data: returningRows, error: err1 } = await supabaseAdmin.rpc("lookup_returning_user", {
      _email: data.email,
      _date_naissance: data.date_naissance,
    });

    if (err1) throw new Error(err1.message);

    if (returningRows && returningRows.length > 0) {
      const row = returningRows[0] as LookupResult;
      return {
        status: "returning" as const,
        found: true,
        role: row.role,
        etablissement_id: row.etablissement_id,
        filiere_id: row.filiere_id,
        niveau_id: row.niveau_id,
        nom_complet: row.nom_complet,
      };
    }

    // 2. Check first-time user (no user_id yet)
    // For first-time, we need etablissement_id at minimum (for admins), or all three for students
    const { data: firstTimeRows, error: err2 } = await supabaseAdmin.rpc("lookup_first_time_user", {
      _email: data.email,
      _date_naissance: data.date_naissance,
      _etablissement_id: data.etablissement_id ?? null,
      _filiere_id: data.filiere_id ?? null,
      _niveau_id: data.niveau_id ?? null,
    });

    if (err2) throw new Error(err2.message);

    if (firstTimeRows && firstTimeRows.length > 0) {
      const row = firstTimeRows[0] as LookupResult;
      return {
        status: "first_time" as const,
        found: true,
        role: row.role,
        etablissement_id: row.etablissement_id,
        filiere_id: row.filiere_id,
        niveau_id: row.niveau_id,
        nom_complet: row.nom_complet,
      };
    }

    // If no etablissement was provided, it could be a first-time user that needs more info
    if (!data.etablissement_id) {
      return {
        status: "need_more_info" as const,
        found: false,
      };
    }

    return {
      status: "not_found" as const,
      found: false,
    };
  });

/**
 * Finalise le compte après vérification OTP.
 * - super_admin : insère dans user_roles + lie user_id dans super_admins
 * - admin_etablissement : insère dans user_roles + lie user_id dans admins
 * - etudiant : crée profile + user_roles + fiche etudiants + marque liste_officielle
 * - professeur : insère dans user_roles
 */
export const finalizeUnifiedLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({
      email: z.string().email(),
      date_naissance: z.string(),
      etablissement_id: z.string().uuid().optional(),
      filiere_id: z.string().uuid().optional(),
      niveau_id: z.string().uuid().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // Try returning user first
    const { data: returningRows } = await supabaseAdmin.rpc("lookup_returning_user", {
      _email: data.email,
      _date_naissance: data.date_naissance,
    });

    let row: LookupResult | null = null;
    let isFirstTime = false;

    if (returningRows && returningRows.length > 0) {
      row = returningRows[0] as LookupResult;
    } else {
      // First-time user
      const { data: firstTimeRows } = await supabaseAdmin.rpc("lookup_first_time_user", {
        _email: data.email,
        _date_naissance: data.date_naissance,
        _etablissement_id: data.etablissement_id ?? null,
        _filiere_id: data.filiere_id ?? null,
        _niveau_id: data.niveau_id ?? null,
      });
      if (firstTimeRows && firstTimeRows.length > 0) {
        row = firstTimeRows[0] as LookupResult;
        isFirstTime = true;
      }
    }

    if (!row) {
      throw new Error("Aucun compte trouvé avec ces informations.");
    }

    // Profil commun
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: data.email,
      nom_complet: row.nom_complet,
      etablissement_id: row.etablissement_id,
      date_naissance: data.date_naissance,
    }, { onConflict: "id" });

    if (row.role === "super_admin") {
      await supabaseAdmin.from("user_roles").upsert({
        user_id: userId,
        role: "super_admin" as never,
      }, { onConflict: "user_id,role,etablissement_id" });

      if (isFirstTime) {
        await supabaseAdmin.from("super_admins")
          .update({ user_id: userId })
          .eq("email", data.email);
      }

    } else if (row.role === "admin_etablissement") {
      await supabaseAdmin.from("user_roles").upsert({
        user_id: userId,
        role: "admin_etablissement" as never,
        etablissement_id: row.etablissement_id!,
      }, { onConflict: "user_id,role,etablissement_id" });

      if (isFirstTime) {
        await supabaseAdmin.from("admins")
          .update({ user_id: userId })
          .eq("email", data.email)
          .eq("etablissement_id", row.etablissement_id!);
      }

    } else if (row.role === "etudiant") {
      await supabaseAdmin.from("user_roles").upsert({
        user_id: userId,
        role: "etudiant" as never,
        etablissement_id: row.etablissement_id!,
      }, { onConflict: "user_id,role,etablissement_id" });

      if (isFirstTime) {
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

        await supabaseAdmin.from("liste_officielle")
          .update({ utilise: true })
          .eq("etablissement_id", row.etablissement_id!)
          .eq("filiere_id", row.filiere_id!)
          .eq("niveau_id", row.niveau_id!)
          .eq("date_naissance", data.date_naissance)
          .ilike("email", data.email.trim());
      }
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

    const { data: isSuper } = await supabaseAdmin.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isSuper) throw new Error("Accès refusé : super admin uniquement.");

    const { data: existingSA } = await supabaseAdmin.from("super_admins")
      .select("email")
      .ilike("email", data.email)
      .maybeSingle();
    if (existingSA) throw new Error("Cet email est déjà super administrateur.");

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

/**
 * Crée un professeur (appelé par super_admin après validation candidature).
 */
export const createProfessor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({
      email: z.string().email(),
      nom_complet: z.string().min(1).max(200),
      date_naissance: z.string(),
      matiere: z.string(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: isSuper } = await supabaseAdmin.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isSuper) throw new Error("Accès refusé : super admin uniquement.");

    // Create auth user via admin API
    const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { nom_complet: data.nom_complet, role: "professeur", matiere: data.matiere },
    });

    if (inviteErr) throw new Error(inviteErr.message);
    if (!invited?.user) throw new Error("Erreur lors de l'invitation");

    // Create profile
    await supabaseAdmin.from("profiles").upsert({
      id: invited.user.id,
      email: data.email,
      nom_complet: data.nom_complet,
      date_naissance: data.date_naissance,
    }, { onConflict: "id" });

    // Create role
    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: invited.user.id,
      role: "professeur" as never,
    });
    if (roleErr) throw new Error(roleErr.message);

    return { created: true, user_id: invited.user.id };
  });
