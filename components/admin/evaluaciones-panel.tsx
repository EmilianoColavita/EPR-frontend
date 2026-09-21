"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Download, FileText, Trash2, Upload } from "lucide-react";

import { getSession, type Usuario } from "@/lib/auth";
import {
  ApiError,
  descargarEvaluacion,
  eliminarEvaluacion,
  listEvaluacionesAlumno,
  listUsuarios,
  subirEvaluacion,
  type Evaluacion,
} from "@/lib/api";
import { descargarBlob } from "@/lib/download";
import { formatDateShort } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

export function EvaluacionesPanel({ alumnoId }: { alumnoId: number }) {
  const [alumno, setAlumno] = useState<Usuario | null | undefined>(undefined);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[] | null | undefined>(
    undefined,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    listUsuarios(session.token, "ALUMNO").then((alumnos) => {
      setAlumno(alumnos?.find((a) => a.id === alumnoId) ?? null);
    });

    listEvaluacionesAlumno(session.token, alumnoId).then(setEvaluaciones);
  }, [alumnoId]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!archivo) return;
    const session = getSession();
    if (!session) return;

    setError(null);
    setUploading(true);
    try {
      const nueva = await subirEvaluacion(session.token, alumnoId, archivo);
      setEvaluaciones((prev) => (prev ? [nueva, ...prev] : [nueva]));
      setArchivo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(evaluacion: Evaluacion) {
    const session = getSession();
    if (!session) return;

    setDownloadingId(evaluacion.id);
    try {
      const blob = await descargarEvaluacion(session.token, alumnoId, evaluacion.id);
      if (blob) descargarBlob(blob, evaluacion.nombreArchivo);
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(evaluacionId: number) {
    const session = getSession();
    if (!session) return;

    setDeleteError(null);
    setDeletingId(evaluacionId);
    try {
      await eliminarEvaluacion(session.token, alumnoId, evaluacionId);
      setEvaluaciones((prev) => (prev ? prev.filter((e) => e.id !== evaluacionId) : prev));
      setConfirmDeleteId(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : "No se pudo eliminar la evaluación.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (alumno === undefined || evaluaciones === undefined) {
    return <p className="font-heading font-light text-foreground/50">Cargando...</p>;
  }

  if (alumno === null) {
    return (
      <p className="font-heading font-light text-foreground/50">
        No se encontró ese alumno.
      </p>
    );
  }

  const ordenadas = (evaluaciones ?? [])
    .slice()
    .sort((a, b) => b.id - a.id);

  return (
    <>
      <span className="font-display text-sm uppercase tracking-widest text-epr-green">
        {alumno.nombre} {alumno.apellido}
      </span>
      <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
        Evaluaciones
      </h1>
      <p className="mt-2 font-heading font-light text-foreground/50">
        Subí el PDF de cada evaluación de fuerza. Se van a ir acumulando para
        poder comparar el progreso del alumno mes a mes.
      </p>

      <DashboardCard className="mt-6">
        <form onSubmit={handleUpload} className="flex flex-wrap items-end gap-4">
          <label className="flex flex-1 min-w-[240px] flex-col gap-2">
            <span className="font-heading text-xs font-light text-foreground/60">
              Archivo PDF
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              disabled={uploading}
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-sm text-foreground outline-none transition-colors file:mr-4 file:rounded-lg file:border-0 file:bg-epr-green/20 file:px-3 file:py-1.5 file:font-heading file:text-epr-green focus:border-epr-green disabled:opacity-50"
            />
          </label>

          <Button type="submit" font="heading" disabled={uploading || !archivo}>
            <Upload className="h-4 w-4" />
            {uploading ? "Subiendo..." : "Subir evaluación"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}
      </DashboardCard>

      <DashboardCard className="mt-6">
        {deleteError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {deleteError}
          </div>
        )}

        {ordenadas.length === 0 ? (
          <p className="font-heading font-light text-foreground/50">
            Todavía no hay evaluaciones cargadas para este alumno.
          </p>
        ) : (
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

                {confirmDeleteId === evaluacion.id ? (
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-light text-foreground/60">
                      ¿Eliminar?
                    </span>
                    <button
                      type="button"
                      disabled={deletingId === evaluacion.id}
                      onClick={() => handleDelete(evaluacion.id)}
                      className="font-heading text-sm text-red-400 hover:underline disabled:opacity-50"
                    >
                      {deletingId === evaluacion.id ? "Eliminando..." : "Sí, eliminar"}
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === evaluacion.id}
                      onClick={() => setConfirmDeleteId(null)}
                      className="font-heading text-sm text-foreground/60 hover:text-foreground disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(evaluacion.id)}
                    aria-label="Eliminar evaluación"
                    className="-m-2 p-2 text-foreground/40 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </>
  );
}
