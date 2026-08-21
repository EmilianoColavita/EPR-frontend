import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DashboardCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-epr-green/30 bg-black/50 p-6 backdrop-blur-sm sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardCardIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-epr-green/60 text-epr-green">
      {children}
    </span>
  );
}
