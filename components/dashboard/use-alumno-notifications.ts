"use client";

import { useCallback, useEffect, useState } from "react";

import { getSession } from "@/lib/auth";
import {
  marcarNotificacionLeida,
  marcarTodasLasNotificacionesLeidas,
  misNotificaciones,
  type Notificacion,
} from "@/lib/api";

const INTERVALO_MS = 45_000;

export function useAlumnoNotifications() {
  const [items, setItems] = useState<Notificacion[]>([]);

  const cargar = useCallback(async () => {
    const session = getSession();
    if (!session) return;
    const data = await misNotificaciones(session.token);
    if (data) setItems(data);
  }, []);

  useEffect(() => {
    // Primer fetch al montar; el estado no se puede derivar durante el
    // render porque depende de una llamada a la API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
    const interval = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(interval);
  }, [cargar]);

  async function marcarLeida(id: number) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    const session = getSession();
    if (!session) return;
    try {
      await marcarNotificacionLeida(session.token, id);
    } catch (error) {
      console.error("No se pudo marcar la notificación como leída:", error);
    }
  }

  async function marcarTodasLeidas() {
    setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
    const session = getSession();
    if (!session) return;
    try {
      await marcarTodasLasNotificacionesLeidas(session.token);
    } catch (error) {
      console.error("No se pudieron marcar las notificaciones como leídas:", error);
    }
  }

  const noLeidas = items.filter((n) => !n.leida).length;

  return { items, noLeidas, marcarLeida, marcarTodasLeidas };
}
