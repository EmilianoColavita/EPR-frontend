import { AdminShell } from "@/components/admin/admin-shell";
import { AlumnoBecaPage } from "@/components/admin/alumno-beca-page";

export default async function BecaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminShell>
      <AlumnoBecaPage alumnoId={Number(id)} />
    </AdminShell>
  );
}
