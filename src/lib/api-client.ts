const BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
const TOKEN_KEY = "rana_session_token";

export function getAuthToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage can be unavailable in private mode */
  }
}

/* Fetch helper that points API calls at the Vercel deployment when the
 * static frontend is served from Firebase Hosting. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(BASE + path, { ...init, headers, credentials: BASE ? "omit" : "same-origin" });

  if (/\/api\/auth\/logout(\?|$)/.test(path)) {
    if (response.ok) setAuthToken(null);
    return response;
  }
  if (/\/api\/auth\/(login|session)(\?|$)/.test(path)) {
    try {
      const data = await response.clone().json();
      if (data && typeof data.token === "string") setAuthToken(data.token);
    } catch {
      /* non-JSON response */
    }
  }
  return response;
}
