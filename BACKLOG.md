# ForkList Backlog

> Última actualización: 2026-03-04

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
- [x] Landing page
- [x] Meal type (tipo de comida)
- [x] Share review

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
- [x] Desktop navigation
- [x] Profile settings (edit bio, avatar, delete account)
- [x] Sign out

---

## Bugs Conocidos

### 🔴 Críticos
- [x] ~~**Follow system no funciona** — usuarios de Clerk no se sincronizaban a Supabase (webhook sin configurar)~~ FIXED: auto-sync fallback agregado

### Pendientes
- [ ] **Configurar CLERK_WEBHOOK_SECRET en Vercel** — el auto-sync funciona pero es mejor tener el webhook activo

---

## Pendiente

### 🔴 Fase 4 - Polish & Growth (ACTUAL)

| Prioridad | Feature | Esfuerzo |
|-----------|---------|----------|
| 1 | Buscar usuarios por email (username es opcional) | 1-2 hs |
| 2 | Sign out más accesible | 30 min |
| 3 | Mejorar feed UX | 2-3 hs |
| 4 | Filtros en historial | 2-3 hs |
| 5 | Onboarding nuevos usuarios | 2 hs |
| 6 | Notificaciones (follow/like) | 3-4 hs |

### 🟡 Fase 5 - Engagement
- [ ] UI de likes clickeable
- [ ] Comentarios en reviews
- [ ] Discovery avanzado (popular, cercanos)
- [ ] Fotos propias

### 🟡 Fase 6 - Features Avanzados
- [ ] Mapa de restaurantes
- [ ] Stats avanzados / Year in Review
- [ ] Gamification (badges, streaks)

### 🟢 Fase 7 - Monetización
- [ ] Freemium
- [ ] Reservas
- [ ] B2B dashboard

---

## Notas Técnicas

### Auto-sync de usuarios (2026-03-04)
- Si el webhook de Clerk falla, `getCurrentUserId()` en `lib/actions/user.ts` auto-sincroniza el usuario
- Busca en Clerk API y crea el registro en Supabase
- Previene errores silenciosos en follow/like/etc

### i18n
- Archivos en `src/lib/i18n/`
- `useT()` hook en client components
- Fechas: `locale === "es" ? "es-ES" : "en-US"`

### iOS Safari
- `min-h-dvh` en vez de `min-h-screen`
- `transform-gpu` en elementos fixed
- `pb-safe` para home indicator
