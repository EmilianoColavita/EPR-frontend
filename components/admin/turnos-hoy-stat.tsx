"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

import { getSession } from "@/lib/auth";
import { listTurnos } from "@/lib/api";
import { toDateKey } from "@/lib/calendar";
import { StatCard } from "./stat-card";

export function TurnosHoyStat() {
  // undefined = cargando, null = no se pudo obtener
  const [count, setCount] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    const hoy = toDateKey(new Date());
    listTurnos(session.token, { desde: hoy, hasta: hoy }).then((turnos) => {
      setCount(turnos ? turnos.filter((t) => t.estado !== "CANCELADO").length : null);
    });
  }, []);

  return (
    <StatCard
      icon={CalendarClock}
      label="Turnos de hoy"
      value={count ?? "—"}
      href="/panel/admin/turnos"
      linkLabel="Ver agenda"
    />
  );
}
