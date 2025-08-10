# 🔥 Implementación del Sistema de Streaks Robusto

## 📋 **Resumen de la Solución**

Este sistema reemplaza la lógica defectuosa de Redis con un cálculo robusto basado en la **base de datos como fuente de verdad**. Los streaks se calculan automáticamente basándose en los votos reales de los usuarios.

## 🎯 **Características Principales**

- ✅ **Base de datos como fuente de verdad** - Prioridad sobre Redis
- ✅ **Cálculo automático** - Se ejecuta al iniciar sesión y al votar
- ✅ **Triggers automáticos** - Mantiene streaks actualizados en tiempo real
- ✅ **Fallbacks robustos** - Múltiples capas de seguridad
- ✅ **Índices optimizados** - Consultas rápidas y eficientes
- ✅ **Migración automática** - Corrige streaks existentes

## 🚀 **Pasos de Implementación**

### **Paso 1: Ejecutar Scripts SQL en Supabase**

1. **Ir al SQL Editor de Supabase**
2. **Ejecutar `scripts/setup-streak-functions.sql`**
3. **Verificar que las funciones se crearon correctamente**

### **Paso 2: Verificar la Instalación**

```sql
-- Verificar funciones creadas
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%streak%';

-- Verificar índices creados
SELECT indexname, tablename, indexdef
FROM pg_indexes 
WHERE indexname LIKE '%streak%' OR indexname LIKE '%votes%';
```

### **Paso 3: Migrar Streaks Existentes**

1. **Ejecutar `scripts/migrate-existing-streaks.sql`**
2. **Reemplazar los FIDs de ejemplo con FIDs reales**
3. **Verificar que los streaks se calcularon correctamente**

### **Paso 4: Probar el Sistema**

```sql
-- Probar con un usuario específico (reemplazar 123 con FID real)
SELECT get_user_streak_with_priority(123);
SELECT calculate_user_current_streak(123);
```

## 🔧 **Arquitectura del Sistema**

### **Flujo de Datos**

```
Usuario Vota → Trigger → Función SQL → Base de Datos
     ↓
Usuario Inicia Sesión → StreakService → Base de Datos (Prioridad)
     ↓
Redis (Solo para cache, NO para cálculo)
```

### **Componentes Principales**

1. **`StreakService`** - Servicio principal que maneja toda la lógica
2. **Funciones SQL** - Cálculos robustos en la base de datos
3. **Triggers** - Actualización automática al votar
4. **APIs** - Endpoints que usan el servicio
5. **Hooks** - React hooks para el frontend

## 📊 **Funciones SQL Disponibles**

### **`get_user_streak_with_priority(user_fid_param)`**
- **Propósito**: Obtiene el streak con prioridad en la base de datos
- **Retorna**: Número entero del streak actual
- **Uso**: Llamada principal para obtener streaks

### **`calculate_user_current_streak(user_fid_param)`**
- **Propósito**: Calcula el streak consecutivo actual
- **Retorna**: Número de días consecutivos votando hasta hoy
- **Uso**: Cálculo interno y fallback

### **`update_user_streak(user_fid_param)`**
- **Propósito**: Actualiza el streak de un usuario
- **Retorna**: El streak calculado
- **Uso**: Actualización manual y por triggers

### **`update_all_user_streaks()`**
- **Propósito**: Actualiza streaks de todos los usuarios
- **Retorna**: Void
- **Uso**: Migración masiva y mantenimiento

## 🎮 **Uso en el Frontend**

### **Hook `useVoteStreak`**

```typescript
import { useVoteStreak } from '@/hooks/useVoteStreak'

function MyComponent() {
  const { streak, loading, error, refreshStreak } = useVoteStreak()
  
  return (
    <div>
      <p>Tu streak: {streak}</p>
      <button onClick={refreshStreak}>Recalcular Streak</button>
    </div>
  )
}
```

### **Servicio Directo**

