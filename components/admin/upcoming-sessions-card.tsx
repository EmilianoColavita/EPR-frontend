"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { getSession } from "@/lib/auth";
import { listTurnos, type Turno } from "@/lib/api";
import { toDateKey } from "@/lib/calendar";
import { buttonVariants } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

export function UpcomingSessionsCard() {
  // undefined = cargando, null = no se pudo obtener
  const [turnos, setTurnos] = useState<Turno[] | null | undefined>(undefined);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    const hoy = toDateKey(new Date());

    listTurnos(session.token, { desde: hoy, hasta: hoy }).then((data) => {
      if (!data) {
        setTurnos(null);
        return;
      }
      const deHoy = data
        .filter((t) => t.estado === "CONFIRMADO")
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
      setTurnos(deHoy);
    });
  }, []);

  return (
    <DashboardCard className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground">
          Agenda de hoy
        </h2>
        <Link
          href="/panel/admin/turnos"
          className={buttonVariants({ variant: "outline", size: "sm", font: "heading" })}
        >
          <CalendarClock className="h-4 w-4" />
          Ver agenda
        </Link>
      </div>

      <div className="mt-4 flex-1">
        {turnos === undefined && (
          <p className="font-heading font-light text-foreground/50">Cargando...</p>
        )}
        {turnos === null && (
          <p className="font-heading font-light text-foreground/50">
            No se pudieron cargar los turnos.
          </p>
        )}
        {turnos && turnos.length === 0 && (
          <p className="font-heading font-light text-foreground/50">
            No hay turnos confirmados para hoy.
          </p>
        )}
        {turnos?.map((turno) => (
          <div
            key={turno.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-white/10 py-3 last:border-b-0"
          >
            <div className="w-20 shrink-0">
              <p className="font-heading text-sm text-epr-green">{turno.horaInicio}</p>
            </div>
            <span className="flex-1 font-heading font-semibold text-foreground">
              {turno.alumno.nombre} {turno.alumno.apellido}
            </span>
            <span className="font-heading text-sm font-light text-foreground/60">
              {turno.actividad}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
