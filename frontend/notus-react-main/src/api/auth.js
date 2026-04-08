// Dev: empty base + package.json "proxy" → same-origin /api → no CORS issues.
// Prod: set REACT_APP_API_BASE to your API URL (e.g. https://api.example.com).
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (process.env.NODE_ENV === "development" ? "" : "http://localhost:5000");

export async function loginApi({ email, password }) {
  const res = await fetch(`${API_BASE}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data; // {_id,name,email,role,token}
}

export async function registerApi({ name, email, password, role }) {
  const res = await fetch(`${API_BASE}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Register failed");
  return data;
}

// --- Helpers réutilisables ---
export function getApiBase() {
  return API_BASE;
}

export function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem("auth") || "{}");
  } catch {
    return {};
  }
}

export function getToken() {
  return getStoredAuth()?.token || null;
}

export function authHeaders(extra = {}) {
  const token = getToken();
  if (!token) throw new Error("No token found. Please login first.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

export async function parseJsonOrThrow(res, fallbackMessage = "Request failed") {
  const raw = await res.text();
  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { message: raw.slice(0, 300) };
    }
  }
  if (!res.ok) {
    const msg =
      data.message ||
      data.error ||
      (typeof data === "string" ? data : null) ||
      `HTTP ${res.status}${raw ? `: ${raw.slice(0, 120)}` : ""}` ||
      fallbackMessage;
    throw new Error(msg);
  }
  return data;
}