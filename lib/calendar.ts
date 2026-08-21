export type DayCell = {
  date: Date;
  key: string; // YYYY-MM-DD, sirve como key de React y de lookup en statusByDate
  day: number;
  inCurrentMonth: boolean;
  isWeekend: boolean;
};

export type WeekRow = {
  weekNumber: number;
  days: DayCell[];
};

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Numero de semana ISO 8601 (semanas empiezan el lunes).
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstThursdayDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDay + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
}

// Grilla de 6 semanas (Lunes a Domingo) para el mes dado, incluyendo los
// dias del mes anterior/siguiente que completan la primera y ultima semana.
export function buildMonthGrid(year: number, month: number): WeekRow[] {
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // Lunes = 0
  const cursor = new Date(year, month, 1 - firstWeekday);

  const weeks: WeekRow[] = [];
  for (let w = 0; w < 6; w++) {
    const days: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      days.push({
        date: new Date(cursor),
        key: toDateKey(cursor),
        day: cursor.getDate(),
        inCurrentMonth: cursor.getMonth() === month,
        isWeekend: d >= 5,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push({ weekNumber: getISOWeekNumber(days[0].date), days });
  }
  return weeks;
}

export const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
