import type { Turno } from "@/lib/api";
import { toDateKey } from "@/lib/calendar";

// Evento que se dispara cuando el alumno cambia el estado de un turno, para
// que otras tarjetas del panel (ej: el calendario) vuelvan a cargar.
export const TURNOS_ACTUALIZADOS_EVENT = "epr:turnos-actualizados";

export function avisarTurnosActualizados() {
  window.dispatchEvent(new Event(TURNOS_ACTUALIZADOS_EVENT));
}

// Solo se puede marcar asistencia de un turno confirmado que ya empezó
// (el backend valida lo mismo).
export function puedeMarcarAsistencia(turno: Turno, ahora: Date): boolean {
  if (turno.estado !== "CONFIRMADO") return false;
  const hoyKey = toDateKey(ahora);
  if (turno.fecha < hoyKey) return true;
  if (turno.fecha > hoyKey) return false;
  const horaActual = `${String(ahora.getHours()).padStart(2, "0")}:${String(
    ahora.getMinutes(),
  ).padStart(2, "0")}`;
  return turno.horaInicio.slice(0, 5) <= horaActual;
}
