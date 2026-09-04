import { AdminShell } from "@/components/admin/admin-shell";
import { AlumnoCuentaPage } from "@/components/admin/alumno-cuenta-page";

export default async function CuentaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminShell>
      <AlumnoCuentaPage alumnoId={Number(id)} />
    </AdminShell>
  );
}
