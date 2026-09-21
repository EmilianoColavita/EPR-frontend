"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Award, CheckCircle2, CircleAlert, Download } from "lucide-react";

import { getSession, type Usuario } from "@/lib/auth";
import {
  ApiError,
  confirmarComprobante,
  descargarComprobanteAlumno,
  getCuentaAlumno,
  listComprobantesAlumno,
  listPagosAlumno,
  listPlanesCuota,
  listUsuarios,
  rechazarComprobante,
  registrarPago,
  type ComprobantePago,
  type CuentaAlumno,
  type Pago,
  type PlanCuota,
} from "@/lib/api";
import { descargarBlob } from "@/lib/download";
import { diasDesde, esVencido, formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
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

function formatPrecio(precio: number | null): string {
  if (precio == null) return "—";
  return precio.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

export function AlumnoCuentaPage({ alumnoId }: { alumnoId: number }) {
  const [alumno, setAlumno] = useState<Usuario | null | undefined>(undefined);
  const [cuenta, setCuenta] = useState<CuentaAlumno | null | undefined>(undefined);
  const [pagos, setPagos] = useState<Pago[] | null | undefined>(undefined);
  const [planes, setPlanes] = useState<PlanCuota[] | null | undefined>(undefined);
  const [comprobantes, setComprobantes] = useState<ComprobantePago[] | null | undefined>(
    undefined,
  );
  const [downloadingComprobanteId, setDownloadingComprobanteId] = useState<number | null>(
    null,
  );

  const [planCuotaId, setPlanCuotaId] = useState("");
  const [fecha, setFecha] = useState(todayISO);
  const [monto, setMonto] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[] | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    listUsuarios(session.token, "ALUMNO").then((alumnos) => {
      setAlumno(alumnos?.find((a) => a.id === alumnoId) ?? null);
    });

    getCuentaAlumno(session.token, alumnoId).then(setCuenta);
    listPagosAlumno(session.token, alumnoId).then(setPagos);
    listPlanesCuota(session.token).then(setPlanes);
    listComprobantesAlumno(session.token, alumnoId).then(setComprobantes);
  }, [alumnoId]);

  function handleComprobanteResuelto(pago: Pago | null, actualizado: ComprobantePago) {
    setComprobantes((prev) =>
      prev ? prev.map((c) => (c.id === actualizado.id ? actualizado : c)) : prev,
    );
    if (pago) {
      setPagos((prev) => (prev ? [pago, ...prev] : [pago]));
      const session = getSession();
      if (session) getCuentaAlumno(session.token, alumnoId).then(setCuenta);
    }
  }

  async function handleVerComprobante(comprobante: ComprobantePago) {
    const session = getSession();
    if (!session) return;

    setDownloadingComprobanteId(comprobante.id);
    try {
      const blob = await descargarComprobanteAlumno(session.token, alumnoId, comprobante.id);
      if (blob) descargarBlob(blob, comprobante.nombreArchivo);
    } finally {
      setDownloadingComprobanteId(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!planCuotaId) return;
    const session = getSession();
    if (!session) return;

    setError(null);
    setDetails(null);
    setSaving(true);

    try {
      const nuevoPago = await registrarPago(session.token, alumnoId, {
        planCuotaId: Number(planCuotaId),
        fecha,
        monto: monto ? Number(monto) : undefined,
      });
      setPagos((prev) => (prev ? [nuevoPago, ...prev] : [nuevoPago]));
      const cuentaActualizada = await getCuentaAlumno(session.token, alumnoId);
      setCuenta(cuentaActualizada);
      setPlanCuotaId("");
      setMonto("");
      setFecha(todayISO());
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

  if (
    alumno === undefined ||
    cuenta === undefined ||
    pagos === undefined ||
    comprobantes === undefined
  ) {
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

  const becado = cuenta?.becado ?? false;
  const vencido =
    !becado && cuenta != null && !cuenta.alDia && esVencido(cuenta.fechaVencimiento);
  const planesActivos = (planes ?? []).filter((p) => p.activo);
  const pagosOrdenados = (pagos ?? []).slice().sort((a, b) => b.id - a.id);
  const pendiente = (comprobantes ?? []).find((c) => c.estado === "PENDIENTE");
  const rechazados = (comprobantes ?? [])
    .filter((c) => c.estado === "RECHAZADO")
    .sort((a, b) => b.id - a.id);
  const comprobantePorPago = new Map(
    (comprobantes ?? [])
      .filter((c): c is ComprobantePago & { pago: Pago } => c.pago != null)
      .map((c) => [c.pago.id, c]),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <span className="font-display text-sm uppercase tracking-widest text-epr-green">
        {alumno.nombre} {alumno.apellido}
      </span>
      <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
        Cuenta
      </h1>

      <DashboardCard
        className={cn(
          "mt-6 flex items-start gap-5",
          vencido && "border-red-500/40 bg-red-500/5",
        )}
      >
        <DashboardCardIcon>
          {becado ? (
            <Award className="h-6 w-6" />
          ) : cuenta?.alDia ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <CircleAlert className="h-6 w-6" />
          )}
        </DashboardCardIcon>
        <div>
          <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
            Estado actual
          </p>
          <p
            className={cn(
              "mt-2 font-heading text-2xl font-bold uppercase tracking-tight",
              becado || cuenta?.alDia
                ? "text-epr-green"
                : vencido
                  ? "text-red-500"
                  : "text-red-400",
            )}
          >
            {becado ? "Becado" : cuenta?.alDia ? "Al día" : vencido ? "Vencido" : "Pendiente"}
          </p>
          {!becado && (
            <p
              className={cn(
                "font-heading font-light",
                vencido ? "text-red-400/90" : "text-foreground/60",
              )}
            >
              {vencido && cuenta?.fechaVencimiento
                ? `Hace ${diasDesde(cuenta.fechaVencimiento)} días que está vencido`
                : cuenta?.planActual
                  ? `Plan ${cuenta.planActual.nombre}`
                  : "Sin plan asignado todavía"}
              {!vencido &&
                cuenta?.fechaVencimiento &&
                ` · Vence el ${formatDateShort(cuenta.fechaVencimiento)}`}
            </p>
          )}
        </div>
      </DashboardCard>

      {becado && (
        <DashboardCard className="mt-6">
          <p className="font-heading font-light text-foreground/70">
            Este alumno es becado y queda exento del sistema de cuotas.
          </p>
          <Link
            href={`/panel/admin/alumnos/${alumnoId}/beca`}
            className="mt-3 inline-flex items-center gap-1.5 font-heading text-sm text-epr-green hover:underline"
          >
            Ver beca
          </Link>
        </DashboardCard>
      )}

      {!becado && pendiente && (
        <ComprobantePendienteCard
          alumnoId={alumnoId}
          comprobante={pendiente}
          planesActivos={planesActivos}
          onResuelto={handleComprobanteResuelto}
        />
      )}

      {!becado && (
      <>
      <DashboardCard className="mt-6">
        <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
          Registrar pago
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex flex-1 min-w-[180px] flex-col gap-2">
            <span className="font-heading text-xs font-light text-foreground/60">
              Plan
            </span>
            <select
              required
              disabled={saving}
              value={planCuotaId}
              onChange={(e) => setPlanCuotaId(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Elegir plan...
              </option>
              {planesActivos.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre} ({plan.duracionDias} días)
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-1 min-w-[160px] flex-col gap-2">
            <span className="font-heading text-xs font-light text-foreground/60">
              Fecha de pago
            </span>
            <input
              type="date"
              required
              disabled={saving}
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
              disabled={saving}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className={inputClass}
            />
          </label>

          <Button type="submit" font="heading" disabled={saving || !planCuotaId}>
            {saving ? "Guardando..." : "Registrar pago"}
          </Button>
        </form>

        {planesActivos.length === 0 && (
          <p className="mt-4 font-heading text-sm font-light text-foreground/50">
            Todavía no hay planes de membresía activos. Creá uno en Configuración.
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
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
      </DashboardCard>

      <DashboardCard className="mt-6">
        <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
          Historial de pagos
        </h2>

        {pagosOrdenados.length === 0 ? (
          <p className="mt-4 font-heading font-light text-foreground/50">
            Todavía no hay pagos registrados para este alumno.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {pagosOrdenados.map((pago) => (
              <div
                key={pago.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 p-4"
              >
                <span className="w-28 shrink-0 font-heading text-epr-green">
                  {formatDateShort(pago.fecha)}
                </span>
                <span className="flex-1 font-heading font-semibold text-foreground">
                  {pago.planCuota.nombre}
                </span>
                <span className="font-heading text-sm font-light text-foreground/60">
                  {formatPrecio(pago.monto)}
                </span>
                {comprobantePorPago.has(pago.id) && (
                  <button
                    type="button"
                    disabled={downloadingComprobanteId === comprobantePorPago.get(pago.id)!.id}
                    onClick={() => handleVerComprobante(comprobantePorPago.get(pago.id)!)}
                    className="flex items-center gap-1.5 font-heading text-sm text-foreground/70 transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Ver comprobante
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {rechazados.length > 0 && (
        <DashboardCard className="mt-6">
          <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
            Comprobantes rechazados
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {rechazados.map((comprobante) => (
              <div
                key={comprobante.id}
                className="flex flex-col gap-2 rounded-xl border border-red-500/20 p-4"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <span className="w-28 shrink-0 font-heading text-foreground/70">
                    {formatDateShort(comprobante.fecha)}
                  </span>
                  <span className="flex-1 font-heading font-semibold text-foreground">
                    {comprobante.planCuota?.nombre ?? "Plan sin especificar"}
                  </span>
                  <button
                    type="button"
                    disabled={downloadingComprobanteId === comprobante.id}
                    onClick={() => handleVerComprobante(comprobante)}
                    className="flex items-center gap-1.5 font-heading text-sm text-foreground/70 transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Ver comprobante
                  </button>
                </div>
                {comprobante.notaRechazo && (
                  <p className="font-heading text-sm font-light text-red-400/90">
                    Motivo: {comprobante.notaRechazo}
                  </p>
                )}
              </div>
            ))}
          </div>
        </DashboardCard>
      )}
      </>
      )}
    </div>
  );
}

function ComprobantePendienteCard({
  alumnoId,
  comprobante,
  planesActivos,
  onResuelto,
}: {
  alumnoId: number;
  comprobante: ComprobantePago;
  planesActivos: PlanCuota[];
  onResuelto: (pago: Pago | null, comprobanteActualizado: ComprobantePago) => void;
}) {
  const [planCuotaId, setPlanCuotaId] = useState(
    comprobante.planCuota && planesActivos.some((p) => p.id === comprobante.planCuota!.id)
      ? String(comprobante.planCuota.id)
      : "",
  );
  const [fecha, setFecha] = useState(comprobante.fecha);
  const [monto, setMonto] = useState(
    comprobante.monto != null ? String(comprobante.monto) : "",
  );
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showRechazar, setShowRechazar] = useState(false);
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleVer() {
    const session = getSession();
    if (!session) return;

    setDownloading(true);
    try {
      const blob = await descargarComprobanteAlumno(session.token, alumnoId, comprobante.id);
      if (blob) descargarBlob(blob, comprobante.nombreArchivo);
    } finally {
      setDownloading(false);
    }
  }

  async function handleConfirmar() {
    if (!planCuotaId) return;
    const session = getSession();
    if (!session) return;

    setError(null);
    setSaving(true);
    try {
      const actualizado = await confirmarComprobante(session.token, comprobante.id, {
        planCuotaId: Number(planCuotaId),
        fecha,
        monto: monto ? Number(monto) : undefined,
      });
      onResuelto(actualizado.pago, actualizado);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
      setSaving(false);
    }
  }

  async function handleRechazar() {
    const session = getSession();
    if (!session) return;

    setError(null);
    setSaving(true);
    try {
      const actualizado = await rechazarComprobante(
        session.token,
        comprobante.id,
        nota || undefined,
      );
      onResuelto(null, actualizado);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
      setSaving(false);
    }
  }

  return (
    <DashboardCard className="mt-6 border-yellow-500/40 bg-yellow-500/5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-yellow-400">
          Comprobante pendiente de revisión
        </h2>
        <button
          type="button"
          disabled={downloading}
          onClick={handleVer}
          className="flex items-center gap-1.5 font-heading text-sm text-foreground/70 transition-colors hover:text-foreground disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Descargando..." : "Ver comprobante"}
        </button>
      </div>

      <p className="mt-1 font-heading text-sm font-light text-foreground/60">
        Subido el {formatDateShort(comprobante.fecha)}
        {comprobante.planCuota && ` · dice haber pagado ${comprobante.planCuota.nombre}`}
        {comprobante.monto != null && ` · ${formatPrecio(comprobante.monto)}`}
      </p>

      {!showRechazar ? (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <label className="flex flex-1 min-w-[180px] flex-col gap-2">
              <span className="font-heading text-xs font-light text-foreground/60">
                Plan
              </span>
              <select
                required
                disabled={saving}
                value={planCuotaId}
                onChange={(e) => setPlanCuotaId(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Elegir plan...
                </option>
                {planesActivos.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.nombre} ({plan.duracionDias} días)
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-1 min-w-[160px] flex-col gap-2">
              <span className="font-heading text-xs font-light text-foreground/60">
                Fecha de pago
              </span>
              <input
                type="date"
                required
                disabled={saving}
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
                disabled={saving}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              font="heading"
              disabled={saving || !planCuotaId}
              onClick={handleConfirmar}
            >
              {saving ? "Guardando..." : "Confirmar pago"}
            </Button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setShowRechazar(true)}
              className="font-heading text-sm text-red-400 hover:underline disabled:opacity-50"
            >
              Rechazar
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-2">
            <span className="font-heading text-xs font-light text-foreground/60">
              Motivo (opcional)
            </span>
            <textarea
              disabled={saving}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              placeholder="Ej: la foto no se lee bien, subí una de nuevo"
              className={inputClass}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={handleRechazar}
              className="font-heading text-sm text-red-400 hover:underline disabled:opacity-50"
            >
              {saving ? "Rechazando..." : "Confirmar rechazo"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setShowRechazar(false)}
              className="font-heading text-sm text-foreground/60 transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}
    </DashboardCard>
  );
}
