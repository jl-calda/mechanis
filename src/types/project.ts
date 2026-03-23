export interface Project {
  id: string;
  userId: string;
  name: string;
  type: "profiles" | "bolts" | "welds" | "cad";
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
