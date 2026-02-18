# PRD: Trading Spot (MVP)

## 📋 Información del Producto

**Nombre del Producto:** Trading Spot
**Versión:** MVP v1.0
**Tipo:** Web Application
**Idiomas:** Español e Inglés
**Target:** Uso personal inicial → Validación con traders en fase 2

---

## 🎯 Problema

Como trader semanal, necesito analizar 5-8 instrumentos financieros cada semana, pero:
- Revisar noticias, estados financieros y análisis consume 4-6 horas
- No tengo un sistema para evaluar la confianza de mis decisiones
- No trackeo sistemáticamente qué funcionó y qué no
- Pierdo oportunidades por falta de tiempo para investigar

**Consecuencia:** Decisiones apresuradas, riesgo innecesario, rentabilidad inconsistente.

---

## 💡 Solución

Una webapp que cada semana:
1. Analiza automáticamente los instrumentos que elijo seguir
2. Agrega noticias y datos financieros relevantes
3. Genera recomendaciones (subir/bajar) con nivel de confianza
4. Me permite revisar todo en ~1 hora el lunes en la mañana
5. Trackea mis resultados reales vs predicciones del sistema

---

## 👤 Usuario Objetivo (MVP)

**Usuario Primario:** Yo mismo
- Opera en mercado US (acciones + ETFs)
- Estrategia: compra lunes AM, vende viernes PM
- Objetivo: 1-2% ganancia semanal
- Selecciona 5-8 instrumentos por semana
- Prefiere tech, health, ETFs, commodities

**Usuario Futuro (post-MVP):**
- Traders retail con estrategia similar
- Operan semanalmente o con horizonte corto
- Buscan reducir tiempo de research
- Dispuestos a pagar $10-30/mes

---

## 🎬 Casos de Uso Principales

### **CU0: Registro y Autenticación**
**Como** nuevo usuario  
**Quiero** crear una cuenta y verificar mi email  
**Para** acceder a la plataforma de forma segura

**Flujo de Registro:**
1. Voy a `/signup`
2. Ingreso email y password (min 8 caracteres)
3. Sistema envía email de verificación
4. Click en link del email → cuenta activada
5. Redirect a `/onboarding` (configuración inicial)
6. Completo perfil básico:
   - Nombre (opcional)
   - Idioma preferido (ES/EN)
   - Sectores de interés (para sugerencias)
   - Meta de ganancia semanal (default 1.5%)
7. Redirect a `/dashboard`

**Flujo de Login:**
1. Voy a `/login`
2. Ingreso email y password
3. Si email no verificado → aviso + botón "Reenviar verificación"
4. Si verificado → acceso a dashboard

**Flujo de Recuperación:**
1. "¿Olvidaste tu contraseña?"
2. Ingreso email
3. Recibo link para reset
4. Creo nueva password

**Criterios de Éxito:**
- Registro toma < 2 minutos
- Email de verificación llega en < 30 segundos
- Sistema previene duplicados (email ya registrado)
- Password debe ser segura (validación)

---

### **CU1: Configurar Watchlist**
**Como** usuario  
**Quiero** buscar y agregar instrumentos a mi watchlist  
**Para** que el sistema los analice semanalmente

**Flujo:**
1. Voy a "Instrumentos"
2. Busco ticker (ej: "AAPL") o nombre ("Apple")
3. Veo info básica (precio, sector, descripción)
4. Click "Seguir" → se agrega a mi watchlist
5. Puedo categorizar: Tech, Health, ETF, Commodities, Otros
6. Límite: 20 instrumentos máximo en watchlist

**Criterios de Éxito:**
- Puedo agregar un instrumento en < 30 segundos
- El sistema valida que el ticker existe
- Veo mi watchlist completa con precios actuales

---

### **CU2: Revisar Análisis Semanal**
**Como** usuario  
**Quiero** ver el reporte semanal de mis instrumentos  
**Para** decidir qué comprar el lunes

**Notificación:**
- Cada domingo 8PM (hora del usuario), recibo email:
  - Subject: "📊 Tu Reporte Semanal está Listo - Trading Intel"
  - Preview de instrumentos destacados (los más confiables)
  - CTA: "Ver Reporte Completo" → lleva a dashboard

**Flujo:**
1. Click en email o entro directo al dashboard
2. Banner: "🆕 Reporte de la semana del [fecha] disponible"
3. Veo tabla/grid con todos mis instrumentos:

