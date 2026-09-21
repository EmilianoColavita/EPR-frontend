"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/format";
import { getSession, type Usuario } from "@/lib/auth";
import { listUsuarios } from "@/lib/api";

export function RecentStudentsCard() {
  // undefined = cargando, null = no se pudo obtener
  const [alumnos, setAlumnos] = useState<Usuario[] | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listUsuarios(session.token, "ALUMNO").then((data) => {
      if (!data) {
        setAlumnos(null);
        return;
      }
      const recientes = [...data]
        .sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro))
        .slice(0, 4);
      setAlumnos(recientes);
    });
  }, []);

  return (
    <DashboardCard>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground">
          Alumnos recientes
        </h2>
        <Link
          href="/panel/admin/alumnos"
          className="font-heading text-sm text-epr-green hover:underline"
        >
          Ver todos
        </Link>
      </div>

      {alumnos === undefined && (
        <p className="mt-4 font-heading font-light text-foreground/50">
          Cargando...
        </p>
      )}

      {alumnos === null && (
        <p className="mt-4 font-heading font-light text-foreground/50">
          No se pudo cargar la lista de alumnos.
        </p>
      )}

      {alumnos && alumnos.length === 0 && (
        <p className="mt-4 font-heading font-light text-foreground/50">
          Todavía no hay alumnos dados de alta.
        </p>
      )}

      {alumnos && alumnos.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 md:hidden">
          {alumnos.map((student) => (
            <div key={student.id} className="rounded-xl border border-white/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-heading font-semibold text-foreground">
                    {student.nombre} {student.apellido}
                  </p>
                  <p className="mt-1 font-heading text-sm font-light text-foreground/60">
                    {student.email}
                  </p>
                  <p className="mt-1 font-heading text-xs font-light text-foreground/40">
                    Alta: {formatDateShort(student.fechaRegistro)}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1 font-heading text-xs uppercase",
                    student.activo
                      ? "border-epr-green/50 text-epr-green"
                      : "border-white/20 text-foreground/50",
                  )}
                >
                  {student.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {alumnos && alumnos.length > 0 && (
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                  Nombre
                </th>
                <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                  Email
                </th>
                <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                  Estado
                </th>
                <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                  Alta
                </th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((student) => (
                <tr key={student.id} className="border-b border-white/5 last:border-b-0">
                  <td className="py-3 font-heading font-semibold text-foreground">
                    {student.nombre} {student.apellido}
                  </td>
                  <td className="py-3 font-heading font-light text-foreground/60">
                    {student.email}
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 font-heading text-xs uppercase",
                        student.activo
                          ? "border-epr-green/50 text-epr-green"
                          : "border-white/20 text-foreground/50",
                      )}
                    >
                      {student.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 font-heading font-light text-foreground/60">
                    {formatDateShort(student.fechaRegistro)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
}
