"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Download, Upload } from "lucide-react";

import { useRequireRole } from "@/lib/use-require-role";
import { getSession } from "@/lib/auth";
import {
  ApiError,
  descargarMiComprobante,
  getEstadoCuenta,
  listPlanesCuota,
  misComprobantes,
  subirComprobante,
  type ComprobantePago,
  type EstadoCuenta,
  type EstadoComprobante,
  type PlanCuota,
} from "@/lib/api";
import { descargarBlob } from "@/lib/download";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "./dashboard-header";
import { DashboardCard } from "./dashboard-card";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50";

const ESTADO_LABEL: Record<EstadoComprobante, string> = {
  PENDIENTE: "Pendiente de revisión",
  CONFIRMADO: "Confirmado",
  RECHAZADO: "Rechazado",
};

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function formatPrecio(precio: number | null): string {
  if (precio == null) return "—";
  return precio.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

function LoadingState() {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark">
      <p className="font-heading font-light text-foreground/60">Cargando...</p>
    </section>
  );
}

export function MisPagosPage() {
  const usuario = useRequireRole("ALUMNO");
  const [estado, setEstado] = useState<EstadoCuenta | null | undefined>(undefined);
  const [comprobantes, setComprobantes] = useState<ComprobantePago[] | null | undefined>(
    undefined,
  );
  const [planes, setPlanes] = useState<PlanCuota[] | null | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [planCuotaId, setPlanCuotaId] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(todayISO);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!usuario) return;
    const session = getSession();
    if (!session) return;

    getEstadoCuenta(session.token).then(setEstado);
    misComprobantes(session.token).then(setComprobantes);
    listPlanesCuota(session.token).then(setPlanes);
  }, [usuario]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!archivo) return;
    const session = getSession();
    if (!session) return;

    setError(null);
    setUploading(true);
    try {
      const nuevo = await subirComprobante(session.token, {
        archivo,
        planCuotaId: planCuotaId ? Number(planCuotaId) : undefined,
        monto: monto ? Number(monto) : undefined,
        fecha,
      });
      setComprobantes((prev) => (prev ? [nuevo, ...prev] : [nuevo]));
      setArchivo(null);
      setPlanCuotaId("");
      setMonto("");
      setFecha(todayISO());
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(comprobante: ComprobantePago) {
    const session = getSession();
    if (!session) return;

    setDownloadingId(comprobante.id);
    try {
      const blob = await descargarMiComprobante(session.token, comprobante.id);
      if (blob) descargarBlob(blob, comprobante.nombreArchivo);
    } finally {
      setDownloadingId(null);
    }
  }

  if (!usuario) {
    return <LoadingState />;
  }

  const planesActivos = (planes ?? []).filter((p) => p.activo);
  const ordenados = (comprobantes ?? []).slice().sort((a, b) => b.id - a.id);

  return (
    <>
      <DashboardHeader usuario={usuario} />
      <section className="min-h-[calc(100vh-7rem)] bg-epr-dark px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
            Pagos
          </h1>
          <p className="mt-2 font-heading font-light text-foreground/50">
            {estado?.alDia
              ? `Estás al día${estado.proximoVencimiento ? ` · vence el ${formatDateShort(estado.proximoVencimiento)}` : ""}.`
              : "Tu cuota está pendiente. Subí el comprobante de tu último pago para que el administrador lo confirme."}
          </p>

          <DashboardCard className="mt-6">
            <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
              Subir comprobante
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="font-heading text-xs font-light text-foreground/60">
                  Archivo (PDF o imagen)
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  disabled={uploading}
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-sm text-foreground outline-none transition-colors file:mr-4 file:rounded-lg file:border-0 file:bg-epr-green/20 file:px-3 file:py-1.5 file:font-heading file:text-epr-green focus:border-epr-green disabled:opacity-50"
                />
              </label>

              <div className="flex flex-wrap gap-4">
                <label className="flex flex-1 min-w-[180px] flex-col gap-2">
                  <span className="font-heading text-xs font-light text-foreground/60">
                    Plan que pagaste (opcional)
                  </span>
                  <select
                    disabled={uploading}
                    value={planCuotaId}
                    onChange={(e) => setPlanCuotaId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">No estoy seguro</option>
                    {planesActivos.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.nombre} ({plan.duracionDias} días)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-1 min-w-[160px] flex-col gap-2">
                  <span className="font-heading text-xs font-light text-foreground/60">
                    Fecha del pago
                  </span>
                  <input
                    type="date"
                    required
                    disabled={uploading}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-1 min-w-[140px] flex-col gap-2">
                  <span className="font-heading text-xs font-light text-foreground/60">
                    Monto (opcional)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    disabled={uploading}
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>

              <Button
                type="submit"
                font="heading"
                disabled={uploading || !archivo}
                className="self-start"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Subiendo..." : "Subir comprobante"}
              </Button>
            </form>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}
          </DashboardCard>

          <DashboardCard className="mt-6">
            <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
              Mis comprobantes
            </h2>

            {comprobantes === undefined && (
              <p className="mt-4 font-heading font-light text-foreground/50">
                Cargando...
              </p>
            )}

            {comprobantes === null && (
              <p className="mt-4 font-heading font-light text-foreground/50">
                No se pudieron cargar tus comprobantes.
              </p>
            )}

            {comprobantes && ordenados.length === 0 && (
              <p className="mt-4 font-heading font-light text-foreground/50">
                Todavía no subiste ningún comprobante.
              </p>
            )}

            {comprobantes && ordenados.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                {ordenados.map((comprobante) => (
                  <div
                    key={comprobante.id}
                    className="flex flex-col gap-2 rounded-xl border border-white/10 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="w-28 shrink-0 font-heading text-epr-green">
                        {formatDateShort(comprobante.fecha)}
                      </span>
                      <span className="flex-1 font-heading font-semibold text-foreground">
                        {comprobante.planCuota?.nombre ?? "Plan sin especificar"}
                      </span>
                      <span className="font-heading text-sm font-light text-foreground/60">
                        {formatPrecio(comprobante.monto)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 font-heading text-xs uppercase",
                          comprobante.estado === "CONFIRMADO" &&
                            "border-epr-green/50 text-epr-green",
                          comprobante.estado === "RECHAZADO" &&
                            "border-red-500/40 text-red-400",
                          comprobante.estado === "PENDIENTE" &&
                            "border-yellow-500/40 text-yellow-400",
                        )}
                      >
                        {ESTADO_LABEL[comprobante.estado]}
                      </span>
                      <button
                        type="button"
                        disabled={downloadingId === comprobante.id}
                        onClick={() => handleDownload(comprobante)}
                        className="flex items-center gap-1.5 font-heading text-sm text-foreground/70 transition-colors hover:text-foreground disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                        {downloadingId === comprobante.id ? "Descargando..." : "Ver"}
                      </button>
                    </div>
                    {comprobante.estado === "RECHAZADO" && comprobante.notaRechazo && (
                      <p className="font-heading text-sm font-light text-red-400/90">
                        Motivo: {comprobante.notaRechazo}
                      </p>
                    )}
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
