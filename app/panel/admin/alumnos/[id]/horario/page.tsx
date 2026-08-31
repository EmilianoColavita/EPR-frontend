import { AdminShell } from "@/components/admin/admin-shell";
import { AlumnoHorarioPage } from "@/components/admin/alumno-horario-page";

export default async function HorarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminShell>
      <AlumnoHorarioPage alumnoId={Number(id)} />
    </AdminShell>
  );
}
