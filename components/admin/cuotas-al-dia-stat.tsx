"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Receipt } from "lucide-react";

import { getSession } from "@/lib/auth";
import { getCuotasResumen, type CuotasResumen } from "@/lib/api";
import { DashboardCard, DashboardCardIcon } from "@/components/dashboard/dashboard-card";

export function CuotasAlDiaStat() {
  // undefined = cargando, null = no se pudo obtener
  const [resumen, setResumen] = useState<CuotasResumen | null | undefined>(undefined);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    getCuotasResumen(session.token).then(setResumen);
  }, []);

  return (
    <DashboardCard className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <DashboardCardIcon>
          <Receipt className="h-6 w-6" />
        </DashboardCardIcon>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="font-heading text-3xl font-bold text-epr-green">
              {resumen?.alDia ?? "—"}
            </span>
            <p className="font-heading text-xs font-light text-foreground/50">Al día</p>
          </div>
          <div className="text-right">
            <span className="font-heading text-3xl font-bold text-red-400">
              {resumen?.vencidos ?? "—"}
            </span>
            <p className="font-heading text-xs font-light text-foreground/50">Vencidas</p>
          </div>
        </div>
      </div>
      <div>
        <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
          Cuotas al día
        </p>
        <Link
          href="/panel/admin/alumnos"
          className="mt-2 inline-flex items-center gap-1 font-heading text-sm text-epr-green hover:underline"
        >
          Ver alumnos
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </DashboardCard>
  );
}
