"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clearSession, type Rol } from "@/lib/auth";
import { useRequireRole } from "@/lib/use-require-role";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

const ROLE_LABEL: Record<Rol, string> = {
  ADMIN: "Panel de administración",
  ENTRENADOR: "Panel de entrenador",
  ALUMNO: "Mi cuenta",
};

function LoadingState() {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark">
      <p className="font-heading font-light text-foreground/60">
        Cargando...
      </p>
    </section>
  );
}

export function PanelPlaceholder({ role }: { role: Rol }) {
  const router = useRouter();
  const usuario = useRequireRole(role);

  if (!usuario) {
    return <LoadingState />;
  }

  return (
    <>
      <DashboardHeader usuario={usuario} />
      <section className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center gap-4 bg-epr-dark px-4 text-center">
        <span className="font-display text-sm uppercase tracking-widest text-epr-green">
          {ROLE_LABEL[role]}
        </span>
        <h1 className="font-heading text-4xl font-bold uppercase tracking-tight text-foreground sm:text-5xl">
          Bienvenido, {usuario.nombre}
        </h1>
        <p className="max-w-md font-heading font-light text-foreground/60">
          Esta sección está en construcción. Muy pronto vas a poder gestionar
          todo desde acá.
        </p>
        <Button
          variant="outline"
          font="heading"
          className="mt-4"
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
        >
          Cerrar sesión
        </Button>
      </section>
    </>
  );
}
