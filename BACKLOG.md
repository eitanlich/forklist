# ForkList Backlog

> Última actualización: 2026-03-03

## Leyenda
- 🔴 Alta prioridad
- 🟡 Media prioridad  
- 🟢 Baja prioridad / nice-to-have
- ✅ Completado

---

## Completado

### Fase 1 - MVP ✅
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

### Fase 2 - Core Features ✅
- [x] Filtro de ubicación (auto-detect + selector de país)
- [x] Búsqueda de cualquier país (100+ países)
- [x] i18n completo (EN/ES)
- [x] Editar/eliminar reviews
- [x] PWA (Add to Home Screen)
- [x] Listas/Wishlists

### Fase 3 - Social ✅ (2026-03-03)
- [x] Perfiles públicos (`/u/username`)
- [x] Follow/Unfollow system
- [x] Feed de reviews (home)
- [x] Explore (buscar usuarios)
- [x] Profile stats con temporalidad (mes/año/todo)
- [x] List/Grid view en perfil
- [x] Página de review (`/review/[id]`)
- [x] Share reviews
- [x] Likes system (backend ready)
- [x] Followers/Following pages

---

## Pendiente

### 🔴 Fase 4 - Polish & Growth (PRÓXIMA)

#### UX Crítico
- [ ] Sign out más accesible (header menu o perfil)
- [ ] Mejorar feed UX (diferenciar reviews propias vs otros)
- [ ] Empty states más amigables
- [ ] Onboarding para nuevos usuarios

#### Landing & Marketing
- [ ] Landing page atractiva (hero, features, CTA)
- [ ] Dominio propio (forklist.app?)
- [ ] SEO optimizado
- [ ] Open Graph images dinámicas por review

#### Filtros en Historial
- [ ] Filtrar por rating (1-5 estrellas)
- [ ] Filtrar por ocasión
- [ ] Filtrar por tipo de comida
- [ ] Ordenar por fecha/rating

#### Notificaciones
- [ ] Notificación cuando te siguen
- [ ] Notificación de likes en tus reviews
- [ ] Email digest semanal (opcional)

### 🟡 Fase 5 - Engagement

#### Likes & Comentarios
- [ ] UI de likes en reviews (corazón clickeable)
- [ ] Like count visible
- [ ] Comentarios en reviews
- [ ] Notificación de comentarios

#### Discovery Avanzado
- [ ] Explore: reviews populares (más likes)
- [ ] Explore: reviews cercanas (geolocation)
- [ ] Search reviews por restaurant/ciudad
- [ ] "Busco lugar para cenar con mi pareja" → filtros inteligentes

#### Fotos Propias
- [ ] Upload de fotos del usuario
- [ ] Storage en Supabase Storage
- [ ] Galería en review
- [ ] Compresión client-side

### 🟡 Fase 6 - Features Avanzados

#### Mapa de Restaurantes
- [ ] Mapa con pins de lugares visitados
- [ ] Click en pin → ver review
- [ ] Filtrar por ciudad/país

#### Stats Avanzados
- [ ] Gráfico de reviews por mes
- [ ] Top cuisines probadas
- [ ] Países/ciudades visitadas
- [ ] Year in Review (estilo Letterboxd)

#### Gamification
- [ ] Badges por cantidad de reviews
- [ ] Streaks (días seguidos)
- [ ] Levels/XP

### 🟢 Fase 7 - Monetización (futuro)

#### Freemium
- [ ] Free: 3 reviews/mes
- [ ] Pro ($2-3/mes): ilimitadas + stats + export

#### Reservas
- [ ] Integración con sistemas de reservas
- [ ] Comisión por reserva completada

#### B2B
- [ ] Dashboard para restaurants
- [ ] Sponsored results en búsqueda

---

## Bugs Conocidos

### Pendientes
- [ ] Login con Google desde PWA (iOS) puede fallar por 2FA en webview

### Resueltos (2026-03-03)
- [x] Stats mostraban 0 → cuisine_type estaba en tabla equivocada
- [x] API stats protegida → agregada a rutas públicas
- [x] Rutas duplicadas rompían build → renombradas a /edit-review, /delete-review
- [x] Sin sign out → agregado en settings
- [x] Fondo blanco en perfil → removido html/body duplicado

---

## Notas Técnicas

### Rutas importantes
- `/u/[username]` - perfil público (public)
- `/review/[id]` - vista de review (public)
- `/edit-review/[id]` - editar review (app, auth required)
- `/delete-review/[id]` - eliminar review (app, auth required)
- `/explore` - buscar usuarios (app)

### Pre-push checklist
1. `npx tsc --noEmit`
2. Verificar que campos existen en tablas
3. Verificar rutas públicas en middleware
4. No conflictos entre (app) y (public)
