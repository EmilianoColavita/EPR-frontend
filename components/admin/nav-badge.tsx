import { cn } from "@/lib/utils";

// Globito con la cantidad de pendientes de una sección del menú. Mismo
// estilo que el de la campanita para que se lea como la misma notificación.
export function NavBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;

  return (
    <span
      aria-label={`${count} pendiente${count === 1 ? "" : "s"}`}
      className={cn(
        "flex h-4 min-w-4 items-center justify-center rounded-full bg-epr-green px-1 font-heading text-[10px] font-bold leading-none text-epr-dark",
        className,
      )}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