**Vista de Tabla:**
| Ticker | Precio | Cambio 7d | Tendencia | Confianza | P&L Acum | Acción |
|--------|--------|-----------|-----------|-----------|----------|--------|
| AAPL   | $175.50| +2.3%     | ↗️ Alza  | 🟢 75%   | +$450    | Ver    |
| TSLA   | $242.10| -1.2%     | ↘️ Baja | 🟡 55%   | -$120    | Ver    |

**Por cada uno veo:**
- Ticker y nombre
- Precio actual vs hace 1 semana (% cambio)
- **Tendencia predicha:** ↗️ Alza / ↘️ Baja / → Lateral
- **Nivel de confianza:** 🟢 Alta (>70%) / 🟡 Media (40-70%) / 🔴 Baja (<40%)
- P&L acumulado en ese instrumento (histórico)
- 2-3 highlights (bullets de por qué esa predicción)

4. Click en instrumento → veo reporte completo:
   - Resumen ejecutivo (2-3 párrafos)
   - 5-7 noticias relevantes de la semana con fuentes
   - Datos financieros clave (si hubo earnings)
   - Razonamiento detallado del análisis
5. Marco los que decido comprar

**Criterios de Éxito:**
- Email llega puntual cada domingo
- Puedo revisar 8 instrumentos en < 1 hora
- Entiendo claramente por qué se recomienda cada uno
- Puedo validar las fuentes del análisis
- Veo mi histórico con ese instrumento

---

### **CU3: Registrar Operaciones (con Costos de Trading)**
**Como** usuario  
**Quiero** registrar mis compras y ventas reales incluyendo comisiones  
**Para** calcular rentabilidad neta real

**Flujo Compra (Lunes):**
1. Desde dashboard, click en instrumento
2. Botón "Registrar Compra"
3. Modal/Form con:
   - Ticker (pre-filled)
   - Precio de entrada (USD)
   - Cantidad de acciones
   - **Comisión pagada** (USD) - ej: $1.50
   - Fecha/hora (default: ahora)
4. Sistema calcula:
   - Inversión bruta: precio × cantidad
   - Costo total: inversión + comisión
5. Guarda operación como "abierta"

**Flujo Venta (Viernes):**
1. Veo sección "Posiciones Abiertas" en dashboard
2. Click en posición → Botón "Registrar Venta"
3. Modal/Form con:
   - Precio de salida (USD)
   - **Comisión pagada** (USD) - ej: $1.50
   - Fecha/hora (default: ahora)
4. Sistema calcula:
   - Ganancia bruta: (precio_salida - precio_entrada) × cantidad
   - **Comisiones totales:** comisión_compra + comisión_venta
   - **Ganancia neta:** ganancia_bruta - comisiones_totales
   - **ROI neto:** (ganancia_neta / costo_total) × 100
5. Compara con predicción:
   - Si precio subió y predijo "up" → ✅ Acierto
   - Si precio bajó y predijo "down" → ✅ Acierto
   - Cualquier otra combinación → ❌ Fallo
6. Operación se marca como "cerrada"

**Vista de Resumen:**
```
📊 AAPL - Operación Cerrada
Compra: $170.00 × 10 = $1,700.00
Comisión compra: $1.50
Venta: $175.50 × 10 = $1,755.00
Comisión venta: $1.50
────────────────────────────
Ganancia bruta: $55.00
Comisiones totales: -$3.00
Ganancia neta: $52.00
ROI neto: +3.06%
────────────────────────────
Predicción: ↗️ Alza (🟢 75%)
Resultado: ✅ CORRECTO
```

**Criterios de Éxito:**
- Registro una operación completa en < 2 minutos
- Veo claramente el impacto de comisiones en mi rentabilidad
- Sistema trackea accuracy de predicciones
- Puedo ver comisiones acumuladas por semana/mes

---

### **CU4: Ver Métricas de Performance (con Drill-Down)**
**Como** usuario  
**Quiero** ver mi rendimiento histórico con drill-down por instrumento  
**Para** mejorar mi estrategia y entender qué funciona

**Dashboard Principal - Vista Consolidada:**

