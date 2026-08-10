export const CANONICAL_APP_URL = "https://campuslink-bf.app";
const LEGACY_HOSTS = new Set(["campuslink-bf.vercel.app", "www.campuslink-bf.app"]);

export function buildAuthRedirectUrl(path = "/") {
  return new URL(path, CANONICAL_APP_URL).toString();
}

export function redirectLegacyHostnameToCanonical() {
  if (typeof window === "undefined") return;
  if (!LEGACY_HOSTS.has(window.location.hostname)) return;

  const redirectUrl = new URL(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
    CANONICAL_APP_URL,
  ).toString();

  window.location.replace(redirectUrl);
}
