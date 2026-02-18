# Trading Spot - Design System

## 🎨 Visual Identity

### Filosofía de Diseño
- **Minimalista:** Cada elemento tiene un propósito claro
- **Elegante:** Tonos grises sofisticados, espacios generosos
- **Baja carga cognitiva:** Jerarquía visual clara, no abrumar
- **Friendly:** Accesible sin sacrificar profesionalismo

**Referencias principales:**
- Mercury Bank (limpieza, elegancia)
- Linear (modernidad, UX fluida)
- TradingView (data visualization profesional)

---

## 🎨 Paleta de Colores (Light Mode - MVP)

### Grises Base
```css
--gray-50:  #FAFAFA   /* Backgrounds más suaves */
--gray-100: #F5F5F5   /* Background cards hover */
--gray-200: #E5E5E5   /* Borders sutiles */
--gray-300: #D4D4D4   /* Borders normales */
--gray-400: #A3A3A3   /* Texto secundario disabled */
--gray-500: #737373   /* Texto secundario activo */
--gray-600: #525252   /* Texto primario */
--gray-700: #404040   /* Headings */
--gray-800: #262626   /* Headings importantes */
--gray-900: #171717   /* Negro casi puro para contraste máximo */
```

### Colores Funcionales

**Success (Verde sutil):**
```css
--success-50:  #F0FDF4  /* Background de ganancias */
--success-100: #DCFCE7
--success-500: #22C55E  /* Iconos/badges de win */
--success-600: #16A34A  /* Hover estados */
--success-700: #15803D  /* Texto de énfasis */
```

**Danger (Rojo sutil):**
```css
--danger-50:  #FEF2F2  /* Background de pérdidas */
--danger-100: #FEE2E2
--danger-500: #EF4444  /* Iconos/badges de loss */
--danger-600: #DC2626  /* Hover estados */
--danger-700: #B91C1C  /* Texto de énfasis */
```

**Warning (Amarillo/Amber):**
```css
--warning-50:  #FFFBEB  /* Background de alertas */
--warning-100: #FEF3C7
--warning-500: #F59E0B  /* Confianza media 🟡 */
--warning-600: #D97706
```

**Info (Azul grisáceo - muy sutil):**
```css
--info-50:  #F8FAFC   /* Background de info cards */
--info-100: #F1F5F9
--info-500: #64748B   /* Iconos informativos */
--info-600: #475569
```

**Primary (Plateado/Gris con tinte azul):**
```css
--primary-50:  #F8FAFC
--primary-100: #F1F5F9
--primary-500: #64748B  /* CTAs principales */
--primary-600: #475569  /* Hover */
--primary-700: #334155  /* Active */
```

### Colores Especiales

**Nivel de Confianza:**
```css
--confidence-high:   #22C55E  /* 🟢 Verde */
--confidence-medium: #F59E0B  /* 🟡 Amarillo */
--confidence-low:    #EF4444  /* 🔴 Rojo */
```

**Tendencias:**
```css
--trend-up:       #22C55E  /* ↗️ */
--trend-down:     #EF4444  /* ↘️ */
--trend-sideways: #A3A3A3  /* → */
```

---

## 📐 Espaciado (Sistema de 8px)

```css
--space-1:  0.25rem  /* 4px  - Padding mínimo */
--space-2:  0.5rem   /* 8px  - Gaps pequeños */
--space-3:  0.75rem  /* 12px - Padding interno */
--space-4:  1rem     /* 16px - Padding estándar */
--space-5:  1.25rem  /* 20px - Gaps entre secciones */
--space-6:  1.5rem   /* 24px - Padding grande */
--space-8:  2rem     /* 32px - Gaps grandes */
--space-10: 2.5rem   /* 40px - Separación de secciones */
--space-12: 3rem     /* 48px - Márgenes generosos */
--space-16: 4rem     /* 64px - Hero sections */
```

**Principio:** Usar múltiplos de 8px para mantener consistencia visual.

---

## 🔤 Tipografía

