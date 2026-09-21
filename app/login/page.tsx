import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LoginForm } from "@/components/sections/login-form";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <LoginForm />
      </main>
      <Footer />
    </>
  );
}
