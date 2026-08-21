import type { Rol, Usuario } from "./auth";

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
  if (!API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL no está configurada.", 0);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  if (!res.ok) {
    throw await parseApiError(res);
  }

  return (await res.json()) as Usuario;
}

export async function actualizarActivo(
  token: string,
  id: number,
  activo: boolean,
): Promise<Usuario> {
  if (!API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL no está configurada.", 0);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1/usuarios/${id}/activo`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ activo }),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  if (!res.ok) {
    throw await parseApiError(res);
  }

  return (await res.json()) as Usuario;
}
