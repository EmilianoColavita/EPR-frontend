import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Dumbbell,
  HelpCircle,
  Tag,
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
  { href: "/panel/admin/planes", label: "Plan", icon: Tag },
  { href: "/panel/admin/configuracion", label: "Configuración", icon: HelpCircle },
];
