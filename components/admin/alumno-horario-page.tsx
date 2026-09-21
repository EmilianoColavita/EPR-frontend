"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import { getSession, type Usuario } from "@/lib/auth";
import {
  ApiError,
  asignarHorario,
  getHorarioAlumno,
  listUsuarios,
  type DiaSemana,
  type FranjaHorarioInput,
  type HorarioAsignado,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

const DIAS: { value: DiaSemana; label: string }[] = [
  { value: "LUNES", label: "Lunes" },
  { value: "MARTES", label: "Martes" },
  { value: "MIERCOLES", label: "Miércoles" },
  { value: "JUEVES", label: "Jueves" },
  { value: "VIERNES", label: "Viernes" },
  { value: "SABADO", label: "Sábado" },
  { value: "DOMINGO", label: "Domingo" },
];

const DIA_LABEL = Object.fromEntries(DIAS.map((d) => [d.value, d.label])) as Record<
  DiaSemana,
  string
>;

const inputClass =
  "w-full rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50";
const smallInputClass =
  "w-full rounded-lg border border-white/15 bg-epr-dark px-3 py-2 text-sm font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50";

type FranjaForm = {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  actividad: string;
};

function emptyFranja(): FranjaForm {
  return { diaSemana: "LUNES", horaInicio: "", horaFin: "", actividad: "" };
}

function describirHorario(h: HorarioAsignado): string {
  return h.franjas
    .map(
      (f) =>
        `${DIA_LABEL[f.diaSemana]} ${f.horaInicio}${f.horaFin ? `–${f.horaFin}` : ""}`,
    )
    .join(" · ");
}

export function AlumnoHorarioPage({ alumnoId }: { alumnoId: number }) {
  const [alumno, setAlumno] = useState<Usuario | null | undefined>(undefined);
  const [horarioActual, setHorarioActual] = useState<
    HorarioAsignado | "sin-horario" | null | undefined
  >(undefined);

  const [franjas, setFranjas] = useState<FranjaForm[]>([emptyFranja()]);
  const [notas, setNotas] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[] | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    listUsuarios(session.token, "ALUMNO").then((alumnos) => {
      setAlumno(alumnos?.find((a) => a.id === alumnoId) ?? null);
    });

    getHorarioAlumno(session.token, alumnoId).then((horario) => {
      setHorarioActual(horario);
      if (horario && horario !== "sin-horario" && horario.franjas.length > 0) {
        setFranjas(
          horario.franjas.map((f) => ({
            diaSemana: f.diaSemana,
            horaInicio: f.horaInicio,
            horaFin: f.horaFin ?? "",
            actividad: f.actividad,
          })),
        );
        setNotas(horario.notas ?? "");
      }
    });
  }, [alumnoId]);

  function updateFranja(index: number, patch: Partial<FranjaForm>) {
    setFranjas((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function addFranja() {
    setFranjas((prev) => [...prev, emptyFranja()]);
  }

  function removeFranja(index: number) {
    setFranjas((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSession();
    if (!session) return;

    setError(null);
    setDetails(null);
    setSavedOk(false);
    setSaving(true);

    const franjasInput: FranjaHorarioInput[] = franjas.map((f) => ({
      diaSemana: f.diaSemana,
      horaInicio: f.horaInicio,
      horaFin: f.horaFin || undefined,
      actividad: f.actividad,
    }));

    try {
      const nuevo = await asignarHorario(session.token, alumnoId, {
        franjas: franjasInput,
        notas: notas || undefined,
      });
      setHorarioActual(nuevo);
      setSavedOk(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setDetails(err.details);
      } else {
        setError("Ocurrió un error inesperado. Probá de nuevo.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (alumno === undefined || horarioActual === undefined) {
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

  const tieneHorario = horarioActual !== "sin-horario" && horarioActual !== null;
  const puedeGuardar =
    franjas.length > 0 &&
    franjas.every((f) => f.horaInicio && f.actividad.trim().length > 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <span className="font-display text-sm uppercase tracking-widest text-epr-green">
        {alumno.nombre} {alumno.apellido}
      </span>
      <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
        Horario fijo
      </h1>
      <p className="mt-2 font-heading font-light text-foreground/50">
        {tieneHorario
          ? `Horario actual: ${describirHorario(horarioActual)}`
          : "Este alumno todavía no tiene un horario fijo asignado."}
      </p>

      <DashboardCard className="mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            {franjas.map((franja, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-end"
              >
                <label className="flex flex-1 flex-col gap-2">
                  <span className="font-heading text-xs font-light text-foreground/60">
                    Día
                  </span>
                  <select
                    disabled={saving}
                    value={franja.diaSemana}
                    onChange={(e) =>
                      updateFranja(index, { diaSemana: e.target.value as DiaSemana })
                    }
                    className={smallInputClass}
                  >
                    {DIAS.map((dia) => (
                      <option key={dia.value} value={dia.value}>
                        {dia.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-1 flex-col gap-2">
                  <span className="font-heading text-xs font-light text-foreground/60">
                    Hora inicio
                  </span>
                  <input
                    type="time"
                    required
                    disabled={saving}
                    value={franja.horaInicio}
                    onChange={(e) => updateFranja(index, { horaInicio: e.target.value })}
                    className={smallInputClass}
                  />
                </label>

                <label className="flex flex-1 flex-col gap-2">
                  <span className="font-heading text-xs font-light text-foreground/60">
                    Hora fin (opcional)
                  </span>
                  <input
                    type="time"
                    disabled={saving}
                    value={franja.horaFin}
                    onChange={(e) => updateFranja(index, { horaFin: e.target.value })}
                    className={smallInputClass}
                  />
                </label>

                <label className="flex flex-[1.5] flex-col gap-2">
                  <span className="font-heading text-xs font-light text-foreground/60">
                    Actividad
                  </span>
                  <input
                    required
                    disabled={saving}
                    value={franja.actividad}
                    onChange={(e) => updateFranja(index, { actividad: e.target.value })}
                    placeholder="Ej: Entrenamiento funcional"
                    className={smallInputClass}
                  />
                </label>

                {franjas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFranja(index)}
                    aria-label="Eliminar franja"
                    disabled={saving}
                    className="-m-2 shrink-0 self-center p-2 text-foreground/40 transition-colors hover:text-red-400 disabled:opacity-50 sm:mb-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addFranja}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 font-heading text-sm text-foreground/60 transition-colors hover:border-epr-green hover:text-epr-green disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Agregar día
            </button>
          </div>

          <label className="flex flex-col gap-2">
            <span className="font-heading text-sm font-light text-foreground/70">
              Notas (opcional)
            </span>
            <input
              disabled={saving}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className={inputClass}
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              <p>{error}</p>
              {details && details.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {savedOk && (
            <div className="rounded-xl border border-epr-green/30 bg-epr-green/10 p-4 text-sm text-epr-green">
              Horario asignado correctamente. Los turnos se van a seguir
              generando solos mientras el alumno esté activo.
            </div>
          )}

          <Button
            type="submit"
            font="heading"
            size="lg"
            disabled={saving || !puedeGuardar}
            className="mt-2"
          >
            {saving
              ? "Guardando..."
              : tieneHorario
                ? "Actualizar horario"
                : "Asignar horario"}
          </Button>
        </form>
      </DashboardCard>
    </div>
  );
}
