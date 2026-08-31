"use client";

import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";

import { getSession } from "@/lib/auth";
import { getMiRutina, seleccionarDia, type Rutina } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DashboardCard, DashboardCardIcon } from "./dashboard-card";

export function TodayRoutineCard() {
  // undefined = cargando, null = error, "sin-rutina" = todavía no tiene una asignada
  const [rutina, setRutina] = useState<Rutina | null | "sin-rutina" | undefined>(
    undefined,
  );
  const [selectedDiaId, setSelectedDiaId] = useState<number | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    getMiRutina(session.token).then((result) => {
      setRutina(result);
      if (result && result !== "sin-rutina") {
        setSelectedDiaId(result.diaSugeridoId ?? result.dias[0]?.id ?? null);
      }
    });
  }, []);

  async function handleSelectDia(diaId: number) {
    if (diaId === selectedDiaId) return;
    setSelectedDiaId(diaId);

    const session = getSession();
    if (!session) return;

    setSwitching(true);
    try {
      const updated = await seleccionarDia(session.token, diaId);
      setRutina(updated);
    } catch (error) {
      console.error("No se pudo registrar el día seleccionado:", error);
    } finally {
      setSwitching(false);
    }
  }

  if (rutina === undefined) {
    return (
      <DashboardCard>
        <p className="font-heading font-light text-foreground/50">Cargando...</p>
      </DashboardCard>
    );
  }

  if (rutina === null) {
    return (
      <DashboardCard>
        <p className="font-heading font-light text-foreground/50">
          No se pudo cargar tu rutina.
        </p>
      </DashboardCard>
    );
  }

  if (rutina === "sin-rutina") {
    return (
      <DashboardCard className="flex items-start gap-5">
        <DashboardCardIcon>
          <Dumbbell className="h-6 w-6" />
        </DashboardCardIcon>
        <div>
          <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
            Rutina de hoy
          </p>
          <p className="mt-2 font-heading font-light text-foreground/60">
            Todavía no tenés una rutina asignada. Tu entrenador te la va a
            cargar pronto.
          </p>
        </div>
      </DashboardCard>
    );
  }

  const diaSeleccionado =
    rutina.dias.find((d) => d.id === selectedDiaId) ?? rutina.dias[0];

  return (
    <DashboardCard>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-5">
          <DashboardCardIcon>
            <Dumbbell className="h-6 w-6" />
          </DashboardCardIcon>

          <div>
            <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
              Rutina de hoy
            </p>
            <p className="mt-2 font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
              {diaSeleccionado?.nombre || `Día ${diaSeleccionado?.numero}`}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {rutina.dias.map((dia) => (
                <button
                  key={dia.id}
                  type="button"
                  disabled={switching}
                  onClick={() => handleSelectDia(dia.id)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border font-heading text-sm transition-colors disabled:opacity-50",
                    dia.id === selectedDiaId
                      ? "border-epr-green bg-epr-green/20 text-epr-green"
                      : "border-white/15 text-foreground/60 hover:border-white/40",
                  )}
                  aria-label={`Entrenar día ${dia.numero}`}
                >
                  {dia.numero}
                </button>
              ))}
            </div>
            {rutina.diaSugeridoId && rutina.diaSugeridoId === selectedDiaId && (
              <p className="mt-2 font-heading text-xs font-light text-epr-green">
                Día sugerido
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 sm:max-w-xl">
          {diaSeleccionado?.ejercicios.length === 0 && (
            <p className="font-heading font-light text-foreground/50">
              Este día todavía no tiene ejercicios cargados.
            </p>
          )}
          {diaSeleccionado?.ejercicios.map((ejercicio, index) => (
            <div
              key={ejercicio.id}
              className="flex items-center gap-4 border-b border-white/10 py-4 first:pt-0 last:border-b-0 last:pb-0"
            >
              <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg border border-white/15 font-heading text-lg text-foreground/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="h-8 w-px shrink-0 bg-white/10" />
              <span className="flex-1 font-heading font-bold uppercase tracking-tight text-foreground">
                {ejercicio.nombre}
              </span>
              <span className="text-right font-heading font-light text-foreground/60">
                {[
                  ejercicio.series && `${ejercicio.series} series`,
                  ejercicio.repeticiones && `x ${ejercicio.repeticiones}`,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
