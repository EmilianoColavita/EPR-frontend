import type { ReactNode } from "react";
import { MapPin } from "lucide-react";

import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { FacebookIcon, InstagramIcon } from "@/components/ui/social-icons";
import {
  DIRECCION,
  EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  MAPS_EMBED_SRC,
  MAPS_SEARCH_HREF,
  TELEFONO_VISIBLE,
  whatsappHref,
} from "@/lib/site-info";
import { Logo } from "./logo";

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-foreground transition-colors hover:border-epr-green hover:text-epr-green"
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-epr-dark">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-8 sm:flex-row">
            <Logo className="h-28 w-28 sm:h-32 sm:w-32" />

            <div className="flex flex-col items-center gap-4 sm:items-start">
              <p className="font-heading text-sm text-foreground/70">
                Seguinos en nuestras redes
              </p>
              <div className="flex items-center gap-3">
                <SocialIcon href={INSTAGRAM_URL} label="Instagram de E.P.R">
                  <InstagramIcon className="h-5 w-5" />
                </SocialIcon>
                <SocialIcon href={whatsappHref()} label="WhatsApp de E.P.R">
                  <WhatsAppIcon className="h-5 w-5" />
                </SocialIcon>
                <SocialIcon href={FACEBOOK_URL} label="Facebook de E.P.R">
                  <FacebookIcon className="h-5 w-5" />
                </SocialIcon>
              </div>
            </div>
          </div>

          <div className="hidden h-24 w-px bg-white/10 lg:block" />

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10 lg:gap-16">
            <div className="text-center sm:text-left">
              <p className="font-heading text-sm font-semibold uppercase tracking-widest text-foreground">
                Contacto
              </p>
              <p className="mt-3 font-heading font-light text-foreground/70">
                {TELEFONO_VISIBLE}
              </p>
              <p className="font-heading font-light text-foreground/70">{EMAIL}</p>

              <div className="my-4 h-px w-40 bg-white/10" />

              <p className="font-heading text-sm font-semibold uppercase tracking-widest text-foreground">
                Ubicación
              </p>
              <p className="mt-3 max-w-[220px] font-heading font-light text-foreground/70">
                {DIRECCION}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="h-32 w-52 overflow-hidden rounded-2xl border border-white/10">
                <iframe
                  src={MAPS_EMBED_SRC}
                  title="Ubicación de E.P.R en el mapa"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                />
              </div>
              <a
                href={MAPS_SEARCH_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-2 font-heading text-sm text-foreground transition-colors hover:border-epr-green hover:text-epr-green"
              >
                <MapPin className="h-4 w-4" />
                Ver maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
