"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getSession } from "@/lib/auth";
import { actualizarEstadoTurno, listTurnos, type EstadoTurno, type Turno } from "@/lib/api";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { cn } from "@/lib/utils";

const ESTADO_LABEL: Record<EstadoTurno, string> = {
  CONFIRMADO: "Confirmado",
  CANCELADO: "Cancelado",
  COMPLETADO: "Completado",
};

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function TurnosPage() {
  const [fecha, setFecha] = useState(todayISO);
  // undefined = cargando, null = no se pudo obtener
  const [turnos, setTurnos] = useState<Turno[] | null | undefined>(undefined);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  function reload() {
    const session = getSession();
    if (!session) return;
    listTurnos(session.token, { desde: fecha, hasta: fecha }).then(setTurnos);
  }

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listTurnos(session.token, { desde: fecha, hasta: fecha }).then(setTurnos);
  }, [fecha]);

  async function handleEstado(id: number, estado: EstadoTurno) {
    const session = getSession();
    if (!session) return;

    setUpdatingId(id);
    try {
      await actualizarEstadoTurno(session.token, id, estado);
      reload();
    } catch (error) {
      console.error("No se pudo actualizar el turno:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  const ordenados = (turnos ?? [])
    .slice()
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
        Turnos
      </h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setFecha((f) => shiftDate(f, -1))}
          aria-label="Día anterior"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-foreground/70 transition-colors hover:border-epr-green hover:text-epr-green"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="rounded-xl border border-white/15 bg-epr-dark px-4 py-2 font-sans text-foreground outline-none transition-colors focus:border-epr-green"
        />
        <button
          type="button"
          onClick={() => setFecha((f) => shiftDate(f, 1))}
          aria-label="Día siguiente"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-foreground/70 transition-colors hover:border-epr-green hover:text-epr-green"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setFecha(todayISO())}
          className="font-heading text-sm text-epr-green hover:underline"
        >
          Hoy
        </button>
      </div>

      <DashboardCard className="mt-6">
        {turnos === undefined && (
          <p className="font-heading font-light text-foreground/50">Cargando...</p>
        )}

        {turnos === null && (
          <p className="font-heading font-light text-foreground/50">
            No se pudo cargar la agenda.
          </p>
        )}

        {turnos && turnos.length === 0 && (
          <p className="font-heading font-light text-foreground/50">
            No hay turnos cargados para este día.
          </p>
        )}

        {turnos && turnos.length > 0 && (
          <div className="flex flex-col gap-3">
            {ordenados.map((turno) => (
              <div
                key={turno.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 p-4"
              >
                <span className="w-24 shrink-0 font-heading text-epr-green">
                  {turno.horaInicio}
                  {turno.horaFin && `–${turno.horaFin}`}
                </span>
                <div className="min-w-[160px] flex-1">
                  <p className="font-heading font-semibold text-foreground">
                    {turno.alumno.nombre} {turno.alumno.apellido}
                  </p>
                  <p className="font-heading text-sm font-light text-foreground/60">
                    {turno.actividad}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 font-heading text-xs uppercase",
                    turno.estado === "CONFIRMADO" && "border-epr-green/50 text-epr-green",
                    turno.estado === "CANCELADO" && "border-red-500/40 text-red-400",
                    turno.estado === "COMPLETADO" && "border-white/20 text-foreground/50",
                  )}
                >
                  {ESTADO_LABEL[turno.estado]}
                </span>
                {turno.estado === "CONFIRMADO" && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={updatingId === turno.id}
                      onClick={() => handleEstado(turno.id, "COMPLETADO")}
                      className="font-heading text-sm text-foreground/70 transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      Marcar hecho
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === turno.id}
                      onClick={() => handleEstado(turno.id, "CANCELADO")}
                      className="font-heading text-sm text-red-400 hover:underline disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
