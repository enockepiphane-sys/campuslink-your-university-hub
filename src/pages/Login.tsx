import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth, roleHomePath } from "../lib/auth";

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [otp, setOtp] = useState("");
  const [detectedRole, setDetectedRole] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.loading && auth.user && auth.role) navigate(roleHomePath(auth.role));
  }, [auth.loading, auth.user, auth.role, navigate]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setDetectedRole(null);

    // 1. Look up user via RPC
    const { data: rows, error: rpcErr } = await supabase.rpc("lookup_user_by_email_birthdate", {
      _email: email,
      _date_naissance: dob,
    });
    if (rpcErr) { setError(rpcErr.message); setBusy(false); return; }
    if (!rows || rows.length === 0) {
      setError("Aucun compte trouvé avec ces informations. Contactez votre administration.");
      setBusy(false);
      return;
    }

    const row = rows[0];
    setDetectedRole(row.role);

    // 2. Send OTP via Supabase auth
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email,
      options: { data: { email, date_naissance: dob, role: row.role } },
    });
    if (otpErr) { setError(otpErr.message); setBusy(false); return; }

    setStep("otp");
    setBusy(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const { data, error: vErr } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (vErr) { setError(vErr.message); setBusy(false); return; }

    if (data.user) {
      // Finalize account: upsert profile, user_roles, etudiants
      try {
        const { data: rows } = await supabase.rpc("lookup_user_by_email_birthdate", {
          _email: email,
          _date_naissance: dob,
        });
        if (rows && rows.length > 0) {
          const row = rows[0];
          // Upsert profile
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email,
            nom_complet: row.nom_complet,
            etablissement_id: row.etablissement_id,
            date_naissance: dob,
          }, { onConflict: "id" });

          // Upsert user_roles
          await supabase.from("user_roles").upsert({
            user_id: data.user.id,
            role: row.role,
            etablissement_id: row.etablissement_id,
          }, { onConflict: "user_id,role,etablissement_id" });

          // If etudiant, create fiche + mark liste_officielle
          if (row.role === "etudiant") {
            const { data: existing } = await supabase.from("etudiants")
              .select("id").eq("user_id", data.user.id).maybeSingle();
            if (!existing) {
              await supabase.from("etudiants").insert({
                user_id: data.user.id,
                etablissement_id: row.etablissement_id,
                filiere_id: row.filiere_id,
                niveau_id: row.niveau_id,
                nom_complet: row.nom_complet,
                email,
                date_naissance: dob,
              });
            }
            await supabase.from("liste_officielle").update({ utilise: true })
              .eq("etablissement_id", row.etablissement_id)
              .eq("filiere_id", row.filiere_id)
              .eq("niveau_id", row.niveau_id)
              .ilike("email", email.trim());
          }

          // Link user_id in admins or super_admins
          if (row.role === "admin_etablissement") {
            await supabase.from("admins").update({ user_id: data.user.id })
              .eq("email", email).eq("etablissement_id", row.etablissement_id);
          } else if (row.role === "super_admin") {
            await supabase.from("super_admins").update({ user_id: data.user.id })
              .eq("email", email);
          }
        }
      } catch (err) {
        console.error("Finalization error:", err);
      }
    }
    setBusy(false);
    // redirect via useEffect
  }

  const roleLabel =
    detectedRole === "super_admin" ? "Super administrateur"
    : detectedRole === "admin_etablissement" ? "Administrateur d'établissement"
    : detectedRole === "etudiant" ? "Étudiant" : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="kente-bar" />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 28 }}>🎓</span>
            <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>CampusLink</span>
          </div>
          {step === "otp" && (
            <button onClick={() => { setStep("credentials"); setError(""); }}
              style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", background: "none", border: "none" }}>
              ← Retour
            </button>
          )}
        </div>

        <div className="card" style={{ padding: "2rem 1.5rem" }}>
          {step === "credentials" ? (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 800 }}>Se connecter</h1>
              <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
                Saisissez votre email et votre date de naissance. Vous recevrez un code de vérification par email.
              </p>
              <form onSubmit={handleSendOtp} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="label">Email</label>
                  <input className="field" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@gmail.com" required />
                </div>
                <div>
                  <label className="label">Date de naissance</label>
                  <input className="field" type="date" value={dob}
                    onChange={(e) => setDob(e.target.value)} required />
                </div>
                {error && <div className="err">{error}</div>}
                <button className="btn-primary" type="submit"
                  disabled={!email || !dob || busy}>
                  {busy ? "Recherche…" : "Recevoir mon code de connexion"}
                </button>
              </form>
            </>
          ) : (
            <>
              {roleLabel && (
                <div style={{ marginBottom: 12 }}>
                  <span className="chip chip-success">Compte détecté : {roleLabel}</span>
                </div>
              )}
              <h1 style={{ fontSize: 24, fontWeight: 800 }}>Entrez le code reçu</h1>
              <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
                Un code de vérification a été envoyé à <strong>{email}</strong>
              </p>
              <form onSubmit={handleVerifyOtp} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <input className="field" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Code à 6 chiffres" maxLength={6}
                  style={{ textAlign: "center", fontSize: 24, letterSpacing: 6 }} />
                {error && <div className="err">{error}</div>}
                <button className="btn-primary" type="submit"
                  disabled={otp.length !== 6 || busy}>
                  {busy ? "Vérification…" : "Confirmer et se connecter"}
                </button>
              </form>
              <button onClick={handleSendOtp} disabled={busy}
                style={{ marginTop: 16, width: "100%", textAlign: "center", fontSize: 12,
                  color: "var(--muted)", background: "none", border: "none" }}>
                Renvoyer le code
              </button>
            </>
          )}
        </div>
        <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
          © CampusLink — Plateforme du Burkina Faso
        </p>
      </div>
    </div>
  );
}
