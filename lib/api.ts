import { handleUnauthorized, type Rol, type Usuario } from "./auth";

export type PlanCard = {
  id?: number;
  title: string;
  items: string[];
  price?: number;
  // Solo vienen en las respuestas de admin (/planes/todos, POST/PUT).
  orden?: number | null;
  activo?: boolean | null;
};

export type PlanGroup = {
  id?: number;
  title: string;
  cards: PlanCard[];
  note?: string[];
  // Solo vienen en las respuestas de admin (/planes/todos, POST/PUT).
  orden?: number | null;
  activo?: boolean | null;
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

// --- ABM de planes públicos (para el panel de admin) ---

export type PlanCategoriaInput = {
  titulo: string;
  orden?: number;
  activo?: boolean;
  notas?: string[];
};

export type PlanCardInput = {
  titulo: string;
  orden?: number;
  activo?: boolean;
  precio?: number;
  items?: string[];
};

export async function listPlanesTodos(token: string): Promise<PlanGroup[] | null> {
  return authGet<PlanGroup[]>("/api/v1/planes/todos", token);
}

export async function crearPlanCategoria(
  token: string,
  input: PlanCategoriaInput,
): Promise<PlanGroup> {
  return authMutate<PlanGroup>("/api/v1/planes/categorias", "POST", token, input);
}

export async function actualizarPlanCategoria(
  token: string,
  id: number,
  input: PlanCategoriaInput,
): Promise<PlanGroup> {
  return authMutate<PlanGroup>(`/api/v1/planes/categorias/${id}`, "PUT", token, input);
}

export async function eliminarPlanCategoria(token: string, id: number): Promise<void> {
  return authDelete(`/api/v1/planes/categorias/${id}`, token);
}

export async function crearPlanCard(
  token: string,
  categoriaId: number,
  input: PlanCardInput,
): Promise<PlanCard> {
  return authMutate<PlanCard>(
    `/api/v1/planes/categorias/${categoriaId}/cards`,
    "POST",
    token,
    input,
  );
}

export async function actualizarPlanCard(
  token: string,
  id: number,
  input: PlanCardInput,
): Promise<PlanCard> {
  return authMutate<PlanCard>(`/api/v1/planes/cards/${id}`, "PUT", token, input);
}

export async function eliminarPlanCard(token: string, id: number): Promise<void> {
  return authDelete(`/api/v1/planes/cards/${id}`, token);
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
  becado: boolean;
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

// Helper para POST/PUT públicos (sin JWT) con body JSON, para los pocos
// endpoints que se llaman antes de tener sesión (ej: reservar una
// evaluación). Mismo manejo de errores que authMutate.
async function publicMutate<T>(
  path: string,
  method: "POST" | "PUT",
  body: unknown,
): Promise<T> {
  if (!API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL no está configurada.", 0);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  if (!res.ok) {
    throw await parseApiError(res);
  }

  return (await res.json()) as T;
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
  videoUrl: string | null;
};

export type BloqueRutina = {
  id: number;
  numero: number;
  nombre: string | null;
  ejercicios: Ejercicio[];
};

export type DiaRutina = {
  id: number;
  numero: number;
  nombre: string | null;
  bloques: BloqueRutina[];
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
  videoUrl?: string;
};

export type BloqueRutinaInput = {
  numero: number;
  nombre?: string;
  ejercicios: EjercicioInput[];
};

export type DiaRutinaInput = {
  numero: number;
  nombre?: string;
  bloques: BloqueRutinaInput[];
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
  becado: boolean;
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

// --- Comprobantes de pago (el alumno sube, el admin confirma o rechaza) ---

export type EstadoComprobante = "PENDIENTE" | "CONFIRMADO" | "RECHAZADO";

export type ComprobantePago = {
  id: number;
  alumno: {
    id: number;
    nombre: string;
    apellido: string;
  };
  nombreArchivo: string;
  fecha: string;
  planCuota: PlanCuota | null;
  monto: number | null;
  estado: EstadoComprobante;
  pago: Pago | null;
  notaRechazo: string | null;
};

export type SubirComprobanteInput = {
  archivo: File;
  planCuotaId?: number;
  monto?: number;
  fecha?: string;
};

export async function subirComprobante(
  token: string,
  input: SubirComprobanteInput,
): Promise<ComprobantePago> {
  const formData = new FormData();
  formData.append("archivo", input.archivo);
  if (input.planCuotaId != null) formData.append("planCuotaId", String(input.planCuotaId));
  if (input.monto != null) formData.append("monto", String(input.monto));
  if (input.fecha) formData.append("fecha", input.fecha);
  return authUpload<ComprobantePago>("/api/v1/comprobantes-pago", token, formData);
}

export async function misComprobantes(token: string): Promise<ComprobantePago[] | null> {
  return authGet<ComprobantePago[]>("/api/v1/comprobantes-pago/mios", token);
}

export async function descargarMiComprobante(
  token: string,
  comprobanteId: number,
): Promise<Blob | null> {
  return authDownload(`/api/v1/comprobantes-pago/mios/${comprobanteId}/archivo`, token);
}

export async function listComprobantesAlumno(
  token: string,
  alumnoId: number,
): Promise<ComprobantePago[] | null> {
  return authGet<ComprobantePago[]>(`/api/v1/alumnos/${alumnoId}/comprobantes-pago`, token);
}

export async function descargarComprobanteAlumno(
  token: string,
  alumnoId: number,
  comprobanteId: number,
): Promise<Blob | null> {
  return authDownload(
    `/api/v1/alumnos/${alumnoId}/comprobantes-pago/${comprobanteId}/archivo`,
    token,
  );
}

export type ConfirmarComprobanteInput = {
  planCuotaId: number;
  fecha?: string;
  monto?: number;
};

export async function confirmarComprobante(
  token: string,
  comprobanteId: number,
  input: ConfirmarComprobanteInput,
): Promise<ComprobantePago> {
  return authMutate<ComprobantePago>(
    `/api/v1/comprobantes-pago/${comprobanteId}/confirmar`,
    "POST",
    token,
    input,
  );
}

export async function rechazarComprobante(
  token: string,
  comprobanteId: number,
  nota?: string,
): Promise<ComprobantePago> {
  return authMutate<ComprobantePago>(
    `/api/v1/comprobantes-pago/${comprobanteId}/rechazar`,
    "POST",
    token,
    { nota },
  );
}

export async function listComprobantesPendientes(
  token: string,
): Promise<ComprobantePago[] | null> {
  return authGet<ComprobantePago[]>("/api/v1/comprobantes-pago?estado=PENDIENTE", token);
}

// --- Becas (un alumno becado queda exento del sistema de Cuenta/Pago) ---

export type EstadoBeca = "ACTIVA" | "FINALIZADA";

export type NotaBeca = {
  id: number;
  fecha: string;
  texto: string;
};

export type Beca = {
  id: number;
  alumno: {
    id: number;
    nombre: string;
    apellido: string;
  };
  fechaInicio: string;
  fechaFinalizacion: string | null;
  estado: EstadoBeca;
  notas: NotaBeca[];
};

async function fetchBeca(path: string, token: string): Promise<Beca | "sin-beca" | null> {
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

    if (res.status === 404) return "sin-beca";

    if (!res.ok) {
      console.error(`GET ${path} respondió ${res.status}`);
      return null;
    }

    return (await res.json()) as Beca;
  } catch (error) {
    console.error(`No se pudo conectar con el backend (${path}):`, error);
    return null;
  }
}

export async function getBecaAlumno(
  token: string,
  alumnoId: number,
): Promise<Beca | "sin-beca" | null> {
  return fetchBeca(`/api/v1/alumnos/${alumnoId}/beca`, token);
}

export async function getMiBeca(token: string): Promise<Beca | "sin-beca" | null> {
  return fetchBeca("/api/v1/becas/mia", token);
}

export async function otorgarBeca(
  token: string,
  alumnoId: number,
  fechaInicio?: string,
): Promise<Beca> {
  return authMutate<Beca>(`/api/v1/alumnos/${alumnoId}/beca`, "POST", token, {
    fechaInicio,
  });
}

export async function agregarNotaBeca(
  token: string,
  alumnoId: number,
  texto: string,
): Promise<Beca> {
  return authMutate<Beca>(`/api/v1/alumnos/${alumnoId}/beca/notas`, "POST", token, {
    texto,
  });
}

export async function finalizarBeca(
  token: string,
  alumnoId: number,
  fechaFinalizacion?: string,
): Promise<Beca> {
  return authMutate<Beca>(`/api/v1/alumnos/${alumnoId}/beca/finalizar`, "POST", token, {
    fechaFinalizacion,
  });
}

// --- Solicitudes de evaluación (formulario público "Reservar evaluación") ---

export type EstadoSolicitudEvaluacion = "PENDIENTE" | "CONTACTADO" | "COMPLETADA";

export type SolicitudEvaluacion = {
  id: number;
  nombreCompleto: string;
  email: string;
  telefono: string | null;
  objetivo: string | null;
  fechaPreferida: string | null;
  estado: EstadoSolicitudEvaluacion;
  fechaSolicitud: string;
};

export type SolicitudEvaluacionInput = {
  nombreCompleto: string;
  email: string;
  telefono?: string;
  objetivo?: string;
  fechaPreferida?: string;
};

// Público, no requiere sesión: lo llama cualquiera desde el botón
// "Reservar evaluación" del home, sin necesidad de tener cuenta.
export async function crearSolicitudEvaluacion(
  input: SolicitudEvaluacionInput,
): Promise<SolicitudEvaluacion> {
  return publicMutate<SolicitudEvaluacion>("/api/v1/evaluaciones", "POST", input);
}

// ADMIN/ENTRENADOR — gestión de las solicitudes desde el panel.
export async function listSolicitudesEvaluacion(
  token: string,
): Promise<SolicitudEvaluacion[] | null> {
  return authGet<SolicitudEvaluacion[]>("/api/v1/evaluaciones", token);
}

export async function actualizarEstadoSolicitud(
  token: string,
  id: number,
  estado: EstadoSolicitudEvaluacion,
): Promise<SolicitudEvaluacion> {
  return authMutate<SolicitudEvaluacion>(`/api/v1/evaluaciones/${id}/estado`, "PUT", token, {
    estado,
  });
}

export async function eliminarSolicitud(token: string, id: number): Promise<void> {
  return authDelete(`/api/v1/evaluaciones/${id}`, token);
}

// --- Notificaciones (avisos puntuales para el alumno, ej: pago confirmado) ---

export type Notificacion = {
  id: number;
  titulo: string;
  mensaje: string;
  href: string | null;
  leida: boolean;
  fecha: string;
};

export async function misNotificaciones(token: string): Promise<Notificacion[] | null> {
  return authGet<Notificacion[]>("/api/v1/notificaciones/mias", token);
}

export async function marcarNotificacionLeida(
  token: string,
  id: number,
): Promise<Notificacion> {
  return authMutate<Notificacion>(
    `/api/v1/notificaciones/mias/${id}/leida`,
    "POST",
    token,
    {},
  );
}

export async function marcarTodasLasNotificacionesLeidas(token: string): Promise<void> {
  await authMutate<unknown>("/api/v1/notificaciones/mias/leer-todas", "POST", token, {});
}

// --- Mi perfil (datos personales y foto del usuario logueado, cualquier rol) ---

export type ActualizarPerfilInput = {
  nombre: string;
  apellido: string;
  telefono?: string;
};

export async function actualizarMiPerfil(
  token: string,
  input: ActualizarPerfilInput,
): Promise<Usuario> {
  return authMutate<Usuario>("/api/v1/usuarios/mi-perfil", "PUT", token, input);
}

export async function subirFotoPerfil(token: string, archivo: File): Promise<Usuario> {
  const formData = new FormData();
  formData.append("archivo", archivo);
  return authUpload<Usuario>("/api/v1/usuarios/mi-perfil/foto", token, formData);
}

export async function eliminarFotoPerfil(token: string): Promise<void> {
  return authDelete("/api/v1/usuarios/mi-perfil/foto", token);
}

// A diferencia de authDownload, un 404 acá es un estado normal (todavía no
// subió ninguna foto) y no un error — no lo logueamos como tal.
export async function descargarMiFotoPerfil(token: string): Promise<Blob | null> {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL no está configurada.");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/usuarios/mi-perfil/foto`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 401) {
      handleUnauthorized();
      return null;
    }
    if (res.status === 404) return null;

    if (!res.ok) {
      console.error(`GET /api/v1/usuarios/mi-perfil/foto respondió ${res.status}`);
      return null;
    }

    return await res.blob();
  } catch (error) {
    console.error("No se pudo conectar con el backend (foto de perfil):", error);
    return null;
  }
}
