"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

import { getSession } from "@/lib/auth";
import {
  actualizarRutina,
  ApiError,
  crearRutina,
  getRutinaById,
  type BloqueRutinaInput,
  type DiaRutinaInput,
  type EjercicioInput,
  type Rutina,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EjercicioVideoButton } from "@/components/ui/ejercicio-video-button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50";
const smallInputClass =
  "w-full rounded-lg border border-white/15 bg-epr-dark px-3 py-2 text-sm font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50";

type EjercicioForm = {
  nombre: string;
  series: string;
  repeticiones: string;
  pesoSugerido: string;
  descansoSegundos: string;
  notas: string;
  videoUrl: string;
};

type BloqueForm = {
  nombre: string;
  ejercicios: EjercicioForm[];
};

type DiaForm = {
  nombre: string;
  bloques: BloqueForm[];
  expanded: boolean;
};

function emptyEjercicio(): EjercicioForm {
  return {
    nombre: "",
    series: "",
    repeticiones: "",
    pesoSugerido: "",
    descansoSegundos: "",
    notas: "",
    videoUrl: "",
  };
}

function emptyBloque(): BloqueForm {
  return { nombre: "", ejercicios: [emptyEjercicio()] };
}

function emptyDia(): DiaForm {
  // Un día recién agregado arranca desplegado porque el usuario lo va a
  // completar ahora mismo; los que vienen cargados desde el backend
  // arrancan colapsados (ver rutinaToForm) para no ocupar toda la pantalla.
  return { nombre: "", bloques: [emptyBloque()], expanded: true };
}

function rutinaToForm(rutina: Rutina): {
  nombre: string;
  descripcion: string;
  dias: DiaForm[];
} {
  return {
    nombre: rutina.nombre,
    descripcion: rutina.descripcion ?? "",
    dias: rutina.dias.map((dia) => ({
      nombre: dia.nombre ?? "",
      expanded: false,
      bloques: dia.bloques.map((bloque) => ({
        nombre: bloque.nombre ?? "",
        ejercicios: bloque.ejercicios.map((ej) => ({
          nombre: ej.nombre,
          series: ej.series?.toString() ?? "",
          repeticiones: ej.repeticiones ?? "",
          pesoSugerido: ej.pesoSugerido ?? "",
          descansoSegundos: ej.descansoSegundos?.toString() ?? "",
          notas: ej.notas ?? "",
          videoUrl: ej.videoUrl ?? "",
        })),
      })),
    })),
  };
}

