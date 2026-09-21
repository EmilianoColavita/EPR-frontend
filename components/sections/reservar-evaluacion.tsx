"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { ApiError, crearSolicitudEvaluacion } from "@/lib/api";

const WHATSAPP_NUMERO = "5492235744040";
const WHATSAPP_MENSAJE = "Hola! Quiero reservar una evaluación en E.P.R.";
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`;

export function ReservarEvaluacion() {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[] | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDetails(null);
    setLoading(true);

    try {
      await crearSolicitudEvaluacion({
        nombreCompleto,
        email,
        telefono: telefono || undefined,
        objetivo: objetivo || undefined,
      });
      setEnviado(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setDetails(err.details);
      } else {
        setError("Ocurrió un error inesperado. Probá de nuevo.");
      }
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
              ¡Listo!
            </h1>
            <p className="mt-2 font-heading font-light text-foreground/70">
              Recibimos tu solicitud. Te vamos a contactar pronto para
              coordinar tu evaluación.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-heading text-4xl font-bold italic uppercase tracking-tight text-foreground">
              Reservar evaluación
            </h1>
            <p className="mt-2 font-heading font-light text-foreground/60">
              Dejanos tus datos y te contactamos para coordinar el turno.
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-8 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="nombreCompleto"
                  className="font-heading text-sm font-light text-foreground/70"
                >
                  Nombre completo
                </label>
                <input
                  id="nombreCompleto"
                  name="nombreCompleto"
                  required
                  disabled={loading}
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50"
                />
              </div>

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
                  htmlFor="telefono"
                  className="font-heading text-sm font-light text-foreground/70"
                >
                  Teléfono (opcional)
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  disabled={loading}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="rounded-xl border border-white/15 bg-epr-dark px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-epr-green disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="objetivo"
                  className="font-heading text-sm font-light text-foreground/70"
                >
                  Contanos tu objetivo (opcional)
                </label>
                <textarea
                  id="objetivo"
                  name="objetivo"
                  rows={3}
                  disabled={loading}
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  placeholder="Ej: quiero evaluar mi fuerza antes de arrancar la temporada"
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

              <Button
                type="submit"
                font="heading"
                size="lg"
                disabled={loading}
                className="mt-2"
              >
                {loading ? "Enviando..." : "Reservar evaluación"}
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="font-heading text-xs uppercase tracking-widest text-foreground/40">
                o
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 rounded-full border border-[#25D366]/50 py-3 font-heading text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/10"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Escribinos por WhatsApp
            </a>
          </>
        )}
      </div>
    </section>
  );
}