### Fuentes
```css
/* Sans-serif moderna, friendly y limpia */
--font-sans: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace para números/tickers */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Por qué Nunito:**
- Rounded, friendly pero profesional
- Excelente legibilidad en pantalla
- Números bien diferenciados
- Amplia gama de pesos (300-900)
- Diseñada para UI/UX modernas

### Scale Tipográfica

```css
/* Headings */
--text-xs:   0.75rem   /* 12px - Labels pequeños */
--text-sm:   0.875rem  /* 14px - Body secundario */
--text-base: 1rem      /* 16px - Body principal */
--text-lg:   1.125rem  /* 18px - Subheadings */
--text-xl:   1.25rem   /* 20px - Card titles */
--text-2xl:  1.5rem    /* 24px - Section headings */
--text-3xl:  1.875rem  /* 30px - Page titles */
--text-4xl:  2.25rem   /* 36px - Hero */

/* Weights */
--font-normal:  400
--font-medium:  500
--font-semibold: 600
--font-bold:    700
```

### Estilos de Texto

**Headings:**
```css
h1, h2, h3 {
  font-weight: 600;
  color: var(--gray-800);
  letter-spacing: -0.02em; /* Tighter para elegancia */
}

h1 { font-size: var(--text-3xl); line-height: 1.2; }
h2 { font-size: var(--text-2xl); line-height: 1.3; }
h3 { font-size: var(--text-xl); line-height: 1.4; }
```

**Body:**
```css
body {
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--gray-600);
  line-height: 1.6;
}
```

**Números/Métricas:**
```css
.metric {
  font-family: var(--font-mono);
  font-weight: 600;
  font-variant-numeric: tabular-nums; /* Alineación perfecta */
}
```

---

## 🧱 Componentes Base

### Cards

**Card Base:**
```css
.card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--space-6);
  transition: all 0.2s ease;
}

.card:hover {
  border-color: var(--gray-300);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
```

**Card con Header:**
```html
<div class="card">
  <div class="card-header">
    <h3>Performance Total</h3>
    <span class="badge">Esta semana</span>
  </div>
  <div class="card-body">
    <!-- Contenido -->
  </div>
</div>
```

### Badges

**Confianza:**
```html
<span class="badge badge-confidence-high">🟢 75% Alta</span>
<span class="badge badge-confidence-medium">🟡 55% Media</span>
<span class="badge badge-confidence-low">🔴 30% Baja</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
}

.badge-confidence-high {
  background: var(--success-50);
  color: var(--success-700);
}

.badge-confidence-medium {
  background: var(--warning-50);
  color: var(--warning-700);
}

.badge-confidence-low {
  background: var(--danger-50);
  color: var(--danger-700);
}
```

**Tendencia:**
```html
<span class="badge badge-trend-up">↗️ Alza</span>
<span class="badge badge-trend-down">↘️ Baja</span>
<span class="badge badge-trend-sideways">→ Lateral</span>
```

### Botones

```css
/* Primary Button */
.btn-primary {
  background: var(--gray-900);
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: var(--text-sm);
  transition: all 0.15s ease;
  border: none;
}

.btn-primary:hover {
  background: var(--gray-800);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: var(--text-sm);
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--gray-600);
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-ghost:hover {
  background: var(--gray-100);
  color: var(--gray-800);
}
```

### Inputs

```css
.input {
  background: white;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  padding: 0.625rem 0.875rem;
  font-size: var(--text-base);
  color: var(--gray-700);
  transition: all 0.15s ease;
}

.input:focus {
  outline: none;
  border-color: var(--gray-600);
  box-shadow: 0 0 0 3px rgba(115, 115, 115, 0.1);
}

.input::placeholder {
  color: var(--gray-400);
}
```

### Tables

```css
.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--gray-200);
}

.table tbody td {
  padding: 1rem;
  font-size: var(--text-sm);
  color: var(--gray-600);
  border-bottom: 1px solid var(--gray-100);
}

