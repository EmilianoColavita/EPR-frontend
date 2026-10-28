"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { useRequireRole } from "@/lib/use-require-role";
import { getSession } from "@/lib/auth";
import {
  ApiError,
  marcarMiAsistencia,
  marcarMiAusencia,
  misTurnos,
  type EstadoTurno,
  type Turno,
} from "@/lib/api";
import { toDateKey } from "@/lib/calendar";
import { formatDateShort, formatHorario } from "@/lib/format";
import { avisarTurnosActualizados, puedeMarcarAsistencia } from "@/lib/turnos";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "./dashboard-header";
import { DashboardCard } from "./dashboard-card";

const ESTADO_LABEL: Record<EstadoTurno, string> = {
  CONFIRMADO: "Confirmado",
  CANCELADO: "Cancelado",
  COMPLETADO: "Asististe",
  AUSENTE: "No asististe",
};

type Marcando = { id: number; accion: "asistencia" | "ausencia" } | null;

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
  const [marcando, setMarcando] = useState<Marcando>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) return;
    const session = getSession();
    if (!session) return;
    misTurnos(session.token).then(setTurnos);
  }, [usuario]);

  async function handleMarcar(turno: Turno, accion: "asistencia" | "ausencia") {
    const session = getSession();
    if (!session) return;

    setError(null);
    setMarcando({ id: turno.id, accion });
    try {
      const actualizado =
        accion === "asistencia"
          ? await marcarMiAsistencia(session.token, turno.id)
          : await marcarMiAusencia(session.token, turno.id);
      setTurnos((prev) =>
        prev ? prev.map((t) => (t.id === actualizado.id ? actualizado : t)) : prev,
      );
      avisarTurnosActualizados();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setMarcando(null);
    }
  }

  if (!usuario) {
    return <LoadingState />;
  }

  const ahora = new Date();
  const hoyKey = toDateKey(ahora);
  const porFecha = (a: Turno, b: Turno) =>
    `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`);
  const proximos = (turnos ?? []).filter((t) => t.fecha >= hoyKey).sort(porFecha);
  // Los anteriores van del más reciente al más viejo.
  const anteriores = (turnos ?? [])
    .filter((t) => t.fecha < hoyKey)
    .sort((a, b) => porFecha(b, a));

  function renderTurno(turno: Turno) {
    const ocupado = marcando?.id === turno.id;
    return (
      <div
        key={turno.id}
        className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-white/10 pb-3 last:border-b-0"
      >
        <div className="w-32 shrink-0">
          <p className="font-heading text-sm font-light text-foreground/60">
            {formatDateShort(turno.fecha)}
          </p>
          <p className="font-heading text-epr-green">
            {formatHorario(turno.horaInicio, turno.horaFin)}
          </p>
        </div>
        <p className="min-w-[120px] flex-1 font-heading font-semibold text-foreground">
          {turno.actividad}
        </p>
        {puedeMarcarAsistencia(turno, ahora) ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={ocupado}
              onClick={() => handleMarcar(turno, "asistencia")}
              className="flex items-center gap-1.5 rounded-full bg-epr-green px-4 py-1.5 font-heading text-xs font-semibold uppercase text-epr-dark transition-colors hover:bg-epr-green/90 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {ocupado && marcando?.accion === "asistencia" ? "Marcando..." : "Asistí"}
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => handleMarcar(turno, "ausencia")}
              className="flex items-center gap-1.5 rounded-full border border-red-500/40 px-4 py-1.5 font-heading text-xs font-semibold uppercase text-red-400 transition-colors hover:border-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              {ocupado && marcando?.accion === "ausencia" ? "Marcando..." : "No asistí"}
            </button>
          </div>
        ) : (
          <span
            className={cn(
              "rounded-full border px-3 py-1 font-heading text-xs uppercase",
              turno.estado === "CONFIRMADO" && "border-epr-green/50 text-epr-green",
              turno.estado === "CANCELADO" && "border-white/20 text-foreground/40 line-through",
              turno.estado === "COMPLETADO" && "border-epr-green bg-epr-green/15 text-epr-green",
              turno.estado === "AUSENTE" && "border-red-500/40 text-red-400",
            )}
          >
            {ESTADO_LABEL[turno.estado]}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <DashboardHeader usuario={usuario} />
      <section className="min-h-[calc(100vh-7rem)] bg-epr-dark px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
            Mis turnos
          </h1>
          <p className="mt-2 font-heading font-light text-foreground/60">
            Cuando termine cada turno, marcá si asististe o no para que quede
            registrado.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {turnos === undefined && (
            <DashboardCard className="mt-6">
              <p className="font-heading font-light text-foreground/50">Cargando...</p>
            </DashboardCard>
          )}

          {turnos === null && (
            <DashboardCard className="mt-6">
              <p className="font-heading font-light text-foreground/50">
                No se pudieron cargar tus turnos.
              </p>
            </DashboardCard>
          )}

          {turnos && turnos.length === 0 && (
            <DashboardCard className="mt-6">
              <p className="font-heading font-light text-foreground/50">
                Todavía no tenés turnos cargados.
              </p>
            </DashboardCard>
          )}

          {turnos && turnos.length > 0 && (
            <>
              <DashboardCard className="mt-6">
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
                  Próximos
                </h2>
                {proximos.length === 0 ? (
                  <p className="mt-4 font-heading font-light text-foreground/50">
                    No tenés turnos próximos.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-col gap-3">{proximos.map(renderTurno)}</div>
                )}
              </DashboardCard>

              <DashboardCard className="mt-6">
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
                  Anteriores
                </h2>
                {anteriores.length === 0 ? (
                  <p className="mt-4 font-heading font-light text-foreground/50">
                    Todavía no tenés turnos anteriores.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-col gap-3">{anteriores.map(renderTurno)}</div>
                )}
              </DashboardCard>
            </>
          )}
        </div>
      </section>
    </>
  );
}
