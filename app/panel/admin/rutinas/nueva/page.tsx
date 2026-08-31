import { AdminShell } from "@/components/admin/admin-shell";
import { RutinaBuilder } from "@/components/admin/rutina-builder";

export default function NuevaRutinaPage() {
  return (
    <AdminShell>
      <RutinaBuilder />
    </AdminShell>
  );
}
