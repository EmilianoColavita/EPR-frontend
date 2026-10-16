"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { getSession } from "@/lib/auth";
import {
  listComprobantesPendientes,
  listSolicitudesEvaluacion,
  marcarNotificacionLeida,
  misNotificaciones,
} from "@/lib/api";
import { seccionDeHref } from "./admin-nav-items";

export type AdminNotificacion = {
  id: string;
  titulo: string;
  subtitulo: string;
  fecha: string;
  href: string;
  // href del item del menú lateral al que pertenece (ej: "/panel/admin/alumnos"),
  // para marcar con un globito en qué sección está lo pendiente.
  seccion: string | null;
  // Presente solo en los avisos puntuales (tabla Notificacion, ej: "alumno
  // nuevo registrado"). Los que vienen de colas en vivo (comprobantes,
  // solicitudes) no lo tienen: esos se resuelven solos desde su propia
  // pantalla, no hace falta marcarlos como leídos acá.
  notificacionId?: number;
};

type AdminNotificationsValue = {
  items: AdminNotificacion[];
  count: number;
  loading: boolean;
  porSeccion: Record<string, number>;
  refetch: () => Promise<void>;
  marcarLeida: (notificacionId: number) => Promise<void>;
  marcarSeccionVista: (seccion: string) => void;
};

const INTERVALO_MS = 45_000;

const AdminNotificationsContext = createContext<AdminNotificationsValue | null>(null);

// El contador de notificaciones se arma agregando las distintas colas de
// "pendiente de revisión" que ya existen en la app (comprobantes de pago,
// solicitudes de evaluación) más los avisos puntuales dirigidos al admin
// (tabla Notificacion, ej: alumno nuevo registrado). Las colas en vivo no
// tienen estado de leído propio — se resuelven al confirmar/rechazar o
// marcar finalizada desde su pantalla. Los avisos puntuales sí se marcan
// como leídos explícitamente (ver marcarLeida), o al entrar a su sección.
//
// Vive en un provider para que la campanita y el menú lateral compartan el
// mismo estado (y no dupliquen el polling).
export function AdminNotificationsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [items, setItems] = useState<AdminNotificacion[]>([]);
  const [loading, setLoading] = useState(true);
  // Copia sincrónica de items, para leerla apenas termina un fetch (el state
  // recién se actualiza en el próximo render).
  const itemsRef = useRef<AdminNotificacion[]>([]);
  // Avisos ya marcados como leídos en esta sesión: si un fetch salió antes de
  // que el backend registrara la lectura, no los vuelve a mostrar.
  const leidasRef = useRef<Set<number>>(new Set());

  const cargar = useCallback(async () => {
    const session = getSession();
    if (!session) return;

    const [comprobantes, solicitudes, notificaciones] = await Promise.all([
      listComprobantesPendientes(session.token),
      listSolicitudesEvaluacion(session.token),
      misNotificaciones(session.token),
    ]);

    const deComprobantes = (comprobantes ?? []).map((c) => {
      const href = `/panel/admin/alumnos/${c.alumno.id}/cuenta`;
      return {
        id: `comprobante-${c.id}`,
        titulo: `${c.alumno.nombre} ${c.alumno.apellido}`,
        subtitulo: "Comprobante de pago pendiente de revisión",
        fecha: c.fecha,
        href,
        seccion: seccionDeHref(href),
      };
    });

    const deSolicitudes = (solicitudes ?? [])
      .filter((s) => s.estado === "PENDIENTE")
      .map((s) => {
        const href = "/panel/admin/solicitudes";
        return {
          id: `solicitud-${s.id}`,
          titulo: s.nombreCompleto,
          subtitulo: "Reservó una evaluación",
          fecha: s.fechaSolicitud,
          href,
          seccion: seccionDeHref(href),
        };
      });

    const deNotificaciones = (notificaciones ?? [])
      .filter((n) => !n.leida && !leidasRef.current.has(n.id))
      .map((n) => {
        const href = n.href ?? "/panel/admin/alumnos";
        return {
          id: `notificacion-${n.id}`,
          titulo: n.titulo,
          subtitulo: n.mensaje,
          fecha: n.fecha,
          href,
          seccion: seccionDeHref(href),
          notificacionId: n.id,
        };
      });

    const lista = [...deComprobantes, ...deSolicitudes, ...deNotificaciones].sort((a, b) =>
      b.fecha.localeCompare(a.fecha),
    );
    itemsRef.current = lista;
    setItems(lista);
    setLoading(false);
  }, []);

  // El primer fetch lo hace el efecto de cambio de ruta (corre al montar).
  useEffect(() => {
    const interval = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(interval);
  }, [cargar]);

  const marcarLeida = useCallback(async (notificacionId: number) => {
    leidasRef.current.add(notificacionId);
    itemsRef.current = itemsRef.current.filter((i) => i.notificacionId !== notificacionId);
    setItems(itemsRef.current);
    const session = getSession();
    if (!session) return;
    try {
      await marcarNotificacionLeida(session.token, notificacionId);
    } catch (error) {
      console.error("No se pudo marcar la notificación como leída:", error);
    }
  }, []);

  // Da por vistos los avisos puntuales de una sección (ej: "alumno nuevo
  // registrado" al entrar a Alumnos o al operar sobre un alumno). Las colas
  // en vivo (comprobantes, solicitudes) no se tocan: esas se van solas
  // cuando se resuelven, y el refetch las saca.
  const marcarSeccionVista = useCallback(
    (seccion: string) => {
      for (const item of itemsRef.current) {
        if (item.notificacionId != null && item.seccion === seccion) {
          marcarLeida(item.notificacionId);
        }
      }
      cargar();
    },
    [cargar, marcarLeida],
  );

  // Al navegar a una sección: se refrescan las colas en vivo (por si se acaba
  // de resolver algo, ej: confirmar un comprobante) y los avisos puntuales de
  // esa sección se dan por vistos. Se espera al fetch porque cada página monta
  // su propio AdminShell: al llegar, la lista todavía está vacía.
  useEffect(() => {
    let cancelado = false;
    const seccionActual = seccionDeHref(pathname);
    cargar().then(() => {
      if (!cancelado && seccionActual) marcarSeccionVista(seccionActual);
    });
    return () => {
      cancelado = true;
    };
  }, [pathname, cargar, marcarSeccionVista]);

  const value = useMemo<AdminNotificationsValue>(() => {
    const porSeccion: Record<string, number> = {};
    for (const item of items) {
      if (item.seccion) porSeccion[item.seccion] = (porSeccion[item.seccion] ?? 0) + 1;
    }
    return {
      items,
      count: items.length,
      loading,
      porSeccion,
      refetch: cargar,
      marcarLeida,
      marcarSeccionVista,
    };
  }, [items, loading, cargar, marcarLeida, marcarSeccionVista]);

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications(): AdminNotificationsValue {
  const ctx = useContext(AdminNotificationsContext);
  if (!ctx) {
    throw new Error("useAdminNotifications se usa dentro de <AdminNotificationsProvider>.");
  }
  return ctx;
}
