import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { OlvideContrasenaForm } from "@/components/sections/olvide-contrasena-form";

export default function OlvideContrasenaPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <OlvideContrasenaForm />
      </main>
      <Footer />
    </>
  );
}
