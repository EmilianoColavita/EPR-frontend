import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { MethodsPreview } from "@/components/sections/methods-preview";
import { About } from "@/components/sections/about";
import { PlansSection } from "@/components/sections/plans-section";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <MethodsPreview />
        <About />
        <PlansSection />
      </main>
      <Footer />
    </>
  );
}
