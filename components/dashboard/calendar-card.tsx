"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  buildMonthGrid,
  MONTH_LABELS,
  toDateKey,
  WEEKDAY_LABELS,
} from "@/lib/calendar";
import { DashboardCard } from "./dashboard-card";
import { AttendanceRing } from "./attendance-ring";

type AttendanceStatus = "completed" | "pending";

// TODO: reemplazar por datos reales de GET /api/v1/asistencias?mes=... cuando
// esté el endpoint. Por ahora solo genera marcas ilustrativas para el mes
// real actual (los demás meses navegados quedan sin marcas).
function buildMockAttendance(
  year: number,
  month: number,
): Record<string, AttendanceStatus> {
  const today = new Date();
  if (today.getFullYear() !== year || today.getMonth() !== month) return {};

  const status: Record<string, AttendanceStatus> = {};
  status[toDateKey(today)] = "pending";

  for (let offset = 2; offset <= 12; offset += 3) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    if (d.getMonth() === month) {
      status[toDateKey(d)] = "completed";
    }
  }
  return status;
}

const MOCK_ATTENDANCE_PERCENT = 90;

export function CalendarCard() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const weeks = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const attendance = useMemo(
    () => buildMockAttendance(year, month),
    [year, month],
  );

  function goToPrevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <DashboardCard className="flex flex-col items-center">
      <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground">
        Mi calendario
      </h2>

      <div className="mt-6 flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={goToPrevMonth}
          aria-label="Mes anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-foreground/70 transition-colors hover:border-epr-green hover:text-epr-green"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="rounded-lg border border-white/15 px-4 py-1.5 font-heading text-sm text-foreground">
          {MONTH_LABELS[month]} {year}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Mes siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-foreground/70 transition-colors hover:border-epr-green hover:text-epr-green"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <table className="mt-6 w-full border-collapse text-center">
        <thead>
          <tr>
            <th className="w-6 pb-2" />
            {WEEKDAY_LABELS.map((label) => (
              <th
                key={label}
                className="pb-2 font-heading text-xs font-light uppercase text-foreground/50"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.weekNumber}>
              <td className="pr-1 text-right font-heading text-[10px] text-foreground/30">
                {week.weekNumber}
              </td>
              {week.days.map((cell) => {
                const status = attendance[cell.key];
                return (
                  <td key={cell.key} className="py-1">
                    <span
                      className={cn(
                        "mx-auto flex h-7 w-7 items-center justify-center rounded-full font-heading text-xs",
                        !cell.inCurrentMonth && "text-foreground/25",
                        cell.inCurrentMonth &&
                          !status &&
                          !cell.isWeekend &&
                          "text-foreground/80",
                        cell.inCurrentMonth &&
                          !status &&
                          cell.isWeekend &&
                          "text-sky-400/80",
                        status === "completed" &&
                          "border border-epr-green bg-epr-green/20 text-epr-green",
                        status === "pending" &&
                          "border border-epr-green/60 text-epr-green",
                      )}
                    >
                      {cell.day}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex w-full flex-col gap-2 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-epr-green bg-epr-green/20 text-epr-green">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
          <span className="font-heading text-xs font-light text-foreground/60">
            Entrenamiento completado
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border border-epr-green/60" />
          <span className="font-heading text-xs font-light text-foreground/60">
            Entrenamiento pendiente
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full bg-white/15" />
          <span className="font-heading text-xs font-light text-foreground/60">
            Sin actividad
          </span>
        </div>
      </div>

      <div className="mt-6">
        <AttendanceRing
          percent={MOCK_ATTENDANCE_PERCENT}
          message="¡Excelente trabajo!"
        />
      </div>
    </DashboardCard>
  );
}
