"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { AuthError, register } from "@/lib/auth";

const inputClass =
  "rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50";

export function RegisterForm() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[] | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDetails(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await register({
        nombre,
        apellido,
        email,
        telefono: telefono || undefined,
        password,
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
        setDetails(err.details);
      } else {
        setError("Ocurrió un error inesperado. Probá de nuevo.");
      }
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-epr-green/30 bg-epr-card/60 p-8 backdrop-blur-sm sm:p-10">
        {success ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-epr-green" />
            <h1 className="font-heading text-3xl font-bold italic uppercase tracking-tight text-foreground">
              ¡Registro exitoso!
            </h1>
            <p className="font-heading font-light text-foreground/70">
              Tu cuenta quedó pendiente de aprobación. Te vamos a avisar
              cuando el equipo de E.P.R la active — recién ahí vas a poder
              ingresar.
            </p>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", font: "heading", className: "mt-2" })}
            >
              Volver a ingresar
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-heading text-4xl font-bold italic uppercase tracking-tight text-foreground">
              Registrarse
            </h1>
            <p className="mt-2 font-heading font-light text-foreground/60">
              Creá tu cuenta de E.P.R
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-8 flex flex-col gap-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="nombre" className="font-heading text-sm font-light text-foreground/70">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    required
                    disabled={loading}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="apellido" className="font-heading text-sm font-light text-foreground/70">
                    Apellido
                  </label>
                  <input
                    id="apellido"
                    required
                    disabled={loading}
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-heading text-sm font-light text-foreground/70">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="telefono" className="font-heading text-sm font-light text-foreground/70">
                  Teléfono (opcional)
                </label>
                <input
                  id="telefono"
                  disabled={loading}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="font-heading text-sm font-light text-foreground/70">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="confirmPassword" className="font-heading text-sm font-light text-foreground/70">
                    Confirmar
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    disabled={loading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
              </div>

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

              <Button type="submit" font="heading" size="lg" disabled={loading} className="mt-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                    Creando cuenta...
                  </>
                ) : (
                  "Registrarse"
                )}
              </Button>

              <p className="text-center font-heading text-sm font-light text-foreground/60">
                ¿Ya tenés cuenta?{" "}
                <Link href="/login" className="text-epr-green hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