.table tbody tr:hover {
  background: var(--gray-50);
}
```

---

## 📊 Componentes Específicos del Producto

### Metric Card (Dashboard)

```html
<div class="metric-card">
  <div class="metric-label">
    <span class="icon">📈</span>
    <span>Rentabilidad Total</span>
  </div>
  <div class="metric-value positive">
    +$1,248.50
  </div>
  <div class="metric-change">
    <span class="badge badge-success">+12.8%</span>
    <span class="metric-period">desde inicio</span>
  </div>
</div>
```

```css
.metric-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--space-6);
}

.metric-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  color: var(--gray-500);
  margin-bottom: var(--space-3);
}

.metric-value {
  font-family: var(--font-mono);
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--space-2);
}

.metric-value.positive {
  color: var(--success-600);
}

.metric-value.negative {
  color: var(--danger-600);
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.metric-period {
  font-size: var(--text-xs);
  color: var(--gray-400);
}
```

### Instrument Card

```html
<div class="instrument-card">
  <div class="instrument-header">
    <div class="instrument-info">
      <h3 class="ticker">AAPL</h3>
      <span class="name">Apple Inc.</span>
    </div>
    <div class="instrument-price">
      <span class="price">$175.50</span>
      <span class="change positive">+2.3%</span>
    </div>
  </div>
  
  <div class="instrument-prediction">
    <div class="prediction-trend">
      <span class="trend-icon">↗️</span>
      <span>Alza</span>
    </div>
    <span class="badge badge-confidence-high">🟢 75% Alta</span>
  </div>
  
  <ul class="instrument-highlights">
    <li>Strong earnings beat</li>
    <li>New product launch momentum</li>
    <li>Positive sector outlook</li>
  </ul>
  
  <div class="instrument-actions">
    <button class="btn-secondary">Ver Análisis</button>
    <button class="btn-primary">Registrar Compra</button>
  </div>
</div>
```

```css
.instrument-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--space-6);
  transition: all 0.2s ease;
}

.instrument-card:hover {
  border-color: var(--gray-300);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.instrument-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--space-4);
}

.ticker {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--gray-800);
  margin: 0;
}

.name {
  font-size: var(--text-sm);
  color: var(--gray-500);
}

.price {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-700);
}

.change {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  margin-left: 0.5rem;
}

.change.positive { color: var(--success-600); }
.change.negative { color: var(--danger-600); }

.instrument-prediction {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--gray-50);
  border-radius: 8px;
  margin-bottom: var(--space-4);
}

.prediction-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.instrument-highlights {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-4) 0;
}

.instrument-highlights li {
  font-size: var(--text-sm);
  color: var(--gray-600);
  padding-left: 1.25rem;
  position: relative;
  margin-bottom: 0.5rem;
}

.instrument-highlights li:before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--gray-400);
}

.instrument-actions {
  display: flex;
  gap: var(--space-3);
}
```

### Trade Entry Form

```html
<div class="trade-form">
  <div class="form-header">
    <h3>Registrar Compra</h3>
    <span class="ticker-badge">AAPL</span>
  </div>
  
  <div class="form-group">
    <label>Precio de Entrada</label>
    <div class="input-with-prefix">
      <span class="prefix">$</span>
      <input type="number" step="0.01" placeholder="175.50" />
    </div>
  </div>
  
  <div class="form-group">
    <label>Cantidad de Acciones</label>
    <input type="number" placeholder="10" />
  </div>
  
  <div class="form-group">
    <label>Comisión de Compra</label>
    <div class="input-with-prefix">
      <span class="prefix">$</span>
      <input type="number" step="0.01" placeholder="1.50" />
    </div>
  </div>
  
  <div class="form-summary">
    <div class="summary-row">
      <span>Inversión bruta</span>
      <span class="value">$1,755.00</span>
    </div>
    <div class="summary-row">
      <span>Comisión</span>
      <span class="value">+$1.50</span>
    </div>
    <div class="summary-row total">
      <span>Total a invertir</span>
      <span class="value">$1,756.50</span>
    </div>
  </div>
  
  <div class="form-actions">
    <button class="btn-secondary">Cancelar</button>
    <button class="btn-primary">Guardar Operación</button>
  </div>
