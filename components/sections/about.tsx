"use client";

import { motion } from "motion/react";

import { cn, TITLE_GRADIENT } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

const BACKGROUND_IMAGES = [
  "/images/nosotros-1.png",
  "/images/nosotros-2.png",
  "/images/nosotros-3.png",
];

export function About() {
  return (
    <section className="relative overflow-hidden bg-epr-dark">
      <div className="absolute inset-0 grid grid-cols-3">
        {BACKGROUND_IMAGES.map((src, index) => (
          <div key={src} className="relative h-full w-full">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${src}')`,
                filter: index === 1 ? "brightness(0.65)" : undefined,
              }}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-epr-dark/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-epr-dark/20 via-transparent to-epr-dark/35" />

      <motion.div
        className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2
          className={cn(
            "py-2 font-heading text-4xl font-bold uppercase leading-[1.25] tracking-tight sm:text-5xl",
            TITLE_GRADIENT,
          )}
          variants={fadeUp}
        >
          ¿Quiénes somos?
        </motion.h2>

        <motion.div
          className="mt-14 w-full max-w-2xl rounded-3xl border border-epr-green/30 bg-epr-dark/70 p-8 backdrop-blur-sm sm:mt-16 sm:p-10"
          variants={fadeUp}
        >
          <h3 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
            Luciano Colavita
          </h3>
          <p className="mt-1 font-heading font-light text-foreground/60">
            Fundador &amp; Head Coach
          </p>

          <div className="mt-6 space-y-5 font-heading font-light text-foreground/85">
            <p>
              Detrás de E.P.R está la pasión por llevar la preparación
              física al siguiente nivel. Liderado por Luciano Colavita,
              nuestro equipo combina experiencia en el alto rendimiento,
              evaluación continua y tecnología para ofrecer un
              entrenamiento con propósito real.
            </p>
            <p>
              En alianza con MuttiGimnasio, creamos un entorno diseñado
              para que cada atleta y usuario encuentre las herramientas
              precisas para superar sus límites con seguridad y máxima
              eficiencia.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
