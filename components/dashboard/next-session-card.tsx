"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2 } from "lucide-react";

import { getSession } from "@/lib/auth";
import { ApiError, marcarMiAsistencia, misTurnos, type Turno } from "@/lib/api";
import { formatDateShort, formatHora } from "@/lib/format";
import { toDateKey } from "@/lib/calendar";
import { avisarTurnosActualizados, puedeMarcarAsistencia } from "@/lib/turnos";
import { Button, buttonVariants } from "@/components/ui/button";
import { DashboardCard, DashboardCardIcon } from "./dashboard-card";

export function NextSessionCard() {
  // undefined = cargando, null = no se pudo obtener o no hay ninguno
  const [turno, setTurno] = useState<Turno | null | undefined>(undefined);
  const [ahora, setAhora] = useState(() => new Date());
  const [marcando, setMarcando] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Refresca la hora cada minuto para que el botón aparezca apenas empieza
  // el turno, sin tener que recargar la página.
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  async function handleAsistencia() {
    const session = getSession();
    if (!session || !turno) return;

    setError(null);
    setMarcando(true);
    try {
      setTurno(await marcarMiAsistencia(session.token, turno.id));
      avisarTurnosActualizados();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setMarcando(false);
    }
  }

  const hoyKey = toDateKey(ahora);
  const enCurso = turno ? puedeMarcarAsistencia(turno, ahora) : false;

  return (
    <DashboardCard className="flex items-start gap-5">
      <DashboardCardIcon>
        <CalendarClock className="h-6 w-6" />
      </DashboardCardIcon>

      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
          {enCurso ? "Turno de hoy" : "Próximo turno"}
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
              {formatHora(turno.horaInicio)}
            </p>
            <p className="font-heading font-light text-foreground/70">
              {turno.actividad}
            </p>
          </>
        )}

        {turno?.estado === "COMPLETADO" && (
          <p className="mt-4 flex items-center gap-2 font-heading text-sm font-semibold text-epr-green">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            ¡Asistencia registrada!
          </p>
        )}

        {error && (
          <p className="mt-3 font-heading text-sm font-light text-red-400">{error}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {enCurso && (
            <Button
              type="button"
              size="sm"
              font="heading"
              disabled={marcando}
              onClick={handleAsistencia}
            >
              <CheckCircle2 className="h-4 w-4" />
              {marcando ? "Marcando..." : "Asistí"}
            </Button>
          )}
          <Link
            href="/panel/alumno/turnos"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              font: "heading",
            })}
          >
            Ver mis turnos
          </Link>
        </div>
      </div>
    </DashboardCard>
  );
}
