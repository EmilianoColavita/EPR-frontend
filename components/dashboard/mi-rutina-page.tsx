"use client";

import { useEffect, useState } from "react";
import { Eye, FileText } from "lucide-react";

import { useRequireRole } from "@/lib/use-require-role";
import { getSession } from "@/lib/auth";
import {
  descargarMiRutinaPdf,
  getMiRutina,
  misRutinasPdf,
  seleccionarDia,
  type Rutina,
  type RutinaPdf,
} from "@/lib/api";
import { verBlobEnNuevaPestana } from "@/lib/download";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EjercicioStats } from "@/components/ui/ejercicio-stats";
import { EjercicioVideoButton } from "@/components/ui/ejercicio-video-button";
import { DashboardHeader } from "./dashboard-header";
import { DashboardCard, DashboardCardIcon } from "./dashboard-card";

function LoadingState() {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark">
      <p className="font-heading font-light text-foreground/60">Cargando...</p>
    </section>
  );
}

export function MiRutinaPage() {
  const usuario = useRequireRole("ALUMNO");
  // undefined = cargando, null = error, "sin-rutina" = todavía no tiene una asignada
  const [rutina, setRutina] = useState<Rutina | null | "sin-rutina" | undefined>(
    undefined,
  );
  const [selectedDiaId, setSelectedDiaId] = useState<number | null>(null);
  const [switching, setSwitching] = useState(false);

  // undefined = cargando, null = error
  const [rutinasPdf, setRutinasPdf] = useState<RutinaPdf[] | null | undefined>(
    undefined,
  );
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!usuario) return;
    const session = getSession();
    if (!session) return;
    getMiRutina(session.token).then((result) => {
      setRutina(result);
      if (result && result !== "sin-rutina") {
        setSelectedDiaId(result.diaSugeridoId ?? result.dias[0]?.id ?? null);
      }
    });
    misRutinasPdf(session.token).then(setRutinasPdf);
  }, [usuario]);

  async function handleVerPdf(rutinaPdf: RutinaPdf) {
    const session = getSession();
    if (!session) return;

    const ventana = window.open("", "_blank");
    setDownloadingId(rutinaPdf.id);
    try {
      const blob = await descargarMiRutinaPdf(session.token, rutinaPdf.id);
      if (blob) {
        verBlobEnNuevaPestana(ventana, blob);
      } else {
        ventana?.close();
      }
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleSelectDia(diaId: number) {
    if (diaId === selectedDiaId) return;
    setSelectedDiaId(diaId);

    const session = getSession();
    if (!session) return;

    setSwitching(true);
    try {
      const updated = await seleccionarDia(session.token, diaId);
      setRutina(updated);
    } catch (error) {
      console.error("No se pudo registrar el día seleccionado:", error);
    } finally {
      setSwitching(false);
    }
  }

  if (!usuario) {
    return <LoadingState />;
  }

  const diaSeleccionado =
    rutina && rutina !== "sin-rutina"
      ? rutina.dias.find((d) => d.id === selectedDiaId) ?? rutina.dias[0]
      : undefined;

  return (
    <>
      <DashboardHeader usuario={usuario} />
      <section className="min-h-[calc(100vh-7rem)] bg-epr-dark px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
            Mi rutina
          </h1>

          {rutina === undefined && (
            <DashboardCard className="mt-6">
              <p className="font-heading font-light text-foreground/50">Cargando...</p>
            </DashboardCard>
          )}

          {rutina === null && (
            <DashboardCard className="mt-6">
              <p className="font-heading font-light text-foreground/50">
                No se pudo cargar tu rutina.
              </p>
            </DashboardCard>
          )}

          {rutina === "sin-rutina" && rutinasPdf !== undefined && !rutinasPdf?.length && (
            <DashboardCard className="mt-6">
              <p className="font-heading font-light text-foreground/60">
                Todavía no tenés una rutina asignada. Tu entrenador te la va a
                cargar pronto.
              </p>
            </DashboardCard>
          )}

          {rutina && rutina !== "sin-rutina" && (
            <DashboardCard className="mt-6">
              <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
                {rutina.nombre}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {rutina.dias.map((dia) => (
                  <button
                    key={dia.id}
                    type="button"
                    disabled={switching}
                    onClick={() => handleSelectDia(dia.id)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border font-heading text-sm transition-colors disabled:opacity-50",
                      dia.id === selectedDiaId
                        ? "border-epr-green bg-epr-green/20 text-epr-green"
                        : "border-white/15 text-foreground/60 hover:border-white/40",
                    )}
                    aria-label={`Entrenar día ${dia.numero}`}
                  >
                    {dia.numero}
                  </button>
                ))}
              </div>

              <p className="mt-6 font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
                {diaSeleccionado?.nombre || `Día ${diaSeleccionado?.numero}`}
              </p>
              {rutina.diaSugeridoId && rutina.diaSugeridoId === selectedDiaId && (
                <p className="mt-1 font-heading text-xs font-light text-epr-green">
                  Día sugerido
                </p>
              )}

              <div className="mt-4">
                {diaSeleccionado?.bloques.length === 0 && (
                  <p className="font-heading font-light text-foreground/50">
                    Este día todavía no tiene ejercicios cargados.
                  </p>
                )}
                {diaSeleccionado?.bloques.map((bloque) => (
                  <div key={bloque.id} className="mb-5 last:mb-0">
                    <p className="font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                      {bloque.nombre || `Bloque ${bloque.numero}`}
                    </p>
                    {bloque.ejercicios.length === 0 && (
                      <p className="mt-2 font-heading font-light text-foreground/50">
                        Sin ejercicios cargados.
                      </p>
                    )}
                    {bloque.ejercicios.map((ejercicio, index) => (
                      <div
                        key={ejercicio.id}
                        className="flex items-start gap-4 border-b border-white/10 py-4 first:pt-2 last:border-b-0 last:pb-0"
                      >
                        <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg border border-white/15 font-heading text-lg text-foreground/70">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="mt-1 h-8 w-px shrink-0 bg-white/10" />
                        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-heading font-bold uppercase tracking-tight text-foreground">
                              {ejercicio.nombre}
                            </span>
                            <EjercicioVideoButton url={ejercicio.videoUrl} />
                          </div>
                          <EjercicioStats ejercicio={ejercicio} className="sm:justify-end" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </DashboardCard>
          )}

          {rutinasPdf && rutinasPdf.length > 0 && (
            <DashboardCard className="mt-6">
              <div className="flex items-start gap-5">
                <DashboardCardIcon>
                  <FileText className="h-6 w-6" />
                </DashboardCardIcon>
                <div>
                  <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
                    Rutina en PDF
                  </p>
                  <p className="mt-2 font-heading font-light text-foreground/60">
                    Tu entrenador también te cargó tu rutina en formato PDF.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5">
                {rutinasPdf
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((rutinaPdf, index) => (
                    <div
                      key={rutinaPdf.id}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-heading font-semibold text-foreground">
                          {rutinaPdf.nombreArchivo}
                        </p>
                        <p className="font-heading text-sm font-light text-foreground/60">
                          {formatDateShort(rutinaPdf.fechaSubida)}
                          {index === 0 && (
                            <span className="ml-2 rounded-full border border-epr-green/50 px-2 py-0.5 text-xs uppercase text-epr-green">
                              Última
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={downloadingId === rutinaPdf.id}
                        onClick={() => handleVerPdf(rutinaPdf)}
                        className="flex items-center gap-1.5 rounded-full border border-epr-green/60 px-4 py-2 font-heading text-sm text-epr-green transition-colors hover:bg-epr-green/10 disabled:opacity-50"
                      >
                        <Eye className="h-4 w-4" />
                        {downloadingId === rutinaPdf.id ? "Abriendo..." : "Ver"}
                      </button>
                    </div>
                  ))}
              </div>
            </DashboardCard>
          )}
        </div>
      </section>
    </>
  );
}
