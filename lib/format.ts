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
