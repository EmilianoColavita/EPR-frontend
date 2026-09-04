import { handleUnauthorized, type Rol, type Usuario } from "./auth";

export type PlanCard = {
  id?: number;
  title: string;
  items: string[];
  price?: number;
};

export type PlanGroup = {
  id?: number;
  title: string;
  cards: PlanCard[];
  note?: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPlanGroups(): Promise<PlanGroup[] | null> {
  if (!API_URL) {
    console.error(
      "NEXT_PUBLIC_API_URL no está configurada (revisá .env.local).",
    );
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/planes`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`GET /api/v1/planes respondió ${res.status}`);
      return null;
    }

    return (await res.json()) as PlanGroup[];
  } catch (error) {
    console.error("No se pudo conectar con el backend:", error);
    return null;
  }
}

// Helper para endpoints autenticados (requieren el JWT del login en el
// header Authorization). Devuelve null en cualquier error de red/status,
// sin distinguir el motivo — cada endpoint decide cómo mostrarlo.
async function authGet<T>(path: string, token: string): Promise<T | null> {
  if (!API_URL) {
    console.error(
      "NEXT_PUBLIC_API_URL no está configurada (revisá .env.local).",
    );
    return null;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 401) {
      handleUnauthorized();
      return null;
    }

    if (!res.ok) {
      console.error(`GET ${path} respondió ${res.status}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`No se pudo conectar con el backend (${path}):`, error);
    return null;
  }
}

export type EstadoCuenta = {
  alDia: boolean;
  proximoVencimiento: string | null; // ISO YYYY-MM-DD
};

export async function getEstadoCuenta(token: string): Promise<EstadoCuenta | null> {
  return authGet<EstadoCuenta>("/api/v1/cuotas/mi-estado", token);
}

export type CuotasResumen = {
  alDia: number;
  vencidos: number;
};

export async function getCuotasResumen(token: string): Promise<CuotasResumen | null> {
  return authGet<CuotasResumen>("/api/v1/cuotas/resumen", token);
}

// --- Usuarios (gestión desde el panel de ADMIN) ---

type ApiErrorBody = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details: string[] | null;
};

export class ApiError extends Error {
  status: number;
  details: string[] | null;

  constructor(message: string, status: number, details: string[] | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseApiError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // el backend no devolvió JSON, seguimos con el mensaje genérico
  }
  return new ApiError(
    body?.message ?? "Ocurrió un error.",
    res.status,
    body?.details ?? null,
  );
}

// Helper para POST/PUT/PATCH autenticados con body JSON. A diferencia de
// authGet, tira ApiError en vez de devolver null: estos endpoints suelen
// dispararse desde un form que necesita mostrar el motivo del error.
async function authMutate<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH",
  token: string,
  body: unknown,
): Promise<T> {
  if (!API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL no está configurada.", 0);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  if (res.status === 401) {
    handleUnauthorized();
  }

  if (!res.ok) {
    throw await parseApiError(res);
  }

  return (await res.json()) as T;
}

export async function listUsuarios(
  token: string,
  rol?: Rol,
): Promise<Usuario[] | null> {
  const query = rol ? `?rol=${rol}` : "";
  return authGet<Usuario[]>(`/api/v1/usuarios${query}`, token);
}

export type CrearUsuarioInput = {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: Rol;
  password: string;
};

export async function crearUsuario(
  token: string,
  input: CrearUsuarioInput,
): Promise<Usuario> {
  return authMutate<Usuario>("/api/v1/usuarios", "POST", token, input);
}

export async function actualizarActivo(
  token: string,
  id: number,
  activo: boolean,
): Promise<Usuario> {
  return authMutate<Usuario>(
    `/api/v1/usuarios/${id}/activo`,
    "PATCH",
    token,
    { activo },
  );
}

// --- Rutinas ---

export type Ejercicio = {
  id: number;
  nombre: string;
  series: number | null;
  repeticiones: string | null;
  pesoSugerido: string | null;
  descansoSegundos: number | null;
  notas: string | null;
  orden: number;
};

