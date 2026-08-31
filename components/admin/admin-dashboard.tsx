import { AlumnosActivosStat } from "./alumnos-activos-stat";
import { TurnosHoyStat } from "./turnos-hoy-stat";
import { UpcomingSessionsCard } from "./upcoming-sessions-card";
import { QuickActionsCard } from "./quick-actions-card";
import { RecentStudentsCard } from "./recent-students-card";

export function AdminDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <AlumnosActivosStat />
        </div>
        <div className="lg:col-span-6">
          <TurnosHoyStat />
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
