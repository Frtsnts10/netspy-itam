import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const resp = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(error.detail || `HTTP ${resp.status}`);
  }

  return resp.json();
}
