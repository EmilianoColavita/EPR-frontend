import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TITLE_GRADIENT =
  "bg-gradient-to-r from-zinc-500 via-zinc-300 to-white bg-clip-text text-transparent";
