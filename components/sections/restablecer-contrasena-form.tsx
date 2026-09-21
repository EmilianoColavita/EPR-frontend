"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthError, restablecerPassword } from "@/lib/auth";

const inputClass =
  "rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50";

export function RestablecerContrasenaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[] | null>(null);
  const [listo, setListo] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      setDetails(null);
      return;
    }

    setError(null);
    setDetails(null);
    setLoading(true);
    try {
      await restablecerPassword(token, password);
      setListo(true);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
        setDetails(err.details);
      } else {
        setError("Ocurrió un error inesperado. Probá de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-epr-green/30 bg-epr-card/60 p-8 text-center backdrop-blur-sm sm:p-10">
          <h1 className="font-heading text-3xl font-bold italic uppercase tracking-tight text-foreground">
            Link inválido
          </h1>
          <p className="mt-2 font-heading font-light text-foreground/60">
            Este link no tiene un token válido. Pedí uno nuevo desde la
            pantalla de &quot;Olvidé mi contraseña&quot;.
          </p>
          <Link
            href="/olvide-contrasena"
            className="mt-6 inline-block font-heading text-sm text-epr-green hover:underline"
          >
            Pedir un nuevo link
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-epr-green/30 bg-epr-card/60 p-8 backdrop-blur-sm sm:p-10">
        {listo ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-epr-green" />
            <h1 className="mt-4 font-heading text-3xl font-bold italic uppercase tracking-tight text-foreground">
              ¡Listo!
            </h1>
            <p className="mt-2 font-heading font-light text-foreground/70">
              Tu contraseña se actualizó correctamente.
            </p>
            <Button
              type="button"
              font="heading"
              size="lg"
              className="mt-6"
              onClick={() => router.push("/login")}
            >
              Ir a Ingresar
            </Button>
          </div>
        ) : (
          <>
            <h1 className="font-heading text-4xl font-bold italic uppercase tracking-tight text-foreground">
              Nueva contraseña
            </h1>
            <p className="mt-2 font-heading font-light text-foreground/60">
              Elegí tu nueva contraseña para volver a entrar.
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-8 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="font-heading text-sm font-light text-foreground/70"
                >
                  Nueva contraseña
                </label>
                <input
                  id="password"
                  name="password"
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
                <label
                  htmlFor="confirmar"
                  className="font-heading text-sm font-light text-foreground/70"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="confirmar"
                  name="confirmar"
                  type="password"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
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
                    Guardando...
                  </>
                ) : (
                  "Guardar nueva contraseña"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
