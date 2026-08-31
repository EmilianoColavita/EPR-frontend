"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { getSession, type Usuario } from "@/lib/auth";
import { asignarRutina, getAlumnoRutina, listUsuarios, type Rutina, type RutinaResumen } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SeleccionarRutinaModal } from "./seleccionar-rutina-modal";

export function AlumnoRutinaPage({ alumnoId }: { alumnoId: number }) {
  const [alumno, setAlumno] = useState<Usuario | null | undefined>(undefined);
  const [rutina, setRutina] = useState<Rutina | "sin-rutina" | null | undefined>(
    undefined,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [asignando, setAsignando] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listUsuarios(session.token, "ALUMNO").then((alumnos) => {
      setAlumno(alumnos?.find((a) => a.id === alumnoId) ?? null);
    });
    getAlumnoRutina(session.token, alumnoId).then(setRutina);
  }, [alumnoId]);

  async function handleSelectRutina(seleccionada: RutinaResumen) {
    const session = getSession();
    if (!session) return;

    setAsignando(true);
    try {
      await asignarRutina(session.token, seleccionada.id, alumnoId);
      const actualizada = await getAlumnoRutina(session.token, alumnoId);
      setRutina(actualizada);
      setModalOpen(false);
    } catch (error) {
      console.error("No se pudo asignar la rutina:", error);
    } finally {
      setAsignando(false);
    }
  }

  if (alumno === undefined || rutina === undefined) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="font-heading font-light text-foreground/50">Cargando...</p>
      </div>
    );
  }

  if (alumno === null) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="font-heading font-light text-foreground/50">
          No se encontró ese alumno.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <span className="font-display text-sm uppercase tracking-widest text-epr-green">
        {alumno.nombre} {alumno.apellido}
      </span>
      <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
        Rutina asignada
      </h1>

      <DashboardCard className="mt-6">
        {(rutina === "sin-rutina" || rutina === null) && (
          <p className="font-heading font-light text-foreground/50">
            Este alumno todavía no tiene una rutina asignada.
          </p>
        )}

        {rutina && rutina !== "sin-rutina" && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
                {rutina.nombre}
              </p>
              {rutina.descripcion && (
                <p className="font-heading font-light text-foreground/60">
                  {rutina.descripcion}
                </p>
              )}
              <p className="mt-1 font-heading text-sm font-light text-foreground/50">
                {rutina.dias.length} día{rutina.dias.length !== 1 && "s"} cargado
                {rutina.dias.length !== 1 && "s"}
              </p>
            </div>
            <Link
              href={`/panel/admin/rutinas/${rutina.id}`}
              className={buttonVariants({ variant: "outline", font: "heading" })}
            >
              <Pencil className="h-4 w-4" />
              Editar rutina
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={asignando}
          className={buttonVariants({
            variant: "primary",
            font: "heading",
            className: "mt-6",
          })}
        >
          {rutina && rutina !== "sin-rutina" ? "Cambiar rutina" : "Asignar rutina"}
        </button>
      </DashboardCard>

      {modalOpen && (
        <SeleccionarRutinaModal
          onClose={() => setModalOpen(false)}
          onSelect={handleSelectRutina}
          busy={asignando}
        />
      )}
    </div>
  );
}
