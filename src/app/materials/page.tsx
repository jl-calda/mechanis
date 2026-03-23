import { MaterialTable } from "@/components/materials/material-table";

export const metadata = {
  title: "Materials - Mechanis",
  description: "Structural steel grade database with full mechanical properties.",
};

export default function MaterialsPage() {
  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Material Grade Database
        </h1>
        <p className="mt-1 text-sm text-muted">
          Searchable database of structural steel grades with mechanical
          properties per ASTM specifications.
        </p>
      </div>

      <MaterialTable />
    </div>
  );
}
