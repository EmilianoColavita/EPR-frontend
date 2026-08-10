"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "motion/react";

import { buttonVariants } from "@/components/ui/button";

const HERO_LETTERS: { highlight: string; rest: string }[] = [
  { highlight: "E", rest: "ntrenamiento" },
  { highlight: "P", rest: "ara el" },
  { highlight: "R", rest: "endimiento" },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.15,
    },
  },
};

const lineContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.22,
    },
  },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -80 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: "easeOut" },
  },
};

export function Hero() {
  return (
    <section
      className="relative flex min-h-[calc(100vh-7rem)] items-center overflow-hidden bg-epr-dark"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(18,18,18,0.96) 0%, rgba(18,18,18,0.75) 45%, rgba(18,18,18,0.55) 100%), radial-gradient(circle at 75% 30%, rgba(60,60,60,0.4), transparent 60%), url('/images/fondoEPR5.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-10">
        <motion.div
          className="max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            className="font-heading text-7xl font-semibold italic uppercase leading-[0.95] tracking-tight sm:text-8xl md:text-9xl"
            variants={lineContainerVariants}
          >
            {HERO_LETTERS.map((line) => (
              <motion.span
                key={line.highlight}
                className="block"
                variants={slideInLeft}
              >
                <span className="text-epr-green">{line.highlight}</span>
                <span className="text-foreground">{line.rest}</span>
              </motion.span>
            ))}
          </motion.h1>

          <motion.div className="mt-8 max-w-md pt-6" variants={fadeUp}>
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.04) 100%)",
              }}
            />
            <p className="mt-6 font-heading text-xl font-light text-foreground/70">
              No entrenamos por entrenar. Entrenamos para rendir.
            </p>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
            variants={fadeUp}
          >
            <Link
              href="/contacto"
              className={buttonVariants({
                variant: "primary",
                size: "lg",
                font: "heading",
              })}
            >
              Reservar evaluacion
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            <Link
              href="/planes"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                font: "heading",
              })}
            >
              Ver planes
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