**Card 1: Performance General**
```
📈 Rentabilidad Total
+$1,248.50 (+12.8%)

Esta semana: +$320.00 (+2.1%)
Mejor semana: +$450.00 (+3.2%)
Peor semana: -$80.00 (-0.5%)
```

**Card 2: Costos de Trading**
```
💸 Comisiones Acumuladas
$156.00 total

Esta semana: $12.00
Promedio/trade: $3.00
% de ganancia: 12.5%
```

**Card 3: Win Rate**
```
✅ Operaciones Exitosas
28/35 (80%)

Esta semana: 5/6 (83%)
Racha actual: 3 wins
```

**Card 4: Accuracy del Agente**
```
🎯 Predicciones Correctas
68% overall

🟢 Alta confianza: 82% (18/22)
🟡 Media confianza: 54% (7/13)
🔴 Baja confianza: 0% (0/0)
```

**Gráfica de Rentabilidad Semanal:**
```
Bar chart mostrando:
- Ganancia bruta (verde)
- Comisiones (rojo)
- Ganancia neta (verde oscuro)
Por semana, últimas 12 semanas
```

**Tabla: Performance por Instrumento**
| Ticker | Operaciones | Win Rate | P&L Neto | Comisiones | ROI | Mejor Trade | Accuracy Predicción |
|--------|-------------|----------|----------|------------|-----|-------------|---------------------|
| AAPL   | 8           | 87%      | +$420    | $24        | +4.2% | +$85 (4.2%) | ✅ 7/8 (87%)      |
| TSLA   | 6           | 67%      | +$180    | $18        | +1.8% | +$120 (6%)  | ⚠️ 4/6 (67%)      |
| NVDA   | 5           | 100%     | +$650    | $15        | +6.5% | +$220 (11%) | ✅ 5/5 (100%)     |

**Click en cualquier fila → Drill-Down**

---

**Vista Drill-Down: AAPL (Ejemplo)**

**Header:**
```
🍎 Apple Inc. (AAPL)
Precio actual: $175.50 (+2.3% hoy)

Performance Total:
8 operaciones | 7 wins, 1 loss | $420 ganancia neta
```

**Tabs:**

**Tab 1: Historial de Operaciones**
```
Tabla detallada:
| Semana      | Entrada | Salida | Shares | P&L Bruto | Comisiones | P&L Neto | ROI | Predicción | Resultado |
|-------------|---------|--------|--------|-----------|------------|----------|-----|------------|-----------|
| 12-18 Feb   | $170.00 | $175.50| 10     | +$55.00   | -$3.00     | +$52.00  | +3.06% | ↗️ 🟢 75% | ✅ Win |
| 5-9 Feb     | $168.50 | $169.00| 12     | +$6.00    | -$3.00     | +$3.00   | +0.15% | ↗️ 🟡 55% | ✅ Win |
| 29 Ene-2 Feb| $172.00 | $168.50| 10     | -$35.00   | -$3.00     | -$38.00  | -2.21% | ↗️ 🟢 70% | ❌ Loss|
...
```

**Tab 2: Estadísticas**
```
📊 Estadísticas AAPL
────────────────────
Win Rate: 87.5% (7/8)
Average Win: +$68.57
Average Loss: -$38.00
Profit Factor: 12.6
Sharpe Ratio: 2.1

Comisiones totales: $24.00
Comisiones promedio: $3.00/trade
% de ganancias en comisiones: 5.7%

Mejor operación: +$85 (+4.2%) - Semana 22-26 Ene
Peor operación: -$38 (-2.21%) - Semana 29 Ene-2 Feb

Accuracy de predicciones: 87.5%
- Cuando confianza 🟢: 83% accuracy (5/6)
- Cuando confianza 🟡: 100% accuracy (2/2)
```

**Tab 3: Insights**
```
🔍 Lo que funciona con AAPL:
- Predicciones 🟢 han sido muy confiables (5/6 aciertos)
- Mejor performance en semanas post-earnings
- Tus mejores trades fueron comprando en dips pequeños

⚠️ Áreas de mejora:
- La única pérdida fue ignorando una predicción 🟡
- Considera reducir position size cuando confianza < 70%
```

**Tab 4: Comparación con Mercado**
```
AAPL vs S&P 500 (últimas 8 semanas):
Tu ROI: +4.2%
S&P 500: +2.1%
Alpha: +2.1% 🎉
```

---

**Insights Globales (en Dashboard Principal):**

