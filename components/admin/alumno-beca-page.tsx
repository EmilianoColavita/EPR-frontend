"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Award } from "lucide-react";

import { getSession, type Usuario } from "@/lib/auth";
import {
  ApiError,
  agregarNotaBeca,
  finalizarBeca,
  getBecaAlumno,
  listUsuarios,
  otorgarBeca,
  type Beca,
} from "@/lib/api";
import { formatDateShort } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { DashboardCard, DashboardCardIcon } from "@/components/dashboard/dashboard-card";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function AlumnoBecaPage({ alumnoId }: { alumnoId: number }) {
  const [alumno, setAlumno] = useState<Usuario | null | undefined>(undefined);
  const [beca, setBeca] = useState<Beca | "sin-beca" | null | undefined>(undefined);

  const [fechaInicio, setFechaInicio] = useState(todayISO);
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmandoFinalizar, setConfirmandoFinalizar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    listUsuarios(session.token, "ALUMNO").then((alumnos) => {
      setAlumno(alumnos?.find((a) => a.id === alumnoId) ?? null);
    });

    getBecaAlumno(session.token, alumnoId).then(setBeca);
  }, [alumnoId]);

  async function handleOtorgar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSession();
    if (!session) return;

    setError(null);
    setSaving(true);
    try {
      const nueva = await otorgarBeca(session.token, alumnoId, fechaInicio);
      setBeca(nueva);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAgregarNota(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!texto.trim()) return;
    const session = getSession();
    if (!session) return;

    setError(null);
    setSaving(true);
    try {
      const actualizada = await agregarNotaBeca(session.token, alumnoId, texto);
      setBeca(actualizada);
      setTexto("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalizar() {
    const session = getSession();
    if (!session) return;

    setError(null);
    setSaving(true);
    try {
      const actualizada = await finalizarBeca(session.token, alumnoId);
      setBeca(actualizada);
      setConfirmandoFinalizar(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setSaving(false);
    }
  }

  if (alumno === undefined || beca === undefined) {
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
        Beca
      </h1>

      {(beca === "sin-beca" || beca === null || beca.estado === "FINALIZADA") && (
        <DashboardCard className="mt-6">
          <p className="font-heading font-light text-foreground/60">
            {beca && beca !== "sin-beca"
              ? "Este alumno no tiene una beca activa. Podés otorgarle una nueva."
              : "Este alumno todavía no tiene una beca otorgada."}
          </p>

          <form onSubmit={handleOtorgar} className="mt-4 flex flex-wrap items-end gap-4">
            <label className="flex flex-1 min-w-[160px] flex-col gap-2">
              <span className="font-heading text-xs font-light text-foreground/60">
                Fecha de inicio
              </span>
              <input
                type="date"
                required
                disabled={saving}
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={inputClass}
              />
            </label>

            <Button type="submit" font="heading" disabled={saving}>
              {saving ? "Otorgando..." : "Otorgar beca"}
            </Button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}
        </DashboardCard>
      )}

      {beca && beca !== "sin-beca" && (
        <>
          <DashboardCard className="mt-6 flex items-start gap-5">
            <DashboardCardIcon>
              <Award className="h-6 w-6" />
            </DashboardCardIcon>
            <div className="flex-1">
              <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
                Estado
              </p>
              <p className="mt-2 font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
                {beca.estado === "ACTIVA" ? "Activa" : "Finalizada"}
              </p>
              <p className="font-heading font-light text-foreground/60">
                Desde el {formatDateShort(beca.fechaInicio)}
                {beca.fechaFinalizacion &&
                  ` · Finalizada el ${formatDateShort(beca.fechaFinalizacion)}`}
              </p>
            </div>

            {beca.estado === "ACTIVA" && (
              <div>
                {confirmandoFinalizar ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleFinalizar}
                      className="font-heading text-sm text-red-400 hover:underline disabled:opacity-50"
                    >
                      {saving ? "Finalizando..." : "Sí, finalizar"}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setConfirmandoFinalizar(false)}
                      className="font-heading text-sm text-foreground/60 hover:text-foreground disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmandoFinalizar(true)}
                    className="font-heading text-sm text-red-400 hover:underline"
                  >
                    Finalizar beca
                  </button>
                )}
              </div>
            )}
          </DashboardCard>

          {beca.estado === "ACTIVA" && (
            <DashboardCard className="mt-6">
              <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
                Agregar nota de revisión
              </h2>
              <form onSubmit={handleAgregarNota} className="mt-4 flex flex-col gap-4">
                <textarea
                  required
                  disabled={saving}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={3}
                  placeholder="Ej: sigue asistiendo con regularidad, cumple los requisitos"
                  className={inputClass}
                />
                <Button
                  type="submit"
                  font="heading"
                  disabled={saving || !texto.trim()}
                  className="self-start"
                >
                  {saving ? "Guardando..." : "Agregar nota"}
                </Button>
              </form>
            </DashboardCard>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <DashboardCard className="mt-6">
            <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
              Notas de revisión
            </h2>

            {beca.notas.length === 0 ? (
              <p className="mt-4 font-heading font-light text-foreground/50">
                Todavía no hay notas cargadas.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {beca.notas
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((nota) => (
                    <div
                      key={nota.id}
                      className="rounded-xl border border-white/10 p-4"
                    >
                      <p className="font-heading text-sm text-epr-green">
                        {formatDateShort(nota.fecha)}
                      </p>
                      <p className="mt-1 font-heading font-light text-foreground/80">
                        {nota.texto}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </DashboardCard>
        </>
      )}
    </div>
  );
}
