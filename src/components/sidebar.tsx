"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ruler,
  CircleDot,
  Zap,
  Database,
  PenTool,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "./auth-provider";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profiles", label: "Profile Drawer", icon: Ruler },
  { href: "/bolts", label: "Bolt Calculator", icon: CircleDot },
  { href: "/welds", label: "Weld Calculator", icon: Zap },
  { href: "/materials", label: "Materials", icon: Database },
  { href: "/cad", label: "CAD Editor", icon: PenTool },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Hide sidebar on login page
  if (pathname === "/login") return null;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 rounded-md bg-surface p-2 text-foreground md:hidden no-print"
        aria-label="Toggle navigation"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 flex w-52 flex-col border-r border-border bg-sidebar transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary font-semibold text-black text-[11px]">
              M
            </div>
            <span className="text-sm font-medium tracking-tight text-foreground">Mechanis</span>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                  isActive
                    ? "bg-surface-alt text-foreground"
                    : "text-muted hover:bg-sidebar-hover hover:text-foreground"
                }`}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border px-3 py-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-alt text-[10px] font-medium text-muted">
                  {(user.email?.[0] ?? "U").toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate text-[11px] text-foreground">
                  {user.user_metadata?.full_name ?? user.email}
                </div>
              </div>
              <button
                onClick={signOut}
                className="text-muted hover:text-danger transition-colors"
                title="Sign out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-muted/50">AISC 360 Reference</div>
          )}
        </div>
      </aside>
    </>
  );
}
