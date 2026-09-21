"use client";

import {
  ArrowRight,
  ClipboardList,
  History,
  Mail,
  PersonStanding,
  Star,
  Target,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { EMAIL } from "@/lib/site-info";
import { buttonVariants } from "@/components/ui/button";

const REQUISITOS = [
  "Asistir regularmente a los entrenamientos.",
  "Respetar las normas de convivencia y las pautas establecidas por los profesionales.",
  "Mantener una conducta acorde con los valores del proyecto.",
];

const VALORES = [
  {
    icon: PersonStanding,
    label: "Compromiso",
    caption: "Con tu entrenamiento y tus objetivos.",
  },
  { icon: Users, label: "Respeto", caption: "Por las normas y la convivencia." },
  { icon: Star, label: "Valores", caption: "Del proyecto E.P.R." },
];

export function Becas() {
  return (
    <>
      <section className="relative overflow-hidden bg-epr-dark py-20 sm:py-28">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/fondoEPR5.png')" }}
        />
        <div className="absolute inset-0 bg-epr-dark/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-epr-dark via-epr-dark/25 to-transparent" />

        <motion.div
          className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h1
            className="font-heading text-5xl font-bold uppercase leading-[1.15] tracking-tight sm:text-6xl lg:text-7xl"
            variants={fadeUp}
          >
            <span className="text-foreground">Programa de</span>
            <br />
            <span className="text-epr-green">Becas Deportivas</span>{" "}
            <span className="text-foreground">E.P.R.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl font-heading text-lg font-light text-foreground/85 sm:text-xl"
            variants={fadeUp}
          >
            En E.P.R. creemos en el potencial de quienes entrenan con
            compromiso, por eso ofrecemos becas deportivas para aquellos que
            buscan crecer en el ámbito deportivo.
          </motion.p>

          <motion.a
            href="#postularte"
            className={cn(buttonVariants({ variant: "primary", font: "heading" }), "mt-8")}
            variants={fadeUp}
          >
            <UserPlus className="h-4 w-4" />
            Inscribirme en la beca
            <ArrowRight className="h-4 w-4" />
          </motion.a>
        </motion.div>
      </section>

      <section className="bg-epr-dark py-16 sm:py-20">
        <motion.div
          className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.div
            className="rounded-3xl border border-epr-green/30 bg-epr-card/40 p-8 backdrop-blur-sm"
            variants={fadeUp}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-epr-green/60 text-epr-green">
              <Target className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-heading text-xl font-bold uppercase tracking-tight text-foreground">
              ¿Quiénes pueden postularse?
            </h2>
            <p className="mt-3 font-heading font-light text-foreground/70">
              El programa está dirigido a personas comprometidas con su
              entrenamiento y que quieran crecer en el ámbito deportivo, sin
              importar su nivel actual.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {VALORES.map((valor) => (
                <div
                  key={valor.label}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <valor.icon className="h-6 w-6 text-epr-green" />
                  <p className="font-heading text-sm font-bold uppercase text-foreground">
                    {valor.label}
                  </p>
                  <p className="font-heading text-xs font-light text-foreground/50">
                    {valor.caption}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="rounded-3xl border border-epr-green/30 bg-epr-card/40 p-8 backdrop-blur-sm"
            variants={fadeUp}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-epr-green/60 text-epr-green">
              <ClipboardList className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-heading text-xl font-bold uppercase tracking-tight text-foreground">
              Requisitos principales
            </h2>

            <ul className="mt-4 flex flex-col gap-3">
              {REQUISITOS.map((req, index) => (
                <li key={req} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-epr-green font-heading text-xs font-bold text-epr-dark">
                    {index + 1}
                  </span>
                  <span className="font-heading font-light text-foreground/80">
                    {req}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-epr-green" />
                <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
                  Revisión periódica
                </h3>
              </div>
              <p className="mt-3 font-heading font-light text-foreground/70">
                La beca se revisa periódicamente según el compromiso, la
                asistencia y el desempeño de cada deportista.
              </p>
            </div>
          </motion.div>

          <motion.div
            id="postularte"
            className="relative scroll-mt-28 overflow-hidden rounded-3xl border border-epr-green/30"
            variants={fadeUp}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/images/metodossss.png')",
                filter: "brightness(0.4)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-epr-dark via-epr-dark/70 to-epr-dark/30" />

            <div className="relative p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-epr-green/60 text-epr-green">
                <Mail className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-heading text-xl font-bold uppercase tracking-tight text-foreground">
                ¿Cómo postularte?
              </h2>
              <p className="mt-3 font-heading font-light text-foreground/80">
                Si te sentís identificado y querés postularte, escribinos a:
              </p>

              <a
                href={`mailto:${EMAIL}`}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-epr-green px-5 py-3 font-heading text-sm font-semibold text-epr-dark transition-colors hover:bg-epr-green/90"
              >
                {EMAIL}
                <ArrowRight className="h-4 w-4" />
              </a>

              <p className="mt-4 font-heading font-light text-foreground/70">
                Contanos tu situación deportiva y por qué te gustaría formar
                parte de E.P.R.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative overflow-hidden bg-epr-dark py-14">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: "url('/images/fondoEPR5.png')" }}
        />
        <div className="absolute inset-0 bg-epr-dark/85" />

        <motion.div
          className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:flex-row lg:justify-between lg:px-10 lg:text-left"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p
            className="max-w-2xl font-heading text-2xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-3xl"
            variants={fadeUp}
          >
            Si sos de los que no entrena por entrenar, sino que entrena para
            rendir...{" "}
            <span className="font-semibold italic text-epr-green">
              Esta es tu oportunidad.
            </span>
          </motion.p>

          <motion.a
            href="#postularte"
            className={cn(
              buttonVariants({ variant: "outline", font: "heading" }),
              "h-auto shrink-0 whitespace-normal py-3 text-center leading-snug",
            )}
            variants={fadeUp}
          >
            <Trophy className="h-4 w-4 shrink-0" />
            Sumate al programa de becas deportivas
          </motion.a>
        </motion.div>
      </section>
    </>
  );
}
