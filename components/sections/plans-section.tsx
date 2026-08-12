import { getPlanGroups } from "@/lib/api";
import { Plans } from "./plans";

export async function PlansSection({ showCta = true }: { showCta?: boolean }) {
  const groups = await getPlanGroups();

  if (!groups || groups.length === 0) {
    return (
      <section className="bg-epr-dark px-4 py-24 text-center">
        <p className="mx-auto max-w-md font-heading font-light text-foreground/60">
          No se pudieron cargar los planes. Verificá que el backend esté
          corriendo (
          {process.env.NEXT_PUBLIC_API_URL ?? "NEXT_PUBLIC_API_URL sin configurar"}
          ).
        </p>
      </section>
    );
  }

  return <Plans groups={groups} showCta={showCta} />;
}
