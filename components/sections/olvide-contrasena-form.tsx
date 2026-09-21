"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthError, solicitarResetPassword } from "@/lib/auth";

export function OlvideContrasenaForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await solicitarResetPassword(email);
      setEnviado(true);
    } catch (err) {
      setError(
        err instanceof AuthError ? err.message : "Ocurrió un error inesperado. Probá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-epr-green/30 bg-epr-card/60 p-8 backdrop-blur-sm sm:p-10">
        {enviado ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-epr-green" />
            <h1 className="mt-4 font-heading text-3xl font-bold italic uppercase tracking-tight text-foreground">
              Revisá tu mail
            </h1>
            <p className="mt-2 font-heading font-light text-foreground/70">
              Si ese email está registrado, te enviamos un link para
              restablecer tu contraseña.
            </p>
            <Link
              href="/login"
              className="mt-6 font-heading text-sm text-epr-green hover:underline"
            >
              Volver a Ingresar
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-heading text-4xl font-bold italic uppercase tracking-tight text-foreground">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="mt-2 font-heading font-light text-foreground/60">
              Poné tu email y te mandamos un link para restablecerla.
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-8 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="font-heading text-sm font-light text-foreground/70"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                font="heading"
                size="lg"
                disabled={loading}
                className="mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                    Enviando...
                  </>
                ) : (
                  "Enviar link"
                )}
              </Button>

              <p className="text-center font-heading text-sm font-light text-foreground/60">
                <Link href="/login" className="text-epr-green hover:underline">
                  Volver a Ingresar
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
