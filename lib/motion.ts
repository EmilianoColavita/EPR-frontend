import type { Variants } from "motion/react";

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.1,
    },
  },
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Imagen: aparece con un leve zoom-out además del fade, para que se lea
// distinto al texto.
export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.08, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.1, ease: EASE_OUT },
  },
};

// Tarjeta de texto: entra ella y después escalona sus hijos (título,
// párrafos) usando fadeUpItem. El delay deja que la imagen de al lado
// arranque primero cuando ambas entran en pantalla a la vez (desktop).
export const textCard: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: EASE_OUT,
      delay: 0.2,
      delayChildren: 0.35,
      staggerChildren: 0.15,
    },
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};
