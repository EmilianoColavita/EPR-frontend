"use client";

import { useRequireRole } from "@/lib/use-require-role";
import { DashboardHeader } from "./dashboard-header";
import { MiCuentaPage } from "./mi-cuenta-page";

function LoadingState() {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark">
      <p className="font-heading font-light text-foreground/60">Cargando...</p>
    </section>
  );
}

export function MiCuentaAlumnoPage() {
  const usuario = useRequireRole("ALUMNO");

  if (!usuario) {
    return <LoadingState />;
  }

  return (
    <>
      <DashboardHeader usuario={usuario} />
      <div className="min-h-[calc(100vh-7rem)] bg-epr-dark">
        <MiCuentaPage />
      </div>
    </>
  );
}