```
💡 Insights Personalizados

✅ Tus mejores sectores:
   1. Tech (78% win rate, +$820)
   2. ETFs (72% win rate, +$340)

⚠️ Cuidado con:
   - Commodities (50% win rate, -$40)
   - Stocks con baja confianza (40% accuracy)

📈 Recomendaciones:
   - Sigue priorizando predicciones 🟢 (82% accuracy)
   - Considera reducir trades con 🟡 (<70%)
   - Tus mejores semanas tienen 6-7 instrumentos
   - Comisiones representan 12% de tus ganancias
     → Considera optimizar # de trades o cambiar broker
```

**Criterios de Éxito:**
- Veo tendencias claras en dashboard principal en < 30 segundos
- Drill-down me da contexto completo de cada instrumento
- Puedo identificar qué tipo de predicciones son más confiables
- Tracking de costos me ayuda a optimizar comisiones
- Los datos me ayudan a ajustar mi estrategia

---

### **CU5: Recibir Sugerencias de Instrumentos (Nice-to-Have para MVP)**
**Como** usuario  
**Quiero** que el sistema me sugiera instrumentos similares a los que sigo  
**Para** descubrir oportunidades

**Flujo:**
1. Veo sección "Sugerencias" en dashboard
2. Sistema muestra 3-5 instrumentos basados en:
   - Mismo sector que los que ya sigo
   - Correlación de movimiento
   - Tendencia positiva reciente
3. Click "Seguir" para agregar a watchlist

**Criterios de Éxito:**
- Sugerencias son relevantes (mismo sector/tipo)
- Puedo agregar directamente desde sugerencias

---

## 🚫 Fuera de Scope (MVP)

**NO haremos en esta versión:**
- ❌ Integración directa con brokers (API de TD Ameritrade, etc.)
- ❌ Trading automatizado o ejecución de órdenes
- ❌ Análisis técnico avanzado (RSI, MACD, Bollinger Bands)
- ❌ Backtesting con datos históricos
- ❌ Alertas en tiempo real (push notifications)
- ❌ Social features (compartir análisis, seguir otros usuarios)
- ❌ Catálogo completo de todos los stocks (solo búsqueda)
- ❌ Múltiples estrategias (solo compra lunes, vende viernes)
- ❌ Portafolio tracking completo (solo operaciones semanales)
- ❌ Mercados fuera de US

---

## 🏗️ Arquitectura Técnica

### **Stack:**
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes + Server Actions
- **Base de Datos:** Supabase (PostgreSQL + Auth + RLS)
- **AI/Análisis:** Claude API (Anthropic) para generar análisis
- **APIs Externas:**
  - **Datos de mercado:** Yahoo Finance API (gratis) o Alpha Vantage
  - **Noticias:** NewsAPI (gratis con límites) + Finnhub (básico $0-60/mes)
- **Deploy:** Vercel
- **Idiomas:** i18next para ES/EN

### **Flujo de Datos:**

```
┌─────────────────┐
│  Usuario ve     │
│  Dashboard      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Sistema verifica:                  │
│  ¿Hay análisis reciente (<3 días)?  │
└────────┬────────────────────────────┘
         │
    ┌────┴────┐
    │         │
   SÍ        NO
    │         │
    │         ▼
    │    ┌──────────────────────────┐
    │    │ Job Semanal (Domingos)   │
    │    │ 1. Fetch precios (Yahoo) │
    │    │ 2. Fetch noticias (News) │
    │    │ 3. Analizar con Claude   │
    │    │ 4. Guardar en Supabase   │
    │    └──────────────────────────┘
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│  Mostrar datos  │
│  desde cache    │
└─────────────────┘
```

### **Schema de Base de Datos:**

