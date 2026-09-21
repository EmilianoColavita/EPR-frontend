"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { getSession } from "@/lib/auth";
import {
  actualizarEstadoSolicitud,
  eliminarSolicitud,
  listSolicitudesEvaluacion,
  type EstadoSolicitudEvaluacion,
  type SolicitudEvaluacion,
} from "@/lib/api";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

const ESTADO_LABEL: Record<EstadoSolicitudEvaluacion, string> = {
  PENDIENTE: "Pendiente",
  CONTACTADO: "Contactado",
  COMPLETADA: "Finalizada",
};

type Filtro = "PENDIENTE" | "COMPLETADA" | "TODAS";

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "COMPLETADA", label: "Finalizadas" },
  { value: "TODAS", label: "Todas" },
];

export function SolicitudesPage() {
  // undefined = cargando, null = no se pudo obtener
  const [solicitudes, setSolicitudes] = useState<
    SolicitudEvaluacion[] | null | undefined
  >(undefined);
  const [filtro, setFiltro] = useState<Filtro>("PENDIENTE");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [confirmandoBorrarId, setConfirmandoBorrarId] = useState<number | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listSolicitudesEvaluacion(session.token).then(setSolicitudes);
  }, []);

  async function handleAvanzar(
    solicitud: SolicitudEvaluacion,
    nuevoEstado: EstadoSolicitudEvaluacion,
  ) {
    const session = getSession();
    if (!session) return;

    setUpdatingId(solicitud.id);
    try {
      const actualizada = await actualizarEstadoSolicitud(
        session.token,
        solicitud.id,
        nuevoEstado,
      );
      setSolicitudes((prev) =>
        prev ? prev.map((s) => (s.id === solicitud.id ? actualizada : s)) : prev,
      );
    } catch (error) {
      console.error("No se pudo actualizar la solicitud:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleEliminar(solicitud: SolicitudEvaluacion) {
    const session = getSession();
    if (!session) return;

    setUpdatingId(solicitud.id);
    try {
      await eliminarSolicitud(session.token, solicitud.id);
      setSolicitudes((prev) =>
        prev ? prev.filter((s) => s.id !== solicitud.id) : prev,
      );
      setConfirmandoBorrarId(null);
    } catch (error) {
      console.error("No se pudo eliminar la solicitud:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  const conteos = (solicitudes ?? []).reduce(
    (acc, s) => {
      acc[s.estado] += 1;
      return acc;
    },
    { PENDIENTE: 0, CONTACTADO: 0, COMPLETADA: 0 } as Record<
      EstadoSolicitudEvaluacion,
      number
    >,
  );

  const filtradas = (solicitudes ?? [])
    .filter((s) => filtro === "TODAS" || s.estado === filtro)
    .sort((a, b) => b.id - a.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
        Solicitudes
      </h1>
      <p className="mt-2 font-heading font-light text-foreground/50">
        Pedidos de evaluación desde el botón &quot;Reservar evaluación&quot; del
        sitio.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFiltro(f.value)}
            className={cn(
              "rounded-full border px-4 py-2 font-heading text-sm transition-colors",
              filtro === f.value
                ? "border-epr-green bg-epr-green/20 text-epr-green"
                : "border-white/15 text-foreground/60 hover:border-white/40",
            )}
          >
            {f.label}
            {f.value !== "TODAS" && ` (${conteos[f.value]})`}
          </button>
        ))}
      </div>

      <DashboardCard className="mt-6">
        {solicitudes === undefined && (
          <p className="font-heading font-light text-foreground/50">Cargando...</p>
        )}

        {solicitudes === null && (
          <p className="font-heading font-light text-foreground/50">
            No se pudo cargar la lista de solicitudes.
          </p>
        )}

        {solicitudes && filtradas.length === 0 && (
          <p className="font-heading font-light text-foreground/50">
            No hay solicitudes en este filtro.
          </p>
        )}

        {solicitudes && filtradas.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtradas.map((solicitud) => (
              <div
                key={solicitud.id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-heading font-semibold text-foreground">
                      {solicitud.nombreCompleto}
                    </p>
                    <p className="font-heading text-sm font-light text-foreground/60">
                      {solicitud.email}
                      {solicitud.telefono && ` · ${solicitud.telefono}`}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 font-heading text-xs uppercase",
                      solicitud.estado === "PENDIENTE" &&
                        "border-yellow-500/40 text-yellow-400",
                      solicitud.estado === "CONTACTADO" &&
                        "border-epr-green/50 text-epr-green",
                      solicitud.estado === "COMPLETADA" &&
                        "border-white/20 text-foreground/50",
                    )}
                  >
                    {ESTADO_LABEL[solicitud.estado]}
                  </span>
                </div>

                <div className="font-heading text-sm font-light text-foreground/60">
                  Pedida el {formatDateShort(solicitud.fechaSolicitud)}
                </div>

                {solicitud.objetivo && (
                  <p className="font-heading text-sm font-light text-foreground/70">
                    &quot;{solicitud.objetivo}&quot;
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  {solicitud.estado !== "COMPLETADA" && (
                    <button
                      type="button"
                      disabled={updatingId === solicitud.id}
                      onClick={() => handleAvanzar(solicitud, "COMPLETADA")}
                      className="font-heading text-sm text-epr-green hover:underline disabled:opacity-50"
                    >
                      Marcar finalizada
                    </button>
                  )}

                  {solicitud.estado === "COMPLETADA" &&
                    (confirmandoBorrarId === solicitud.id ? (
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-sm font-light text-foreground/60">
                          ¿Eliminar?
                        </span>
                        <button
                          type="button"
                          disabled={updatingId === solicitud.id}
                          onClick={() => handleEliminar(solicitud)}
                          className="font-heading text-sm text-red-400 hover:underline disabled:opacity-50"
                        >
                          {updatingId === solicitud.id ? "Eliminando..." : "Sí, eliminar"}
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === solicitud.id}
                          onClick={() => setConfirmandoBorrarId(null)}
                          className="font-heading text-sm text-foreground/60 hover:text-foreground disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmandoBorrarId(solicitud.id)}
                        className="flex items-center gap-1.5 font-heading text-sm text-foreground/40 transition-colors hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
