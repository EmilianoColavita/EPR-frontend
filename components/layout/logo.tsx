"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative h-20 w-20 shrink-0 transition-transform duration-300 hover:scale-105 sm:h-24 sm:w-24 lg:h-28 lg:w-28",
        className,
      )}
    >
      <div className="absolute inset-0 -z-10 rounded-full bg-epr-green/25 blur-2xl" />

      {!imageFailed && (
        <Image
          src="/images/logo.jpeg"
          alt="E.P.R"
          fill
          sizes="(min-width: 1024px) 112px, (min-width: 640px) 96px, 80px"
          className="rounded-full object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          onError={() => setImageFailed(true)}
        />
      )}

      {imageFailed && (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full border-2 border-foreground/70 bg-epr-dark p-2 text-center">
          <span className="font-display text-lg leading-none tracking-tight text-foreground sm:text-2xl">
            E.P.R
          </span>
          <span className="mt-1 max-w-[64px] text-[6px] font-semibold uppercase leading-[1.15] tracking-wide text-foreground/70 sm:text-[7px]">
            Entrenamiento para el rendimiento
          </span>
          <span className="mt-1 h-px w-6 bg-epr-green" />
        </div>
      )}
    </div>
  );
}
