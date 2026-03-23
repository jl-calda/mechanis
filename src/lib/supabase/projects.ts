import { createClient } from "./client";
import type { Project } from "@/types/project";

// These functions call the API routes which use Prisma on the server side.
// Auth is still handled by Supabase client.

async function getAuthUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function saveProject(
  name: string,
  type: Project["type"],
  data: Record<string, unknown>
): Promise<Project | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, name, type, data }),
  });

  if (!res.ok) return null;
  return res.json();
}

export async function loadProjects(
  type?: Project["type"]
): Promise<Project[]> {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const params = new URLSearchParams({ userId });
  if (type) params.set("type", type);

  const res = await fetch(`/api/projects?${params}`);
  if (!res.ok) return [];
  return res.json();
}

export async function loadProject(id: string): Promise<Project | null> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function deleteProject(id: string): Promise<boolean> {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  return res.ok;
}
