"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getSession } from "@/lib/auth";
import {
  ApiError,
  actualizarPlanCard,
  crearPlanCard,
  type PlanCard,
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

export function PlanCardModal({
  categoriaId,
  card,
  defaultOrden,
  onClose,
  onSaved,
}: {
  categoriaId: number;
  card?: PlanCard;
  defaultOrden: number;
  onClose: () => void;
  onSaved: (card: PlanCard) => void;
}) {
  const [titulo, setTitulo] = useState(card?.title ?? "");
  const [precio, setPrecio] = useState(card?.price != null ? String(card.price) : "");
  const [activo, setActivo] = useState(card?.activo ?? true);
  const [items, setItems] = useState((card?.items ?? []).join("\n"));
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
      titulo,
      orden: card?.orden ?? defaultOrden,
      activo,
      precio: precio ? Number(precio) : undefined,
      items: items
        .split("\n")
        .map((linea) => linea.trim())
        .filter((linea) => linea.length > 0),
    };

    try {
      const guardado = card?.id
        ? await actualizarPlanCard(session.token, card.id, input)
        : await crearPlanCard(session.token, categoriaId, input);
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
            {card ? "Editar plan" : "Nuevo plan"}
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
          <Field label="Título">
            <input
              required
              disabled={loading}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: 3 veces por semana"
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

          <Field label="Ítems (opcional, uno por línea)">
            <textarea
              disabled={loading}
              value={items}
              onChange={(e) => setItems(e.target.value)}
              rows={4}
              placeholder={"Ej: Acceso a sala de musculación\nEvaluación inicial incluida"}
              className={inputClass}
            />
          </Field>

          <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
            <span className="font-heading text-sm font-light text-foreground/70">
              Visible en la web
            </span>
            <Switch checked={activo} onCheckedChange={setActivo} ariaLabel="Plan visible en la web" />
          </div>

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
            {loading ? "Guardando..." : card ? "Guardar cambios" : "Crear plan"}
          </Button>
        </form>
      </div>
    </div>
  );
}
