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
