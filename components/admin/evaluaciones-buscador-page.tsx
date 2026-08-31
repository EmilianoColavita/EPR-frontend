"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

import { getSession, type Usuario } from "@/lib/auth";
import { listUsuarios } from "@/lib/api";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EvaluacionesPanel } from "./evaluaciones-panel";

export function EvaluacionesBuscadorPage() {
  // undefined = cargando, null = no se pudo obtener
  const [alumnos, setAlumnos] = useState<Usuario[] | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [seleccionado, setSeleccionado] = useState<Usuario | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listUsuarios(session.token, "ALUMNO").then(setAlumnos);
  }, []);

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !alumnos) return [];
    return alumnos.filter(
      (a) =>
        `${a.nombre} ${a.apellido}`.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q),
    );
  }, [alumnos, query]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
        Evaluaciones
      </h1>

      {!seleccionado && (
        <>
          <p className="mt-2 font-heading font-light text-foreground/50">
            Buscá un alumno para cargar o ver sus evaluaciones.
          </p>

          <DashboardCard className="mt-6">
            <label className="flex flex-col gap-2">
              <span className="font-heading text-xs font-light text-foreground/60">
                Buscar por nombre, apellido o email
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full rounded-xl border border-white/15 bg-epr-dark py-3 pl-11 pr-4 font-sans text-foreground outline-none transition-colors focus:border-epr-green"
                />
              </div>
            </label>

            {alumnos === null && (
              <p className="mt-3 font-heading font-light text-foreground/50">
                No se pudo cargar la lista de alumnos.
              </p>
            )}

            {query.trim().length > 0 && alumnos && resultados.length === 0 && (
              <p className="mt-3 font-heading font-light text-foreground/50">
                No se encontraron alumnos para &quot;{query}&quot;.
              </p>
            )}

            {resultados.length > 0 && (
              <div className="mt-3 flex flex-col gap-1">
                {resultados.map((alumno) => (
                  <button
                    key={alumno.id}
                    type="button"
                    onClick={() => {
                      setSeleccionado(alumno);
                      setQuery("");
                    }}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/5"
                  >
                    <span className="font-heading font-semibold text-foreground">
                      {alumno.nombre} {alumno.apellido}
                    </span>
                    <span className="font-heading text-sm font-light text-foreground/50">
                      {alumno.email}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </DashboardCard>
        </>
      )}

      {seleccionado && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setSeleccionado(null)}
            className="mb-4 flex items-center gap-1.5 font-heading text-sm text-foreground/60 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Buscar otro alumno
          </button>

          <EvaluacionesPanel alumnoId={seleccionado.id} />
        </div>
      )}
    </div>
  );
}