</div>
```

---

## 🎨 Iconografía

**Sistema de íconos:** Lucide Icons (minimalistas, consistentes)

**Íconos principales:**
- 📊 TrendingUp/Down - Tendencias
- 💰 DollarSign - Dinero/Precios
- 📈 LineChart - Métricas
- 🎯 Target - Objetivos
- ✅ CheckCircle - Confirmaciones
- ⚠️ AlertTriangle - Warnings
- 🔔 Bell - Notificaciones
- ⚙️ Settings - Configuración
- 👤 User - Perfil

**Tamaños estándar:**
- Small: 16px
- Medium: 20px (default)
- Large: 24px

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px   /* Tablet pequeña */
--breakpoint-md: 768px   /* Tablet */
--breakpoint-lg: 1024px  /* Desktop */
--breakpoint-xl: 1280px  /* Desktop grande */
```

**Grid Layout:**
```css
/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  gap: var(--space-6);
}

/* Mobile: 1 columna */
@media (min-width: 640px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet: 2 columnas */
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop: 3 columnas */
  }
}
```

---

## 🎭 Animaciones y Transiciones

**Principios:**
- Sutiles y rápidas (150-250ms)
- Ease timing functions (no linear)
- Solo animar propiedades performantes (transform, opacity)

```css
/* Transiciones estándar */
--transition-fast:   150ms ease;
--transition-base:   200ms ease;
--transition-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Hover states */
.interactive:hover {
  transform: translateY(-1px);
  transition: transform var(--transition-fast);
}

/* Loading states */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background: var(--gray-200);
  border-radius: 8px;
}
```

---

## ♿ Accesibilidad

**Contraste mínimo:**
- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

**Focus states:**
```css
*:focus-visible {
  outline: 2px solid var(--gray-600);
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Screen readers:**
```html
<!-- Labels descriptivos -->
<button aria-label="Ver análisis completo de AAPL">
  Ver Análisis
</button>

<!-- Estados dinámicos -->
<div role="status" aria-live="polite">
  Operación guardada exitosamente
</div>
```

---

## 🌓 Dark Mode (Futuro)

**Variables para dark mode:**
```css
[data-theme="dark"] {
  --gray-50:  #18181B;
  --gray-100: #27272A;
  --gray-200: #3F3F46;
  /* ... invertir escala */
  
  /* Ajustar opacidades de colores funcionales */
  --success-500: #10B981;
  --danger-500: #F87171;
}
```

---

## 📦 Tech Stack Recomendado para Implementar el Diseño

**Framework UI:** shadcn/ui (componentes pre-construidos pero customizables)
**Tailwind CSS:** Para utility classes + custom theme
**Recharts:** Para gráficas (limpio, customizable)
**Lucide Icons:** Íconos consistentes

**Configuración Tailwind:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          // ... resto de grises
        },
        success: {
          50: '#F0FDF4',
          // ...
        },
        // ... resto de colores
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
      },
    },
  },
}
```

---

## ✅ Checklist de Consistencia

Al diseñar cada pantalla/componente nuevo:
- [ ] ¿Usa la paleta de colores definida?
- [ ] ¿Espaciado es múltiplo de 8px?
- [ ] ¿Tipografía sigue la escala?
- [ ] ¿Border radius es 8px o 12px?
- [ ] ¿Hover states están definidos?
- [ ] ¿Es accesible (contraste, focus)?
- [ ] ¿Funciona en mobile?
- [ ] ¿Tiene estado de loading/error?

---

## 🎯 Próximos Pasos

1. Crear wireframes con este sistema aplicado
2. Prototipar componentes principales en HTML/React
3. Validar con usuario (tú) antes de implementar todo

¿Quieres que empecemos con wireframes de las pantallas principales usando este sistema?
