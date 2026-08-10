import { Header } from "@/components/layout/header";
import { Hero } from "@/components/sections/hero";
import { MethodsPreview } from "@/components/sections/methods-preview";
import { About } from "@/components/sections/about";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <MethodsPreview />
        <About />
      </main>
    </>
  );
}
