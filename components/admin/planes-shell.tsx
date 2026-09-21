"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { PlanesPage } from "./planes-page";
import { PlanesPublicosPage } from "./planes-publicos-page";

const TABS = [
  { key: "cuotas", label: "Cuotas de alumnos" },
  { key: "publico", label: "Sitio web" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function PlanesShell() {
  const [tab, setTab] = useState<TabKey>("cuotas");

  return (
    <div>
      <div className="flex gap-2 border-b border-white/10 px-4 pt-4 sm:px-6 lg:px-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-t-xl px-4 py-2.5 font-heading text-sm uppercase tracking-wide transition-colors",
              tab === t.key
                ? "border-b-2 border-epr-green text-epr-green"
                : "text-foreground/50 hover:text-foreground/80",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "cuotas" ? <PlanesPage /> : <PlanesPublicosPage />}
    </div>
  );
}
