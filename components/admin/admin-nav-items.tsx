import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Dumbbell,
  HelpCircle,
  Inbox,
  Layers,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/panel/admin", label: "Dashboard", icon: ClipboardCheck },
  { href: "/panel/admin/alumnos", label: "Alumnos", icon: Users },
  { href: "/panel/admin/rutinas", label: "Rutinas", icon: Dumbbell },
  { href: "/panel/admin/turnos", label: "Turnos/Agenda", icon: CalendarDays },
  { href: "/panel/admin/evaluaciones", label: "Evaluaciones", icon: ClipboardList },
  { href: "/panel/admin/solicitudes", label: "Solicitudes", icon: Inbox },
  { href: "/panel/admin/planes", label: "Plan", icon: Layers },
  { href: "/panel/admin/configuracion", label: "Configuración", icon: HelpCircle },
];

const DASHBOARD_HREF = "/panel/admin";

// Devuelve el href del item del menú al que pertenece una ruta, ej:
// "/panel/admin/alumnos/12/cuenta" -> "/panel/admin/alumnos". El Dashboard
// solo matchea exacto, si no se comería todas las rutas del panel.
export function seccionDeHref(href: string): string | null {
  const path = href.split(/[?#]/)[0];
  if (path === DASHBOARD_HREF) return DASHBOARD_HREF;

  const item = ADMIN_NAV_ITEMS.find(
    (i) => i.href !== DASHBOARD_HREF && (path === i.href || path.startsWith(`${i.href}/`)),
  );
  return item?.href ?? null;
}
