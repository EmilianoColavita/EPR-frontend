"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { formatDateShort } from "@/lib/format";
import { useAdminNotifications } from "./use-admin-notifications";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { items, count, marcarLeida } = useAdminNotifications();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:text-epr-green"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-epr-green px-1 font-heading text-[10px] font-bold leading-none text-epr-dark">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-epr-card shadow-xl">
            <div className="border-b border-white/10 px-4 py-3">
              <p className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">
                Notificaciones
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-6 text-center font-heading text-sm font-light text-foreground/50">
                  No tenés nada pendiente.
                </p>
              ) : (
                items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      if (item.notificacionId != null) marcarLeida(item.notificacionId);
                      setOpen(false);
                    }}
                    className="block border-b border-white/5 px-4 py-3 transition-colors last:border-b-0 hover:bg-white/5"
                  >
                    <p className="font-heading text-sm font-semibold text-foreground">
                      {item.titulo}
                    </p>
                    <p className="font-heading text-xs font-light text-foreground/60">
                      {item.subtitulo}
                    </p>
                    <p className="mt-1 font-heading text-xs font-light text-foreground/40">
                      {formatDateShort(item.fecha)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
