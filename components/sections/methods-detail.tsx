"use client";

import type { ReactNode } from "react";
import { Bike, CircleCheck, Dumbbell, Medal, PersonStanding, Volleyball } from "lucide-react";
import { motion } from "motion/react";

import { cn, TITLE_GRADIENT } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

function IconCircle({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-epr-green/60 text-epr-green">
      {children}
    </span>
  );
}

export function MethodsDetail() {
  return (
    <section className="relative overflow-hidden bg-epr-dark py-20 sm:py-28">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/nosotros-3.png')" }}
      />
      <div className="absolute inset-0 bg-epr-dark/85" />
      <div className="absolute inset-0 bg-gradient-to-b from-epr-dark/40 via-transparent to-epr-dark/40" />

      <motion.div
        className="relative mx-auto flex max-w-5xl flex-col gap-16 px-4 sm:px-6 lg:px-10"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div className="flex items-center gap-6" variants={fadeUp}>
          <div className="flex-1 rounded-3xl border border-epr-green/30 bg-epr-dark/70 p-8 backdrop-blur-sm sm:p-10">
            <h1
              className={cn(
                "py-1 font-heading text-3xl font-bold uppercase leading-[1.25] tracking-tight sm:text-4xl",
                TITLE_GRADIENT,
              )}
            >
              ¿Qué es E.P.R?
            </h1>

            <div className="mt-5 space-y-4 font-heading font-light text-foreground/85">
              <p>
                Entrenamiento Para el Rendimiento es la creación de un
                espacio de entrenamiento personalizado diseñado para
                quienes buscan mejorar su rendimiento físico a través de
                un proceso de evaluaciones, planificaciones y seguimiento
                basado en evidencia.
              </p>
              <p>
                Nuestro objetivo es acercar los recursos del alto
                rendimiento a la población general, adaptándolos a las
                necesidades y objetivos de cada persona para que todos
                puedan entrenar con mayor seguridad, eficiencia y
                propósito.
              </p>
              <p>
                Creemos que cualquier persona, independientemente de su
                experiencia o condición física, puede beneficiarse de una
                evaluación precisa y de un entrenamiento personalizado.
              </p>
              <p>
                E.P.R cuenta con tecnología utilizada en el alto
                rendimiento (Encoder Lineal, Plataformas de Fuerza,
                Celdas de Carga).
              </p>
              <p>
                No creemos en rutinas genéricas ni en entrenar por
                hacerlo; creemos en un proceso que optimiza tu
                rendimiento, reduce el riesgo de lesiones y te acerca,
                paso a paso, a tu mejor versión física.
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 flex-col gap-6 lg:flex">
            <IconCircle>
              <Dumbbell className="h-7 w-7" />
            </IconCircle>
            <IconCircle>
              <Volleyball className="h-7 w-7" />
            </IconCircle>
            <IconCircle>
              <Bike className="h-7 w-7" />
            </IconCircle>
          </div>
        </motion.div>

        <motion.div className="flex items-center gap-6" variants={fadeUp}>
          <div className="hidden shrink-0 flex-col gap-6 lg:flex">
            <IconCircle>
              <CircleCheck className="h-7 w-7" />
            </IconCircle>
            <IconCircle>
              <PersonStanding className="h-7 w-7" />
            </IconCircle>
            <IconCircle>
              <Medal className="h-7 w-7" />
            </IconCircle>
          </div>

          <div className="flex-1 rounded-3xl border border-epr-green/30 bg-epr-dark/70 p-8 backdrop-blur-sm sm:p-10">
            <h2
              className={cn(
                "py-1 font-heading text-3xl font-bold uppercase leading-[1.25] tracking-tight sm:text-4xl",
                TITLE_GRADIENT,
              )}
            >
              ¿Para quiénes es E.P.R?
            </h2>

            <div className="mt-5 space-y-5 font-heading font-light text-foreground/85">
              <p>
                <span className="font-semibold text-foreground">
                  Deportistas recreativos - Deportistas del Alto
                  Rendimiento:
                </span>{" "}
                Los planes MENSUALES están destinados a deportistas
                amateurs, recreativos y profesionales. A partir de una
                evaluación inicial y de las demandas específicas de cada
                disciplina, diseñamos una planificación individualizada
                con un seguimiento continuo, buscando optimizar el
                rendimiento deportivo, favorecer una evolución sostenida
                y alcanzar las metas deportivas de cada atleta.
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  Evaluaciones:
                </span>{" "}
                Las evaluaciones FUNCIONALES están destinadas a toda la
                población, independientemente de la edad, la experiencia
                o el nivel de entrenamiento. Mediante la utilización de
                celdas de carga analizamos la fuerza en los miembros
                inferiores y superiores, obteniendo datos objetivos del
                estado de la musculatura de cada persona. A raíz de esto
                comenzamos a planificar el entrenamiento y contribuimos a
                la corrección de asimetrías y desbalances musculares.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
