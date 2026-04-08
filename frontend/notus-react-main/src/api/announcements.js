import { getApiBase, authHeaders, parseJsonOrThrow } from "./auth";

const API_BASE = getApiBase();

export async function getMyAnnouncements() {
  const res = await fetch(`${API_BASE}/api/users/announcements`, { headers: authHeaders() });
  return parseJsonOrThrow(res, "Failed to load announcements");
}
