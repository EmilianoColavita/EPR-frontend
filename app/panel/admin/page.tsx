import { AdminShell } from "@/components/admin/admin-shell";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminPanelPage() {
  return (
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  );
}
