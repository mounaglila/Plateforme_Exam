// ================= API BASE =================
import API_BASE from "./config";  

// ================= AUTH API =================
export async function loginApi({ email, password }) {
  const res = await fetch(`${API_BASE}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
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

// ================= STORAGE =================
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

// ================= HEADERS =================
export function authHeaders(extra = {}) {
  const token = getToken();
  if (!token) throw new Error("No token found. Please login first.");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

// ================= HELPERS =================
export function getApiBase() {
  return API_BASE;
}

export async function parseJsonOrThrow(res, fallbackMessage = "Request failed") {
  const raw = await res.text();
  let data = {};

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { message: raw };
    }
  }

  if (!res.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}