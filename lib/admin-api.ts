import type { User } from "firebase/auth";

export async function adminApiFetch(user: User, input: string, init?: RequestInit): Promise<Response> {
  const token = await user.getIdToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init?.body != null) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
