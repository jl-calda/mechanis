import { MaterialTable } from "@/components/materials/material-table";

export const metadata = {
  title: "Materials - Mechanis",
  description: "Structural steel grade database with full mechanical properties.",
};

export default function MaterialsPage() {
  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-5">
        <h1 className="text-lg font-medium tracking-tight text-foreground">
          Material Grade Database
        </h1>
        <p className="mt-0.5 text-xs text-muted">
          Searchable database of structural steel grades with mechanical
          properties per ASTM specifications.
        </p>
      </div>

      <MaterialTable />
    </div>
  );
}