```typescript
import { StreakService } from '@/services/streak'

// Obtener streak
const streak = await StreakService.getUserStreak(userFid)

// Obtener detalles completos
const details = await StreakService.getStreakDetails(userFid)

// Verificar si votó hoy
const votedToday = await StreakService.hasUserVotedToday(userFid)
```

## 🔍 **Debugging y Monitoreo**

### **Logs del Sistema**

```typescript
// En el hook useVoteStreak
console.log(`🔥 Streak actualizado: ${streak} (fuente: ${source})`)
console.log(`🔄 Streak recalculado: ${streak} (fuente: ${source})`)
```

### **Verificación en Base de Datos**

```sql
-- Verificar streak de un usuario
SELECT fid, username, vote_streak, updated_at
FROM users 
WHERE fid = [TU_FID];

-- Verificar votos recientes
SELECT DATE(created_at) as fecha, COUNT(*) as votos
FROM votes 
WHERE voter_fid = [TU_FID]
AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;
```

## 🚨 **Solución de Problemas**

### **Problema: Streak sigue siendo 0**

1. **Verificar que las funciones SQL se crearon**
2. **Ejecutar migración manual**: `SELECT update_user_streak([TU_FID]);`
3. **Verificar que hay votos en la base de datos**
4. **Revisar logs de error en la consola**

### **Problema: Streak no se actualiza al votar**

1. **Verificar que el trigger se creó correctamente**
2. **Verificar permisos de la base de datos**
3. **Revisar logs de error en Supabase**

### **Problema: Rendimiento lento**

1. **Verificar que los índices se crearon**
2. **Ejecutar `VACUUM ANALYZE votes;`**
3. **Considerar limitar el rango de días a 30**

## 🔄 **Mantenimiento Automático**

### **Cron Job Diario (Opcional)**

```sql
-- Habilitar extensión pg_cron en Supabase
SELECT cron.schedule(
    'update-vote-streaks-daily',
    '0 1 * * *', -- Todos los días a la 1:00 AM
    'SELECT update_all_user_streaks();'
);
```

### **Verificación Periódica**

```sql
-- Verificar usuarios sin streaks
SELECT COUNT(*) as users_without_streak
FROM users 
WHERE vote_streak IS NULL OR vote_streak = 0;

-- Verificar streaks anómalos
SELECT fid, username, vote_streak
FROM users 
WHERE vote_streak > 30; -- Streaks mayores a 30 días
```

## 📈 **Métricas y KPIs**

### **Métricas del Sistema**

- **Usuarios activos con streaks**: `COUNT(*) FROM users WHERE vote_streak > 0`
- **Streak promedio**: `AVG(vote_streak) FROM users WHERE vote_streak > 0`
- **Streak máximo**: `MAX(vote_streak) FROM users`
- **Usuarios con streak > 7 días**: `COUNT(*) FROM users WHERE vote_streak > 7`

### **Monitoreo de Rendimiento**

```sql
-- Tiempo de ejecución de funciones
EXPLAIN (ANALYZE, BUFFERS) 
SELECT get_user_streak_with_priority([TU_FID]);

-- Uso de índices
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE indexname LIKE '%streak%' OR indexname LIKE '%votes%';
```

## 🎉 **Beneficios de la Nueva Implementación**

1. **✅ Precisión**: Streaks basados en votos reales
2. **✅ Confiabilidad**: Base de datos como fuente de verdad
3. **✅ Automatización**: Actualización automática al votar
4. **✅ Rendimiento**: Índices optimizados y consultas eficientes
5. **✅ Mantenibilidad**: Código limpio y bien estructurado
6. **✅ Escalabilidad**: Funciona con cualquier número de usuarios
7. **✅ Debugging**: Logs claros y herramientas de monitoreo

## 🔮 **Próximos Pasos**

1. **Implementar métricas avanzadas** (gráficos de streaks)
2. **Sistema de recompensas** basado en streaks
3. **Notificaciones** cuando se rompe un streak
4. **Competencias** entre usuarios por streaks más altos
5. **Analytics** de comportamiento de votación
