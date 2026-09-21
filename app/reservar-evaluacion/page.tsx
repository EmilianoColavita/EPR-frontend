import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ReservarEvaluacion } from "@/components/sections/reservar-evaluacion";

export default function ReservarEvaluacionPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ReservarEvaluacion />
      </main>
      <Footer />
    </>
  );
}
