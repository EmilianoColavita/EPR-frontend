"use client";

import { useCallback, useEffect, useState } from "react";

import { getSession } from "@/lib/auth";
import {
  listComprobantesPendientes,
  listSolicitudesEvaluacion,
  marcarNotificacionLeida,
  misNotificaciones,
} from "@/lib/api";

export type AdminNotificacion = {
  id: string;
  titulo: string;
  subtitulo: string;
  fecha: string;
  href: string;
  // Presente solo en los avisos puntuales (tabla Notificacion, ej: "alumno
  // nuevo registrado"). Los que vienen de colas en vivo (comprobantes,
  // solicitudes) no lo tienen: esos se resuelven solos desde su propia
  // pantalla, no hace falta marcarlos como leídos acá.
  notificacionId?: number;
};

const INTERVALO_MS = 45_000;

// El contador de notificaciones se arma agregando las distintas colas de
// "pendiente de revisión" que ya existen en la app (comprobantes de pago,
// solicitudes de evaluación) más los avisos puntuales dirigidos al admin
// (tabla Notificacion, ej: alumno nuevo registrado). Las colas en vivo no
// tienen estado de leído propio — se resuelven al confirmar/rechazar o
// marcar finalizada desde su pantalla. Los avisos puntuales sí se marcan
// como leídos explícitamente (ver marcarLeida).
export function useAdminNotifications() {
  const [items, setItems] = useState<AdminNotificacion[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    const session = getSession();
    if (!session) return;

    const [comprobantes, solicitudes, notificaciones] = await Promise.all([
      listComprobantesPendientes(session.token),
      listSolicitudesEvaluacion(session.token),
      misNotificaciones(session.token),
    ]);

    const deComprobantes: AdminNotificacion[] = (comprobantes ?? []).map((c) => ({
      id: `comprobante-${c.id}`,
      titulo: `${c.alumno.nombre} ${c.alumno.apellido}`,
      subtitulo: "Comprobante de pago pendiente de revisión",
      fecha: c.fecha,
      href: `/panel/admin/alumnos/${c.alumno.id}/cuenta`,
    }));

    const deSolicitudes: AdminNotificacion[] = (solicitudes ?? [])
      .filter((s) => s.estado === "PENDIENTE")
      .map((s) => ({
        id: `solicitud-${s.id}`,
        titulo: s.nombreCompleto,
        subtitulo: "Reservó una evaluación",
        fecha: s.fechaSolicitud,
        href: "/panel/admin/solicitudes",
      }));

    const deNotificaciones: AdminNotificacion[] = (notificaciones ?? [])
      .filter((n) => !n.leida)
      .map((n) => ({
        id: `notificacion-${n.id}`,
        titulo: n.titulo,
        subtitulo: n.mensaje,
        fecha: n.fecha,
        href: n.href ?? "/panel/admin/alumnos",
        notificacionId: n.id,
      }));

    setItems(
      [...deComprobantes, ...deSolicitudes, ...deNotificaciones].sort((a, b) =>
        b.fecha.localeCompare(a.fecha),
      ),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    // Primer fetch al montar; el estado no se puede derivar durante el
    // render porque depende de una llamada a la API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
    const interval = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(interval);
  }, [cargar]);

  async function marcarLeida(notificacionId: number) {
    setItems((prev) => prev.filter((i) => i.notificacionId !== notificacionId));
    const session = getSession();
    if (!session) return;
    try {
      await marcarNotificacionLeida(session.token, notificacionId);
    } catch (error) {
      console.error("No se pudo marcar la notificación como leída:", error);
    }
  }

  return { items, count: items.length, loading, refetch: cargar, marcarLeida };
}
