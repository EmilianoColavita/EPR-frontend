"use client";

import type { ReactNode } from "react";

import { useRequireRole } from "@/lib/use-require-role";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

function LoadingState() {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark">
      <p className="font-heading font-light text-foreground/60">
        Cargando...
      </p>
    </section>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const usuario = useRequireRole("ADMIN");

  if (!usuario) {
    return <LoadingState />;
  }

  return (
    <>
      <AdminHeader usuario={usuario} />
      <main className="flex flex-1">
        <AdminSidebar />
        <div className="min-w-0 flex-1 bg-epr-dark">{children}</div>
      </main>
    </>
  );
}
