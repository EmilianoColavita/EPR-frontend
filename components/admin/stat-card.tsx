import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { DashboardCard, DashboardCardIcon } from "@/components/dashboard/dashboard-card";

export function StatCard({
  icon: Icon,
  label,
  value,
  href,
  linkLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  href: string;
  linkLabel: string;
}) {
  return (
    <DashboardCard className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <DashboardCardIcon>
          <Icon className="h-6 w-6" />
        </DashboardCardIcon>
        <span className="font-heading text-4xl font-bold text-foreground">
          {value}
        </span>
      </div>
      <div>
        <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
          {label}
        </p>
        <Link
          href={href}
          className="mt-2 inline-flex items-center gap-1 font-heading text-sm text-epr-green hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </DashboardCard>
  );
}
