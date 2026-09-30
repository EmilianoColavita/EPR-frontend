"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, FileText, Pencil, Trash2, Upload } from "lucide-react";

import { getSession, type Usuario } from "@/lib/auth";
import {
  ApiError,
  asignarRutina,
  descargarRutinaPdf,
  eliminarRutinaPdf,
  getAlumnoRutina,
  listRutinasPdfAlumno,
  listUsuarios,
  quitarRutinaAlumno,
  subirRutinaPdf,
  type Rutina,
  type RutinaPdf,
  type RutinaResumen,
} from "@/lib/api";
import { verBlobEnNuevaPestana } from "@/lib/download";
import { formatDateShort } from "@/lib/format";
import { Button, buttonVariants } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SeleccionarRutinaModal } from "./seleccionar-rutina-modal";

export function AlumnoRutinaPage({ alumnoId }: { alumnoId: number }) {
  const [alumno, setAlumno] = useState<Usuario | null | undefined>(undefined);
  const [rutina, setRutina] = useState<Rutina | "sin-rutina" | null | undefined>(
    undefined,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [asignando, setAsignando] = useState(false);
  const [confirmQuitar, setConfirmQuitar] = useState(false);
  const [quitando, setQuitando] = useState(false);
  const [quitarError, setQuitarError] = useState<string | null>(null);

  const [rutinasPdf, setRutinasPdf] = useState<RutinaPdf[] | null | undefined>(
    undefined,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
    getAlumnoRutina(session.token, alumnoId).then(setRutina);
    listRutinasPdfAlumno(session.token, alumnoId).then(setRutinasPdf);
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

  async function handleQuitarRutina() {
    const session = getSession();
    if (!session) return;

    setQuitarError(null);
    setQuitando(true);
    try {
      await quitarRutinaAlumno(session.token, alumnoId);
      setRutina("sin-rutina");
      setConfirmQuitar(false);
    } catch (err) {
      setQuitarError(
        err instanceof ApiError ? err.message : "No se pudo quitar la rutina.",
      );
    } finally {
      setQuitando(false);
    }
  }

  async function handleUploadPdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!archivo) return;
    const session = getSession();
    if (!session) return;

    setUploadError(null);
    setUploading(true);
    try {
      const nueva = await subirRutinaPdf(session.token, alumnoId, archivo);
      setRutinasPdf((prev) => (prev ? [nueva, ...prev] : [nueva]));
      setArchivo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadError(
        err instanceof ApiError ? err.message : "Ocurrió un error inesperado.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleVerPdf(rutinaPdf: RutinaPdf) {
    const session = getSession();
    if (!session) return;

    const ventana = window.open("", "_blank");
    setDownloadingId(rutinaPdf.id);
    try {
      const blob = await descargarRutinaPdf(session.token, alumnoId, rutinaPdf.id);
      if (blob) {
        verBlobEnNuevaPestana(ventana, blob);
      } else {
        ventana?.close();
      }
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDeletePdf(rutinaPdfId: number) {
    const session = getSession();
    if (!session) return;

    setDeleteError(null);
    setDeletingId(rutinaPdfId);
    try {
      await eliminarRutinaPdf(session.token, alumnoId, rutinaPdfId);
      setRutinasPdf((prev) => (prev ? prev.filter((r) => r.id !== rutinaPdfId) : prev));
      setConfirmDeleteId(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : "No se pudo eliminar el archivo.",
      );
    } finally {
      setDeletingId(null);
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

        {quitarError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {quitarError}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={asignando}
            className={buttonVariants({ variant: "primary", font: "heading" })}
          >
            {rutina && rutina !== "sin-rutina" ? "Cambiar rutina" : "Asignar rutina"}
          </button>

          {rutina && rutina !== "sin-rutina" && (
            confirmQuitar ? (
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-light text-foreground/60">
                  ¿Quitar la rutina asignada?
                </span>
                <button
                  type="button"
                  disabled={quitando}
                  onClick={handleQuitarRutina}
                  className="font-heading text-sm text-red-400 hover:underline disabled:opacity-50"
                >
                  {quitando ? "Quitando..." : "Sí, quitar"}
                </button>
                <button
                  type="button"
                  disabled={quitando}
                  onClick={() => setConfirmQuitar(false)}
                  className="font-heading text-sm text-foreground/60 hover:text-foreground disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmQuitar(true)}
                className="font-heading text-sm text-foreground/50 transition-colors hover:text-red-400"
              >
                Quitar rutina
              </button>
            )
          )}
        </div>
      </DashboardCard>

      <h2 className="mt-10 font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
        Rutina en PDF
      </h2>
      <p className="mt-1 font-heading font-light text-foreground/50">
        Alternativa o complemento a la rutina de arriba: subí el PDF tal cual lo
        tengas armado. El alumno va a poder descargarlo desde la app.
      </p>

      <DashboardCard className="mt-4">
        <form onSubmit={handleUploadPdf} className="flex flex-wrap items-end gap-4">
          <label className="flex min-w-[240px] flex-1 flex-col gap-2">
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
            {uploading ? "Subiendo..." : "Subir PDF"}
          </Button>
        </form>

        {uploadError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {uploadError}
          </div>
        )}

        {deleteError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {deleteError}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {rutinasPdf === undefined && (
            <p className="font-heading font-light text-foreground/50">Cargando...</p>
          )}
          {rutinasPdf === null && (
            <p className="font-heading font-light text-foreground/50">
              No se pudieron cargar los PDF de este alumno.
            </p>
          )}
          {rutinasPdf && rutinasPdf.length === 0 && (
            <p className="font-heading font-light text-foreground/50">
              Todavía no hay ningún PDF cargado para este alumno.
            </p>
          )}

          {rutinasPdf &&
            rutinasPdf
              .slice()
              .sort((a, b) => b.id - a.id)
              .map((rutinaPdf, index) => (
                <div
                  key={rutinaPdf.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 p-4"
                >
                  <FileText className="h-5 w-5 shrink-0 text-epr-green" />
                  <div className="min-w-[160px] flex-1">
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
                    className="flex items-center gap-1.5 font-heading text-sm text-foreground/70 transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    <Eye className="h-4 w-4" />
                    {downloadingId === rutinaPdf.id ? "Abriendo..." : "Ver"}
                  </button>

                  {confirmDeleteId === rutinaPdf.id ? (
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm font-light text-foreground/60">
                        ¿Eliminar?
                      </span>
                      <button
                        type="button"
                        disabled={deletingId === rutinaPdf.id}
                        onClick={() => handleDeletePdf(rutinaPdf.id)}
                        className="font-heading text-sm text-red-400 hover:underline disabled:opacity-50"
                      >
                        {deletingId === rutinaPdf.id ? "Eliminando..." : "Sí, eliminar"}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === rutinaPdf.id}
                        onClick={() => setConfirmDeleteId(null)}
                        className="font-heading text-sm text-foreground/60 hover:text-foreground disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(rutinaPdf.id)}
                      className="-m-2 flex items-center gap-1.5 p-2 font-heading text-sm text-foreground/40 transition-colors hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
        </div>
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
