import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PlansSection } from "@/components/sections/plans-section";

export default function PlanesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PlansSection showCta={false} />
      </main>
      <Footer />
    </>
  );
}
