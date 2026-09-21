"use client";

import { useEffect, useState } from "react";

import { getSession, type Usuario } from "@/lib/auth";
import { descargarMiFotoPerfil } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ProfileAvatar({
  usuario,
  className,
}: {
  usuario: Usuario;
  className?: string;
}) {
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    let objectUrl: string | null = null;
    let cancelado = false;

    descargarMiFotoPerfil(session.token).then((blob) => {
      if (cancelado || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setFotoUrl(objectUrl);
    });

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const initials = `${usuario.nombre[0] ?? ""}${usuario.apellido[0] ?? ""}`.toUpperCase();

  return (
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-epr-green/60 bg-epr-card font-display text-sm text-foreground",
        className,
      )}
    >
      {fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- es un blob: URL, next/image no lo maneja bien
        <img src={fotoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