```sql
-- Usuarios (manejado por Supabase Auth + profile extendido)
users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  email_verified boolean DEFAULT false,
  created_at timestamp DEFAULT now()
)

-- Perfil extendido de usuario
user_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  full_name text,
  language text DEFAULT 'es', -- 'es' o 'en'
  preferred_sectors jsonb, -- ['tech', 'health', 'etf', 'commodities']
  weekly_goal_pct decimal DEFAULT 1.5,
  timezone text DEFAULT 'America/Santiago',
  
  -- Preferencias de notificaciones
  email_notifications boolean DEFAULT true,
  weekly_report_time time DEFAULT '20:00:00', -- 8PM domingo
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
)

-- Instrumentos seguidos
watchlist (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  ticker text NOT NULL,
  name text,
  sector text, -- 'tech', 'health', 'etf', 'commodities', 'other'
  added_at timestamp DEFAULT now(),
  UNIQUE(user_id, ticker)
)

-- Análisis semanales generados
weekly_analyses (
  id uuid PRIMARY KEY,
  ticker text NOT NULL,
  week_start date NOT NULL, -- Lunes de esa semana
  
  -- Datos de mercado
  price_current decimal,
  price_week_ago decimal,
  price_change_pct decimal,
  
  -- Predicción
  predicted_direction text, -- 'up', 'down', 'sideways'
  confidence_score integer, -- 0-100
  confidence_level text, -- 'high', 'medium', 'low'
  
  -- Análisis
  summary_es text, -- Resumen en español
  summary_en text, -- Resumen en inglés
  highlights jsonb, -- Array de bullets
  reasoning_es text, -- Análisis completo español
  reasoning_en text, -- Análisis completo inglés
  news_sources jsonb, -- Array de noticias con URLs
  
  generated_at timestamp DEFAULT now(),
  UNIQUE(ticker, week_start)
)

-- Operaciones del usuario (con tracking de costos)
trades (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  ticker text NOT NULL,
  analysis_id uuid REFERENCES weekly_analyses(id),
  
  -- Datos de compra
  buy_date timestamp,
  buy_price decimal,
  shares integer,
  buy_commission decimal DEFAULT 0, -- 🆕 Comisión de compra
  
  -- Datos de venta
  sell_date timestamp,
  sell_price decimal,
  sell_commission decimal DEFAULT 0, -- 🆕 Comisión de venta
  
  -- Cálculos automáticos
  investment_gross decimal, -- buy_price * shares
  investment_total decimal, -- investment_gross + buy_commission
  revenue_gross decimal, -- sell_price * shares
  revenue_net decimal, -- revenue_gross - sell_commission
  
  -- Resultados
  profit_loss_gross decimal, -- revenue_gross - investment_gross
  total_commissions decimal, -- buy_commission + sell_commission
  profit_loss_net decimal, -- profit_loss_gross - total_commissions
  roi_gross_pct decimal, -- (profit_loss_gross / investment_gross) * 100
  roi_net_pct decimal, -- (profit_loss_net / investment_total) * 100
  
  -- Estado
  status text DEFAULT 'open', -- 'open' o 'closed'
  
  -- Validación de predicción
  predicted_direction text, -- Copiado del análisis
  actual_direction text, -- 'up' o 'down' basado en buy vs sell
  prediction_correct boolean, -- Calculado automáticamente
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
)

-- Notificaciones enviadas (para tracking)
notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  type text, -- 'weekly_report', 'email_verification', 'password_reset'
  
  -- Datos del email
  subject text,
  recipients jsonb, -- Array de emails
  
  -- Contexto
  context jsonb, -- Data específica del tipo de notificación
  
  -- Estado
  status text DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at timestamp,
  error_message text,
  
  created_at timestamp DEFAULT now()
)

-- Historial de generación de reportes (para debugging)
report_generations (
  id uuid PRIMARY KEY,
  week_start date NOT NULL,
  
  -- Stats
  total_instruments integer,
  successful_analyses integer,
  failed_analyses integer,
  
  -- Timing
  started_at timestamp DEFAULT now(),
  completed_at timestamp,
  duration_seconds integer,
  
  -- Costos
  api_calls integer,
  estimated_cost_usd decimal,
  
  -- Errores
  errors jsonb -- Array de errores si los hubo
)

-- Índices para performance
CREATE INDEX idx_trades_user_status ON trades(user_id, status);
CREATE INDEX idx_trades_ticker ON trades(ticker);
CREATE INDEX idx_weekly_analyses_ticker_week ON weekly_analyses(ticker, week_start);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
```

**Triggers para cálculos automáticos:**

