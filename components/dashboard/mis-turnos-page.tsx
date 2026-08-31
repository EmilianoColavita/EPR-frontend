"use client";

import { useEffect, useState } from "react";

import { useRequireRole } from "@/lib/use-require-role";
import { getSession } from "@/lib/auth";
import { misTurnos, type EstadoTurno, type Turno } from "@/lib/api";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "./dashboard-header";
import { DashboardCard } from "./dashboard-card";

const ESTADO_LABEL: Record<EstadoTurno, string> = {
  CONFIRMADO: "Confirmado",
  CANCELADO: "Cancelado",
  COMPLETADO: "Completado",
};

function LoadingState() {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark">
      <p className="font-heading font-light text-foreground/60">Cargando...</p>
    </section>
  );
}

export function MisTurnosPage() {
  const usuario = useRequireRole("ALUMNO");
  // undefined = cargando, null = no se pudo obtener
  const [turnos, setTurnos] = useState<Turno[] | null | undefined>(undefined);

  useEffect(() => {
    if (!usuario) return;
    const session = getSession();
    if (!session) return;
    misTurnos(session.token).then(setTurnos);
  }, [usuario]);

  if (!usuario) {
    return <LoadingState />;
  }

  const ordenados = (turnos ?? [])
    .slice()
    .sort((a, b) => `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`));

  return (
    <>
      <DashboardHeader usuario={usuario} />
      <section className="min-h-[calc(100vh-7rem)] bg-epr-dark px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
            Mis turnos
          </h1>

          <DashboardCard className="mt-6">
            {turnos === undefined && (
              <p className="font-heading font-light text-foreground/50">
                Cargando...
              </p>
            )}

            {turnos === null && (
              <p className="font-heading font-light text-foreground/50">
                No se pudieron cargar tus turnos.
              </p>
            )}

            {turnos && turnos.length === 0 && (
              <p className="font-heading font-light text-foreground/50">
                Todavía no tenés turnos cargados.
              </p>
            )}

            {turnos && turnos.length > 0 && (
              <div className="flex flex-col gap-3">
                {ordenados.map((turno) => (
                  <div
                    key={turno.id}
                    className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-3 last:border-b-0"
                  >
                    <div className="w-32 shrink-0">
                      <p className="font-heading text-sm font-light text-foreground/60">
                        {formatDateShort(turno.fecha)}
                      </p>
                      <p className="font-heading text-epr-green">
                        {turno.horaInicio}
                        {turno.horaFin && `–${turno.horaFin}`}
                      </p>
                    </div>
                    <p className="flex-1 font-heading font-semibold text-foreground">
                      {turno.actividad}
                    </p>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 font-heading text-xs uppercase",
                        turno.estado === "CONFIRMADO" &&
                          "border-epr-green/50 text-epr-green",
                        turno.estado === "CANCELADO" &&
                          "border-red-500/40 text-red-400",
                        turno.estado === "COMPLETADO" &&
                          "border-white/20 text-foreground/50",
                      )}
                    >
                      {ESTADO_LABEL[turno.estado]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </section>
    </>
  );
}
