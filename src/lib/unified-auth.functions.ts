import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// =====================================================
// STUDENT FUNCTIONS (ETAPE 3)
// =====================================================

/**
 * Checks if an email already exists in auth.users.
 * Used by the registration page to detect already-registered students.
 */
export const checkStudentEmailExists = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Check auth.users via admin API
    const { data: userList, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw new Error(error.message);

    const exists = (userList?.users ?? []).some(
      (u) => u.email?.toLowerCase() === data.email.toLowerCase(),
    );

    return { exists };
  });

/**
 * Student registration: signs up via supabase.auth.signUp, then creates
 * profile, user_roles, and etudiants row.
 */
export const registerStudent = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      etablissement_id: z.string().uuid(),
      filiere_id: z.string().uuid(),
      niveau_id: z.string().uuid(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // First check if email already exists in auth.users
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = (userList?.users ?? []).some(
      (u) => u.email?.toLowerCase() === data.email.toLowerCase(),
    );
    if (emailExists) {
      return { created: false, reason: "already_registered" as const };
    }

    // Create auth user with password
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authErr) throw new Error(authErr.message);
    if (!authData.user) throw new Error("Erreur lors de la création du compte.");

    const userId = authData.user.id;

    // Create profile
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: data.email,
      etablissement_id: data.etablissement_id,
    }, { onConflict: "id" });

    // Create user_roles entry
    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: "etudiant" as never,
      etablissement_id: data.etablissement_id,
    });
    if (roleErr) throw new Error(roleErr.message);

    // Create etudiants entry
    const { error: etuErr } = await supabaseAdmin.from("etudiants").insert({
      user_id: userId,
      etablissement_id: data.etablissement_id,
      filiere_id: data.filiere_id,
      niveau_id: data.niveau_id,
      email: data.email,
      nom_complet: "",
      date_naissance: "1900-01-01",
      statut: "actif",
    });
    if (etuErr) throw new Error(etuErr.message);

    return { created: true, user_id: userId };
  });

// =====================================================
// ADMIN FUNCTIONS (ETAPE 4)
// =====================================================

/**
 * Checks if an admin is pre-authorized in the admins table for a given establishment.
 * Returns whether the admin exists, and whether a user_id (password) is already linked.
 */
export const checkAdminAuthorization = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({
      etablissement_id: z.string().uuid(),
      nom_complet: z.string().min(1),
      email: z.string().email(),
      date_naissance: z.string(),
      telephone: z.string().optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: admin, error } = await supabaseAdmin.from("admins")
      .select("id, user_id, statut")
      .eq("etablissement_id", data.etablissement_id)
      .ilike("email", data.email.trim())
      .eq("statut", "actif")
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!admin) {
      return { authorized: false, has_password: false };
    }

    // Also verify nom_complet and date_naissance match
    const { data: fullAdmin } = await supabaseAdmin.from("admins")
      .select("id, user_id, nom_complet, date_naissance")
      .eq("id", admin.id)
      .maybeSingle();

    if (!fullAdmin) {
      return { authorized: false, has_password: false };
    }

    const nameMatch = fullAdmin.nom_complet?.toLowerCase().trim() === data.nom_complet.toLowerCase().trim();
    const dateMatch = fullAdmin.date_naissance === data.date_naissance;

    if (!nameMatch || !dateMatch) {
      return { authorized: false, has_password: false };
    }

    return {
      authorized: true,
      has_password: !!fullAdmin.user_id,
      admin_id: fullAdmin.id,
    };
  });

/**
 * First-time admin: creates auth user with password, links user_id to admins row.
 */
export const finalizeAdminSignup = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({
      etablissement_id: z.string().uuid(),
      nom_complet: z.string().min(1),
      email: z.string().email(),
      date_naissance: z.string(),
      telephone: z.string().optional(),
      password: z.string().min(6),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Verify admin is pre-authorized
    const { data: admin } = await supabaseAdmin.from("admins")
      .select("id, user_id, statut")
      .eq("etablissement_id", data.etablissement_id)
      .ilike("email", data.email.trim())
      .eq("statut", "actif")
      .maybeSingle();

    if (!admin) throw new Error("Administrateur non autorisé pour cet établissement.");
    if (admin.user_id) throw new Error("Un mot de passe a déjà été créé pour ce compte.");

    // Create auth user with password
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authErr) throw new Error(authErr.message);
    if (!authData.user) throw new Error("Erreur lors de la création du compte.");

    const userId = authData.user.id;

    // Link user_id to admins row + update telephone
    const { error: updateErr } = await supabaseAdmin.from("admins")
      .update({ user_id: userId, telephone: data.telephone ?? null })
      .eq("id", admin.id);
    if (updateErr) throw new Error(updateErr.message);

    // Create profile
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: data.email,
      nom_complet: data.nom_complet,
      etablissement_id: data.etablissement_id,
      date_naissance: data.date_naissance,
    }, { onConflict: "id" });

    // Create user_roles entry
    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: "admin_etablissement" as never,
      etablissement_id: data.etablissement_id,
    });
    if (roleErr) throw new Error(roleErr.message);

    return { created: true, user_id: userId };
  });

// =====================================================
// SUPER ADMIN FUNCTIONS (ETAPE 5)
// =====================================================

/**
 * Checks if an email belongs to a super_admin in the database.
 * Called BEFORE attempting signInWithPassword, to reject non-super-admins.
 */
export const checkSuperAdminEmail = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: sa, error } = await supabaseAdmin.from("super_admins")
      .select("id, email")
      .ilike("email", data.email.trim())
      .maybeSingle();

    if (error) throw new Error(error.message);

    return { is_super_admin: !!sa };
  });

// =====================================================
// EXISTING FUNCTIONS (kept for professor feature)
// =====================================================

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

    const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { nom_complet: data.nom_complet, role: "professeur", matiere: data.matiere },
    });

    if (inviteErr) throw new Error(inviteErr.message);
    if (!invited?.user) throw new Error("Erreur lors de l'invitation");

    await supabaseAdmin.from("profiles").upsert({
      id: invited.user.id,
      email: data.email,
      nom_complet: data.nom_complet,
      date_naissance: data.date_naissance,
    }, { onConflict: "id" });

    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: invited.user.id,
      role: "professeur" as never,
    });
    if (roleErr) throw new Error(roleErr.message);

    return { created: true, user_id: invited.user.id };
  });
