# ForkList Backlog

> Última actualización: 2026-03-09
> Product Owner: Ori 🤖

## Leyenda
- 🔥 Valor alto
- 💪 Esfuerzo
- 🧪 Complejidad de testing

---

## Completado ✅

### Fase 1 - MVP
- [x] Auth con Clerk
- [x] Base de datos Supabase
- [x] Integración Google Places API
- [x] Review wizard (búsqueda + ratings + submit)
- [x] Historial de reviews
- [x] Dashboard con stats
- [x] Favicon y SEO/OpenGraph
- [x] UI premium (Playfair Display + DM Sans)
- [x] Loading skeletons
- [x] Error handling

### Fase 2 - Core Features
- [x] Filtro de ubicación (auto-detect + selector de país)
- [x] Búsqueda de cualquier país (100+ países)
- [x] i18n completo (EN/ES)
- [x] Editar/eliminar reviews
- [x] PWA (Add to Home Screen)
- [x] Listas/Wishlists
- [x] Landing page
- [x] Meal type (tipo de comida)
- [x] Share review

### Fase 3 - Social Core
- [x] Perfiles públicos (`/u/username`)
- [x] Follow/Unfollow system
- [x] Feed de reviews (home)
- [x] Explore (buscar usuarios)
- [x] Profile stats con temporalidad (mes/año/todo)
- [x] List/Grid view en perfil
- [x] Página de review (`/review/[id]`)
- [x] Share reviews
- [x] Likes system
- [x] Followers/Following pages
- [x] Desktop navigation
- [x] Profile settings (edit bio, avatar, delete account)

### Fase 4 - Private Profiles & Notifications
- [x] Follow a usuario privado → status pending
- [x] Botón muestra "Requested" con reloj
- [x] Accept/Reject follow requests
- [x] Remove follower
- [x] Cancel pending request
- [x] Búsqueda muestra usuarios privados con candado
- [x] Página /notifications con tabs (Activity / Requests)
- [x] Badge de notificaciones en tiempo real
- [x] Auto-aprobar pending requests al cambiar a público

---

## Pendiente

### 🔴 FASE 6: Retención & Onboarding (ACTUAL)
*Sin esto, los usuarios nuevos no entienden el valor y se van*

| Feature | Valor | Esfuerzo | Test | Benchmark | Estado |
|---------|-------|----------|------|-----------|--------|
| Onboarding flow | 🔥🔥🔥 | 3-4 hs | Media | Letterboxd, IG | |
| Empty states mejorados | 🔥🔥 | 1-2 hs | Baja | Todos | |
| Sugerencias "a quién seguir" | 🔥🔥🔥 | 2-3 hs | Media | Twitter, IG | |

**Onboarding flow:**
- Primera vez: wizard que explique qué es ForkList
- Paso 1: "Logueá tu primer restaurante" (CTA a /add)
- Paso 2: "Seguí gente" (usuarios activos/populares)
- Paso 3: "Completá tu perfil" (username, bio, avatar)
- Referencia: Letterboxd te muestra películas populares para empezar

**Empty states mejorados:**
- Feed vacío → "Seguí gente para ver sus reviews" + sugerencias
- Historial vacío → "Logueá tu primera visita" con ilustración
- Referencia: Strava - cada empty state tiene CTA claro

**Sugerencias "a quién seguir":**
- En /explore: "Personas que quizás conozcas"
- En feed vacío: usuarios populares
- Algoritmo: ordenar por review_count o follower_count DESC
- Referencia: Twitter lo pone en todos lados

---

### 🟡 FASE 7: Engagement & Interacción
*Aumenta tiempo en app y razones para volver*

| Feature | Valor | Esfuerzo | Test | Benchmark |
|---------|-------|----------|------|-----------|
| Comentarios en reviews | 🔥🔥🔥 | 4-5 hs | Alta | Letterboxd, IG |
| Menciones (@usuario) | 🔥🔥 | 2-3 hs | Media | Twitter, IG |
| Bookmark/Guardar reviews | 🔥🔥 | 2 hs | Baja | Twitter |
| Share mejorado (deep links) | 🔥 | 2 hs | Media | Todos |

**Comentarios:**
- Genera conversación y razones para volver
- Necesita: notificaciones de replies, moderación básica
- Referencia: Letterboxd - comentarios lineales, sin threads

**Menciones:**
- @usuario en comentarios y reviews
- Genera notificación al mencionado

**Bookmark:**
- Guardar reviews para después (quiero ir a ese lugar)
- Diferente de listas - más personal/rápido
- Referencia: Twitter bookmarks son privados y rápidos

---

### 🟡 FASE 8: Discovery & Contenido
*Ayuda a encontrar contenido relevante*

| Feature | Valor | Esfuerzo | Test | Benchmark |
|---------|-------|----------|------|-----------|
| Filtros en historial | 🔥🔥 | 2-3 hs | Baja | Letterboxd |
| Feed mejorado (orden, filtros) | 🔥🔥 | 3-4 hs | Media | Twitter |
| Trending/Popular | 🔥🔥 | 2-3 hs | Baja | Twitter, Letterboxd |
| Búsqueda de restaurantes en reviews | 🔥 | 2 hs | Baja | Letterboxd |

