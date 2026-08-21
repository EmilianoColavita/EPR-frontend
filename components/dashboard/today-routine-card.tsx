import Link from "next/link";
import { Dumbbell } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { DashboardCard, DashboardCardIcon } from "./dashboard-card";

// TODO: reemplazar por datos reales de GET /api/v1/rutinas/hoy cuando esté el endpoint.
const MOCK_ROUTINE = {
  diaActual: 3,
  diasTotales: 5,
  ejercicios: [
    { numero: "01", nombre: "Sentadilla", detalle: "4 series x 8 repeticiones" },
    { numero: "02", nombre: "Peso muerto", detalle: "4 series x 10 repeticiones" },
    { numero: "03", nombre: "Plancha", detalle: "3 series x 45 segundos" },
  ],
};

export function TodayRoutineCard() {
  return (
    <DashboardCard>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-5">
          <DashboardCardIcon>
            <Dumbbell className="h-6 w-6" />
          </DashboardCardIcon>

          <div>
            <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
              Rutina de hoy
            </p>
            <p className="mt-2 font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
              Día {MOCK_ROUTINE.diaActual} / {MOCK_ROUTINE.diasTotales}
            </p>

            <Link
              href="/panel/alumno/rutina"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                font: "heading",
                className: "mt-4",
              })}
            >
              Ver rutina completa
            </Link>
          </div>
        </div>

        <div className="flex-1 sm:max-w-xl">
          {MOCK_ROUTINE.ejercicios.map((ejercicio) => (
            <div
              key={ejercicio.numero}
              className="flex items-center gap-4 border-b border-white/10 py-4 first:pt-0 last:border-b-0 last:pb-0"
            >
              <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg border border-white/15 font-heading text-lg text-foreground/70">
                {ejercicio.numero}
              </span>
              <span className="h-8 w-px shrink-0 bg-white/10" />
              <span className="flex-1 font-heading font-bold uppercase tracking-tight text-foreground">
                {ejercicio.nombre}
              </span>
              <span className="text-right font-heading font-light text-foreground/60">
                {ejercicio.detalle}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
