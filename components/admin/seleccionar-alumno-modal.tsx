"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { getSession, type Usuario } from "@/lib/auth";
import { listUsuarios } from "@/lib/api";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-epr-dark px-4 py-3 pl-11 font-sans text-foreground outline-none transition-colors focus:border-epr-green";

export function SeleccionarAlumnoModal({
  onClose,
  onSelect,
  busy = false,
}: {
  onClose: () => void;
  onSelect: (alumno: Usuario) => void;
  busy?: boolean;
}) {
  const [alumnos, setAlumnos] = useState<Usuario[] | null | undefined>(
    undefined,
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listUsuarios(session.token, "ALUMNO").then(setAlumnos);
  }, []);

  const filtrados = (alumnos ?? []).filter((a) => {
    const texto = `${a.nombre} ${a.apellido} ${a.email}`.toLowerCase();
    return texto.includes(query.toLowerCase());
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-epr-green/30 bg-epr-card p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
            Elegir alumno
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-foreground/60 transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className={inputClass}
          />
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {alumnos === undefined && (
            <p className="font-heading font-light text-foreground/50">
              Cargando...
            </p>
          )}

          {alumnos === null && (
            <p className="font-heading font-light text-foreground/50">
              No se pudo cargar la lista de alumnos.
            </p>
          )}

          {alumnos && filtrados.length === 0 && (
            <p className="font-heading font-light text-foreground/50">
              No hay alumnos que coincidan.
            </p>
          )}

          <div className="flex flex-col gap-1">
            {filtrados.map((alumno) => (
              <button
                key={alumno.id}
                type="button"
                disabled={busy}
                onClick={() => onSelect(alumno)}
                className="flex flex-col rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
              >
                <span className="font-heading font-semibold text-foreground">
                  {alumno.nombre} {alumno.apellido}
                </span>
                <span className="font-heading text-sm font-light text-foreground/50">
                  {alumno.email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