**Filtros en historial:**
- Por rating, fecha, ciudad/país, tipo de comida
- Referencia: Letterboxd filtra por década, género, rating

**Feed mejorado:**
- Toggle cronológico vs "mejores" (por likes)
- Filtrar: solo fotos, solo gente que sigo
- Referencia: Twitter For You / Following

**Trending:**
- "Restaurantes populares esta semana"
- "Reviews más likeadas"
- Referencia: Letterboxd "Popular this week"

---

### 🟢 FASE 9: Notificaciones Externas
*Trae usuarios de vuelta cuando no están en la app*

| Feature | Valor | Esfuerzo | Test | Benchmark |
|---------|-------|----------|------|-----------|
| Push notifications (web) | 🔥🔥 | 4-5 hs | Alta | Todos |
| Email digest semanal | 🔥 | 3-4 hs | Media | Letterboxd, Strava |
| Email transaccional | 🔥 | 2-3 hs | Media | Todos |

**Push:**
- "X te empezó a seguir", "X le dio like"
- Requiere service worker, permisos
- Alta complejidad de test (browsers, permisos)

**Email digest:**
- Resumen semanal: reviews populares de gente que seguís
- Referencia: Letterboxd manda uno muy bueno los domingos

---

### 🟢 FASE 10: Contenido Rico
*Hace el producto más visual y atractivo*

| Feature | Valor | Esfuerzo | Test | Benchmark |
|---------|-------|----------|------|-----------|
| Fotos en reviews | 🔥🔥🔥 | 5-6 hs | Alta | Instagram, Yelp |
| Múltiples fotos | 🔥 | 2-3 hs | Media | Instagram |
| Mapa de restaurantes | 🔥🔥 | 4-5 hs | Media | Yelp, Google Maps |

**Fotos:**
- Feature más pedido en apps de comida
- Supabase Storage ya configurado (usado en avatars)
- Complejidad: upload, compresión, moderación

**Mapa:**
- Ver todos tus restaurantes visitados en mapa
- Útil para "qué hay cerca que ya probé"

---

### 🟢 FASE 11: Gamification & Stats
*Engagement a largo plazo y compartibilidad*

| Feature | Valor | Esfuerzo | Test | Benchmark |
|---------|-------|----------|------|-----------|
| Year in Review | 🔥🔥🔥 | 6-8 hs | Media | Spotify Wrapped |
| Badges/Achievements | 🔥 | 4-5 hs | Media | Strava, Untappd |
| Streaks | 🔥 | 3-4 hs | Baja | Duolingo |

**Year in Review:**
- Stats anuales compartibles
- "Visitaste X restaurantes, tu favorito fue Y"
- Altamente viral
- Referencia: Spotify Wrapped es el gold standard

**Badges:**
- "Primer review", "10 restaurantes", "Explorador" (5 países)
- Referencia: Untappd lo hace muy bien

---

### 🟢 FASE 12: Monetización (FUTURO)
*Para cuando haya tracción real*

| Feature | Valor | Esfuerzo | Test |
|---------|-------|----------|------|
| Freemium (límites en free) | 🔥🔥 | 5-6 hs | Alta |
| Reservas integradas | 🔥 | 8-10 hs | Muy alta |
| B2B (restaurantes ven stats) | 🔥 | 10+ hs | Muy alta |

---

## Roadmap Sugerido

**Próximas 2 semanas:**
1. ✅ Auto-approve pending requests (DONE)
2. Onboarding flow
3. Empty states mejorados
4. Sugerencias "a quién seguir"

**Siguiente iteración:**
5. Comentarios en reviews
6. Filtros en historial
7. Feed mejorado

**Q2 2026:**
8. Fotos en reviews
9. Push notifications
10. Trending/Popular

**Q4 2026:**
11. Year in Review (para diciembre!)

---

## Notas Técnicas

### Auto-sync de usuarios (2026-03-04)
- Si el webhook de Clerk falla, `getCurrentUserId()` auto-sincroniza
- Previene errores silenciosos en follow/like/etc

### CRÍTICO: Caching en Next.js (2026-03-05)
- Datos dinámicos (likes, follows) → cargar en CLIENTE con useEffect
- `noStore()` y `dynamic = "force-dynamic"` NO son suficientes

### Auto-username desde email (2026-03-05)
- Usuarios sin username: `email.split("@")[0]`

### Notifications system (2026-03-05)
- `last_notifications_seen_at` en tabla users
- Badge cuenta desde ese timestamp
- Evento `notifications-seen` para reset en tiempo real

### Private profiles (2026-03-05)
- `getPublicReview()` verifica owner o follower aprobado
- Modal de confirmación al cambiar privacidad

### Auto-approve pending requests (2026-03-09)
- Privado → público: auto-aprueba todas las pending requests
- Implementado en `updateProfile()` en `src/lib/actions/profile.ts`

### i18n
- Archivos en `src/lib/i18n/`
- `useT()` hook en client components

### iOS Safari
- `min-h-dvh` en vez de `min-h-screen`
- `transform-gpu` en elementos fixed
- `pb-safe` para home indicator
