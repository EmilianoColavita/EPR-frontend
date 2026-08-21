"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { clearSession, type Usuario } from "@/lib/auth";
import { Logo } from "@/components/layout/logo";
import { ADMIN_NAV_ITEMS } from "./admin-nav-items";

export function AdminHeader({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = `${usuario.nombre[0] ?? ""}${usuario.apellido[0] ?? ""}`.toUpperCase();

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-epr-dark">
      <div className="mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Logo className="h-16 w-16 sm:h-16 sm:w-16 lg:h-16 lg:w-16" />
          <div>
            <h1 className="font-heading text-2xl font-semibold italic uppercase tracking-tight sm:text-3xl">
              <span className="text-foreground">¡Bienvenido </span>
              <span className="text-epr-green">{usuario.nombre}!</span>
            </h1>
            <p className="font-heading text-sm font-light text-foreground/50">
              Panel de administración
            </p>
          </div>
        </div>

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
              <span className="text-left">
                <span className="block font-display text-sm uppercase tracking-wider text-foreground">
                  {usuario.nombre} {usuario.apellido}
                </span>
                <span className="block font-heading text-xs font-light text-foreground/50">
                  Administrador
                </span>
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
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-foreground md:hidden"
          aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-epr-dark md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 font-display text-sm uppercase tracking-wider text-foreground/90",
                    isActive && "bg-white/5 text-epr-green",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
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
