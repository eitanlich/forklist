# CLAUDE.md — ForkList

## Descripción del proyecto

ForkList es una app tipo Letterboxd pero para restaurantes. Los usuarios pueden buscar restaurantes con Google Places, dejar reviews con ratings detallados, y ver su historial de visitas. El objetivo es crear un MVP funcional y visualmente pulido.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript strict |
| Styling | Tailwind CSS v4 |
| UI | shadcn/ui |
| Auth | Clerk (`@clerk/nextjs` v6) |
| Base de datos | Supabase (PostgreSQL) |
| Restaurantes | Google Places API (New) |
| Deploy | Vercel (free tier) |
| Validación | Zod v4 |
| Icons | Lucide React |

---

## Plan por fases

### Fase 1 — MVP (pasos 1-9)

- [x] **Step 1: Setup base** — Next.js 16, TypeScript strict, Tailwind v4, shadcn/ui, ESLint, estructura de carpetas, .gitignore, git init
- [x] **Step 2: Design system** — CSS variables con paleta warm, fuentes (Playfair Display + Inter via next/font), componente Header, componente BottomNav
- [x] **Step 3: Auth con Clerk** — SignIn/SignUp pages, protección de rutas via proxy.ts, UserButton en Header
- [x] **Step 4: Supabase + webhook** — Cliente anon (server.ts), cliente service role (admin.ts), tipos compartidos (types/index.ts), webhook `/api/webhooks/clerk` que sincroniza usuarios Clerk → Supabase tabla `users`
- [x] **Step 5: Restaurant search** — Autocomplete con Google Places API (New) via API routes proxy server-side. Wizard `/add`: buscar → seleccionar → form
- [x] **Step 6: Review form** — Estrellas 1-5 para 5 categorías, ocasión, comentario, fecha. Server Action valida con Zod y guarda restaurant (upsert) + review
- [x] **Step 7: History page** — Cards con foto, estrellas, sub-ratings, fecha y ocasión. Empty state con CTA
- [ ] **Step 8: Dashboard** — Stats del usuario (total restaurantes, rating promedio, ocasión favorita, top cuisine). Ruta: `/dashboard`
- [ ] **Step 9: Polish** — Loading states, error handling, empty states, SEO básico, metadata, favicon, og:image

### Fase 2 — Enriquecimiento (post-MVP)

**Prioridad alta (feedback del founder):**
- [ ] Links al restaurante desde reviews en historial (Google Maps, website)
- [ ] Filtrar búsqueda por país/ciudad (nombres de restaurantes se repiten mucho)
- [ ] Paginación en resultados de búsqueda
- [ ] Cursor pointer en hover de elementos clickeables (UX básico)

**Features planeadas:**
- [ ] Wishlists: guardar restaurantes para visitar
- [ ] Fotos via Places API
- [ ] Mapa de restaurantes visitados
- [ ] Filtros avanzados en historial (por ciudad, rating, ocasión, fecha)
- [ ] Editar/eliminar reviews

**Métricas del dashboard (repensar):**
- Las métricas actuales (places, rating, occasion, cuisine) no copan 100%
- Ideas: streak de días logueando, new places this month, mapa de ciudades

### Fase 3 — Social (futuro)

- [ ] Perfiles públicos con username
- [ ] Seguir usuarios
- [ ] Feed de amigos (ver qué están visitando)
- [ ] Recomendaciones basadas en la red

---

## Estado actual

**Completados:** Steps 1-9 (MVP completo ✅)
**Próximo paso:** Fase 2 — Links en reviews, filtros por país/ciudad, paginación, cursor hovers

---

## Decisiones técnicas

### Next.js 16 — proxy.ts en lugar de middleware.ts
Next.js 16 renombró el archivo de middleware. El archivo de Clerk va en `src/proxy.ts`, no en `src/middleware.ts`.

### Clerk + Supabase — patrón de autenticación
- En Server Actions: obtener el `userId` con `auth()` de Clerk
- Para operaciones de DB: usar `createAdminClient()` (service role, bypassa RLS)
- No se usa RLS de Supabase en el MVP (se simplifica la lógica)
- `createServerClient()` = anon key (solo para reads públicos si los hubiera)
- `createAdminClient()` = service role (todas las writes del MVP)

### Sin RLS en MVP
Se decidió no implementar Row Level Security de Supabase en el MVP para simplificar. Todas las operaciones del server usan el cliente admin con service role. Esto es seguro mientras las operaciones críticas (insert, update, delete) siempre pasen por Server Actions server-side.

