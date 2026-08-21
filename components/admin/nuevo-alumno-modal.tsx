"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSession, type Usuario } from "@/lib/auth";
import { ApiError, crearUsuario } from "@/lib/api";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-heading text-sm font-light text-foreground/70">
        {label}
      </span>
      {children}
    </label>
  );
}

export function NuevoAlumnoModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (usuario: Usuario) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState(generatePassword);
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[] | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSession();
    if (!session) return;

    setLoading(true);
    setError(null);
    setDetails(null);

    try {
      const usuario = await crearUsuario(session.token, {
        nombre,
        apellido,
        email,
        telefono: telefono || undefined,
        rol: "ALUMNO",
        password,
      });
      onCreated(usuario);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setDetails(err.details);
      } else {
        setError("Ocurrió un error inesperado. Probá de nuevo.");
      }
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-y-auto rounded-3xl border border-epr-green/30 bg-epr-card p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
            Dar de alta alumno
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

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre">
              <input
                required
                disabled={loading}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Apellido">
              <input
                required
                disabled={loading}
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Email">
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Teléfono (opcional)">
            <input
              disabled={loading}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Contraseña inicial">
            <div className="flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 text-foreground/60 transition-colors hover:text-foreground disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                disabled={loading}
                aria-label="Generar otra contraseña"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 text-foreground/60 transition-colors hover:text-foreground disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 font-heading text-xs font-light text-foreground/40">
              Compartísela con el alumno para su primer ingreso.
            </p>
          </Field>

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

          <Button
            type="submit"
            font="heading"
            size="lg"
            disabled={loading}
            className="mt-2"
          >
            {loading ? "Creando..." : "Dar de alta"}
          </Button>
        </form>
      </div>
    </div>
  );
}
