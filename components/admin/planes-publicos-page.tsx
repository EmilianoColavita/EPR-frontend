"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { getSession } from "@/lib/auth";
import {
  actualizarPlanCard,
  actualizarPlanCategoria,
  eliminarPlanCard,
  eliminarPlanCategoria,
  listPlanesTodos,
  type PlanCard,
  type PlanGroup,
} from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PlanCategoriaModal } from "./plan-categoria-modal";
import { PlanCardModal } from "./plan-card-modal";

function formatPrecio(precio: number | null | undefined): string {
  if (precio == null) return "—";
  return precio.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

function ordenarPorOrden<T extends { orden?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
}

export function PlanesPublicosPage() {
  // undefined = cargando, null = no se pudo obtener
  const [grupos, setGrupos] = useState<PlanGroup[] | null | undefined>(undefined);
  const [modalCategoria, setModalCategoria] = useState<PlanGroup | "nueva" | null>(null);
  const [modalCard, setModalCard] = useState<{ categoriaId: number; card?: PlanCard } | null>(
    null,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmandoCategoriaId, setConfirmandoCategoriaId] = useState<number | null>(null);
  const [confirmandoCardId, setConfirmandoCardId] = useState<number | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listPlanesTodos(session.token).then(setGrupos);
  }, []);

  async function handleToggleCategoria(grupo: PlanGroup, next: boolean) {
    const session = getSession();
    if (!session || !grupo.id) return;

    setBusyId(`cat-${grupo.id}`);
    try {
      const actualizado = await actualizarPlanCategoria(session.token, grupo.id, {
        titulo: grupo.title,
        orden: grupo.orden ?? 0,
        activo: next,
        notas: grupo.note,
      });
      setGrupos((prev) => (prev ? prev.map((g) => (g.id === actualizado.id ? actualizado : g)) : prev));
    } catch (error) {
      console.error("No se pudo actualizar la categoría:", error);
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleCard(categoriaId: number, card: PlanCard, next: boolean) {
    const session = getSession();
    if (!session || !card.id) return;

    setBusyId(`card-${card.id}`);
    try {
      const actualizada = await actualizarPlanCard(session.token, card.id, {
        titulo: card.title,
        orden: card.orden ?? 0,
        activo: next,
        precio: card.price,
        items: card.items,
      });
      setGrupos((prev) =>
        prev
          ? prev.map((g) =>
              g.id === categoriaId
                ? { ...g, cards: g.cards.map((c) => (c.id === actualizada.id ? actualizada : c)) }
                : g,
            )
          : prev,
      );
    } catch (error) {
      console.error("No se pudo actualizar el plan:", error);
    } finally {
      setBusyId(null);
    }
  }

  async function moverCategoria(grupo: PlanGroup, direction: -1 | 1) {
    const session = getSession();
    if (!session || !grupos || !grupo.id) return;

    const ordenados = ordenarPorOrden(grupos);
    const index = ordenados.findIndex((g) => g.id === grupo.id);
    const target = ordenados[index + direction];
    if (!target || !target.id) return;

    const ordenGrupo = grupo.orden ?? index;
    const ordenTarget = target.orden ?? index + direction;

    setBusyId(`cat-${grupo.id}`);
    try {
      const [actualizadoA, actualizadoB] = await Promise.all([
        actualizarPlanCategoria(session.token, grupo.id, {
          titulo: grupo.title,
          orden: ordenTarget,
          activo: grupo.activo ?? true,
          notas: grupo.note,
        }),
        actualizarPlanCategoria(session.token, target.id, {
          titulo: target.title,
          orden: ordenGrupo,
          activo: target.activo ?? true,
          notas: target.note,
        }),
      ]);
      setGrupos((prev) =>
        prev
          ? prev.map((g) => {
              if (g.id === actualizadoA.id) return actualizadoA;
              if (g.id === actualizadoB.id) return actualizadoB;
              return g;
            })
          : prev,
      );
    } catch (error) {
      console.error("No se pudo reordenar la categoría:", error);
    } finally {
      setBusyId(null);
    }
  }

  async function moverCard(categoriaId: number, card: PlanCard, direction: -1 | 1) {
    const session = getSession();
    if (!session || !grupos || !card.id) return;

    const grupo = grupos.find((g) => g.id === categoriaId);
    if (!grupo) return;

    const ordenados = ordenarPorOrden(grupo.cards);
    const index = ordenados.findIndex((c) => c.id === card.id);
    const target = ordenados[index + direction];
    if (!target || !target.id) return;

    const ordenCard = card.orden ?? index;
    const ordenTarget = target.orden ?? index + direction;

    setBusyId(`card-${card.id}`);
    try {
      const [actualizadaA, actualizadaB] = await Promise.all([
        actualizarPlanCard(session.token, card.id, {
          titulo: card.title,
          orden: ordenTarget,
          activo: card.activo ?? true,
          precio: card.price,
          items: card.items,
        }),
        actualizarPlanCard(session.token, target.id, {
          titulo: target.title,
          orden: ordenCard,
          activo: target.activo ?? true,
          precio: target.price,
          items: target.items,
        }),
      ]);
      setGrupos((prev) =>
        prev
          ? prev.map((g) =>
              g.id === categoriaId
                ? {
                    ...g,
                    cards: g.cards.map((c) => {
                      if (c.id === actualizadaA.id) return actualizadaA;
                      if (c.id === actualizadaB.id) return actualizadaB;
                      return c;
                    }),
                  }
                : g,
            )
          : prev,
      );
    } catch (error) {
      console.error("No se pudo reordenar el plan:", error);
    } finally {
      setBusyId(null);
    }
  }

  async function handleEliminarCategoria(grupo: PlanGroup) {
    const session = getSession();
    if (!session || !grupo.id) return;

    setBusyId(`cat-${grupo.id}`);
    try {
      await eliminarPlanCategoria(session.token, grupo.id);
      setGrupos((prev) => (prev ? prev.filter((g) => g.id !== grupo.id) : prev));
    } catch (error) {
      console.error("No se pudo eliminar la categoría:", error);
    } finally {
      setBusyId(null);
      setConfirmandoCategoriaId(null);
    }
  }

  async function handleEliminarCard(categoriaId: number, card: PlanCard) {
    const session = getSession();
    if (!session || !card.id) return;

    setBusyId(`card-${card.id}`);
    try {
      await eliminarPlanCard(session.token, card.id);
      setGrupos((prev) =>
        prev
          ? prev.map((g) =>
              g.id === categoriaId ? { ...g, cards: g.cards.filter((c) => c.id !== card.id) } : g,
            )
          : prev,
      );
    } catch (error) {
      console.error("No se pudo eliminar el plan:", error);
    } finally {
      setBusyId(null);
      setConfirmandoCardId(null);
    }
  }

  function handleCategoriaGuardada(categoria: PlanGroup) {
    setGrupos((prev) => {
      if (!prev) return [categoria];
      const existe = prev.some((g) => g.id === categoria.id);
      return existe ? prev.map((g) => (g.id === categoria.id ? categoria : g)) : [...prev, categoria];
    });
    setModalCategoria(null);
  }

  function handleCardGuardada(categoriaId: number, card: PlanCard) {
    setGrupos((prev) =>
      prev
        ? prev.map((g) => {
            if (g.id !== categoriaId) return g;
            const existe = g.cards.some((c) => c.id === card.id);
            return {
              ...g,
              cards: existe ? g.cards.map((c) => (c.id === card.id ? card : c)) : [...g.cards, card],
            };
          })
        : prev,
    );
    setModalCard(null);
  }

  const gruposOrdenados = grupos ? ordenarPorOrden(grupos) : grupos;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
          Planes del sitio
        </h1>
        <button
          type="button"
          onClick={() => setModalCategoria("nueva")}
          className={buttonVariants({ variant: "primary", font: "heading" })}
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </button>
      </div>

      <p className="mt-2 font-heading font-light text-foreground/50">
        Categorías y planes que se muestran en la sección Planes de la web pública.
        Distintos de los planes de cuota que se le asignan a cada alumno.
      </p>

      {gruposOrdenados === undefined && (
        <p className="mt-6 font-heading font-light text-foreground/50">Cargando...</p>
      )}

      {gruposOrdenados === null && (
        <p className="mt-6 font-heading font-light text-foreground/50">
          No se pudo cargar la lista de planes.
        </p>
      )}

      {gruposOrdenados && gruposOrdenados.length === 0 && (
        <p className="mt-6 font-heading font-light text-foreground/50">
          Todavía no hay categorías de planes creadas.
        </p>
      )}

      {gruposOrdenados && gruposOrdenados.length > 0 && (
        <div className="mt-6 flex flex-col gap-6">
          {gruposOrdenados.map((grupo, grupoIndex) => {
            const cardsOrdenadas = ordenarPorOrden(grupo.cards);

            return (
              <DashboardCard key={grupo.id ?? grupo.title}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        disabled={grupoIndex === 0 || busyId === `cat-${grupo.id}`}
                        onClick={() => moverCategoria(grupo, -1)}
                        aria-label="Subir categoría"
                        className="-m-2 p-2 text-foreground/40 transition-colors hover:text-epr-green disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={
                          grupoIndex === gruposOrdenados.length - 1 || busyId === `cat-${grupo.id}`
                        }
                        onClick={() => moverCategoria(grupo, 1)}
                        aria-label="Bajar categoría"
                        className="-m-2 p-2 text-foreground/40 transition-colors hover:text-epr-green disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground">
                        {grupo.title}
                      </h2>
                      {grupo.note && grupo.note.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {grupo.note.map((nota) => (
                            <p key={nota} className="font-heading text-xs font-light text-foreground/50">
                              {nota}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Switch
                      checked={grupo.activo ?? true}
                      disabled={busyId === `cat-${grupo.id}`}
                      onCheckedChange={(next) => handleToggleCategoria(grupo, next)}
                      ariaLabel={`${grupo.activo ? "Desactivar" : "Activar"} la categoría ${grupo.title}`}
                    />
                    <button
                      type="button"
                      onClick={() => setModalCategoria(grupo)}
                      className="font-heading text-sm text-epr-green hover:underline"
                    >
                      Editar
                    </button>
                    {confirmandoCategoriaId === grupo.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busyId === `cat-${grupo.id}`}
                          onClick={() => handleEliminarCategoria(grupo)}
                          className="font-heading text-sm text-red-400 hover:underline disabled:opacity-50"
                        >
                          {busyId === `cat-${grupo.id}` ? "Eliminando..." : "Sí, eliminar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmandoCategoriaId(null)}
                          className="font-heading text-sm text-foreground/60 hover:text-foreground"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmandoCategoriaId(grupo.id ?? null)}
                        aria-label={`Eliminar categoría ${grupo.title}`}
                        className="-m-2 p-2 text-foreground/40 transition-colors hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 md:hidden">
                  {cardsOrdenadas.map((card, cardIndex) => (
                    <div
                      key={card.id ?? card.title}
                      className="rounded-xl border border-white/10 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              disabled={cardIndex === 0 || busyId === `card-${card.id}`}
                              onClick={() => moverCard(grupo.id!, card, -1)}
                              aria-label="Subir plan"
                              className="-m-2 p-2 text-foreground/40 transition-colors hover:text-epr-green disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={
                                cardIndex === cardsOrdenadas.length - 1 ||
                                busyId === `card-${card.id}`
                              }
                              onClick={() => moverCard(grupo.id!, card, 1)}
                              aria-label="Bajar plan"
                              className="-m-2 p-2 text-foreground/40 transition-colors hover:text-epr-green disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div>
                            <p className="font-heading font-semibold text-foreground">
                              {card.title}
                            </p>
                            <p className="font-heading text-sm font-light text-foreground/60">
                              {formatPrecio(card.price)}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={card.activo ?? true}
                          disabled={busyId === `card-${card.id}`}
                          onCheckedChange={(next) => handleToggleCard(grupo.id!, card, next)}
                          ariaLabel={`${card.activo ? "Desactivar" : "Activar"} el plan ${card.title}`}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
                        <button
                          type="button"
                          onClick={() => setModalCard({ categoriaId: grupo.id!, card })}
                          className="font-heading text-sm text-epr-green hover:underline"
                        >
                          Editar
                        </button>
                        {confirmandoCardId === card.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={busyId === `card-${card.id}`}
                              onClick={() => handleEliminarCard(grupo.id!, card)}
                              className="font-heading text-sm text-red-400 hover:underline disabled:opacity-50"
                            >
                              {busyId === `card-${card.id}` ? "Eliminando..." : "Sí, eliminar"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmandoCardId(null)}
                              className="font-heading text-sm text-foreground/60 hover:text-foreground"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmandoCardId(card.id ?? null)}
                            aria-label={`Eliminar plan ${card.title}`}
                            className="-m-2 flex items-center gap-1.5 p-2 font-heading text-sm text-foreground/40 transition-colors hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {cardsOrdenadas.length === 0 && (
                    <p className="font-heading font-light text-foreground/50">
                      Esta categoría todavía no tiene planes.
                    </p>
                  )}
                </div>

                <div className="mt-6 hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[560px] text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-3" />
                        <th className="pb-3 font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
                          Plan
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
                      {cardsOrdenadas.map((card, cardIndex) => (
                        <tr key={card.id ?? card.title} className="border-b border-white/5 last:border-b-0">
                          <td className="py-3 pr-2">
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                disabled={cardIndex === 0 || busyId === `card-${card.id}`}
                                onClick={() => moverCard(grupo.id!, card, -1)}
                                aria-label="Subir plan"
                                className="text-foreground/40 transition-colors hover:text-epr-green disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={
                                  cardIndex === cardsOrdenadas.length - 1 || busyId === `card-${card.id}`
                                }
                                onClick={() => moverCard(grupo.id!, card, 1)}
                                aria-label="Bajar plan"
                                className="text-foreground/40 transition-colors hover:text-epr-green disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 font-heading font-semibold text-foreground">
                            {card.title}
                          </td>
                          <td className="py-3 font-heading font-light text-foreground/60">
                            {formatPrecio(card.price)}
                          </td>
                          <td className="py-3">
                            <div className="flex justify-end">
                              <Switch
                                checked={card.activo ?? true}
                                disabled={busyId === `card-${card.id}`}
                                onCheckedChange={(next) => handleToggleCard(grupo.id!, card, next)}
                                ariaLabel={`${card.activo ? "Desactivar" : "Activar"} el plan ${card.title}`}
                              />
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => setModalCard({ categoriaId: grupo.id!, card })}
                                className="font-heading text-sm text-epr-green hover:underline"
                              >
                                Editar
                              </button>
                              {confirmandoCardId === card.id ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={busyId === `card-${card.id}`}
                                    onClick={() => handleEliminarCard(grupo.id!, card)}
                                    className="font-heading text-sm text-red-400 hover:underline disabled:opacity-50"
                                  >
                                    {busyId === `card-${card.id}` ? "..." : "Sí"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmandoCardId(null)}
                                    className="font-heading text-sm text-foreground/60 hover:text-foreground"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmandoCardId(card.id ?? null)}
                                  aria-label={`Eliminar plan ${card.title}`}
                                  className="text-foreground/40 transition-colors hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {cardsOrdenadas.length === 0 && (
                    <p className="py-3 font-heading font-light text-foreground/50">
                      Esta categoría todavía no tiene planes.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setModalCard({ categoriaId: grupo.id! })}
                  className="mt-4 flex items-center gap-1.5 font-heading text-sm text-epr-green hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nuevo plan en esta categoría
                </button>
              </DashboardCard>
            );
          })}
        </div>
      )}

      {modalCategoria && (
        <PlanCategoriaModal
          categoria={modalCategoria === "nueva" ? undefined : modalCategoria}
          defaultOrden={grupos?.length ?? 0}
          onClose={() => setModalCategoria(null)}
          onSaved={handleCategoriaGuardada}
        />
      )}

      {modalCard && (
        <PlanCardModal
          categoriaId={modalCard.categoriaId}
          card={modalCard.card}
          defaultOrden={grupos?.find((g) => g.id === modalCard.categoriaId)?.cards.length ?? 0}
          onClose={() => setModalCard(null)}
          onSaved={(card) => handleCardGuardada(modalCard.categoriaId, card)}
        />
      )}
    </div>
  );
}
