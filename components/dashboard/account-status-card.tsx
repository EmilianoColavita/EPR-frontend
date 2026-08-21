"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Wallet } from "lucide-react";

import { DashboardCard, DashboardCardIcon } from "./dashboard-card";
import { getSession } from "@/lib/auth";
import { getEstadoCuenta, type EstadoCuenta } from "@/lib/api";
import { formatDateShort } from "@/lib/format";

export function AccountStatusCard() {
  // undefined = todavía cargando, null = no se pudo obtener
  const [estado, setEstado] = useState<EstadoCuenta | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    getEstadoCuenta(session.token).then(setEstado);
  }, []);

  return (
    <DashboardCard className="flex items-start gap-5">
      <DashboardCardIcon>
        <Wallet className="h-6 w-6" />
      </DashboardCardIcon>

      <div className="flex-1">
        <p className="font-heading text-sm uppercase tracking-widest text-foreground/60">
          Estado de cuenta
        </p>

        {estado === undefined && (
          <p className="mt-2 font-heading font-light text-foreground/40">
            Cargando...
          </p>
        )}

        {estado === null && (
          <p className="mt-2 font-heading font-light text-foreground/40">
            No disponible
          </p>
        )}

        {estado && (
          <>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
                {estado.alDia ? "Al día" : "Pendiente"}
              </span>
              {estado.alDia && (
                <CheckCircle2 className="h-6 w-6 text-epr-green" />
              )}
            </div>

            {estado.proximoVencimiento && (
              <>
                <p className="mt-4 font-heading text-xs uppercase tracking-widest text-foreground/50">
                  Próximo vencimiento
                </p>
                <p className="font-heading font-light text-epr-green">
                  {formatDateShort(estado.proximoVencimiento)}
                </p>
              </>
            )}
          </>
        )}
      </div>
    </DashboardCard>
  );
}
