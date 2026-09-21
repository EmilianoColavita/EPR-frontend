"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, CheckCircle2, CircleAlert, Wallet } from "lucide-react";

import { DashboardCard, DashboardCardIcon } from "./dashboard-card";
import { getSession } from "@/lib/auth";
import { getEstadoCuenta, type EstadoCuenta } from "@/lib/api";
import { diasDesde, esVencido, formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";

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
        {estado?.becado ? <Award className="h-6 w-6" /> : <Wallet className="h-6 w-6" />}
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

        {estado?.becado && (
          <>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-heading text-3xl font-bold uppercase tracking-tight text-epr-green">
                Becado
              </span>
              <Award className="h-6 w-6 text-epr-green" />
            </div>
            <p className="mt-2 font-heading font-light text-foreground/60">
              Formás parte del Programa de Becas E.P.R.
            </p>
          </>
        )}

        {estado && !estado.becado && (
          <>
            {esVencido(estado.proximoVencimiento) ? (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2">
                <CircleAlert className="h-5 w-5 shrink-0 text-red-500" />
                <span className="font-heading text-sm font-light text-red-400/90">
                  Vencido hace {diasDesde(estado.proximoVencimiento!)} días
                </span>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={cn(
                    "font-heading text-3xl font-bold uppercase tracking-tight",
                    estado.alDia ? "text-foreground" : "text-red-400",
                  )}
                >
                  {estado.alDia ? "Al día" : "Pendiente"}
                </span>
                {estado.alDia && (
                  <CheckCircle2 className="h-6 w-6 text-epr-green" />
                )}
              </div>
            )}

            {estado.alDia && estado.proximoVencimiento && (
              <>
                <p className="mt-4 font-heading text-xs uppercase tracking-widest text-foreground/50">
                  Próximo vencimiento
                </p>
                <p className="font-heading font-light text-epr-green">
                  {formatDateShort(estado.proximoVencimiento)}
                </p>
              </>
            )}

            <Link
              href="/panel/alumno/pagos"
              className="mt-4 inline-flex items-center gap-1 font-heading text-sm text-epr-green hover:underline"
            >
              Ver mis pagos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        )}
      </div>
    </DashboardCard>
  );
}
