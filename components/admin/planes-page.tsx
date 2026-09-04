"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { getSession } from "@/lib/auth";
import { actualizarActivoPlanCuota, listPlanesCuota, type PlanCuota } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PlanCuotaModal } from "./plan-cuota-modal";

function formatPrecio(precio: number | null): string {
  if (precio == null) return "—";
  return precio.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

export function PlanesPage() {
  // undefined = cargando, null = no se pudo obtener
  const [planes, setPlanes] = useState<PlanCuota[] | null | undefined>(undefined);
  const [modalPlan, setModalPlan] = useState<PlanCuota | "nuevo" | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listPlanesCuota(session.token).then(setPlanes);
  }, []);

  async function handleToggle(plan: PlanCuota, next: boolean) {
    const session = getSession();
    if (!session) return;

    setTogglingId(plan.id);
    try {
      const updated = await actualizarActivoPlanCuota(session.token, plan.id, next);
      setPlanes((prev) => (prev ? prev.map((p) => (p.id === plan.id ? updated : p)) : prev));
    } catch (error) {
      console.error("No se pudo actualizar el estado del plan:", error);
    } finally {
      setTogglingId(null);
    }
  }

  function handleSaved(plan: PlanCuota) {
    setPlanes((prev) => {
      if (!prev) return [plan];
      const existe = prev.some((p) => p.id === plan.id);
      return existe ? prev.map((p) => (p.id === plan.id ? plan : p)) : [plan, ...prev];
    });
    setModalPlan(null);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
          Planes
        </h1>
        <button
          type="button"
          onClick={() => setModalPlan("nuevo")}
          className={buttonVariants({ variant: "primary", font: "heading" })}
        >
          <Plus className="h-4 w-4" />
          Nuevo plan
        </button>
      </div>

      <p className="mt-2 font-heading font-light text-foreground/50">
        Planes de membresía disponibles para asignarle a los alumnos (duración y
        precio). Distintos de los planes que se muestran en la página pública.
      </p>

      <DashboardCard className="mt-6">
        {planes === undefined && (
          <p className="font-heading font-light text-foreground/50">Cargando...</p>
        )}

        {planes === null && (
          <p className="font-heading font-light text-foreground/50">
            No se pudo cargar la lista de planes.
          </p>
        )}

        {planes && planes.length === 0 && (
          <p className="font-heading font-light text-foreground/50">
            Todavía no hay planes de membresía creados.
          </p>
        )}

        {planes && planes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Nombre
                  </th>
                  <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Duración
                  </th>
                  <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Precio
                  </th>
                  <th className="pb-3 text-right font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                    Activo
                  </th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {planes.map((plan) => (
                  <tr key={plan.id} className="border-b border-white/5 last:border-b-0">
                    <td className="py-3 font-heading font-semibold text-foreground">
                      {plan.nombre}
                    </td>
                    <td className="py-3 font-heading font-light text-foreground/60">
                      {plan.duracionDias} días
                    </td>
                    <td className="py-3 font-heading font-light text-foreground/60">
                      {formatPrecio(plan.precio)}
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end">
                        <Switch
                          checked={plan.activo}
                          disabled={togglingId === plan.id}
                          onCheckedChange={(next) => handleToggle(plan, next)}
                          ariaLabel={`${plan.activo ? "Desactivar" : "Activar"} el plan ${plan.nombre}`}
                        />
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setModalPlan(plan)}
                        className="font-heading text-sm text-epr-green hover:underline"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      {modalPlan && (
        <PlanCuotaModal
          plan={modalPlan === "nuevo" ? undefined : modalPlan}
          onClose={() => setModalPlan(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
