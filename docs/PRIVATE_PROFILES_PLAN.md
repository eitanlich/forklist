# Private Profiles & Follow Requests - Implementation Plan

## Análisis de Apps Referencia

### Instagram
- Perfiles privados aparecen en búsqueda con candado
- Al seguir cuenta privada → "Requested" (pending)
- Dueño ve requests en sección dedicada (❤️ → Follow Requests)
- Puede aceptar/rechazar requests
- Puede remover followers existentes
- Al aceptar, follower_count sube

### Twitter/X
- Similar pero con "Protected tweets"
- Requests van a notificaciones
- Menos prominente que Instagram

### Strava
- Perfiles pueden ser "Everyone" o "Followers"
- Similar a Instagram para requests

## Estado Actual en ForkList
- ✅ `users.is_private` existe en DB
- ✅ `follows.status` soporta 'pending'/'active'
- ✅ UI oculta reviews de perfiles privados
- ❌ Follow siempre crea status='active'
- ❌ No hay UI para ver/gestionar requests
- ❌ No se puede remover followers
- ❌ Búsqueda excluye privados (debería mostrarlos)

## Plan de Implementación

### Fase 1: Backend - Follow Requests
**Archivos:** `src/lib/actions/follows.ts`

1. `followUser()` - Modificar para crear pending si target es privado
2. `acceptFollowRequest(followerId)` - Nueva función
3. `rejectFollowRequest(followerId)` - Nueva función  
4. `removeFollower(followerId)` - Nueva función
5. `getPendingFollowRequests()` - Nueva función
6. `getPendingRequestCount()` - Nueva función (para badge)

### Fase 2: UI - Follow Button States
**Archivos:** `src/components/social/FollowButton.tsx`

Estados:
- No siguiendo + público → "Follow" → click → "Following"
- No siguiendo + privado → "Follow" → click → "Requested"
- Pending → "Requested" → click → cancela request
- Following → "Following" → hover → "Unfollow"

### Fase 3: UI - Follow Requests Page
**Archivos:** 
- `src/app/(app)/requests/page.tsx` (nueva)
- `src/app/(app)/requests/RequestsContent.tsx` (nueva)

Features:
- Lista de requests pendientes
- Botones Accept/Reject por request
- Badge en navegación si hay requests

### Fase 4: UI - Manage Followers
**Archivos:**
- `src/app/(public)/u/[username]/followers/page.tsx` (modificar)

Features:
- Si es mi perfil, mostrar botón "Remove" en cada follower
- Confirmación antes de remover

### Fase 5: Búsqueda - Mostrar Privados
**Archivos:** `src/lib/actions/explore.ts`

- Mostrar usuarios privados en búsqueda
- Indicador visual (candado) en resultados

### Fase 6: Tests de Regresión
Verificar que sigue funcionando:
- [ ] Follow/unfollow en perfiles públicos
- [ ] Contador de followers se actualiza
- [ ] Perfil privado no muestra reviews a no-followers
- [ ] Likes funcionan correctamente
- [ ] Stats de perfil correctas

## Schema de Estados

```
Usuario A quiere seguir a Usuario B (privado):

1. A no sigue a B
   follows: (no record)
   Button: "Follow"

2. A clickea Follow
   follows: {follower: A, following: B, status: 'pending'}
   Button: "Requested"

3. B acepta
   follows: {follower: A, following: B, status: 'active'}
   Button: "Following"

-- OR --

3. B rechaza
   follows: (deleted)
   Button: "Follow"
```

## Orden de Implementación

1. **Backend primero** - todas las actions
2. **FollowButton** - nuevo estado "Requested"
3. **Requests page** - ver y gestionar
4. **Followers page** - remover followers
5. **Búsqueda** - mostrar privados
6. **Tests** - verificar todo

## Backlog Futuro (NO en este PR)
- Push notifications para nuevos requests
- Email notifications
- "Close Friends" lists
- Block users
