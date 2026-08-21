"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { getSession, type Usuario } from "@/lib/auth";
import { listUsuarios, actualizarActivo } from "@/lib/api";
import { formatDateShort } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { NuevoAlumnoModal } from "./nuevo-alumno-modal";

export function AlumnosPage() {
  // undefined = cargando, null = no se pudo obtener
  const [alumnos, setAlumnos] = useState<Usuario[] | null | undefined>(
    undefined,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listUsuarios(session.token, "ALUMNO").then(setAlumnos);
  }, []);

  async function handleToggle(id: number, next: boolean) {
    const session = getSession();
    if (!session) return;

    setTogglingId(id);
    try {
      const updated = await actualizarActivo(session.token, id, next);
      setAlumnos((prev) =>
        prev ? prev.map((a) => (a.id === id ? updated : a)) : prev,
      );
    } catch (error) {
      console.error("No se pudo actualizar el estado del alumno:", error);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
          Alumnos
        </h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={buttonVariants({ variant: "primary", font: "heading" })}
        >
          <Plus className="h-4 w-4" />
          Dar de alta
        </button>
      </div>

      <DashboardCard className="mt-6">
        {alumnos === undefined && (
          <p className="font-heading font-light text-foreground/50">
            Cargando...
          </p>
        )}

        {alumnos === null && (
          <p className="font-heading font-light text-foreground/50">
            No se pudo cargar la lista de alumnos.
          </p>
        )}

        {alumnos && alumnos.length === 0 && (
          <p className="font-heading font-light text-foreground/50">
            Todavía no hay alumnos dados de alta.
          </p>
        )}

        {alumnos && alumnos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Nombre
                  </th>
                  <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Email
                  </th>
                  <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Teléfono
                  </th>
                  <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Alta
                  </th>
                  <th className="pb-3 text-right font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Activo
                  </th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <tr
                    key={alumno.id}
                    className="border-b border-white/5 last:border-b-0"
                  >
                    <td className="py-3 font-heading font-semibold text-foreground">
                      {alumno.nombre} {alumno.apellido}
                    </td>
                    <td className="py-3 font-heading font-light text-foreground/60">
                      {alumno.email}
                    </td>
                    <td className="py-3 font-heading font-light text-foreground/60">
                      {alumno.telefono ?? "—"}
                    </td>
                    <td className="py-3 font-heading font-light text-foreground/60">
                      {formatDateShort(alumno.fechaRegistro)}
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end">
                        <Switch
                          checked={alumno.activo}
                          disabled={togglingId === alumno.id}
                          onCheckedChange={(next) => handleToggle(alumno.id, next)}
                          ariaLabel={`${alumno.activo ? "Deshabilitar" : "Habilitar"} a ${alumno.nombre}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      {modalOpen && (
        <NuevoAlumnoModal
          onClose={() => setModalOpen(false)}
          onCreated={(nuevo) => {
            setAlumnos((prev) => (prev ? [nuevo, ...prev] : [nuevo]));
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