```sql
-- Calcular campos automáticos en trades cuando se inserta/actualiza
CREATE OR REPLACE FUNCTION calculate_trade_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Cálculos de inversión
  NEW.investment_gross := NEW.buy_price * NEW.shares;
  NEW.investment_total := NEW.investment_gross + COALESCE(NEW.buy_commission, 0);
  
  -- Si hay venta, calcular todo lo demás
  IF NEW.sell_price IS NOT NULL THEN
    NEW.revenue_gross := NEW.sell_price * NEW.shares;
    NEW.revenue_net := NEW.revenue_gross - COALESCE(NEW.sell_commission, 0);
    
    NEW.profit_loss_gross := NEW.revenue_gross - NEW.investment_gross;
    NEW.total_commissions := COALESCE(NEW.buy_commission, 0) + COALESCE(NEW.sell_commission, 0);
    NEW.profit_loss_net := NEW.profit_loss_gross - NEW.total_commissions;
    
    NEW.roi_gross_pct := (NEW.profit_loss_gross / NEW.investment_gross) * 100;
    NEW.roi_net_pct := (NEW.profit_loss_net / NEW.investment_total) * 100;
    
    -- Determinar dirección actual
    IF NEW.sell_price > NEW.buy_price THEN
      NEW.actual_direction := 'up';
    ELSIF NEW.sell_price < NEW.buy_price THEN
      NEW.actual_direction := 'down';
    ELSE
      NEW.actual_direction := 'sideways';
    END IF;
    
    -- Validar predicción
    IF NEW.predicted_direction IS NOT NULL THEN
      NEW.prediction_correct := (NEW.predicted_direction = NEW.actual_direction);
    END IF;
    
    NEW.status := 'closed';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_trade_metrics
  BEFORE INSERT OR UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION calculate_trade_metrics();
```

---

## 🎨 Diseño de UI (High-Level)

### **Páginas Principales:**

1. **Landing Pública (`/`)**
   - Hero con value prop
   - Demo screenshot
   - Pricing (futuro)
   - CTA: Sign Up

2. **Auth (`/signup`, `/login`, `/verify-email`, `/reset-password`)**
   - Formularios limpios y modernos
   - Validaciones en tiempo real
   - Social auth (opcional para MVP)

3. **Onboarding (`/onboarding`)** - Solo primera vez
   - Step 1: Bienvenida + explicación rápida
   - Step 2: Preferencias (idioma, sectores)
   - Step 3: Agregar primeros 3-5 instrumentos
   - Step 4: Tour interactivo del dashboard

4. **Dashboard (`/dashboard`)**
   - Header: Logo, Watchlist, Métricas, Settings, User Menu
   - Banner de reporte nuevo (si hay)
   - Grid/Tabla de instrumentos con predicciones
   - Sidebar: 
     - Resumen de semana
     - Posiciones abiertas
     - Sugerencias
     - Quick actions

5. **Detalle de Instrumento (`/instrument/[ticker]`)**
   - Header con ticker, precio, cambio, botón seguir/dejar de seguir
   - Tabs: 
     - Análisis Semanal
     - Historial de Operaciones (drill-down)
     - Estadísticas
     - Noticias

6. **Mis Operaciones (`/trades`)**
   - Tabs: Abiertas | Cerradas | Todas
   - Filtros: Semana, Ticker, Win/Loss
   - Tabla con drill-down
   - Botones: Registrar Compra | Registrar Venta

7. **Métricas (`/metrics`)**
   - Overview cards (performance, costos, win rate, accuracy)
   - Charts de rentabilidad
   - Tabla de performance por instrumento (con drill-down)
   - Insights personalizados

8. **Watchlist (`/watchlist`)**
   - Lista de instrumentos seguidos
   - Búsqueda para agregar nuevos
   - Categorización por sector
   - Ordenar por: Confianza, Cambio%, P&L

9. **Settings (`/settings`)**
   - Tabs:
     - Perfil (nombre, email, idioma)
     - Preferencias (sectores, meta de ganancia)
     - Notificaciones (email semanal, hora)
     - Comisiones (broker default, guardar comisión típica)
     - Cuenta (cambiar password, borrar cuenta)

### **Componentes Clave:**

```typescript
// Tarjeta de Instrumento (Dashboard)
<InstrumentCard
  ticker="AAPL"
  name="Apple Inc."
  currentPrice={175.50}
  weekChange={2.3}
  prediction="up"
  confidence="high"
  highlights={["Strong earnings", "New product launch"]}
/>

// Indicador de Confianza
<ConfidenceIndicator
  level="high" // high | medium | low
  score={75} // 0-100
/>

// Registro de Operación
<TradeForm
  ticker="AAPL"
  action="buy" // buy | sell
  onSubmit={(data) => ...}
/>
```

