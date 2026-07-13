import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = {
  role: "admin" as const | "student",
  error: "" as string,
  error_code: "" as string,
};

export const Route = createFileRoute("/auth/callback")({
  component: CallbackPage,
  validateSearch: (s: any) => ({
    role: s.role || "student",
    error: s.error || "",
    error_code: s.error_code || "",
  }),
  head: () => ({ meta: [{ title: "Vérification — CampusLink" }] }),
});

function CallbackPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/callback" });
  const [message, setMessage] = useState("Vérification en cours...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Check for errors from Supabase
        if (search.error || search.error_code) {
          setIsError(true);
          setMessage(
            `Erreur lors de la confirmation : ${search.error || search.error_code}. Redirection vers la connexion...`
          );
          setTimeout(() => {
            navigate({ to: "/login" });
          }, 3000);
          return;
        }

        // Get the current session (user should be authenticated if email is confirmed)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          setIsError(true);
          setMessage(
            "Impossible de confirmer votre email. Veuillez réessayer ou contacter le support."
          );
          setTimeout(() => {
            navigate({ to: "/login" });
          }, 3000);
          return;
        }

        // Successfully confirmed, redirect to appropriate registration page
        const role = search.role === "admin" ? "admin" : "student";

        if (role === "admin") {
          // Redirect back to register-admin to complete password creation
          navigate({ to: "/register-admin" });
        } else {
          // Redirect back to register to create password
          navigate({ to: "/register" });
        }
      } catch (error) {
        setIsError(true);
        setMessage(
          `Une erreur est survenue: ${error instanceof Error ? error.message : "Erreur inconnue"}`
        );
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 3000);
      }
    }

    handleCallback();
  }, [search.error, search.error_code, search.role, navigate]);

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-20">
        <Logo />

        <div className="mt-12 rounded-3xl border border-border bg-surface p-8 shadow-card">
          <div className={`mx-auto h-12 w-12 rounded-full ${isError ? "bg-red-100" : "bg-blue-100"} flex items-center justify-center text-xl`}>
            {isError ? "⚠️" : "⏳"}
          </div>
          <h1 className="mt-6 text-center font-display text-2xl font-bold">{isError ? "Erreur" : "Vérification en cours"}</h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
