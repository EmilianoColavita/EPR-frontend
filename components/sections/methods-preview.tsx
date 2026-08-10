"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

import { buttonVariants } from "@/components/ui/button";
import { cn, TITLE_GRADIENT } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function MethodsPreview() {
  return (
    <section className="relative overflow-hidden bg-epr-dark py-20 sm:py-28">
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
        style={{ backgroundImage: "url('/images/fondoEPR5.png')" }}
      />
      <div className="absolute inset-0 bg-epr-dark/85" />

      <motion.div
        className="relative mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:px-10"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-epr-green/20 lg:aspect-auto lg:col-span-4 lg:row-span-2"
          variants={fadeUp}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/metodos-1.png')" }}
          />
        </motion.div>

        <motion.div
          className="rounded-3xl border border-epr-green/30 bg-epr-card/60 p-8 backdrop-blur-sm sm:p-10 lg:col-span-8"
          variants={fadeUp}
        >
          <h2
            className={cn(
              "py-1 font-heading text-3xl font-bold uppercase leading-[1.25] tracking-tight sm:text-4xl",
              TITLE_GRADIENT,
            )}
          >
            ¿Qué es E.P.R?
          </h2>
          <div className="mt-5 space-y-4 font-heading font-light text-foreground">
            <p>
              Entrenamiento Para el Rendimiento es la creación en conjunto
              con MuttiGimnasio de un espacio de entrenamiento
              personalizado diseñado para quienes buscan mejorar su
              rendimiento físico a través de un proceso de evaluaciones,
              planificaciones y seguimiento basado en evidencia.
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Ciencia y Tecnología:
              </span>{" "}
              Monitoreo con Encoder Lineal, Plataformas de Fuerza y Celdas
              de Carga.
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Sin Rutinas Genéricas:
              </span>{" "}
              Proceso individualizado centrado en la seguridad, la
              eficiencia y el progreso real.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-epr-green/20 lg:aspect-auto lg:col-span-3"
          variants={fadeUp}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/metodos-2.png')" }}
          />
        </motion.div>

        <motion.div
          className="rounded-3xl border border-epr-green/30 bg-epr-card/60 p-8 backdrop-blur-sm sm:p-10 lg:col-span-5"
          variants={fadeUp}
        >
          <h2
            className={cn(
              "py-1 font-heading text-3xl font-bold uppercase leading-[1.25] tracking-tight sm:text-4xl",
              TITLE_GRADIENT,
            )}
          >
            ¿Para quiénes es E.P.R?
          </h2>
          <div className="mt-5 space-y-4 font-heading font-light text-foreground">
            <p>
              <span className="font-semibold text-foreground">
                Área de Evaluaciones
              </span>{" "}
              <span className="text-foreground">(Para toda persona)</span>{" "}
              Diagnóstico de fuerza (MMII/MMSS) y detección de asimetrías
              para planificar con precisión y prevenir lesiones.
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Área de Rendimiento Deportivo
              </span>{" "}
              <span className="text-foreground">
                (Amateurs y Profesionales)
              </span>{" "}
              Planificación individualizada según las demandas de tu
              deporte para optimizar tu evolución atlética.
            </p>
          </div>
        </motion.div>

        <motion.div className="flex justify-end lg:col-span-12" variants={fadeUp}>
          <Link
            href="/metodos"
            className={buttonVariants({ variant: "outline", font: "heading" })}
          >
            Leer mas
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
