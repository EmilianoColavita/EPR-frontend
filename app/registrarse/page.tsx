import { Header } from "@/components/layout/header";
import { RegisterForm } from "@/components/sections/register-form";

export default function RegistrarsePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <RegisterForm />
      </main>
    </>
  );
}
