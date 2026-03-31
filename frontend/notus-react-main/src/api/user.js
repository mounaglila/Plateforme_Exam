const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function getToken() {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  return auth.token;
}

export async function getAllUsers() {
  const token = getToken();
  if (!token) throw new Error("No token, please login");

  const res = await fetch(`${API_BASE}/api/users/all-users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch users");
  return data;
}