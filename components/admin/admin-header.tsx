"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { clearSession, type Usuario } from "@/lib/auth";
import { Logo } from "@/components/layout/logo";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ADMIN_NAV_ITEMS } from "./admin-nav-items";
import { NotificationsBell } from "./notifications-bell";

export function AdminHeader({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-epr-dark">
      <div className="mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Logo className="h-12 w-12 shrink-0 sm:h-16 sm:w-16" />
          <div className="min-w-0">
            <h1 className="truncate font-heading text-2xl font-semibold italic uppercase tracking-tight sm:text-3xl">
              <span className="text-foreground">¡Bienvenido </span>
              <span className="text-epr-green">{usuario.nombre}!</span>
            </h1>
            <p className="font-heading text-sm font-light text-foreground/50">
              Panel de administración
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <NotificationsBell />

          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-expanded={profileOpen}
              className="flex items-center gap-3"
            >
              <ProfileAvatar usuario={usuario} />
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
                <Link
                  href="/panel/admin/configuracion"
                  onClick={() => setProfileOpen(false)}
                  className="block w-full px-4 py-3 text-left font-heading text-sm text-foreground/80 transition-colors hover:bg-white/5 hover:text-epr-green"
                >
                  Mi cuenta
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
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-epr-dark md:hidden">
          <Link
            href="/panel/admin/configuracion"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-4"
          >
            <ProfileAvatar usuario={usuario} className="h-12 w-12 text-base" />
            <span className="text-left">
              <span className="block font-display text-sm uppercase tracking-wider text-foreground">
                {usuario.nombre} {usuario.apellido}
              </span>
              <span className="block font-heading text-xs font-light text-foreground/50">
                Ver mi cuenta
              </span>
            </span>
          </Link>

          <nav className="flex flex-col gap-1 border-t border-white/5 px-4 py-4">
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
