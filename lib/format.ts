const MONTHS_ES_SHORT = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

// Acepta tanto fechas ISO (YYYY-MM-DD) como datetime ISO (YYYY-MM-DDTHH:mm:ss).
export function formatDateShort(isoDateOrDateTime: string): string {
  const datePart = isoDateOrDateTime.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  return `${String(day).padStart(2, "0")} ${MONTHS_ES_SHORT[month - 1]} ${year}`;
}

// Días transcurridos desde una fecha ISO hasta hoy (positivo si ya pasó).
export function diasDesde(isoDate: string): number {
  const fecha = new Date(`${isoDate.slice(0, 10)}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((hoy.getTime() - fecha.getTime()) / 86_400_000);
}

// A partir de cuántos días de atraso una cuota pendiente pasa a mostrarse
// como "Vencido" (más urgente) en vez de "Pendiente".
export const DIAS_PARA_VENCIDO = 20;

export function esVencido(proximoVencimiento: string | null): boolean {
  return proximoVencimiento != null && diasDesde(proximoVencimiento) > DIAS_PARA_VENCIDO;
}
