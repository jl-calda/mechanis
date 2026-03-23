import Link from "next/link";
import { Ruler, CircleDot, Zap, Database, PenTool } from "lucide-react";

const tools = [
  {
    href: "/profiles",
    title: "Profile Drawer",
    description:
      "View steel cross-sections with annotated dimensions. Browse W-shapes, channels, angles, and HSS profiles.",
    icon: Ruler,
    color: "bg-emerald-500/10 text-emerald-400",
  },
  {
    href: "/bolts",
    title: "Bolt Calculator",
    description:
      "Calculate bolt group capacity per AISC 360 Chapter J. Shear, bearing, and tearout checks with visual bolt patterns.",
    icon: CircleDot,
    color: "bg-sky-500/10 text-sky-400",
  },
  {
    href: "/welds",
    title: "Weld Calculator",
    description:
      "Determine fillet and groove weld capacities. Includes directional strength increase and base metal checks.",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-400",
  },
  {
    href: "/materials",
    title: "Material Database",
    description:
      "Searchable database of structural steel grades. A36, A992, A572, A500, and more with full mechanical properties.",
    icon: Database,
    color: "bg-violet-500/10 text-violet-400",
  },
  {
    href: "/cad",
    title: "CAD Editor",
    description:
      "Draw custom cross-sections, bolt layouts, and weld configurations. Compute section properties from arbitrary shapes.",
    icon: PenTool,
    color: "bg-pink-500/10 text-pink-400",
  },
];

export default function Home() {
  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-8">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          Mechanis
        </h1>
        <p className="mt-1 text-xs text-muted">
          Structural engineering tools for steel design per AISC 360.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-lg border border-border bg-surface p-5 transition-all hover:border-[#333] hover:bg-surface-alt"
            >
              <div
                className={`mb-3 flex h-8 w-8 items-center justify-center rounded-md ${tool.color}`}
              >
                <Icon size={16} />
              </div>
              <h2 className="text-sm font-medium text-foreground group-hover:text-primary">
                {tool.title}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {tool.description}
              </p>
            </Link>
          );
        })}
      </div>

      <p className="mt-10 text-[11px] text-muted/60">
        Calculations reference AISC 360-22. Results should be verified by a
        licensed professional engineer.
      </p>
    </div>
  );
}
