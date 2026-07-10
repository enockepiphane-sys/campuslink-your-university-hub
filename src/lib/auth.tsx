import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type Role = "super_admin" | "admin_etablissement" | "etudiant" | null;

type AuthCtx = {
  loading: boolean;
  user: User | null;
  session: Session | null;
  role: Role;
  etablissementId: string | null;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  loading: true,
  user: null,
  session: null,
  role: null,
  etablissementId: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [etablissementId, setEtablissementId] = useState<string | null>(null);

  async function fetchRole(uid: string) {
    const { data } = await supabase.from("user_roles").select("role,etablissement_id").eq("user_id", uid).limit(1).maybeSingle();
    if (data) {
      setRole(data.role as Role);
      setEtablissementId(data.etablissement_id);
    } else {
      // fallback: check etudiants
      const { data: etu } = await supabase.from("etudiants").select("etablissement_id").eq("user_id", uid).maybeSingle();
      if (etu) { setRole("etudiant"); setEtablissementId(etu.etablissement_id); }
      else { setRole(null); setEtablissementId(null); }
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchRole(data.session.user.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchRole(s.user.id);
      else { setRole(null); setEtablissementId(null); }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); setRole(null); setEtablissementId(null); };

  return <Ctx.Provider value={{ loading, user, session, role, etablissementId, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() { return useContext(Ctx); }

export function roleHomePath(role: Role): string {
  if (role === "super_admin") return "/platform";
  if (role === "admin_etablissement") return "/admin";
  if (role === "etudiant") return "/app";
  return "/login";
}
