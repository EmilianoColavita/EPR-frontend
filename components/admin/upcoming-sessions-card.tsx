import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

// TODO: reemplazar por datos reales de GET /api/v1/turnos?desde=hoy cuando esté el endpoint.
const MOCK_SESSIONS = [
  { hora: "09:00", nombre: "Emiliano Colavita", actividad: "Entrenamiento funcional" },
  { hora: "10:30", nombre: "Grupo Equipo A", actividad: "Fuerza" },
  { hora: "12:00", nombre: "Luciano Colavita", actividad: "Evaluación funcional" },
  { hora: "18:00", nombre: "Grupo Equipo B", actividad: "Entrenamiento funcional" },
];

export function UpcomingSessionsCard() {
  return (
    <DashboardCard className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground">
          Próximos turnos
        </h2>
        <Link
          href="/panel/admin/turnos"
          className={buttonVariants({ variant: "outline", size: "sm", font: "heading" })}
        >
          <Plus className="h-4 w-4" />
          Nuevo turno
        </Link>
      </div>

      <div className="mt-4 flex-1">
        {MOCK_SESSIONS.map((sesion) => (
          <div
            key={sesion.hora + sesion.nombre}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-white/10 py-3 last:border-b-0"
          >
            <span className="w-16 shrink-0 font-heading text-sm text-epr-green">
              {sesion.hora}
            </span>
            <span className="flex-1 font-heading font-semibold text-foreground">
              {sesion.nombre}
            </span>
            <span className="font-heading text-sm font-light text-foreground/60">
              {sesion.actividad}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
