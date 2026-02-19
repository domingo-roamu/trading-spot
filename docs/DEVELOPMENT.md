# Trading Spot — Development Guide

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS + Design System propio |
| Componentes | shadcn/ui (base) |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| SSR Auth | `@supabase/ssr` v0.3.0 |
| Deploy | Vercel |

## Configuración del entorno

```bash
# Variables de entorno requeridas (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Type check
npx tsc --noEmit
```

## Arquitectura y estructura de archivos

```
src/
├── app/
│   ├── (auth)/          # Login, signup, verify-email, reset-password
│   ├── (dashboard)/     # Layout con sidebar + páginas del dashboard
│   │   ├── layout.tsx   # Auth guard + Sidebar
│   │   └── dashboard/   # Dashboard principal
│   ├── (onboarding)/    # Flujo de onboarding 3 pasos
│   └── auth/callback/   # Handler OAuth / email confirmation
├── components/
│   ├── dashboard/       # Sidebar, MetricCard, WatchlistTable, WatchlistSection
│   └── layout/          # Logo, Header
├── lib/
│   ├── auth/actions.ts  # Server Actions de autenticación
│   ├── dashboard/       # Queries del dashboard
│   ├── onboarding/      # Server Action de onboarding
│   ├── supabase/        # Clientes browser y server
│   ├── watchlist/       # Server Actions de watchlist
│   └── utils.ts         # Helpers: cn, formatCurrency, formatPercent, getWeekStart
├── types/
│   ├── index.ts         # Tipos de dominio (Trade, WatchlistItem, etc.)
│   └── database.ts      # Tipos Supabase escritos a mano
└── middleware.ts         # Refresco de sesión + protección de rutas
```

## Workflow de desarrollo

```
planificación → diseño → iteración → desarrollo → QA → commit → actualizar docs
```

1. **Planificación**: Definir scope, componentes, rutas y decisiones técnicas
2. **Diseño**: Layout, estados (empty, loading, error), flujos de usuario
3. **Iteración**: Prototipar en servidor → extraer a cliente solo lo necesario
4. **Desarrollo**: Server Components por defecto; Client solo para interactividad
5. **QA**: `npx tsc --noEmit` sin errores + prueba manual de flujos críticos
6. **Commit**: Cambios atómicos con mensaje descriptivo
7. **Docs**: Actualizar DEVELOPMENT.md y MEMORY.md

## Feature Log

### 2026-02-18 — Dashboard real (v1)
**Decisiones técnicas:**
- `WatchlistSection.tsx`: wrapper Client Component que contiene modal + tabla para compartir estado `open` entre ambos sin prop drilling a través de Server Components.
- `MetricCard`: Server Component — solo presenta datos, sin interactividad.
- `Sidebar`: hidratación diferida (`useState(false)` → `useEffect` lee localStorage) para evitar mismatch SSR/client.
- `getDashboardData`: `Promise.all` para fetch paralelo de watchlist + análisis + trades.
- Join manual en `page.tsx` (server side) antes de pasar datos a Client Components — evita queries en cliente.

**Archivos creados:**
- `src/components/dashboard/Sidebar.tsx`
- `src/components/dashboard/MetricCard.tsx`
- `src/components/dashboard/WatchlistTable.tsx`
- `src/components/dashboard/WatchlistSection.tsx`
- `src/components/dashboard/AddTickerModal.tsx` (standalone, no usado en página actual)
- `src/lib/dashboard/queries.ts`
- `src/lib/watchlist/actions.ts`

**Archivos modificados:**
- `src/app/(dashboard)/layout.tsx` — agrega Sidebar + fetch de `full_name`
- `src/app/(dashboard)/dashboard/page.tsx` — dashboard real reemplaza placeholder

### 2026-02-18 — Onboarding
- Form 3 pasos (Client Component) en `(onboarding)/onboarding/page.tsx`
- Server Action `completeOnboardingAction` actualiza `user_profiles`
- Dashboard layout redirige a `/onboarding` si `onboarding_completed = false`

### 2026-02-18 — Auth + Schema SQL
- Auth pages: login, signup, verify-email, reset-password
- Schema completo aplicado en Supabase (6 tablas + triggers + RLS)
- Middleware protege `/dashboard` y `/onboarding`

## Bugs encontrados y soluciones

### 1. SSR type cast (`@supabase/ssr` v0.3.0 + supabase-js v2.97)
**Problema**: `@supabase/ssr` v0.3.0 fue compilado contra supabase-js 2.42 (3 type params en `SupabaseClient`). La versión instalada (2.97) tiene 5 type params. SSR pasa 3 args → args desalineados → `Schema = never` → `.from()` falla con errores de tipos.

**Fix aplicado** en `server.ts` y `client.ts`:
```ts
return supabase as unknown as SupabaseClient<Database>
```

### 2. Tipos de `database.ts`
**Regla**: Cada tabla en `Database['public']['Tables']` requiere `Relationships: []`.
Views y Functions deben ser `Record<string, never>`, no `{}`.

### 3. RLS en upsert vs update
**Observación**: En tablas con RLS, preferir `.update()` + `.eq('user_id', user.id)` sobre `.upsert()` — el upsert puede fallar silenciosamente si la política INSERT es más restrictiva que UPDATE.

### 4. Next.js cache con Server Actions
**Observación**: Después de mutaciones (add/remove watchlist), llamar `revalidatePath('/dashboard')` en la Server Action para forzar re-fetch. Sin esto, los datos del dashboard no se actualizan.

### 5. Hydration mismatch en Sidebar
**Problema**: Sidebar lee `localStorage` para estado collapsed, pero SSR no tiene acceso a `localStorage`. Si el valor inicial del `useState` es diferente al de localStorage, React lanza hydration mismatch.

**Fix**: `useState(false)` como default (coincide con SSR) + `useEffect` aplica el valor de localStorage después de montar. Se usa flag `mounted` para renderizar correctamente.

## Próximos pasos

- [ ] Página `/dashboard/watchlist` — vista detallada del watchlist
- [ ] Página `/dashboard/trades` — registro y historial de trades
- [ ] Página `/dashboard/analytics` — gráficos de P&L semanal (Recharts)
- [ ] Página `/dashboard/settings` — perfil y preferencias
- [ ] Mobile: hamburger menu para sidebar en pantallas pequeñas
- [ ] Análisis semanales: pipeline de generación automática con IA
- [ ] Notificaciones: sistema de emails semanales
