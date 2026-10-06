import { getPlanGroups } from "@/lib/api";
import { Plans } from "./plans";

export async function PlansSection({ showCta = true }: { showCta?: boolean }) {
  const groups = await getPlanGroups();

  if (!groups || groups.length === 0) {
    return (
      <section className="bg-epr-dark px-4 py-24 text-center">
        <p className="mx-auto max-w-md font-heading font-light text-foreground/60">
          No pudimos cargar los planes en este momento. Probá de nuevo en unos
          minutos.
        </p>
      </section>
    );
  }

  return <Plans groups={groups} showCta={showCta} />;
}