---

## 🤖 Lógica del Agente de Análisis

### **Input al Agente Claude:**

```typescript
const prompt = `
Eres un analista financiero experto. Analiza ${ticker} para la semana del ${weekStart}.

DATOS DISPONIBLES:
- Precio actual: $${currentPrice}
- Precio hace 1 semana: $${priceWeekAgo}
- Cambio: ${changePercent}%

NOTICIAS RECIENTES:
${newsArticles.map(n => `- [${n.date}] ${n.title} (${n.source})`).join('\n')}

ESTADOS FINANCIEROS (si aplica):
${earningsData || 'No hubo earnings esta semana'}

TAREA:
1. Predice si el precio subirá, bajará o se mantendrá la próxima semana
2. Asigna nivel de confianza (0-100)
3. Genera resumen ejecutivo (2-3 párrafos)
4. Lista 3-5 highlights (bullets) de los factores clave
5. Explica tu razonamiento completo

FORMATO DE RESPUESTA:
{
  "prediction": "up|down|sideways",
  "confidence": 75,
  "summary": "...",
  "highlights": ["...", "..."],
  "reasoning": "..."
}

Importante: 
- Sé conservador con la confianza (alta >70% solo si hay señales muy claras)
- Menciona riesgos y factores en contra
- Cita las fuentes específicas que usaste
`;
```

### **Criterios de Confianza:**

- **🟢 Alta (>70%):** 
  - Múltiples señales positivas/negativas alineadas
  - Catalizadores claros (earnings beat, nuevo producto, regulación)
  - Tendencia de sector coherente
  
- **🟡 Media (40-70%):**
  - Señales mixtas
  - Algunas noticias positivas, otras neutrales
  - Incertidumbre moderada
  
- **🔴 Baja (<40%):**
  - Alta incertidumbre
  - Falta de información relevante
  - Señales contradictorias

---

## 📊 Métricas de Éxito (MVP)

### **Métricas de Uso (Semana 1-4):**
- ✅ Uso consistente: Reviso el dashboard al menos 3 de 4 lunes
- ✅ Watchlist estable: Mantengo 5-8 instrumentos activos
- ✅ Registro operaciones: 80%+ de mis trades están registrados

### **Métricas de Producto:**
- ✅ Tiempo de research: De 4-6h a <1h por semana
- ✅ Accuracy del agente: >50% predicciones correctas (baseline)
- ✅ Accuracy 🟢: >65% cuando confianza es alta
- ✅ Rentabilidad: Mantengo 1-2% semanal o mejor

### **Criterios para Fase 2 (Validación con Otros):**
- ✅ 4 semanas consecutivas de uso exitoso
- ✅ Accuracy del agente >60% overall
- ✅ Satisfacción personal: "No volvería a mi método anterior"
- ✅ ROI claro: El tiempo ahorrado justifica mantener el sistema

---

## 🗓️ Plan de Implementación

### **Semana 1: Setup + Core Features**
**Días 1-2:**
- ✅ Setup proyecto (Next.js + Supabase)
- ✅ Autenticación (solo email/password por ahora)
- ✅ Schema de DB + migrations
- ✅ Integración Yahoo Finance API

**Días 3-4:**
- ✅ Watchlist CRUD (agregar, listar, eliminar instrumentos)
- ✅ Búsqueda de tickers
- ✅ Dashboard básico (lista de instrumentos)

**Días 5-7:**
- ✅ Job de análisis semanal
- ✅ Integración Claude API
- ✅ Fetch de noticias (NewsAPI)
- ✅ Vista de detalle de instrumento

### **Semana 2: Operaciones + Métricas**
**Días 1-3:**
- ✅ Registro de compras
- ✅ Registro de ventas
- ✅ Cálculo automático de P&L
- ✅ Validación de predicciones

**Días 4-5:**
- ✅ Dashboard de métricas
- ✅ Charts básicos (recharts)
- ✅ Cálculo de accuracy

**Días 6-7:**
- ✅ i18n (ES/EN)
- ✅ Polish UI
- ✅ Testing manual completo
- ✅ Deploy a Vercel

### **Semana 3-6: Uso Real + Iteración**
- Uso el sistema cada semana
- Recopilo feedback personal
- Ajusto prompts del agente
- Mejoro UX basado en fricción real

