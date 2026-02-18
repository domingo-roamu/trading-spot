> Documento original en `/temp-docs/design-system.md` — copia de referencia en `/docs/`

# Trading Spot - Design System

## Resumen de Implementación

El design system está implementado principalmente en `tailwind.config.ts`.

### Paleta aplicada en Tailwind

| Token | Clase Tailwind | Hex |
|-------|---------------|-----|
| gray-50 | `bg-gray-50` | `#FAFAFA` |
| gray-900 | `bg-gray-900` | `#171717` |
| success-500 | `text-success-500` | `#22C55E` |
| danger-500 | `text-danger-500` | `#EF4444` |
| warning-500 | `text-warning-500` | `#F59E0B` |

### Fuentes

- **Sans:** Nunito via `next/font/google` → `var(--font-sans)` → `font-sans`
- **Mono:** JetBrains Mono via `next/font/google` → `var(--font-mono)` → `font-mono`

### Clases de utilidad custom (en `globals.css`)

- `.tabular-nums` — números con ancho fijo para tablas
- `.skeleton` — loader animado
- `.scrollbar-thin` — scrollbar sutil

---

Ver design system completo: [`/temp-docs/design-system.md`](../temp-docs/design-system.md)
