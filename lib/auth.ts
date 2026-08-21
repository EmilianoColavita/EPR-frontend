export type Rol = "ADMIN" | "ENTRENADOR" | "ALUMNO";

export type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: Rol;
  activo: boolean;
  fechaRegistro: string;
};

export type Session = {
  token: string;
  usuario: Usuario;
};

type ApiErrorBody = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details: string[] | null;
};

export class AuthError extends Error {
  status: number;
  details: string[] | null;

  constructor(message: string, status: number, details: string[] | null = null) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.details = details;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STORAGE_KEY = "epr_session";

export async function login(email: string, password: string): Promise<Session> {
  if (!API_URL) {
    throw new AuthError("NEXT_PUBLIC_API_URL no está configurada.", 0);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    throw new AuthError(
      "No se pudo conectar con el servidor. Verificá tu conexión o que el backend esté corriendo.",
      0,
    );
  }

  if (!res.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      // el backend no devolvió JSON, seguimos con el mensaje genérico
    }
    throw new AuthError(
      body?.message ?? "No se pudo iniciar sesión.",
      res.status,
      body?.details ?? null,
    );
  }

  return (await res.json()) as Session;
}

export type RegisterInput = {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  password: string;
};

// El registro público siempre crea un ALUMNO con activo=false. No devuelve
// token: la cuenta queda pendiente de aprobación por un ADMIN.
export async function register(input: RegisterInput): Promise<Usuario> {
  if (!API_URL) {
    throw new AuthError("NEXT_PUBLIC_API_URL no está configurada.", 0);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    throw new AuthError(
      "No se pudo conectar con el servidor. Verificá tu conexión o que el backend esté corriendo.",
      0,
    );
  }

  if (!res.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      // el backend no devolvió JSON, seguimos con el mensaje genérico
    }
    throw new AuthError(
      body?.message ?? "No se pudo completar el registro.",
      res.status,
      body?.details ?? null,
    );
  }

  return (await res.json()) as Usuario;
}

// Evita un JSON.parse innecesario cuando localStorage no cambió desde la
// última lectura.
let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

export function saveSession(session: Session) {
  if (typeof window === "undefined") return;
  cachedRaw = JSON.stringify(session);
  cachedSession = session;
  localStorage.setItem(STORAGE_KEY, cachedRaw);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSession;

  cachedRaw = raw;
  try {
    cachedSession = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  cachedRaw = null;
  cachedSession = null;
  localStorage.removeItem(STORAGE_KEY);
}

export function getRoleRedirectPath(rol: Rol): string {
  switch (rol) {
    case "ADMIN":
      return "/panel/admin";
    case "ENTRENADOR":
      return "/panel/entrenador";
    case "ALUMNO":
      return "/panel/alumno";
  }
}
