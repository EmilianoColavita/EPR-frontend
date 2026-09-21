import { AdminShell } from "@/components/admin/admin-shell";
import { PlanesShell } from "@/components/admin/planes-shell";

export default function AdminPlanesPage() {
  return (
    <AdminShell>
      <PlanesShell />
    </AdminShell>
  );
}