export function RutinaBuilder({ rutinaId: initialRutinaId }: { rutinaId?: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(initialRutinaId));
  const rutinaId = initialRutinaId ?? null;
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [dias, setDias] = useState<DiaForm[]>([emptyDia()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[] | null>(null);

  useEffect(() => {
    if (!initialRutinaId) return;
    const session = getSession();
    if (!session) return;

    getRutinaById(session.token, initialRutinaId).then((result) => {
      if (result === "sin-rutina" || result === null) {
        setLoading(false);
        return;
      }
      const form = rutinaToForm(result);
      setNombre(form.nombre);
      setDescripcion(form.descripcion);
      setDias(form.dias.length > 0 ? form.dias : [emptyDia()]);
      setLoading(false);
    });
  }, [initialRutinaId]);

  function updateDia(index: number, patch: Partial<DiaForm>) {
    setDias((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function addDia() {
    setDias((prev) => [...prev, emptyDia()]);
  }

  function removeDia(index: number) {
    setDias((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleDia(index: number) {
    setDias((prev) =>
      prev.map((d, i) => (i === index ? { ...d, expanded: !d.expanded } : d)),
    );
  }

  function addBloque(diaIndex: number) {
    setDias((prev) =>
      prev.map((d, i) =>
        i === diaIndex ? { ...d, bloques: [...d.bloques, emptyBloque()] } : d,
      ),
    );
  }

  function updateBloque(
    diaIndex: number,
    bloqueIndex: number,
    patch: Partial<BloqueForm>,
  ) {
    setDias((prev) =>
      prev.map((d, i) =>
        i === diaIndex
          ? {
              ...d,
              bloques: d.bloques.map((b, j) =>
                j === bloqueIndex ? { ...b, ...patch } : b,
              ),
            }
          : d,
      ),
    );
  }

  function removeBloque(diaIndex: number, bloqueIndex: number) {
    setDias((prev) =>
      prev.map((d, i) =>
        i === diaIndex
          ? { ...d, bloques: d.bloques.filter((_, j) => j !== bloqueIndex) }
          : d,
      ),
    );
  }

  function addEjercicio(diaIndex: number, bloqueIndex: number) {
    setDias((prev) =>
      prev.map((d, i) =>
        i === diaIndex
          ? {
              ...d,
              bloques: d.bloques.map((b, j) =>
                j === bloqueIndex
                  ? { ...b, ejercicios: [...b.ejercicios, emptyEjercicio()] }
                  : b,
              ),
            }
          : d,
      ),
    );
  }

  function updateEjercicio(
    diaIndex: number,
    bloqueIndex: number,
    ejIndex: number,
    patch: Partial<EjercicioForm>,
  ) {
    setDias((prev) =>
      prev.map((d, i) =>
        i === diaIndex
          ? {
              ...d,
              bloques: d.bloques.map((b, j) =>
                j === bloqueIndex
                  ? {
                      ...b,
                      ejercicios: b.ejercicios.map((ej, k) =>
                        k === ejIndex ? { ...ej, ...patch } : ej,
                      ),
                    }
                  : b,
              ),
            }
          : d,
      ),
    );
  }

  function removeEjercicio(diaIndex: number, bloqueIndex: number, ejIndex: number) {
    setDias((prev) =>
      prev.map((d, i) =>
        i === diaIndex
          ? {
              ...d,
              bloques: d.bloques.map((b, j) =>
                j === bloqueIndex
                  ? { ...b, ejercicios: b.ejercicios.filter((_, k) => k !== ejIndex) }
                  : b,
              ),
            }
          : d,
      ),
    );
  }

  async function handleSubmit() {
    const session = getSession();
    if (!session) return;

    setError(null);
    setDetails(null);
    setSaving(true);

    const diasInput: DiaRutinaInput[] = dias.map((dia, diaIndex) => {
      const bloques: BloqueRutinaInput[] = dia.bloques.map((bloque, bloqueIndex) => {
        const ejercicios: EjercicioInput[] = bloque.ejercicios
          .filter((ej) => ej.nombre.trim().length > 0)
          .map((ej, ejIndex) => ({
            nombre: ej.nombre,
            series: ej.series ? Number(ej.series) : undefined,
            repeticiones: ej.repeticiones || undefined,
            pesoSugerido: ej.pesoSugerido || undefined,
            descansoSegundos: ej.descansoSegundos
              ? Number(ej.descansoSegundos)
              : undefined,
            notas: ej.notas || undefined,
            orden: ejIndex + 1,
            videoUrl: ej.videoUrl || undefined,
          }));
        return {
          numero: bloqueIndex + 1,
          nombre: bloque.nombre || undefined,
          ejercicios,
        };
      });
      return {
        numero: diaIndex + 1,
        nombre: dia.nombre || undefined,
        bloques,
      };
    });

    try {
      if (rutinaId) {
        await actualizarRutina(session.token, rutinaId, {
          nombre,
          descripcion: descripcion || undefined,
          dias: diasInput,
        });
      } else {
        await crearRutina(session.token, {
          nombre,
          descripcion: descripcion || undefined,
          dias: diasInput,
        });
      }
      router.push("/panel/admin/rutinas");
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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="font-heading font-light text-foreground/50">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
        {rutinaId ? "Editar rutina" : "Nueva rutina"}
      </h1>

      <DashboardCard className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-heading text-sm font-light text-foreground/70">
              Nombre de la rutina
            </span>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClass}
              placeholder="Ej: Hipertrofia fase 1"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-heading text-sm font-light text-foreground/70">
              Descripción (opcional)
            </span>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </DashboardCard>

      <div className="mt-6 flex flex-col gap-6">
        {dias.map((dia, diaIndex) => (
          <DashboardCard key={diaIndex} className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => toggleDia(diaIndex)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                aria-expanded={dia.expanded}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-epr-green/50 font-heading text-sm text-epr-green">
                  {diaIndex + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-heading font-semibold text-foreground">
                  {dia.nombre || `Día ${diaIndex + 1}`}
                </span>
                <span className="shrink-0 font-heading text-xs font-light uppercase tracking-wider text-foreground/40">
                  {dia.bloques.length} bloque
                  {dia.bloques.length !== 1 && "s"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-foreground/50 transition-transform",
                    dia.expanded && "rotate-180",
                  )}
                />
              </button>
              {dias.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDia(diaIndex)}
                  aria-label="Eliminar día"
                  className="-m-2 shrink-0 p-2 text-foreground/40 transition-colors hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {dia.expanded && (
            <>
            <input
              value={dia.nombre}
              onChange={(e) => updateDia(diaIndex, { nombre: e.target.value })}
              placeholder={`Día ${diaIndex + 1} (nombre opcional, ej: Tren superior)`}
              className={inputClass}
            />

            <div className="flex flex-col gap-4">
              {dia.bloques.map((bloque, bloqueIndex) => (
                <div
                  key={bloqueIndex}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/20 font-heading text-xs text-foreground/70">
                      {bloqueIndex + 1}
                    </span>
                    <input
                      value={bloque.nombre}
                      onChange={(e) =>
                        updateBloque(diaIndex, bloqueIndex, { nombre: e.target.value })
                      }
                      placeholder={`Bloque ${bloqueIndex + 1} (nombre opcional, ej: Calentamiento)`}
                      className={cn(smallInputClass, "flex-1")}
                    />
                    {dia.bloques.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBloque(diaIndex, bloqueIndex)}
                        aria-label="Eliminar bloque"
                        className="-m-2 shrink-0 p-2 text-foreground/40 transition-colors hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {bloque.ejercicios.map((ej, ejIndex) => (
                      <div
                        key={ejIndex}
                        className="rounded-xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            value={ej.nombre}
                            onChange={(e) =>
                              updateEjercicio(diaIndex, bloqueIndex, ejIndex, {
                                nombre: e.target.value,
                              })
                            }
                            placeholder="Nombre del ejercicio"
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeEjercicio(diaIndex, bloqueIndex, ejIndex)
                            }
                            aria-label="Eliminar ejercicio"
                            className="-mx-2 -mb-2 mt-1 shrink-0 p-2 text-foreground/40 transition-colors hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <input
                            value={ej.series}
                            onChange={(e) =>
                              updateEjercicio(diaIndex, bloqueIndex, ejIndex, {
                                series: e.target.value,
                              })
                            }
                            placeholder="Series"
                            inputMode="numeric"
                            className={smallInputClass}
                          />
                          <input
                            value={ej.repeticiones}
                            onChange={(e) =>
                              updateEjercicio(diaIndex, bloqueIndex, ejIndex, {
                                repeticiones: e.target.value,
                              })
                            }
                            placeholder="Repeticiones"
                            className={smallInputClass}
                          />
                          <input
                            value={ej.pesoSugerido}
                            onChange={(e) =>
                              updateEjercicio(diaIndex, bloqueIndex, ejIndex, {
                                pesoSugerido: e.target.value,
                              })
                            }
                            placeholder="Peso sugerido"
                            className={smallInputClass}
                          />
                          <input
                            value={ej.descansoSegundos}
                            onChange={(e) =>
                              updateEjercicio(diaIndex, bloqueIndex, ejIndex, {
                                descansoSegundos: e.target.value,
                              })
                            }
                            placeholder="Descanso (seg)"
                            inputMode="numeric"
                            className={smallInputClass}
                          />
                        </div>

                        <input
                          value={ej.notas}
                          onChange={(e) =>
                            updateEjercicio(diaIndex, bloqueIndex, ejIndex, {
                              notas: e.target.value,
                            })
                          }
                          placeholder="Notas (opcional)"
                          className={`${smallInputClass} mt-3`}
                        />

                        <div className="mt-3 flex items-center gap-3">
                          <input
                            value={ej.videoUrl}
                            onChange={(e) =>
                              updateEjercicio(diaIndex, bloqueIndex, ejIndex, {
                                videoUrl: e.target.value,
                              })
                            }
                            placeholder="Link de YouTube (opcional)"
                            className={smallInputClass}
                          />
                          <EjercicioVideoButton url={ej.videoUrl} />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addEjercicio(diaIndex, bloqueIndex)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-2.5 font-heading text-sm text-foreground/60 transition-colors hover:border-epr-green hover:text-epr-green"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar ejercicio
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addBloque(diaIndex)}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-epr-green/30 py-3 font-heading text-sm uppercase tracking-wider text-foreground/60 transition-colors hover:border-epr-green hover:text-epr-green"
              >
                <Plus className="h-4 w-4" />
                Agregar bloque
              </button>
            </div>
            </>
            )}
          </DashboardCard>
        ))}

        <button
          type="button"
          onClick={addDia}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-4 font-heading text-sm uppercase tracking-wider text-foreground/60 transition-colors hover:border-epr-green hover:text-epr-green"
        >
          <Plus className="h-4 w-4" />
          Agregar día
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
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

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          font="heading"
          size="lg"
          disabled={saving || !nombre.trim()}
          onClick={handleSubmit}
        >
          {saving ? "Guardando..." : "Guardar rutina"}
        </Button>
      </div>
    </div>
  );
}
