"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, User, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { clearSession, getRoleRedirectPath, getSession, type Usuario } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "./logo";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/metodos", label: "Metodos" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/planes", label: "Planes" },
  { href: "/contacto", label: "Contacto" },
];

const ANTON_SHADOW = "[text-shadow:2px_2px_0_rgba(0,0,0,0.55)]";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    // localStorage solo existe en el cliente; no hay forma de conocer la
    // sesión durante el render inicial en el servidor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsuario(getSession()?.usuario ?? null);
  }, []);

  function handleLogout() {
    clearSession();
    setUsuario(null);
    setProfileOpen(false);
    setOpen(false);
  }

  const initials = usuario
    ? `${usuario.nombre[0] ?? ""}${usuario.apellido[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-epr-dark">
      <div className="mx-auto flex h-28 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center" aria-label="E.P.R inicio">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-display text-2xl uppercase leading-none tracking-wider text-foreground/90 transition-colors hover:text-foreground",
                  ANTON_SHADOW,
                  "border-b-2 border-transparent pb-2",
                  isActive && "border-epr-green text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex">
          {usuario ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
                className="flex items-center gap-3"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-epr-green/60 bg-epr-card font-display text-sm text-foreground">
                  {initials}
                </span>
                <span className="font-display text-sm uppercase tracking-wider text-foreground">
                  {usuario.nombre}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-foreground/60 transition-transform",
                    profileOpen && "rotate-180",
                  )}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-48 overflow-hidden rounded-xl border border-white/10 bg-epr-card shadow-xl">
                  <Link
                    href={getRoleRedirectPath(usuario.rol)}
                    onClick={() => setProfileOpen(false)}
                    className="block w-full px-4 py-3 text-left font-heading text-sm text-foreground/80 transition-colors hover:bg-white/5 hover:text-epr-green"
                  >
                    Mi panel
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left font-heading text-sm text-foreground/80 transition-colors hover:bg-white/5 hover:text-epr-green"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={buttonVariants({ variant: "primary" })}>
              <User className="h-4 w-4" strokeWidth={2.5} />
              Ingresar
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-foreground md:hidden"
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-epr-dark md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-3 font-display text-lg uppercase leading-none tracking-wider text-foreground/90",
                    ANTON_SHADOW,
                    isActive && "bg-white/5 text-epr-green",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {usuario ? (
              <>
                <Link
                  href={getRoleRedirectPath(usuario.rol)}
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ variant: "primary" }), "mt-2")}
                >
                  <User className="h-4 w-4" strokeWidth={2.5} />
                  Mi panel
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 rounded-lg px-3 py-3 text-left font-heading text-sm text-foreground/70"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "primary" }), "mt-2")}
              >
                <User className="h-4 w-4" strokeWidth={2.5} />
                Ingresar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
