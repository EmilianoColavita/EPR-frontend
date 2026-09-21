import { AdminShell } from "@/components/admin/admin-shell";
import { MiCuentaPage } from "@/components/dashboard/mi-cuenta-page";

export default function AdminConfiguracionPage() {
  return (
    <AdminShell>
      <MiCuentaPage />
    </AdminShell>
  );
}
