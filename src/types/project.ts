export interface Project {
  id: string;
  user_id: string;
  name: string;
  type: "profiles" | "bolts" | "welds" | "cad";
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
