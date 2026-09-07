"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthError, getRoleRedirectPath, login, saveSession } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[] | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!redirectTo) return;
    const video = videoRef.current;
    if (!video) return;

    // Algunos navegadores bloquean el autoplay con sonido si pasó un
    // instante desde el último click del usuario (acá, el submit del
    // login). Si lo rechaza, reintentamos silenciado en vez de dejar el
    // video trabado sin reproducirse.
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => router.push(redirectTo));
    });
  }, [redirectTo, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDetails(null);
    setLoading(true);

    try {
      const session = await login(email, password);
      saveSession(session);
      setRedirectTo(getRoleRedirectPath(session.usuario.rol));
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

  if (redirectTo) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src="/videos/login.mp4"
          playsInline
          onEnded={() => router.push(redirectTo)}
          onError={() => router.push(redirectTo)}
          className="max-h-[100vh] max-w-[100vw]"
        />
        <button
          type="button"
          onClick={() => router.push(redirectTo)}
          className="absolute bottom-6 right-6 font-heading text-sm text-foreground/70 transition-colors hover:text-foreground"
        >
          Saltar
        </button>
      </div>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-epr-dark px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-epr-green/30 bg-epr-card/60 p-8 backdrop-blur-sm sm:p-10">
        <h1 className="font-heading text-4xl font-bold italic uppercase tracking-tight text-foreground">
          Ingresar
        </h1>
        <p className="mt-2 font-heading font-light text-foreground/60">
          Accedé a tu cuenta de E.P.R
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
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

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="font-heading text-sm font-light text-foreground/70"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50"
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

          <Button type="submit" font="heading" size="lg" disabled={loading} className="mt-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Ingresando...
              </>
            ) : (
              "Ingresar"
            )}
          </Button>

          <p className="text-center font-heading text-sm font-light text-foreground/60">
            ¿No tenés cuenta?{" "}
            <Link href="/registrarse" className="text-epr-green hover:underline">
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