export type DiaRutina = {
  id: number;
  numero: number;
  nombre: string | null;
  ejercicios: Ejercicio[];
};

export type Rutina = {
  id: number;
  nombre: string;
  descripcion: string | null;
  dias: DiaRutina[];
  diaSugeridoId: number | null;
  ultimoDiaEntrenadoId: number | null;
};

export type EjercicioInput = {
  nombre: string;
  series?: number;
  repeticiones?: string;
  pesoSugerido?: string;
  descansoSegundos?: number;
  notas?: string;
  orden: number;
};

export type DiaRutinaInput = {
  numero: number;
  nombre?: string;
  ejercicios: EjercicioInput[];
};

export type RutinaInput = {
  nombre: string;
  descripcion?: string;
  dias: DiaRutinaInput[];
};

async function fetchRutina(
  path: string,
  token: string,
): Promise<Rutina | "sin-rutina" | null> {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL no está configurada.");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 401) {
      handleUnauthorized();
      return null;
    }

    if (res.status === 404) return "sin-rutina";

    if (!res.ok) {
      console.error(`GET ${path} respondió ${res.status}`);
      return null;
    }

    return (await res.json()) as Rutina;
  } catch (error) {
    console.error(`No se pudo conectar con el backend (${path}):`, error);
    return null;
  }
}

export type RutinaResumen = {
  id: number;
  nombre: string;
  descripcion: string | null;
  cantidadDias: number;
  cantidadAlumnosAsignados: number;
};

// ADMIN — las rutinas son plantillas independientes de cualquier alumno.
export async function listRutinas(token: string): Promise<RutinaResumen[] | null> {
  return authGet<RutinaResumen[]>("/api/v1/rutinas", token);
}

export async function getRutinaById(
  token: string,
  rutinaId: number,
): Promise<Rutina | "sin-rutina" | null> {
  return fetchRutina(`/api/v1/rutinas/${rutinaId}`, token);
}

export async function getAlumnoRutina(
  token: string,
  alumnoId: number,
): Promise<Rutina | "sin-rutina" | null> {
  return fetchRutina(`/api/v1/alumnos/${alumnoId}/rutina`, token);
}

export async function crearRutina(
  token: string,
  input: RutinaInput,
): Promise<Rutina> {
  return authMutate<Rutina>("/api/v1/rutinas", "POST", token, input);
}

export async function actualizarRutina(
  token: string,
  rutinaId: number,
  input: RutinaInput,
): Promise<Rutina> {
  return authMutate<Rutina>(`/api/v1/rutinas/${rutinaId}`, "PUT", token, input);
}

export async function asignarRutina(
  token: string,
  rutinaId: number,
  alumnoId: number,
): Promise<void> {
  await authMutate<unknown>(
    `/api/v1/rutinas/${rutinaId}/asignar`,
    "POST",
    token,
    { alumnoId },
  );
}

// ALUMNO
export async function getMiRutina(
  token: string,
): Promise<Rutina | "sin-rutina" | null> {
  return fetchRutina("/api/v1/rutinas/mia", token);
}

export async function seleccionarDia(
  token: string,
  diaId: number,
): Promise<Rutina> {
  return authMutate<Rutina>(
    "/api/v1/rutinas/mia/seleccionar-dia",
    "POST",
    token,
    { diaId },
  );
}

// --- Turnos ---

export type EstadoTurno = "CONFIRMADO" | "CANCELADO" | "COMPLETADO";

export type Turno = {
  id: number;
  alumno: {
    id: number;
    nombre: string;
    apellido: string;
  };
  fecha: string; // ISO YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string | null;
  actividad: string;
  estado: EstadoTurno;
  notas: string | null;
};

export type TurnoInput = {
  alumnoId: number;
  fecha: string;
  horaInicio: string;
  horaFin?: string;
  actividad: string;
  notas?: string;
};

