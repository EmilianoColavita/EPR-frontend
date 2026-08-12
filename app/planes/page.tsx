import { Header } from "@/components/layout/header";
import { PlansSection } from "@/components/sections/plans-section";

export default function PlanesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PlansSection showCta={false} />
      </main>
    </>
  );
}
