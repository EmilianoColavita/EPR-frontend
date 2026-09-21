"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, UserPlus } from "lucide-react";

import { getSession, type Usuario } from "@/lib/auth";
import {
  asignarRutina,
  getRutinaById,
  listRutinas,
  type Rutina,
  type RutinaResumen,
} from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { EjercicioStats } from "@/components/ui/ejercicio-stats";
import { EjercicioVideoButton } from "@/components/ui/ejercicio-video-button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { cn } from "@/lib/utils";
import { SeleccionarAlumnoModal } from "./seleccionar-alumno-modal";

function DetalleRutina({ detalle }: { detalle: Rutina | null | undefined }) {
  if (detalle === undefined) {
    return <p className="font-heading font-light text-foreground/50">Cargando...</p>;
  }
  if (detalle === null) {
    return (
      <p className="font-heading font-light text-foreground/50">
        No se pudo cargar el detalle.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {detalle.dias.map((dia) => (
        <div key={dia.id}>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">
            {dia.nombre || `Día ${dia.numero}`}
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {dia.bloques.length === 0 && (
              <p className="font-heading text-sm font-light text-foreground/40">
                Sin bloques cargados.
              </p>
            )}
            {dia.bloques.map((bloque) => (
              <div key={bloque.id}>
                <p className="font-heading text-xs font-light uppercase tracking-wider text-foreground/50">
                  {bloque.nombre || `Bloque ${bloque.numero}`}
                </p>
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {bloque.ejercicios.length === 0 && (
                    <p className="font-heading text-sm font-light text-foreground/40">
                      Sin ejercicios cargados.
                    </p>
                  )}
                  {bloque.ejercicios.map((ej) => (
                    <div
                      key={ej.id}
                      className="flex flex-col gap-1.5 border-b border-white/5 pb-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-heading text-foreground/90">{ej.nombre}</span>
                        <EjercicioVideoButton url={ej.videoUrl} />
                      </span>
                      <EjercicioStats ejercicio={ej} className="sm:justify-end" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RutinasPage() {
  // undefined = cargando, null = no se pudo obtener
  const [rutinas, setRutinas] = useState<RutinaResumen[] | null | undefined>(
    undefined,
  );
  const [asignandoRutinaId, setAsignandoRutinaId] = useState<number | null>(null);
  const [asignando, setAsignando] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  // undefined = todavía no se pidió / está cargando, null = no se pudo obtener
  const [detalles, setDetalles] = useState<Record<number, Rutina | null | undefined>>(
    {},
  );

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listRutinas(session.token).then(setRutinas);
  }, []);

  async function toggleExpand(rutinaId: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rutinaId)) {
        next.delete(rutinaId);
      } else {
        next.add(rutinaId);
      }
      return next;
    });

    if (!(rutinaId in detalles)) {
      const session = getSession();
      if (!session) return;
      setDetalles((prev) => ({ ...prev, [rutinaId]: undefined }));
      const rutina = await getRutinaById(session.token, rutinaId);
      setDetalles((prev) => ({
        ...prev,
        [rutinaId]: rutina === "sin-rutina" ? null : rutina,
      }));
    }
  }

  async function handleAsignar(alumno: Usuario) {
    const session = getSession();
    if (!session || asignandoRutinaId === null) return;

    setAsignando(true);
    try {
      await asignarRutina(session.token, asignandoRutinaId, alumno.id);
      const actualizadas = await listRutinas(session.token);
      setRutinas(actualizadas);
      setAsignandoRutinaId(null);
    } catch (error) {
      console.error("No se pudo asignar la rutina:", error);
    } finally {
      setAsignando(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
          Rutinas
        </h1>
        <Link
          href="/panel/admin/rutinas/nueva"
          className={buttonVariants({ variant: "primary", font: "heading" })}
        >
          <Plus className="h-4 w-4" />
          Nueva rutina
        </Link>
      </div>

      <DashboardCard className="mt-6">
        {rutinas === undefined && (
          <p className="font-heading font-light text-foreground/50">
            Cargando...
          </p>
        )}

        {rutinas === null && (
          <p className="font-heading font-light text-foreground/50">
            No se pudo cargar la lista de rutinas.
          </p>
        )}

        {rutinas && rutinas.length === 0 && (
          <p className="font-heading font-light text-foreground/50">
            Todavía no hay ninguna rutina cargada.
          </p>
        )}

        {rutinas && rutinas.length > 0 && (
          <div className="flex flex-col gap-3 md:hidden">
            {rutinas.map((rutina) => {
              const expanded = expandedIds.has(rutina.id);
              const detalle = detalles[rutina.id];
              return (
                <div key={rutina.id} className="rounded-xl border border-white/10 p-4">
                  <p className="font-heading font-semibold text-foreground">{rutina.nombre}</p>
                  {rutina.descripcion && (
                    <p className="font-heading text-sm font-light text-foreground/50">
                      {rutina.descripcion}
                    </p>
                  )}
                  <p className="mt-1 font-heading text-sm font-light text-foreground/60">
                    {rutina.cantidadDias} días · {rutina.cantidadAlumnosAsignados} alumnos asignados
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(rutina.id)}
                      aria-expanded={expanded}
                      className="inline-flex items-center gap-1.5 font-heading text-sm text-foreground/70 hover:text-foreground"
                    >
                      Ver
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          expanded && "rotate-180",
                        )}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAsignandoRutinaId(rutina.id)}
                      className="inline-flex items-center gap-1.5 font-heading text-sm text-epr-green hover:underline"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Asignar
                    </button>
                    <Link
                      href={`/panel/admin/rutinas/${rutina.id}`}
                      className="font-heading text-sm text-foreground/70 hover:text-foreground hover:underline"
                    >
                      Editar
                    </Link>
                  </div>

                  {expanded && (
                    <div className="mt-3 rounded-lg bg-black/20 p-3">
                      <DetalleRutina detalle={detalle} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {rutinas && rutinas.length > 0 && (
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Rutina
                  </th>
                  <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Días
                  </th>
                  <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Alumnos asignados
                  </th>
                  <th className="pb-3" />
                  <th className="pb-3" />
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {rutinas.map((rutina) => {
                  const expanded = expandedIds.has(rutina.id);
                  const detalle = detalles[rutina.id];
                  return (
                  <Fragment key={rutina.id}>
                  <tr
                    className="border-b border-white/5 last:border-b-0"
                  >
                    <td className="py-3">
                      <p className="font-heading font-semibold text-foreground">
                        {rutina.nombre}
                      </p>
                      {rutina.descripcion && (
                        <p className="font-heading text-sm font-light text-foreground/50">
                          {rutina.descripcion}
                        </p>
                      )}
                    </td>
                    <td className="py-3 font-heading font-light text-foreground/60">
                      {rutina.cantidadDias}
                    </td>
                    <td className="py-3 font-heading font-light text-foreground/60">
                      {rutina.cantidadAlumnosAsignados}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleExpand(rutina.id)}
                        aria-expanded={expanded}
                        className="inline-flex items-center gap-1.5 font-heading text-sm text-foreground/70 hover:text-foreground"
                      >
                        Ver
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            expanded && "rotate-180",
                          )}
                        />
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setAsignandoRutinaId(rutina.id)}
                        className="inline-flex items-center gap-1.5 font-heading text-sm text-epr-green hover:underline"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Asignar
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/panel/admin/rutinas/${rutina.id}`}
                        className="font-heading text-sm text-foreground/70 hover:text-foreground hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="border-b border-white/5 last:border-b-0">
                      <td colSpan={5} className="bg-black/20 px-4 py-4">
                        <DetalleRutina detalle={detalle} />
                      </td>
                    </tr>
                  )}
                  </Fragment>
                );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      {asignandoRutinaId !== null && (
        <SeleccionarAlumnoModal
          onClose={() => setAsignandoRutinaId(null)}
          onSelect={handleAsignar}
          busy={asignando}
        />
      )}
    </div>
  );
}
