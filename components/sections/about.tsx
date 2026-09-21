"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn, TITLE_GRADIENT } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

const BACKGROUND_IMAGES = [
  "/images/nosotros-1.png",
  "/images/nosotros-2.png",
  "/images/nosotros-3.png",
];

const CIERRE_COMUN =
  "Creamos un entorno pensado para que atletas, deportistas recreativos y personas vinculadas al fitness puedan acceder a herramientas tecnológicas y metodologías propias del alto rendimiento, evaluarse, conocer su punto de partida y trabajar para superar sus propios registros.";

const PERFILES = [
  {
    nombre: "Muttigimnasio",
    rol: null,
    avatar: "/images/avatar-muttigimnasio.jpg",
    parrafos: [
      "Somos Muttigimnasios. 30 años ayudando a nuestros alumnos a alcanzar su mejor versión. Con la preparación en fuerza, el entrenamiento de running y las clases funcionales, damos a nuestra clientela las herramientas para desarrollar sus cualidades físicas.",
      CIERRE_COMUN,
    ],
  },
  {
    nombre: "Luciano Colavita",
    rol: "Fundador & Head Coach",
    avatar: "/images/avatar-luciano.jpg",
    parrafos: [
      "Detrás de E.P.R. está la pasión por llevar el rendimiento físico a otro nivel, acercando herramientas y metodologías del alto rendimiento a cada persona que busca entrenar con un propósito.",
      "E.P.R. es liderado por Luciano Colavita, Profesor en Educación Física egresado de la Universidad Nacional de La Plata (UNLP) y Licenciado en Alto Rendimiento Deportivo, egresado de la Universidad Nacional de Lomas de Zamora (UNLZ).",
      CIERRE_COMUN,
    ],
  },
] as const;

function PerfilAvatar({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative z-10 h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-epr-dark bg-epr-card shadow-lg sm:h-36 sm:w-36">
      {!failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="144px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-3xl text-foreground/50">
          {alt.charAt(0)}
        </div>
      )}
    </div>
  );
}

export function About() {
  const [active, setActive] = useState(1);

  function goTo(step: 1 | -1) {
    setActive((prev) => (prev + step + PERFILES.length) % PERFILES.length);
  }

  const inactiveIndex = PERFILES.findIndex((_, index) => index !== active);
  const otherSide = inactiveIndex < active ? "left" : "right";

  return (
    <section id="nosotros" className="relative overflow-hidden bg-epr-dark scroll-mt-28">
      <div
        className="absolute inset-0 bg-cover bg-center sm:hidden"
        style={{
          backgroundImage: `url('${BACKGROUND_IMAGES[1]}')`,
          filter: "brightness(0.65)",
        }}
      />
      <div className="absolute inset-0 hidden grid-cols-3 sm:grid">
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
        className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6"
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
          className="relative mt-20 grid w-full grid-cols-1 place-items-center sm:mt-24"
          variants={fadeUp}
        >
          {otherSide === "left" && (
            <button
              type="button"
              onClick={() => goTo(-1)}
              aria-label="Ver perfil anterior"
              className="absolute left-0 top-1/2 z-30 -translate-y-1/2 rounded-full border border-epr-green/40 bg-epr-dark/80 p-2 text-foreground backdrop-blur-sm transition hover:border-epr-green hover:text-epr-green sm:left-2 sm:p-2.5"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
          {otherSide === "right" && (
            <button
              type="button"
              onClick={() => goTo(1)}
              aria-label="Ver perfil siguiente"
              className="absolute right-0 top-1/2 z-30 -translate-y-1/2 rounded-full border border-epr-green/40 bg-epr-dark/80 p-2 text-foreground backdrop-blur-sm transition hover:border-epr-green hover:text-epr-green sm:right-2 sm:p-2.5"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {PERFILES.map((perfil, index) => {
            const isActive = index === active;
            const side = isActive ? null : index < active ? "left" : "right";

            return (
              <motion.div
                key={perfil.nombre}
                style={{ zIndex: isActive ? 20 : 10 }}
                animate={{
                  x: isActive ? "0%" : side === "left" ? "-72%" : "72%",
                  scale: isActive ? 1 : 0.8,
                  opacity: isActive ? 1 : 0.45,
                  filter: isActive ? "blur(0px)" : "blur(6px)",
                }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                onClick={() => !isActive && setActive(index)}
                role={isActive ? undefined : "button"}
                aria-label={isActive ? undefined : `Ver perfil de ${perfil.nombre}`}
                className={cn(
                  "col-start-1 row-start-1 flex w-[82%] max-w-md flex-col items-center sm:w-full sm:max-w-lg",
                  !isActive && "cursor-pointer",
                )}
              >
                <PerfilAvatar src={perfil.avatar} alt={perfil.nombre} />

                <div className="-mt-16 w-full rounded-3xl border border-epr-green/30 bg-epr-dark/70 px-8 pb-8 pt-20 backdrop-blur-sm sm:px-10 sm:pb-10">
                  <h3 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
                    {perfil.nombre}
                  </h3>
                  {perfil.rol && (
                    <p className="mt-1 font-heading font-light text-foreground/60">
                      {perfil.rol}
                    </p>
                  )}

                  <div className="mt-6 space-y-5 text-left font-heading font-light text-foreground/85">
                    {perfil.parrafos.map((parrafo, paragraphIndex) => (
                      <p key={paragraphIndex}>{parrafo}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
