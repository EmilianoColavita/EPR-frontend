"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";

import { getSession, type Usuario } from "@/lib/auth";
import {
  ApiError,
  getCuentaAlumno,
  listPagosAlumno,
  listPlanesCuota,
  listUsuarios,
  registrarPago,
  type CuentaAlumno,
  type Pago,
  type PlanCuota,
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

function formatPrecio(precio: number | null): string {
  if (precio == null) return "—";
  return precio.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

export function AlumnoCuentaPage({ alumnoId }: { alumnoId: number }) {
  const [alumno, setAlumno] = useState<Usuario | null | undefined>(undefined);
  const [cuenta, setCuenta] = useState<CuentaAlumno | null | undefined>(undefined);
  const [pagos, setPagos] = useState<Pago[] | null | undefined>(undefined);
  const [planes, setPlanes] = useState<PlanCuota[] | null | undefined>(undefined);

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
  }, [alumnoId]);

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

  if (alumno === undefined || cuenta === undefined || pagos === undefined) {
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

  const planesActivos = (planes ?? []).filter((p) => p.activo);
  const pagosOrdenados = (pagos ?? []).slice().sort((a, b) => b.id - a.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <span className="font-display text-sm uppercase tracking-widest text-epr-green">
        {alumno.nombre} {alumno.apellido}
      </span>
      <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
        Cuenta
      </h1>

      <DashboardCard className="mt-6 flex items-start gap-5">
        <DashboardCardIcon>
          {cuenta?.alDia ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <CircleAlert className="h-6 w-6" />
          )}
        </DashboardCardIcon>
        <div>
          <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
            Estado actual
          </p>
          <p className="mt-2 font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
            {cuenta?.alDia ? "Al día" : "Pendiente"}
          </p>
          <p className="font-heading font-light text-foreground/60">
            {cuenta?.planActual
              ? `Plan ${cuenta.planActual.nombre}`
              : "Sin plan asignado todavía"}
            {cuenta?.fechaVencimiento &&
              ` · Vence el ${formatDateShort(cuenta.fechaVencimiento)}`}
          </p>
        </div>
      </DashboardCard>

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
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
