"use client";

import type { ReactNode } from "react";
import { Mail, MapPin } from "lucide-react";
import { motion } from "motion/react";

import { cn, TITLE_GRADIENT } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { FacebookIcon, InstagramIcon } from "@/components/ui/social-icons";
import { Logo } from "@/components/layout/logo";
import {
  DIRECCION,
  EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  MAPS_EMBED_SRC,
  MAPS_SEARCH_HREF,
  TELEFONO_VISIBLE,
  mailtoHref,
  whatsappHref,
} from "@/lib/site-info";

const GALERIA = [
  { src: "/images/nosotros-1.png", alt: "Zona de mancuernas del gimnasio" },
  { src: "/images/nosotros-3.png", alt: "Interior del gimnasio" },
];

function ContactCard({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-epr-card/60 p-5 backdrop-blur-sm transition-colors hover:border-epr-green/60"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-epr-green/60 text-epr-green">
        {icon}
      </span>
      <div>
        <p className="font-heading text-xs font-light uppercase tracking-widest text-foreground/50">
          {label}
        </p>
        <p className="font-heading font-semibold text-foreground">{value}</p>
      </div>
    </a>
  );
}

export function Contacto() {
  return (
    <>
      <section className="relative overflow-hidden bg-epr-dark py-20 sm:py-24">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: "url('/images/fondoEPR5.png')" }}
        />
        <div className="absolute inset-0 bg-epr-dark/80" />

        <motion.div
          className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6 lg:px-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.div variants={fadeUp}>
            <Logo className="h-24 w-24 sm:h-28 sm:w-28" />
          </motion.div>

          <motion.h1
            className={cn(
              "mt-6 py-1 font-heading text-4xl font-bold uppercase leading-[1.15] tracking-tight sm:text-5xl",
              TITLE_GRADIENT,
            )}
            variants={fadeUp}
          >
            Contacto
          </motion.h1>
          <motion.p
            className="mt-4 font-heading font-light text-foreground/70"
            variants={fadeUp}
          >
            ¿Tenés dudas o querés sumarte a E.P.R? Escribinos por donde te
            resulte más cómodo, te respondemos a la brevedad.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.div className="flex flex-col gap-4" variants={fadeUp}>
            <ContactCard
              href={whatsappHref("Hola! Tengo una consulta para E.P.R.")}
              icon={<WhatsAppIcon className="h-5 w-5" />}
              label="WhatsApp"
              value={TELEFONO_VISIBLE}
            />
            <ContactCard
              href={mailtoHref("Consulta desde la web")}
              icon={<Mail className="h-5 w-5" />}
              label="Email"
              value={EMAIL}
            />
            <ContactCard
              href={INSTAGRAM_URL}
              icon={<InstagramIcon className="h-5 w-5" />}
              label="Instagram"
              value="@epr.entrenamiento"
            />
            <ContactCard
              href={FACEBOOK_URL}
              icon={<FacebookIcon className="h-5 w-5" />}
              label="Facebook"
              value="E.P.R Entrenamiento"
            />
          </motion.div>

          <motion.div className="grid grid-cols-2 gap-3 sm:gap-4" variants={fadeUp}>
            <div className="col-span-2 aspect-video overflow-hidden rounded-2xl border border-white/10">
              <div
                className="h-full w-full bg-cover bg-center transition-transform duration-500 hover:scale-105"
                style={{ backgroundImage: "url('/images/nosotros-2.png')" }}
                role="img"
                aria-label="Vista del gimnasio al atardecer"
              />
            </div>
            {GALERIA.map((foto) => (
              <div
                key={foto.src}
                className="aspect-square overflow-hidden rounded-2xl border border-white/10"
              >
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 hover:scale-105"
                  style={{ backgroundImage: `url('${foto.src}')` }}
                  role="img"
                  aria-label={foto.alt}
                />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-epr-dark pb-20 sm:pb-28">
        <motion.div
          className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            className="flex flex-col overflow-hidden rounded-3xl border border-epr-green/30 bg-epr-card/60 lg:flex-row"
            variants={fadeUp}
          >
            <div className="flex-1 p-8 sm:p-10">
              <p className="font-heading text-sm font-semibold uppercase tracking-widest text-foreground">
                Ubicación
              </p>
              <p className="mt-3 max-w-sm font-heading font-light text-foreground/70">
                {DIRECCION}
              </p>
              <a
                href={MAPS_SEARCH_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 font-heading text-sm text-foreground transition-colors hover:border-epr-green hover:text-epr-green"
              >
                <MapPin className="h-4 w-4" />
                Ver en Maps
              </a>
            </div>

            <div className="h-64 flex-1 lg:h-auto">
              <iframe
                src={MAPS_EMBED_SRC}
                title="Ubicación de E.P.R en el mapa"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
