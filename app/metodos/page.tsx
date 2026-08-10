import { Header } from "@/components/layout/header";
import { ComingSoon } from "@/components/sections/coming-soon";

export default function MetodosPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ComingSoon title="Metodos" />
      </main>
    </>
  );
}
