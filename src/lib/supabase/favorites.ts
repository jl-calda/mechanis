import { createClient } from "./client";

export interface Favorite {
  id: string;
  userId: string;
  designation: string;
  profileType: string;
  standard: string;
  createdAt: string;
}

async function getAuthUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getFavorites(): Promise<Favorite[]> {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const res = await fetch(`/api/favorites?userId=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function addFavorite(
  designation: string,
  profileType: string,
  standard: string
): Promise<Favorite | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const res = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, designation, profileType, standard }),
  });

  if (!res.ok) return null;
  return res.json();
}

export async function removeFavorite(id: string): Promise<boolean> {
  const res = await fetch(`/api/favorites/${id}`, { method: "DELETE" });
  return res.ok;
}
