"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "./admin-nav-items";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-epr-dark px-4 py-8 lg:block">
      <nav className="flex flex-col gap-2">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                isActive
                  ? "bg-white/5 text-epr-green"
                  : "text-foreground/80 hover:bg-white/5 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                  isActive
                    ? "border-epr-green text-epr-green"
                    : "border-white/15 text-epr-green/80",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-display text-sm uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
