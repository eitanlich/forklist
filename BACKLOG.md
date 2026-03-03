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

#### Landing Page & Dominio (NEXT)
- [ ] Landing page atractiva (hero, features, CTA)
- [ ] Dominio propio (forklist.app? forklist.io? getforklist.com?)
- [ ] Verificar disponibilidad de dominios
- [ ] Conectar dominio a Vercel
- [ ] SEO básico para landing

#### Tipo de Comida (NEXT)
- [ ] Nuevo campo en review: desayuno, almuerzo, merienda, cena, brunch, drinks
- [ ] Agregar columna en tabla `reviews`
- [ ] Selector en form de review (similar a ocasión)
- [ ] Filtro en historial

#### Discovery / Búsqueda Pública (CORE FEATURE)
- [ ] Nueva vertical: buscar restaurant NUEVO (no para loggear visita)
- [ ] Ver reviews públicas de otros usuarios de ForkList
- [ ] Filtros: ocasión, tipo de comida, rating, precio, ubicación
- [ ] "Busco lugar para cenar hoy con mi pareja" → resultados relevantes
- [ ] Integración con reservas (el flywheel completo)
- [ ] Sponsored results para monetización

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

### 🟡 Media Prioridad

#### Instagram del Restaurant
- [ ] Obtener link de Instagram desde Google Places
- [ ] Mostrar botón Instagram en card del restaurant
- [ ] Scraping del linktree/bio para encontrar menú

#### Menú del Restaurant
- [ ] Obtener foto del menú desde Google Places si existe
- [ ] Detectar link a menú en Instagram bio (linktree, drive, etc)
- [ ] Mostrar menú en la card del restaurant

#### Reservas via ForkList
- [ ] Detectar si restaurant tiene sistema de reservas (web/Instagram)
- [ ] Link directo a reserva desde la app
- [ ] Tracking de reservas hechas

### 🟢 Baja Prioridad / Nice-to-have

#### Import Reviews de Google Maps
- [ ] Conectar con Google Account
- [ ] Detectar reviews existentes del usuario en Google Maps
- [ ] Importar a ForkList con un click
- [ ] (nice to have - en la práctica no se usa mucho)

#### Compartir Reservas con Amigos
- [ ] Ver reservas de amigos en ForkList
- [ ] Invitar amigos a una reserva
- [ ] Depende de: Social Features

#### Social Features (FASE 3 - CORE)
**Modelo: Instagram/Letterboxd (followers asimétricos)**

##### Perfiles
- [ ] Username único (@usuario)
- [ ] Página pública `/u/[username]`
- [ ] Default: público / opción: privado
- [ ] Bio, foto, stats (reviews, followers, following)
- [ ] Si privado: necesita aprobar followers

##### Followers (no friends)
- [ ] Seguir a cualquier usuario sin aprobación (si público)
- [ ] Ver feed de reviews de gente que sigo
- [ ] Seguir "foodies famosos" con buen gusto
- [ ] Notificación cuando alguien te sigue

##### Visibilidad por contenido
| Contenido | Default | Opciones |
|-----------|---------|----------|
| Perfil | público | público / privado |
| Reviews | público | público / solo followers / privado |
| Wishlist | privado | privado / solo followers / público |

##### Feed & Discovery
- [ ] Feed home: reviews de gente que sigo
- [ ] Explore: reviews populares / cercanas
- [ ] Likes en reviews
- [ ] Comentarios en reviews

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

---

## 💰 MONETIZACIÓN (por definir)

### Ideas a explorar

#### 1. Freemium / Suscripción
- Free: hasta X reviews, features básicas
- Pro ($5-10/mes): reviews ilimitadas, stats avanzados, export, sin ads

#### 2. Comisión por Reservas
- Si el usuario reserva via ForkList → comisión del restaurant
- Modelo tipo TheFork/OpenTable (€2-4 por comensal)
- Requiere: integración con restaurants

#### 3. Affiliate / Referidos
- Links de reserva con tracking
- Comisión por reserva completada
- No requiere integración directa

#### 4. Restaurant Dashboard (B2B)
- Restaurants pagan por ver analytics de sus reviews
- Responder a reviews
- Promociones a usuarios que los visitaron
- Modelo tipo Yelp for Business

#### 5. Publicidad
- Ads de restaurants en búsqueda (sponsored results)
- Native ads en feed
- Menos intrusivo: solo en versión free

#### 6. Data/Insights
- Vender trends agregados (no PII) a marcas de F&B
- Reports de industria gastronómica

### Modelos Priorizados

#### 1. Freemium con límite de reviews
- **Free:** 3 reviews/mes
- **Pro:** $2-3/mes → reviews ilimitadas + stats + export
- Bajo costo = alta conversión, barrera baja

#### 2. Sponsored Results en búsqueda
- Restaurants pagan por aparecer primero en searchbar
- "Promoted" tag sutil
- Modelo Google Ads para gastro

#### 3. Affiliate en reservas
- Comisión por reserva completada via ForkList
- Win-win: usuario reserva fácil, restaurant paga por cliente

### El Flywheel 🔄
```
Buscar restaurant → Reservar via ForkList → Comer → Review en ForkList
      ↑                                                      ↓
      ←←←←←←←← otros usuarios descubren ←←←←←←←←←←←←←←←←←←←←
```

### Preguntas abiertas
- [ ] ¿Reviews públicas vs privadas? (pivot estratégico)
- [ ] ¿Cuál es el TAM en Argentina/LATAM?
- [ ] ¿Competencia directa? (TheFork, TripAdvisor, Google Maps)
- [ ] ¿Diferenciador principal?

---

## Ideas Futuras (sin priorizar)
- Modo offline con sync
- AI: sugerencias basadas en gustos
- Reservas integradas (OpenTable API)
- Menú con precios
- Detector de platos (foto → identificar comida)
- Multi-currency para precio
- Dark/Light mode toggle

### 🟡 Iteraciones UX

#### Feed (Home)
- [ ] Mejorar diseño del feed - iterar UX
- [ ] Diferenciar reviews propias vs de otros
- [ ] Posible: infinite scroll vs pagination
