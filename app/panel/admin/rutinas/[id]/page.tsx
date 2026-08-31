import { AdminShell } from "@/components/admin/admin-shell";
import { RutinaBuilder } from "@/components/admin/rutina-builder";

export default async function EditarRutinaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminShell>
      <RutinaBuilder rutinaId={Number(id)} />
    </AdminShell>
  );
}
