import { AdminShell } from "@/components/admin/admin-shell";
import { AlumnoRutinaPage } from "@/components/admin/alumno-rutina-page";

export default async function RutinaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminShell>
      <AlumnoRutinaPage alumnoId={Number(id)} />
    </AdminShell>
  );
}
