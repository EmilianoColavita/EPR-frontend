"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";

import { useRequireRole } from "@/lib/use-require-role";
import { getSession } from "@/lib/auth";
import { descargarMiEvaluacion, misEvaluaciones, type Evaluacion } from "@/lib/api";
import { descargarBlob } from "@/lib/download";
import { formatDateShort } from "@/lib/format";
import { DashboardHeader } from "./dashboard-header";
import { DashboardCard } from "./dashboard-card";

function LoadingState() {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark">
      <p className="font-heading font-light text-foreground/60">Cargando...</p>
    </section>
  );
}

export function MisEvaluacionesPage() {
  const usuario = useRequireRole("ALUMNO");
  // undefined = cargando, null = no se pudo obtener
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[] | null | undefined>(
    undefined,
  );
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!usuario) return;
    const session = getSession();
    if (!session) return;
    misEvaluaciones(session.token).then(setEvaluaciones);
  }, [usuario]);

  async function handleDownload(evaluacion: Evaluacion) {
    const session = getSession();
    if (!session) return;

    setDownloadingId(evaluacion.id);
    try {
      const blob = await descargarMiEvaluacion(session.token, evaluacion.id);
      if (blob) descargarBlob(blob, evaluacion.nombreArchivo);
    } finally {
      setDownloadingId(null);
    }
  }

  if (!usuario) {
    return <LoadingState />;
  }

  const ordenadas = (evaluaciones ?? []).slice().sort((a, b) => b.id - a.id);

  return (
    <>
      <DashboardHeader usuario={usuario} />
      <section className="min-h-[calc(100vh-7rem)] bg-epr-dark px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
            Mis evaluaciones
          </h1>

          <DashboardCard className="mt-6">
            {evaluaciones === undefined && (
              <p className="font-heading font-light text-foreground/50">
                Cargando...
              </p>
            )}

            {evaluaciones === null && (
              <p className="font-heading font-light text-foreground/50">
                No se pudieron cargar tus evaluaciones.
              </p>
            )}

            {evaluaciones && ordenadas.length === 0 && (
              <p className="font-heading font-light text-foreground/50">
                Todavía no tenés evaluaciones cargadas.
              </p>
            )}

            {evaluaciones && ordenadas.length > 0 && (
              <div className="flex flex-col gap-3">
                {ordenadas.map((evaluacion, index) => (
                  <div
                    key={evaluacion.id}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 p-4"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-epr-green" />
                    <div className="min-w-[160px] flex-1">
                      <p className="font-heading font-semibold text-foreground">
                        {evaluacion.nombreArchivo}
                      </p>
                      <p className="font-heading text-sm font-light text-foreground/60">
                        {formatDateShort(evaluacion.fechaSubida)}
                        {index === 0 && (
                          <span className="ml-2 rounded-full border border-epr-green/50 px-2 py-0.5 text-xs uppercase text-epr-green">
                            Última
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={downloadingId === evaluacion.id}
                      onClick={() => handleDownload(evaluacion)}
                      className="flex items-center gap-1.5 font-heading text-sm text-foreground/70 transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {downloadingId === evaluacion.id ? "Descargando..." : "Descargar"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </section>
    </>
  );
}
