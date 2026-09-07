"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, FileText } from "lucide-react";

import { getSession } from "@/lib/auth";
import { descargarMiEvaluacion, misEvaluaciones, type Evaluacion } from "@/lib/api";
import { descargarBlob } from "@/lib/download";
import { formatDateShort } from "@/lib/format";
import { DashboardCard, DashboardCardIcon } from "./dashboard-card";

export function EvaluacionesCard() {
  // undefined = cargando, null = error
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[] | null | undefined>(
    undefined,
  );
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    misEvaluaciones(session.token).then(setEvaluaciones);
  }, []);

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

  if (evaluaciones === undefined) {
    return (
      <DashboardCard>
        <p className="font-heading font-light text-foreground/50">Cargando...</p>
      </DashboardCard>
    );
  }

  if (evaluaciones === null) {
    return (
      <DashboardCard>
        <p className="font-heading font-light text-foreground/50">
          No se pudieron cargar tus evaluaciones.
        </p>
      </DashboardCard>
    );
  }

  const ordenadas = evaluaciones.slice().sort((a, b) => b.id - a.id);
  const [ultima, ...anteriores] = ordenadas;

  if (!ultima) {
    return (
      <DashboardCard className="flex items-start gap-5">
        <DashboardCardIcon>
          <FileText className="h-6 w-6" />
        </DashboardCardIcon>
        <div>
          <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
            Evaluación física
          </p>
          <p className="mt-2 font-heading font-light text-foreground/60">
            Todavía no tenés una evaluación cargada. Tu entrenador te la va a
            subir después de la próxima medición.
          </p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-5">
          <DashboardCardIcon>
            <FileText className="h-6 w-6" />
          </DashboardCardIcon>
          <div>
            <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
              Última evaluación
            </p>
            <p className="mt-2 font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
              {formatDateShort(ultima.fechaSubida)}
            </p>
            <p className="font-heading text-sm font-light text-foreground/60">
              {ultima.nombreArchivo}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={downloadingId === ultima.id}
          onClick={() => handleDownload(ultima)}
          className="flex items-center gap-1.5 rounded-full border border-epr-green/60 px-4 py-2 font-heading text-sm text-epr-green transition-colors hover:bg-epr-green/10 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {downloadingId === ultima.id ? "Descargando..." : "Descargar"}
        </button>
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <Link
          href="/panel/alumno/evaluaciones"
          className="inline-flex items-center gap-1 font-heading text-sm text-foreground/60 transition-colors hover:text-foreground"
        >
          Ver todas mis evaluaciones{anteriores.length > 0 && ` (${ordenadas.length})`}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </DashboardCard>
  );
}
