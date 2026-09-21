import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Contacto } from "@/components/sections/contacto";

export default function ContactoPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Contacto />
      </main>
      <Footer />
    </>
  );
}
