import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Becas } from "@/components/sections/becas";

export default function BecasPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Becas />
      </main>
      <Footer />
    </>
  );
}
