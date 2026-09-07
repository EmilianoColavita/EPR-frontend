"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { clearSession, getRoleRedirectPath, type Usuario } from "@/lib/auth";
import { Logo } from "@/components/layout/logo";

const ANTON_SHADOW = "[text-shadow:2px_2px_0_rgba(0,0,0,0.55)]";

export function DashboardHeader({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
    { href: getRoleRedirectPath(usuario.rol), label: "Dashboard" },
    { href: "/panel/alumno/rutina", label: "Rutinas" },
    { href: "/panel/alumno/turnos", label: "Turnos" },
    { href: "/panel/alumno/evaluaciones", label: "Evaluaciones" },
    { href: "/panel/alumno/pagos", label: "Pagos" },
  ];

  const initials = `${usuario.nombre[0] ?? ""}${usuario.apellido[0] ?? ""}`.toUpperCase();

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-epr-dark">
      <div className="mx-auto flex h-28 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center" aria-label="E.P.R inicio">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
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

        <div className="hidden items-center gap-5 md:flex">
          <button
            type="button"
            aria-label="Notificaciones"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:text-epr-green"
          >
            <Bell className="h-5 w-5" />
          </button>

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
                {usuario.nombre} {usuario.apellido}
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
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-foreground md:hidden"
          aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/5 bg-epr-dark md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
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
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 rounded-lg px-3 py-3 text-left font-heading text-sm text-foreground/70"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