---

## 💰 Estimación de Costos (Mensual)

**APIs:**
- Yahoo Finance: $0 (gratis)
- NewsAPI: $0 (plan gratuito, 100 requests/día)
- Claude API: ~$5-10 (8 instrumentos × 4 semanas × $0.01-0.05/análisis)

**Infraestructura:**
- Supabase: $0 (Free tier suficiente para MVP)
- Vercel: $0 (Hobby plan)

**Total MVP: $5-10/mes** ✅

**Si escalo a 100 usuarios:**
- Claude API: ~$200-400/mes
- Supabase: $25/mes (Pro)
- NewsAPI: $449/mes (Business) o alternativa
- Total: ~$700-900/mes → $7-9/usuario

---

## 🚀 Visión Post-MVP

**Fase 2: Validación (3 meses después de MVP):**
- Landing page con waitlist
- Beta con 10-20 usuarios invitados
- A/B test de pricing ($15 vs $25/mes)
- Métricas de engagement y retención

**Fase 3: Producto Completo (6-12 meses):**
- Análisis técnico (indicadores)
- Backtesting
- Multiple estrategias
- Mobile app
- Integración con brokers
- Community features

**Monetización potencial:**
- Freemium: 3 instrumentos gratis, ilimitados en plan Pro
- Pro: $20-30/mes
- Premium: $50/mes con análisis diario + más features

---

## ❓ Riesgos y Mitigaciones

**Riesgo 1: Accuracy del agente es <50%**
- Mitigación: Iterar en prompts, agregar más fuentes de datos, ser más conservador en confianza

**Riesgo 2: Costos de API escalan mucho**
- Mitigación: Limitar análisis a demanda, cachear agresivamente, explorar APIs más baratas

**Riesgo 3: Datos gratis son insuficientes/inexactos**
- Mitigación: Empezar gratis, migrar a Finnhub ($60) si vemos valor claro

**Riesgo 4: No ahorro tiempo realmente**
- Mitigación: Medir tiempo antes/después, iterar en UX para hacer review más rápido

**Riesgo 5: Regulaciones sobre consejos financieros**
- Mitigación: Disclaimer claro ("no es consejo financiero"), solo uso personal en MVP

---

## ✅ Criterios de Aceptación (MVP Completo)

El MVP está listo cuando:

1. ✅ Puedo registrarme y verificar mi email en <3 minutos
2. ✅ Completo onboarding y agrego mis primeros instrumentos
3. ✅ Puedo agregar 8 instrumentos a mi watchlist en <5 minutos
4. ✅ Cada domingo 8PM recibo email con CTA al reporte semanal
5. ✅ Veo análisis fresco de todos mis instrumentos con predicción + confianza
6. ✅ Cada análisis tiene razonamiento claro y fuentes verificables
7. ✅ Puedo registrar compra con precio + shares + comisión en <2 min
8. ✅ Puedo registrar venta y ver P&L neto (después de comisiones)
9. ✅ Dashboard me muestra: 
   - Rentabilidad total y semanal
   - Comisiones acumuladas
   - Win rate y accuracy del agente
10. ✅ Puedo hacer drill-down en cualquier instrumento y ver historial completo
11. ✅ Sistema calcula automáticamente si predicciones fueron correctas
12. ✅ Todo funciona en ES e EN (switch en settings)
13. ✅ Está deployed y accesible desde cualquier dispositivo
14. ✅ He completado 2 ciclos completos:
    - Domingo: recibo email
    - Lunes: reviso y registro compras
    - Viernes: registro ventas
    - Reviso métricas y aprendo
15. ✅ Puedo exportar mis datos (CSV/Excel) si quiero

---

## 📝 Notas Finales

**Filosofía del MVP:**
- Hacerlo simple pero útil
- Optimizar para mi flujo de trabajo real
- No obsesionarse con perfección, iterar rápido
- Medir TODO (tiempo, accuracy, rentabilidad)

**Pregunta clave a responder:**
> "¿Este sistema me hace tomar mejores decisiones más rápido?"

Si la respuesta es SÍ después de 4 semanas → construir Fase 2.
Si la respuesta es NO → pivotar o abandonar.

**Siguiente paso:** Wireframes de pantallas principales + comenzar desarrollo.