### Google Places API
Se usa "Places API (New)" — la versión moderna de Google. No usar la API legacy. Los campos que se recuperan: name, formatted_address, geometry, photos, types, website, url (google maps).

### Webhook Clerk → Supabase
El webhook en `/api/webhooks/clerk` escucha `user.created` y `user.updated`. Usa svix para verificar la firma. Sincroniza el usuario a la tabla `users` de Supabase con `clerk_id`, `email`, `username`.

---

## Variables de entorno

Archivo: `.env.local` (NUNCA commitear)

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_WEBHOOK_SECRET=          # Obtener del dashboard de Clerk → Webhooks

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # Solo server-side, nunca NEXT_PUBLIC_

# Google Places
GOOGLE_PLACES_API_KEY=         # Solo server-side, nunca NEXT_PUBLIC_
```

---

## Esquema de base de datos

SQL listo para copiar-pegar en Supabase SQL Editor:

```sql
-- Users table (synced from Clerk via webhook)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurants table (populated from Google Places)
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  photo_reference TEXT,
  cuisine_type TEXT,
  website TEXT,
  google_maps_url TEXT,
  instagram TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  rating_overall SMALLINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  rating_food SMALLINT NOT NULL CHECK (rating_food BETWEEN 1 AND 5),
  rating_service SMALLINT NOT NULL CHECK (rating_service BETWEEN 1 AND 5),
  rating_ambiance SMALLINT NOT NULL CHECK (rating_ambiance BETWEEN 1 AND 5),
  rating_price SMALLINT NOT NULL CHECK (rating_price BETWEEN 1 AND 5),
  comment TEXT,
  occasion TEXT CHECK (occasion IN ('date', 'family', 'friends', 'business', 'solo', 'other')),
  visited_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para buscar reviews de un usuario rápido
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);
-- Index para buscar cuántas veces un usuario visitó un restaurante
CREATE INDEX IF NOT EXISTS reviews_user_restaurant_idx ON reviews(user_id, restaurant_id);
```

### Cambios vs plan original
- Se eliminó `UNIQUE(user_id, restaurant_id)` en reviews → reemplazado por un INDEX (un usuario puede dejar múltiples reviews del mismo restaurante)
- `visited_at` tiene `DEFAULT CURRENT_DATE` (no TIMESTAMPTZ, solo fecha)
- `restaurants` tiene campos extra vs plan inicial: `photo_reference`, `cuisine_type`, `website`, `google_maps_url`, `instagram`

---

## Pendientes manuales (requieren acción del usuario)

### 1. Correr SQL en Supabase
Ir al dashboard de Supabase → SQL Editor → pegar y ejecutar el SQL de arriba.

### 2. Configurar Clerk Webhook
1. Ir al dashboard de Clerk → Webhooks
2. Agregar nuevo endpoint: `https://[tu-dominio]/api/webhooks/clerk`
3. Suscribirse a eventos: `user.created`, `user.updated`
4. Copiar el "Signing Secret" y pegarlo en `.env.local` como `CLERK_WEBHOOK_SECRET`

### 3. Habilitar Google Places API
1. Ir a Google Cloud Console → APIs & Services → Library
2. Buscar "Places API (New)" y habilitarla
3. Crear una API Key, copiarla a `.env.local` como `GOOGLE_PLACES_API_KEY`
4. Opcional: restringir la key a la IP del servidor de Vercel o al dominio

---

## Archivos clave

```
src/
├── proxy.ts                          # Clerk middleware (protege rutas)
├── app/
│   ├── (auth)/                       # Rutas de sign-in y sign-up
│   ├── (app)/                        # Rutas protegidas (layout con Header + BottomNav)
│   │   └── layout.tsx
│   ├── api/webhooks/clerk/route.ts   # Webhook Clerk → Supabase
│   ├── globals.css                   # Variables CSS + Tailwind v4
│   └── layout.tsx                    # Root layout con ClerkProvider
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── BottomNav.tsx
│   └── ui/                           # Componentes shadcn/ui
├── lib/
│   ├── utils.ts
│   └── supabase/
│       ├── server.ts                 # Cliente anon key
│       └── admin.ts                  # Cliente service role
└── types/
    └── index.ts                      # Tipos compartidos (DbUser, Restaurant, Review, etc.)
```

---

## Problemas conocidos / deuda técnica

- `CLERK_WEBHOOK_SECRET` está vacío en `.env.local` — el webhook no funciona hasta completar la configuración manual
- Sin RLS en Supabase: cualquier Server Action con admin client puede leer/escribir cualquier dato. Aceptable para MVP, revisar antes de escalar
- Google Places API key aún no configurada — Step 5 depende de esto
