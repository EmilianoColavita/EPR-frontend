import { CalendarClock, Wallet } from "lucide-react";

import { StatCard } from "./stat-card";
import { AlumnosActivosStat } from "./alumnos-activos-stat";
import { UpcomingSessionsCard } from "./upcoming-sessions-card";
import { QuickActionsCard } from "./quick-actions-card";
import { RecentStudentsCard } from "./recent-students-card";

export function AdminDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <AlumnosActivosStat />
        </div>
        <div className="lg:col-span-4">
          <StatCard
            icon={CalendarClock}
            label="Turnos de hoy"
            value={8}
            href="/panel/admin/turnos"
            linkLabel="Ver agenda"
          />
        </div>
        <div className="lg:col-span-4">
          <StatCard
            icon={Wallet}
            label="Cuotas pendientes"
            value={5}
            href="/panel/admin/alumnos"
            linkLabel="Ver detalle"
          />
        </div>

        <div className="lg:col-span-8">
          <UpcomingSessionsCard />
        </div>
        <div className="lg:col-span-4">
          <QuickActionsCard />
        </div>

        <div className="lg:col-span-12">
          <RecentStudentsCard />
        </div>
      </div>
    </div>
  );
}
