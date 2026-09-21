import type { ReactNode } from "react";
import { Repeat, Timer, Weight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EjercicioStatsData = {
  series: number | null;
  repeticiones: string | null;
  pesoSugerido: string | null;
  descansoSegundos: number | null;
};

function Chip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-heading text-xs font-light text-foreground/70">
      <Icon className="h-3 w-3 shrink-0 text-foreground/40" />
      {children}
    </span>
  );
}

export function EjercicioStats({
  ejercicio,
  className,
}: {
  ejercicio: EjercicioStatsData;
  className?: string;
}) {
  let seriesReps: string | null = null;
  if (ejercicio.series && ejercicio.repeticiones) {
    seriesReps = `${ejercicio.series} x ${ejercicio.repeticiones}`;
  } else if (ejercicio.series) {
    seriesReps = `${ejercicio.series} series`;
  } else if (ejercicio.repeticiones) {
    seriesReps = `x ${ejercicio.repeticiones}`;
  }

  if (!seriesReps && !ejercicio.pesoSugerido && !ejercicio.descansoSegundos) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {seriesReps && <Chip icon={Repeat}>{seriesReps}</Chip>}
      {ejercicio.pesoSugerido && <Chip icon={Weight}>{ejercicio.pesoSugerido}</Chip>}
      {ejercicio.descansoSegundos != null && (
        <Chip icon={Timer}>{ejercicio.descansoSegundos}s descanso</Chip>
      )}
    </div>
  );
}
