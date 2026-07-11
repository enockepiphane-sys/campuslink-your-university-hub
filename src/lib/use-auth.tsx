import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type Role = "super_admin" | "admin_etablissement" | "etudiant" | "professeur";

export type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: Role | null;
  etablissementId: string | null;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true, session: null, user: null, role: null, etablissementId: null,
  });

  useEffect(() => {
    let active = true;

    async function loadRole(user: User | null) {
      if (!user) return { role: null, etablissementId: null };
      const { data } = await supabase
        .from("user_roles")
        .select("role, etablissement_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      return {
        role: (data?.role as Role) ?? "etudiant",
        etablissementId: data?.etablissement_id ?? null,
      };
    }

    supabase.auth.getSession().then(async ({ data }) => {
      const { role, etablissementId } = await loadRole(data.session?.user ?? null);
      if (!active) return;
      setState({
        loading: false,
        session: data.session,
        user: data.session?.user ?? null,
        role,
        etablissementId,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const { role, etablissementId } = await loadRole(session?.user ?? null);
      if (!active) return;
      setState({ loading: false, session, user: session?.user ?? null, role, etablissementId });
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  return state;
}

export function roleHomePath(role: Role | null): string {
  if (role === "super_admin") return "/platform";
  if (role === "admin_etablissement") return "/admin";
  if (role === "etudiant") return "/app";
  if (role === "professeur") return "/professeur";
  return "/login";
}
