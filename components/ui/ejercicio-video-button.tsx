"use client";

import { useState } from "react";
import { PlayCircle, X } from "lucide-react";

import { getYoutubeEmbedUrl } from "@/lib/youtube";

export function EjercicioVideoButton({ url }: { url: string | null | undefined }) {
  const [open, setOpen] = useState(false);
  const embedUrl = url ? getYoutubeEmbedUrl(url) : null;

  if (!embedUrl) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-epr-green/50 px-3 py-1 font-heading text-xs text-epr-green transition-colors hover:bg-epr-green/10"
      >
        <PlayCircle className="h-3.5 w-3.5" />
        Ver video
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-epr-green/30 bg-epr-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar video"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-foreground transition-colors hover:text-epr-green"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                title="Video del ejercicio"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
