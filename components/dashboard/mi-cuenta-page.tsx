"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, Trash2 } from "lucide-react";

import {
  getSession,
  updateSessionUsuario,
  type Usuario,
} from "@/lib/auth";
import {
  actualizarMiPerfil,
  ApiError,
  descargarMiFotoPerfil,
  eliminarFotoPerfil,
  subirFotoPerfil,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "./dashboard-card";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50";

export function MiCuentaPage() {
  const [usuario, setUsuario] = useState<Usuario | null | undefined>(undefined);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[] | null>(null);
  const [guardadoOk, setGuardadoOk] = useState(false);

  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    // Lee la sesión guardada en localStorage; no hay forma de conocerla
    // durante el render en el servidor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsuario(session.usuario);
    setNombre(session.usuario.nombre);
    setApellido(session.usuario.apellido);
    setTelefono(session.usuario.telefono ?? "");

    let objectUrl: string | null = null;
    descargarMiFotoPerfil(session.token).then((blob) => {
      if (!blob) return;
      objectUrl = URL.createObjectURL(blob);
      setFotoUrl(objectUrl);
    });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  async function handleSubirFoto(archivo: File) {
    const session = getSession();
    if (!session) return;

    setErrorFoto(null);
    setSubiendoFoto(true);
    try {
      await subirFotoPerfil(session.token, archivo);
      const blob = await descargarMiFotoPerfil(session.token);
      if (blob) setFotoUrl(URL.createObjectURL(blob));
    } catch (err) {
      setErrorFoto(
        err instanceof ApiError ? err.message : "No se pudo subir la foto.",
      );
    } finally {
      setSubiendoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleEliminarFoto() {
    const session = getSession();
    if (!session) return;

    setErrorFoto(null);
    setSubiendoFoto(true);
    try {
      await eliminarFotoPerfil(session.token);
      setFotoUrl(null);
    } catch (err) {
      setErrorFoto(
        err instanceof ApiError ? err.message : "No se pudo quitar la foto.",
      );
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSession();
    if (!session) return;

    setError(null);
    setDetails(null);
    setGuardadoOk(false);
    setSaving(true);

    try {
      const actualizado = await actualizarMiPerfil(session.token, {
        nombre,
        apellido,
        telefono: telefono || undefined,
      });
      updateSessionUsuario(actualizado);
      setUsuario(actualizado);
      setGuardadoOk(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setDetails(err.details);
      } else {
        setError("Ocurrió un error inesperado. Probá de nuevo.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (usuario === undefined) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="font-heading font-light text-foreground/50">Cargando...</p>
      </div>
    );
  }

  if (usuario === null) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="font-heading font-light text-foreground/50">
          No se pudo cargar tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
        Mi cuenta
      </h1>
      <p className="mt-2 font-heading font-light text-foreground/50">
        {usuario.email}
      </p>

      <DashboardCard className="mt-6">
        <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
          Foto de perfil
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-5">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-epr-green/60 bg-epr-card font-display text-xl text-foreground">
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- es un blob: URL
              <img src={fotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              `${usuario.nombre[0] ?? ""}${usuario.apellido[0] ?? ""}`.toUpperCase()
            )}
          </span>

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={subiendoFoto}
              className="hidden"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) handleSubirFoto(archivo);
              }}
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={subiendoFoto}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 font-heading text-sm text-foreground transition-colors hover:border-epr-green hover:text-epr-green disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                {subiendoFoto ? "Subiendo..." : fotoUrl ? "Cambiar foto" : "Subir foto"}
              </button>
              {fotoUrl && (
                <button
                  type="button"
                  disabled={subiendoFoto}
                  onClick={handleEliminarFoto}
                  className="flex items-center gap-1.5 font-heading text-sm text-foreground/60 transition-colors hover:text-red-400 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Quitar
                </button>
              )}
            </div>
          </div>
        </div>

        {errorFoto && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {errorFoto}
          </div>
        )}
      </DashboardCard>

      <DashboardCard className="mt-6">
        <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground">
          Datos personales
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="font-heading text-xs font-light text-foreground/60">
                Nombre
              </span>
              <input
                required
                disabled={saving}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-heading text-xs font-light text-foreground/60">
                Apellido
              </span>
              <input
                required
                disabled={saving}
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="font-heading text-xs font-light text-foreground/60">
              Teléfono (opcional)
            </span>
            <input
              disabled={saving}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className={inputClass}
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              <p>{error}</p>
              {details && details.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {guardadoOk && (
            <div className="rounded-xl border border-epr-green/30 bg-epr-green/10 p-4 text-sm text-epr-green">
              Tus datos se actualizaron correctamente.
            </div>
          )}

          <Button
            type="submit"
            font="heading"
            disabled={saving}
            className="self-start"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </DashboardCard>
    </div>
  );
}
