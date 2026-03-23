import { createClient } from "./client";
import type { Project } from "@/types/project";

export async function saveProject(
  name: string,
  type: Project["type"],
  data: Record<string, unknown>
): Promise<Project | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: project, error } = await supabase
    .from("projects")
    .upsert(
      {
        user_id: user.id,
        name,
        type,
        data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,name" }
    )
    .select()
    .single();

  if (error) {
    console.error("Save project error:", error);
    return null;
  }
  return project;
}

export async function loadProjects(
  type?: Project["type"]
): Promise<Project[]> {
  const supabase = createClient();
  let query = supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) {
    console.error("Load projects error:", error);
    return [];
  }
  return data ?? [];
}

export async function loadProject(id: string): Promise<Project | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  return !error;
}
