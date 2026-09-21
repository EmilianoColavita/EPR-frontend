"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import {
  ApiError,
  actualizarPlanCuota,
  crearPlanCuota,
  type PlanCuota,
} from "@/lib/api";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-heading text-sm font-light text-foreground/70">
        {label}
      </span>
      {children}
    </label>
  );
}

export function PlanCuotaModal({
  plan,
  onClose,
  onSaved,
}: {
  plan?: PlanCuota;
  onClose: () => void;
  onSaved: (plan: PlanCuota) => void;
}) {
  const [nombre, setNombre] = useState(plan?.nombre ?? "");
  const [duracionDias, setDuracionDias] = useState(
    plan ? String(plan.duracionDias) : "",
  );
  const [precio, setPrecio] = useState(plan?.precio != null ? String(plan.precio) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[] | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSession();
    if (!session) return;

    setLoading(true);
    setError(null);
    setDetails(null);

    const input = {
      nombre,
      duracionDias: Number(duracionDias),
      precio: precio ? Number(precio) : undefined,
    };

    try {
      const guardado = plan
        ? await actualizarPlanCuota(session.token, plan.id, input)
        : await crearPlanCuota(session.token, input);
      onSaved(guardado);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setDetails(err.details);
      } else {
        setError("Ocurrió un error inesperado. Probá de nuevo.");
      }
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-y-auto rounded-3xl border border-epr-green/30 bg-epr-card p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
            {plan ? "Editar plan" : "Nuevo plan"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-foreground/60 transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <Field label="Nombre">
            <input
              required
              disabled={loading}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Mensual"
              className={inputClass}
            />
          </Field>

          <Field label="Duración (días)">
            <input
              type="number"
              min={1}
              required
              disabled={loading}
              value={duracionDias}
              onChange={(e) => setDuracionDias(e.target.value)}
              placeholder="Ej: 30"
              className={inputClass}
            />
          </Field>

          <Field label="Precio (opcional)">
            <input
              type="number"
              min={0}
              step="0.01"
              disabled={loading}
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className={inputClass}
            />
          </Field>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
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

          <Button type="submit" font="heading" size="lg" disabled={loading} className="mt-2">
            {loading ? "Guardando..." : plan ? "Guardar cambios" : "Crear plan"}
          </Button>
        </form>
      </div>
    </div>
  );
}
