"use client";

import { useRequireRole } from "@/lib/use-require-role";
import { DashboardHeader } from "./dashboard-header";
import { AccountStatusCard } from "./account-status-card";
import { NextSessionCard } from "./next-session-card";
import { TodayRoutineCard } from "./today-routine-card";
import { CalendarCard } from "./calendar-card";

function LoadingState() {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark">
      <p className="font-heading font-light text-foreground/60">
        Cargando...
      </p>
    </section>
  );
}

export function Dashboard() {
  const usuario = useRequireRole("ALUMNO");

  if (!usuario) {
    return <LoadingState />;
  }

  return (
    <>
      <DashboardHeader usuario={usuario} />

      <section className="relative overflow-hidden bg-epr-dark py-16 sm:py-20">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: "url('/images/fondoEPR5.png')" }}
        />
        <div className="absolute inset-0 bg-epr-dark/80" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <h1 className="font-heading text-4xl font-semibold italic uppercase tracking-tight sm:text-5xl">
            <span className="text-foreground">¡Bienvenido </span>
            <span className="text-epr-green">{usuario.nombre}!</span>
          </h1>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <AccountStatusCard />
                <NextSessionCard />
              </div>
              <TodayRoutineCard />
            </div>

            <CalendarCard />
          </div>
        </div>
      </section>
    </>
  );
}
