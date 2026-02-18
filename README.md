# Trading Spot

Plataforma de análisis de trading semanal con IA. Reduce tu tiempo de research de 4–6 horas a menos de 1 hora cada lunes.

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript (strict mode) |
| Estilos | Tailwind CSS + Design System propio |
| Componentes | shadcn/ui |
| Base de datos | Supabase (PostgreSQL + Auth + RLS) |
| IA | Claude API (Anthropic) |
| Tipografía | Nunito + JetBrains Mono |
| Deploy | Vercel |

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
ANTHROPIC_API_KEY=tu_api_key_de_anthropic
NEWS_API_KEY=tu_newsapi_key          # opcional para MVP
ALPHA_VANTAGE_API_KEY=tu_av_key     # opcional, Yahoo Finance es gratis
```

### 3. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. En SQL Editor, ejecuta el schema desde `/docs/prd.md` (sección "Schema de Base de Datos")
3. Habilita Auth > Email/Password en el dashboard

### 4. Instalar componentes shadcn/ui

```bash
npx shadcn-ui@latest init
```

Configuración recomendada:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

### 5. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build optimizado de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Verificar con ESLint |
| `npm run lint:fix` | Fix automático de lint |
| `npm run type-check` | Verificar tipos TypeScript sin emitir |
| `npm run format` | Formatear código con Prettier |
| `npm run format:check` | Verificar formato sin cambiar archivos |

## Estructura del Proyecto

```
trading-spot/
├── src/
│   ├── app/                    # Pages y layouts (Next.js App Router)
│   │   ├── layout.tsx          # Root layout con fuentes Nunito + JetBrains Mono
│   │   ├── page.tsx            # Landing page pública
│   │   └── globals.css         # Estilos base + CSS variables
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx      # Header con logo Trading Spot
│   │   └── ui/                 # Componentes shadcn/ui (generados con CLI)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Cliente browser (componentes cliente)
│   │   │   └── server.ts       # Cliente server (Server Components / API)
│   │   └── utils.ts            # cn(), formatCurrency(), formatPercent()...
│   └── types/
│       ├── index.ts            # Types del dominio (Trade, WatchlistItem...)
│       └── database.ts         # Types generados para Supabase
├── docs/
│   ├── prd.md                  # Product Requirements Document
│   └── design-system.md        # Design System completo
├── public/                     # Assets estáticos
├── .env.example                # Variables de entorno requeridas
├── tailwind.config.ts          # Paleta custom + fuentes
├── tsconfig.json               # TypeScript strict mode
└── next.config.ts              # Configuración Next.js
```

## Documentación

- [PRD - Producto y Casos de Uso](./docs/prd.md)
- [Design System](./docs/design-system.md)

## Decisiones de Arquitectura

- **App Router exclusivo:** No usar Pages Router para mantener consistencia
- **Server Components por defecto:** Solo `'use client'` cuando sea necesario (interactividad, hooks)
- **Supabase SSR:** Cookies manejadas via `@supabase/ssr` para auth sin vulnerabilidades
- **`src/types/database.ts`:** Actualizar con `supabase gen types typescript` cuando el schema esté estable
- **Tailwind + shadcn/ui:** Design system propio vía `tailwind.config.ts`, shadcn como base de componentes accesibles

## Despliegue

Push a `main` → deploy automático en Vercel.

Configurar variables de entorno en el dashboard de Vercel antes del primer deploy.

---

> **Disclaimer:** Trading Spot es una herramienta de análisis personal. No constituye consejo financiero. Usa bajo tu propio criterio y riesgo.
