import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { DashboardCard, DashboardCardIcon } from "./dashboard-card";

// TODO: reemplazar por datos reales de GET /api/v1/turnos/proximo cuando esté el endpoint.
const MOCK_NEXT_SESSION = {
  cuando: "Hoy 19:00 hs",
  actividad: "Entrenamiento funcional",
};

export function NextSessionCard() {
  return (
    <DashboardCard className="flex items-start gap-5">
      <DashboardCardIcon>
        <CalendarClock className="h-6 w-6" />
      </DashboardCardIcon>

      <div className="flex-1">
        <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
          Próximo turno
        </p>
        <p className="mt-2 font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
          {MOCK_NEXT_SESSION.cuando}
        </p>
        <p className="font-heading font-light text-foreground/70">
          {MOCK_NEXT_SESSION.actividad}
        </p>

        <Link
          href="/panel/alumno/turnos"
          className={buttonVariants({ variant: "outline", size: "sm", font: "heading", className: "mt-4" })}
        >
          Ver mis turnos
        </Link>
      </div>
    </DashboardCard>
  );
}
