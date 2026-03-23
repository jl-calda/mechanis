"use client";

import Link from "next/link";
import { Ruler, CircleDot, Zap, Database, PenTool, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { getFavorites, type Favorite } from "@/lib/supabase/favorites";
import { profiles } from "@/data/profiles";
import { ProfileSvg } from "@/components/profiles/profile-svg";

const tools = [
  {
    href: "/profiles",
    title: "Section Builder",
    description:
      "View steel cross-sections with annotated dimensions. Standard AISC shapes or draw custom sections with CAD.",
    icon: Ruler,
    color: "bg-emerald-500/10 text-emerald-400",
  },
  {
    href: "/bolts",
    title: "Bolt Calculator",
    description:
      "Calculate bolt group capacity per AISC 360 Chapter J. Standard grid layouts or custom bolt patterns with CAD.",
    icon: CircleDot,
    color: "bg-sky-500/10 text-sky-400",
  },
  {
    href: "/welds",
    title: "Weld Calculator",
    description:
      "Determine fillet and groove weld capacities. Standard inputs or draw custom weld layouts with CAD.",
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
      "Full drawing canvas for custom cross-sections, bolt layouts, and weld configurations. Region detection and section properties.",
    icon: PenTool,
    color: "bg-pink-500/10 text-pink-400",
  },
];

function FavoriteSections() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getFavorites().then((favs) => {
      setFavorites(favs);
      setLoading(false);
    });
  }, [user]);

  if (!user || loading || favorites.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={13} className="text-amber-400" fill="currentColor" />
          <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
            Saved Sections
          </h2>
        </div>
        <Link
          href="/profiles"
          className="flex items-center gap-1 text-[11px] text-muted hover:text-primary transition-colors"
        >
          View all <ArrowRight size={11} />
        </Link>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {favorites.slice(0, 10).map((fav) => {
          const profile = profiles.find((p) => p.designation === fav.designation);
          return (
            <Link
              key={fav.id}
              href={`/profiles?d=${encodeURIComponent(fav.designation)}`}
              className="group flex flex-col items-center rounded-lg border border-border bg-surface p-3 transition-all hover:border-[#333] hover:bg-surface-alt"
            >
              {profile ? (
                <div className="h-24 w-full flex items-center justify-center">
                  <ProfileSvg profile={profile} width={160} height={96} />
                </div>
              ) : (
                <div className="h-24 w-full flex items-center justify-center">
                  <Ruler size={20} className="text-muted/40" />
                </div>
              )}
              <span className="mt-1.5 text-[11px] font-mono font-medium text-foreground group-hover:text-primary truncate max-w-full">
                {fav.designation}
              </span>
              <span className="text-[10px] text-muted/60">
                {fav.standard === "EN" ? "EN" : "AISC"} {fav.profileType}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-8">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          {user ? `Welcome back${user.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}` : "Mechanis"}
        </h1>
        <p className="mt-1 text-xs text-muted">
          Structural engineering tools for steel design per AISC 360.
        </p>
      </div>

      <FavoriteSections />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
