import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

const ACTIONS = [
  { label: "Dar de alta alumno", href: "/panel/admin/alumnos" },
  { label: "Nueva rutina", href: "/panel/admin/rutinas" },
  { label: "Nueva evaluación", href: "/panel/admin/evaluaciones" },
];

export function QuickActionsCard() {
  return (
    <DashboardCard className="flex h-full flex-col gap-4">
      <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground">
        Accesos rápidos
      </h2>
      <div className="flex flex-1 flex-col gap-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={buttonVariants({
              variant: "outline",
              font: "heading",
              className: "justify-start",
            })}
          >
            <Plus className="h-4 w-4" />
            {action.label}
          </Link>
        ))}
      </div>
    </DashboardCard>
  );
}
