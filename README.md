# E.P.R — Entrenamiento Para el Rendimiento

Frontend de la landing page y (a futuro) panel privado de E.P.R, un centro de entrenamiento personalizado. Construido con Next.js (App Router) y Tailwind CSS.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4
- **Animaciones:** [motion](https://motion.dev)
- **Iconos:** lucide-react

El backend (gestión de turnos, rutinas, cuotas) se desarrolla aparte en Java con Spring Boot (`EPR/backend/backend`) y no forma parte de este repositorio, pero el frontend consume su API para algunas secciones (ver [Variables de entorno](#variables-de-entorno)).

## Requisitos

- [Node.js](https://nodejs.org) 20.9 o superior
- npm (viene incluido con Node)

## Clonar el proyecto en otra PC

```bash
git clone https://github.com/EmilianoColavita/EPR-frontend.git
cd EPR-frontend
npm install
cp .env.example .env.local
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para ver el sitio. Las imágenes (logo, fondos, fotos de las secciones) ya están versionadas en `public/images/`, no hace falta agregarlas a mano.

## Variables de entorno

Copiá `.env.example` a `.env.local` (este último no se versiona) y completá:

| Variable               | Qué es                                              | Default local            |
| ----------------------- | ---------------------------------------------------- | -------------------------- |
| `NEXT_PUBLIC_API_URL`  | URL base del backend Spring Boot                     | `http://localhost:8080`  |

Algunas secciones (por ejemplo, **Planes**) traen su contenido desde el backend. Si el backend no está corriendo, esas secciones muestran un mensaje de error en vez de romper la página. Para levantarlo: desde `EPR/backend/backend`, correr `./gradlew bootRun` (corre en `localhost:8080`).

## Scripts disponibles

| Comando         | Qué hace                                  |
| ---------------- | ------------------------------------------ |
| `npm run dev`   | Levanta el servidor de desarrollo          |
| `npm run build` | Genera el build de producción              |
| `npm run start` | Sirve el build de producción ya generado   |
| `npm run lint`  | Corre ESLint sobre el proyecto             |

## Estructura del proyecto

```
app/                   Rutas (App Router): home, metodos, nosotros, planes, contacto, login
components/
  layout/               Header, Logo
  sections/             Hero, MethodsPreview, About y demás secciones del home
  ui/                    Componentes base reutilizables (Button, etc.)
lib/                    Utilidades compartidas (cn, variantes de animación, fetch al backend)
public/images/          Assets: logo, fondos y fotos usadas en el home
```

## Sistema de diseño

- **Colores:** `epr-green` (#CCFF00), `epr-dark` (#121212), `epr-card` (#1E1E1E) — definidos como tokens de Tailwind en `app/globals.css`.
- **Tipografías:** Anton (nav del header), Barlow Condensed (títulos y textos del home), Inter (texto general) — cargadas con `next/font` en `app/layout.tsx`.
