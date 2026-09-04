import { Header } from "@/components/layout/header";
import { MethodsDetail } from "@/components/sections/methods-detail";

export default function MetodosPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <MethodsDetail />
      </main>
    </>
  );
}
