"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

import { cn } from "@/lib/utils";

const DURACION_MS = 5_000;
// Tiene que coincidir con el duration-300 de la transición.
const ANIMACION_MS = 300;

// Cartel flotante de confirmación. Se cierra solo a los pocos segundos o con
// la X. Se muestra mientras `mensaje` no sea null; onClose lo vuelve a null.
// Entra y sale con un fade + deslizamiento: al cerrar, primero corre la
// animación de salida y recién después se avisa a onClose.
export function Toast({
  titulo,
  mensaje,
  onClose,
}: {
  titulo: string;
  mensaje: string | null;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  // Arranca oculto y se muestra en el próximo frame, para que el navegador
  // pinte el estado inicial y la transición de entrada se vea.
  useEffect(() => {
    if (mensaje == null) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      setVisible(false);
    };
  }, [mensaje]);

  const cerrar = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(cerrar, DURACION_MS);
    return () => clearTimeout(timeout);
  }, [visible, cerrar]);

  // Cuando terminó la salida (visible=false con mensaje todavía puesto),
  // se desmonta avisando al padre.
  useEffect(() => {
    if (visible || mensaje == null) return;
    const timeout = setTimeout(onClose, ANIMACION_MS);
    return () => clearTimeout(timeout);
  }, [visible, mensaje, onClose]);

  if (mensaje == null) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-4 bottom-4 z-[60] flex items-start gap-3 rounded-xl border border-epr-green/30 bg-epr-card p-4 shadow-xl transition-all duration-300 ease-out motion-reduce:transition-none sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-epr-green" />
      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm font-semibold text-foreground">{titulo}</p>
        <p className="font-heading text-xs font-light text-foreground/60">{mensaje}</p>
      </div>
      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar"
        className="shrink-0 text-foreground/50 transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
