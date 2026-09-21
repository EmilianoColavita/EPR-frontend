import { Suspense } from "react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RestablecerContrasenaForm } from "@/components/sections/restablecer-contrasena-form";

export default function RestablecerContrasenaPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense fallback={null}>
          <RestablecerContrasenaForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
