"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

import { buttonVariants } from "@/components/ui/button";
import { cn, TITLE_GRADIENT } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { PlanGroup } from "@/lib/api";

export function Plans({
  groups,
  showCta = true,
}: {
  groups: PlanGroup[];
  showCta?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-epr-dark py-20 sm:py-28">
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
        style={{ backgroundImage: "url('/images/fondoEPR5.png')" }}
      />
      <div className="absolute inset-0 bg-epr-dark/85" />

      <motion.div
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div variants={fadeUp}>
          <h2
            className={cn(
              "py-2 font-heading text-5xl font-semibold italic uppercase tracking-tight",
              TITLE_GRADIENT,
            )}
          >
            Planes
          </h2>
          <div className="mt-2 h-px w-40 bg-white/25" />
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {groups.map((group) => (
            <motion.div
              key={group.id ?? group.title}
              variants={fadeUp}
              className="flex flex-col gap-6 rounded-3xl border border-white/15 bg-black/20 p-6 sm:p-8"
            >
              <h3 className="text-center font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
                {group.title}
              </h3>

              {group.cards.map((card) => (
                <div
                  key={card.id ?? card.title}
                  className="rounded-2xl border border-epr-green/30 bg-epr-dark/60 p-6"
                >
                  <div className="text-center">
                    <h4 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
                      {card.title}
                    </h4>
                    <div className="mx-auto mt-2 h-px w-16 bg-white/20" />
                  </div>
                  <ul className="mt-4 space-y-2">
                    {card.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 font-heading font-light text-foreground/90"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/50" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {group.note && (
                <div className="space-y-3 border-t border-white/10 pt-4">
                  {group.note.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="font-heading text-sm font-light text-foreground/60"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {showCta && (
          <motion.div className="mt-10 flex justify-end" variants={fadeUp}>
            <Link
              href="/planes"
              className={buttonVariants({
                variant: "primary",
                size: "lg",
                font: "heading",
              })}
            >
              Seleccionar plan
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
