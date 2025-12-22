import { safeLocalStorage } from "./safeLocalStorage";

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = safeLocalStorage.get("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}${url}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "API Error");
  }

  return res.json();
}
