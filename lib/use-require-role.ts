"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSession, type Rol, type Usuario } from "./auth";

/**
 * Devuelve el usuario logueado si su rol coincide con `role`.
 * Si no hay sesión o el rol no coincide, redirige a /login y devuelve null
 * mientras tanto (para mostrar un loading state).
 *
 * getSession() depende de localStorage, que solo existe en el cliente, por
 * eso el chequeo se hace en un efecto (no durante el render/SSR).
 */
export function useRequireRole(role: Rol): Usuario | null {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session && session.usuario.rol === role) {
      // localStorage no existe en el servidor: esta lectura solo puede
      // pasar en un efecto, así que el setState sincrónico acá es correcto
      // (no hay forma de calcularlo durante el render/SSR).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsuario(session.usuario);
    } else {
      router.replace("/login");
    }
  }, [role, router]);

  return usuario;
}
