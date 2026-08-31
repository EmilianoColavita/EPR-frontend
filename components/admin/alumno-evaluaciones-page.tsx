import { EvaluacionesPanel } from "./evaluaciones-panel";

export function AlumnoEvaluacionesPage({ alumnoId }: { alumnoId: number }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EvaluacionesPanel alumnoId={alumnoId} />
    </div>
  );
}
