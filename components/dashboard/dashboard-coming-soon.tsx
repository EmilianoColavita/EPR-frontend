"use client";

import { useRequireRole } from "@/lib/use-require-role";
import type { Rol } from "@/lib/auth";
import { DashboardHeader } from "./dashboard-header";

function LoadingState() {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark">
      <p className="font-heading font-light text-foreground/60">
        Cargando...
      </p>
    </section>
  );
}

export function DashboardComingSoon({
  role,
  title,
}: {
  role: Rol;
  title: string;
}) {
  const usuario = useRequireRole(role);

  if (!usuario) {
    return <LoadingState />;
  }

  return (
    <>
      <DashboardHeader usuario={usuario} />
      <section className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center gap-4 bg-epr-dark px-4 text-center">
        <span className="font-display text-sm uppercase tracking-widest text-epr-green">
          Próximamente
        </span>
        <h1 className="font-heading text-4xl font-bold uppercase tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-md font-heading font-light text-foreground/60">
          Esta sección está en construcción. Muy pronto vas a poder ver todo
          el contenido acá.
        </p>
      </section>
    </>
  );
}
