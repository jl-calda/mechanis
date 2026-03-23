import Link from "next/link";
import { Ruler, CircleDot, Zap, Database } from "lucide-react";

const tools = [
  {
    href: "/profiles",
    title: "Profile Drawer",
    description:
      "View steel cross-sections with annotated dimensions. Browse W-shapes, channels, angles, and HSS profiles.",
    icon: Ruler,
    color: "bg-blue-500",
  },
  {
    href: "/bolts",
    title: "Bolt Calculator",
    description:
      "Calculate bolt group capacity per AISC 360 Chapter J. Shear, bearing, and tearout checks with visual bolt patterns.",
    icon: CircleDot,
    color: "bg-emerald-500",
  },
  {
    href: "/welds",
    title: "Weld Calculator",
    description:
      "Determine fillet and groove weld capacities. Includes directional strength increase and base metal checks.",
    icon: Zap,
    color: "bg-orange-500",
  },
  {
    href: "/materials",
    title: "Material Database",
    description:
      "Searchable database of structural steel grades. A36, A992, A572, A500, and more with full mechanical properties.",
    icon: Database,
    color: "bg-violet-500",
  },
];

export default function Home() {
  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Mechanis
        </h1>
        <p className="mt-2 text-muted">
          Structural engineering tools for steel design per AISC 360.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${tool.color} text-white`}
              >
                <Icon size={20} />
              </div>
              <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                {tool.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {tool.description}
              </p>
            </Link>
          );
        })}
      </div>

      <p className="mt-12 text-xs text-muted">
        Calculations reference AISC 360-22. Results should be verified by a
        licensed professional engineer.
      </p>
    </div>
  );
}
