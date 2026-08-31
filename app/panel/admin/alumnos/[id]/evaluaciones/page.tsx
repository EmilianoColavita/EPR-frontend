import { AdminShell } from "@/components/admin/admin-shell";
import { AlumnoEvaluacionesPage } from "@/components/admin/alumno-evaluaciones-page";

export default async function EvaluacionesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminShell>
      <AlumnoEvaluacionesPage alumnoId={Number(id)} />
    </AdminShell>
  );
}
