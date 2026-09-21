export const WHATSAPP_NUMERO = "5492235744040";
export const EMAIL = "eprrendimiento@gmail.com";
export const TELEFONO_VISIBLE = "+54 9 2235 74-4040";
export const INSTAGRAM_URL = "https://www.instagram.com/epr.entrenamiento/";
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61592549804292";

export const DIRECCION =
  "Guardavidas Guillermo Volpe 2725, B7600 Mar del Plata, Provincia de Buenos Aires, Argentina";

// La búsqueda en Maps usa el nombre del local (Mutti Gimnasio Playa Grande)
// además de la dirección, para que apunte al lugar real en vez de a un
// punto geocodificado aproximado de la calle.
const MAPS_QUERY = encodeURIComponent(`Mutti Gimnasio Playa Grande, ${DIRECCION}`);
export const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;
export const MAPS_SEARCH_HREF = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;

export function whatsappHref(mensaje?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMERO}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

export function mailtoHref(asunto?: string): string {
  return asunto ? `mailto:${EMAIL}?subject=${encodeURIComponent(asunto)}` : `mailto:${EMAIL}`;
}

// Datos de la cuenta de Mercado Pago del admin, para que el alumno sepa a
// quién transferirle antes de subir su comprobante de pago.
export const MP_ALIAS = "epr.entrenamiento";
export const MP_CVU = "0000003100023208567173";
export const MP_NOMBRE = "Luciano Colavita";
