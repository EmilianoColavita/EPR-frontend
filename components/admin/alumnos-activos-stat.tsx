"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

import { getSession } from "@/lib/auth";
import { listUsuarios } from "@/lib/api";
import { StatCard } from "./stat-card";

export function AlumnosActivosStat() {
  // undefined = cargando, null = no se pudo obtener
  const [count, setCount] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listUsuarios(session.token, "ALUMNO").then((alumnos) => {
      setCount(alumnos ? alumnos.filter((a) => a.activo).length : null);
    });
  }, []);

  return (
    <StatCard
      icon={Users}
      label="Alumnos activos"
      value={count ?? "—"}
      href="/panel/admin/alumnos"
      linkLabel="Ver alumnos"
    />
  );
}
