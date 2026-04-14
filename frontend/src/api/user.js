import { getApiBase, parseJsonOrThrow } from "./auth";

function getToken() {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  return auth.token;
}

export async function getAllUsers() {
  const token = getToken();
  if (!token) throw new Error("No token, please login");

  const res = await fetch(`${getApiBase()}/api/users/all-users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return parseJsonOrThrow(res, "Failed to fetch users");
}