// ADMIN
export async function listTurnos(
  token: string,
  filtros?: { desde?: string; hasta?: string; alumnoId?: number },
): Promise<Turno[] | null> {
  const params = new URLSearchParams();
  if (filtros?.desde) params.set("desde", filtros.desde);
  if (filtros?.hasta) params.set("hasta", filtros.hasta);
  if (filtros?.alumnoId) params.set("alumnoId", String(filtros.alumnoId));
  const query = params.toString() ? `?${params.toString()}` : "";
  return authGet<Turno[]>(`/api/v1/turnos${query}`, token);
}

export async function actualizarTurno(
  token: string,
  id: number,
  input: TurnoInput,
): Promise<Turno> {
  return authMutate<Turno>(`/api/v1/turnos/${id}`, "PUT", token, input);
}

export async function actualizarEstadoTurno(
  token: string,
  id: number,
  estado: EstadoTurno,
): Promise<Turno> {
  return authMutate<Turno>(`/api/v1/turnos/${id}/estado`, "PATCH", token, {
    estado,
  });
}

// ALUMNO
export async function misTurnos(
  token: string,
  filtros?: { desde?: string; hasta?: string },
): Promise<Turno[] | null> {
  const params = new URLSearchParams();
  if (filtros?.desde) params.set("desde", filtros.desde);
  if (filtros?.hasta) params.set("hasta", filtros.hasta);
  const query = params.toString() ? `?${params.toString()}` : "";
  return authGet<Turno[]>(`/api/v1/turnos/mios${query}`, token);
}

// --- Horario asignado (turno fijo semanal) ---

export type DiaSemana =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

export type FranjaHorario = {
  id: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string | null;
  actividad: string;
};

export type HorarioAsignado = {
  id: number;
  alumno: {
    id: number;
    nombre: string;
    apellido: string;
  };
  franjas: FranjaHorario[];
  notas: string | null;
};

export type FranjaHorarioInput = {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin?: string;
  actividad: string;
};

export type HorarioAsignadoInput = {
  franjas: FranjaHorarioInput[];
  notas?: string;
};

export async function getHorarioAlumno(
  token: string,
  alumnoId: number,
): Promise<HorarioAsignado | "sin-horario" | null> {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL no está configurada.");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/alumnos/${alumnoId}/horario`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 401) {
      handleUnauthorized();
      return null;
    }

    if (res.status === 404) return "sin-horario";

    if (!res.ok) {
      console.error(`GET /api/v1/alumnos/${alumnoId}/horario respondió ${res.status}`);
      return null;
    }

    return (await res.json()) as HorarioAsignado;
  } catch (error) {
    console.error("No se pudo conectar con el backend (horario):", error);
    return null;
  }
}

export async function asignarHorario(
  token: string,
  alumnoId: number,
  input: HorarioAsignadoInput,
): Promise<HorarioAsignado> {
  return authMutate<HorarioAsignado>(
    `/api/v1/alumnos/${alumnoId}/horario`,
    "POST",
    token,
    input,
  );
}

// --- Evaluaciones (PDF de fuerza/composición, uno por alumno por sesión) ---

export type Evaluacion = {
  id: number;
  alumno: {
    id: number;
    nombre: string;
    apellido: string;
  };
  nombreArchivo: string;
  fechaSubida: string; // ISO date
};

async function authUpload<T>(
  path: string,
  token: string,
  formData: FormData,
): Promise<T> {
  if (!API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL no está configurada.", 0);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  if (res.status === 401) {
    handleUnauthorized();
  }

  if (!res.ok) {
    throw await parseApiError(res);
  }

  return (await res.json()) as T;
}

async function authDelete(path: string, token: string): Promise<void> {
  if (!API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL no está configurada.", 0);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  if (res.status === 401) {
    handleUnauthorized();
  }

  if (!res.ok) {
    throw await parseApiError(res);
  }
}

async function authDownload(path: string, token: string): Promise<Blob | null> {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL no está configurada.");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 401) {
      handleUnauthorized();
      return null;
    }

    if (!res.ok) {
      console.error(`GET ${path} respondió ${res.status}`);
      return null;
    }

    return await res.blob();
  } catch (error) {
    console.error(`No se pudo conectar con el backend (${path}):`, error);
    return null;
  }
}

