"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { getSession } from "@/lib/auth";
import { misTurnos, type Turno } from "@/lib/api";
import { formatDateShort } from "@/lib/format";
import { toDateKey } from "@/lib/calendar";
import { buttonVariants } from "@/components/ui/button";
import { DashboardCard, DashboardCardIcon } from "./dashboard-card";

export function NextSessionCard() {
  // undefined = cargando, null = no se pudo obtener o no hay ninguno
  const [turno, setTurno] = useState<Turno | null | undefined>(undefined);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    misTurnos(session.token, { desde: toDateKey(new Date()) }).then((turnos) => {
      if (!turnos) {
        setTurno(null);
        return;
      }
      const proximo = turnos
        .filter((t) => t.estado === "CONFIRMADO")
        .sort((a, b) =>
          `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`),
        )[0];
      setTurno(proximo ?? null);
    });
  }, []);

  const hoyKey = toDateKey(new Date());

  return (
    <DashboardCard className="flex items-start gap-5">
      <DashboardCardIcon>
        <CalendarClock className="h-6 w-6" />
      </DashboardCardIcon>

      <div className="flex-1">
        <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
          Próximo turno
        </p>

        {turno === undefined && (
          <p className="mt-2 font-heading font-light text-foreground/40">
            Cargando...
          </p>
        )}

        {turno === null && (
          <p className="mt-2 font-heading font-light text-foreground/60">
            No tenés turnos próximos cargados.
          </p>
        )}

        {turno && (
          <>
            <p className="mt-2 font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
              {turno.fecha === hoyKey ? "Hoy" : formatDateShort(turno.fecha)}{" "}
              {turno.horaInicio}
            </p>
            <p className="font-heading font-light text-foreground/70">
              {turno.actividad}
            </p>
          </>
        )}

        <Link
          href="/panel/alumno/turnos"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            font: "heading",
            className: "mt-4",
          })}
        >
          Ver mis turnos
        </Link>
      </div>
    </DashboardCard>
  );
}
