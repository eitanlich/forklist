# ForkList Backlog

> Última actualización: 2026-03-02

## Leyenda
- 🔴 Alta prioridad
- 🟡 Media prioridad  
- 🟢 Baja prioridad / nice-to-have
- ✅ Completado

---

## Fase 1 - MVP ✅
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

## Fase 2A - Quick Wins ✅
- [x] Cursor pointer en elementos interactivos
- [x] Links a Google Maps y Website en reviews
- [x] Editar reviews
- [x] Eliminar reviews (con confirmación)
- [x] Date picker friendly (shadcn calendar)
- [x] Fix: botones edit/delete visibles en mobile (no hover)
- [x] Fix: calendar no salta de tamaño entre meses

## Fase 2B - Core Features ✅
- [x] Filtro de ubicación (auto-detect + selector de país)
- [x] Búsqueda de cualquier país (100+ países)
- [x] i18n completo (EN/ES)
- [x] Calendar traducido
- [x] Búsqueda con paginación (Enter para resultados completos)

---

## Pendiente

### 🔴 Alta Prioridad

#### Filtros en Historial (EN PROGRESO)
- [ ] Filtrar por rating (1-5 estrellas)
- [ ] Filtrar por ocasión (date, friends, family, etc.)
- [ ] Ordenar por fecha/rating
- [ ] Paginación (no scroll infinito)

#### Compartir Review (NEXT)
- [ ] Botón share en cada review
- [ ] Generar link/imagen para WhatsApp/Instagram
- [ ] Potencial viral

#### Wishlists (NEXT)
- [ ] Nueva tabla en Supabase
- [ ] Agregar restaurante desde búsqueda
- [ ] Página /wishlist
- [ ] Marcar como visitado → crear review

#### PWA (Progressive Web App) ✅
- [x] manifest.json para "Add to Home Screen"
- [x] Iconos para iOS/Android
- [x] Fix middleware para archivos estáticos

### 🟡 Media Prioridad

#### Wishlists
- [ ] Crear tabla `wishlists` en Supabase
- [ ] Agregar restaurante a wishlist desde búsqueda
- [ ] Página /wishlist con lista de pendientes
- [ ] Marcar como "visitado" → crear review
- [ ] Icono de bookmark en cards

#### Mapa de Restaurantes Visitados
- [ ] Integrar Mapbox o Google Maps
- [ ] Mostrar pins de todos los lugares visitados
- [ ] Click en pin → ver review
- [ ] Filtrar por ciudad/país

#### Fotos Propias
- [ ] Upload de fotos del usuario
- [ ] Storage en Supabase Storage o Cloudflare R2
- [ ] Galería en el review
- [ ] Compresión client-side antes de subir

#### Compartir Reviews
- [ ] Botón "Share" en cada review
- [ ] Generar link público al review
- [ ] Preview para WhatsApp/Twitter (OG tags dinámicos)
- [ ] Página pública /review/[id]/public

### 🟢 Baja Prioridad / Nice-to-have

#### Social Features
- [ ] Perfiles públicos de usuarios
- [ ] Seguir amigos
- [ ] Feed de actividad
- [ ] Likes/comentarios en reviews

#### Gamification
- [ ] Badges por cantidad de reviews
- [ ] Streaks (N días seguidos)
- [ ] Stats avanzados (países visitados, cuisines probadas)

#### Mejoras de Dashboard
- [ ] Gráfico de reviews por mes
- [ ] Top 5 restaurantes por rating
- [ ] Mapa pequeño con ubicaciones
- [ ] Stats por año

#### Integraciones
- [ ] Import desde Google Maps Timeline
- [ ] Export a CSV/PDF
- [ ] Integración con TripAdvisor/Yelp (read-only)

---

## Bugs Conocidos

### Resueltos ✅
- [x] Edit review se quedaba en "Saving..." → fix: usar `window.location.href` en vez de `router.push`
- [x] Conteo de restaurantes únicos usaba `cuisine_type` en vez de `restaurant_id`
- [x] Calendar saltaba de tamaño entre meses → fix: `min-height` en contenedor
- [x] Botones edit/delete invisibles en mobile → fix: siempre visibles, hover solo en desktop
- [x] Navbar se movía al scrollear en iOS → fix: `transform-gpu` + `backface-visibility`
- [x] Calendar tenía fila vacía con `fixedWeeks` → fix: usar `min-height` en vez de `fixedWeeks`
- [x] Títulos de Edit/Delete no se traducían → fix: mover a client components

### Pendientes
- [ ] (ninguno reportado)

---

## Notas Técnicas

### i18n
- Archivos en `src/lib/i18n/`
- Agregar traducciones en `translations.ts` (EN + ES)
- Usar `useT()` hook en client components
- Fechas: `locale === "es" ? "es-ES" : "en-US"`

### iOS Safari
- Usar `min-h-dvh` en vez de `min-h-screen`
- `transform-gpu` en elementos fixed
- `viewportFit: cover` en viewport meta
- `pb-safe` para home indicator

### Caching
- Páginas dinámicas: `export const dynamic = "force-dynamic"`
- Mobile redirect: usar `window.location.href` en vez de `router.push()`

---

## Ideas Futuras (sin priorizar)
- Modo offline con sync
- AI: sugerencias basadas en gustos
- Reservas integradas (OpenTable API)
- Menú con precios
- Detector de platos (foto → identificar comida)
- Multi-currency para precio
- Dark/Light mode toggle