export async function listEvaluacionesAlumno(
  token: string,
  alumnoId: number,
): Promise<Evaluacion[] | null> {
  return authGet<Evaluacion[]>(`/api/v1/alumnos/${alumnoId}/evaluaciones`, token);
}

export async function subirEvaluacion(
  token: string,
  alumnoId: number,
  archivo: File,
): Promise<Evaluacion> {
  const formData = new FormData();
  formData.append("archivo", archivo);
  return authUpload<Evaluacion>(
    `/api/v1/alumnos/${alumnoId}/evaluaciones`,
    token,
    formData,
  );
}

export async function descargarEvaluacion(
  token: string,
  alumnoId: number,
  evaluacionId: number,
): Promise<Blob | null> {
  return authDownload(
    `/api/v1/alumnos/${alumnoId}/evaluaciones/${evaluacionId}/archivo`,
    token,
  );
}

export async function eliminarEvaluacion(
  token: string,
  alumnoId: number,
  evaluacionId: number,
): Promise<void> {
  return authDelete(`/api/v1/alumnos/${alumnoId}/evaluaciones/${evaluacionId}`, token);
}

export async function misEvaluaciones(token: string): Promise<Evaluacion[] | null> {
  return authGet<Evaluacion[]>("/api/v1/evaluaciones/mias", token);
}

export async function descargarMiEvaluacion(
  token: string,
  evaluacionId: number,
): Promise<Blob | null> {
  return authDownload(`/api/v1/evaluaciones/mias/${evaluacionId}/archivo`, token);
}

// --- Cuenta / pagos (plan de membresía, distinto del Plan de la web pública) ---

export type PlanCuota = {
  id: number;
  nombre: string;
  duracionDias: number;
  precio: number | null;
  activo: boolean;
};

export type PlanCuotaInput = {
  nombre: string;
  duracionDias: number;
  precio?: number;
};

export async function listPlanesCuota(token: string): Promise<PlanCuota[] | null> {
  return authGet<PlanCuota[]>("/api/v1/planes-cuota", token);
}

export async function crearPlanCuota(
  token: string,
  input: PlanCuotaInput,
): Promise<PlanCuota> {
  return authMutate<PlanCuota>("/api/v1/planes-cuota", "POST", token, input);
}

export async function actualizarPlanCuota(
  token: string,
  id: number,
  input: PlanCuotaInput,
): Promise<PlanCuota> {
  return authMutate<PlanCuota>(`/api/v1/planes-cuota/${id}`, "PUT", token, input);
}

export async function actualizarActivoPlanCuota(
  token: string,
  id: number,
  activo: boolean,
): Promise<PlanCuota> {
  return authMutate<PlanCuota>(`/api/v1/planes-cuota/${id}/activo`, "PATCH", token, {
    activo,
  });
}

export type CuentaAlumno = {
  planActual: PlanCuota | null;
  fechaVencimiento: string | null;
  alDia: boolean;
};

export async function getCuentaAlumno(
  token: string,
  alumnoId: number,
): Promise<CuentaAlumno | null> {
  return authGet<CuentaAlumno>(`/api/v1/alumnos/${alumnoId}/cuenta`, token);
}

export type Pago = {
  id: number;
  alumno: {
    id: number;
    nombre: string;
    apellido: string;
  };
  planCuota: PlanCuota;
  fecha: string;
  monto: number | null;
};

export type PagoInput = {
  planCuotaId: number;
  fecha?: string;
  monto?: number;
};

export async function listPagosAlumno(
  token: string,
  alumnoId: number,
): Promise<Pago[] | null> {
  return authGet<Pago[]>(`/api/v1/alumnos/${alumnoId}/pagos`, token);
}

export async function registrarPago(
  token: string,
  alumnoId: number,
  input: PagoInput,
): Promise<Pago> {
  return authMutate<Pago>(`/api/v1/alumnos/${alumnoId}/pagos`, "POST", token, input);
}
