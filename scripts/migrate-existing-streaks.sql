-- =====================================================
-- SCRIPT PARA MIGRAR Y CORREGIR STREAKS EXISTENTES
-- =====================================================
-- Ejecutar este script DESPUÉS de ejecutar setup-streak-functions.sql

-- 1. Verificar el estado actual de los streaks
SELECT 
    fid,
    username,
    vote_streak,
    created_at,
    updated_at
FROM users 
ORDER BY vote_streak DESC, created_at DESC
LIMIT 20;

-- 2. Verificar cuántos usuarios tienen streaks incorrectos (0 o NULL)
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN vote_streak IS NULL OR vote_streak = 0 THEN 1 END) as users_without_streak,
    COUNT(CASE WHEN vote_streak > 0 THEN 1 END) as users_with_streak
FROM users;

-- 3. Verificar votos de los últimos 7 días para un usuario específico
-- Reemplazar 123 con un FID real de tu base de datos
SELECT 
    DATE(created_at) as vote_date,
    COUNT(*) as votes_count
FROM votes 
WHERE voter_fid = 123  -- CAMBIAR ESTE FID
AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY vote_date DESC;

-- 4. Calcular y actualizar streaks de usuarios específicos
-- Reemplazar los FIDs con valores reales de tu base de datos
SELECT update_user_streak(123);  -- CAMBIAR ESTE FID
SELECT update_user_streak(456);  -- CAMBIAR ESTE FID
SELECT update_user_streak(789);  -- CAMBIAR ESTE FID

-- 5. Actualizar streaks de todos los usuarios (EJECUTAR SOLO SI ES NECESARIO)
-- WARNING: Esto puede tomar tiempo dependiendo del número de usuarios
-- SELECT update_all_user_streaks();

-- 6. Verificar el estado después de la migración
SELECT 
    fid,
    username,
    vote_streak,
    updated_at
FROM users 
ORDER BY vote_streak DESC, updated_at DESC
LIMIT 20;

-- 7. Verificar que las funciones están funcionando correctamente
-- Probar con un usuario específico (reemplazar 123 con un FID real)
SELECT 
    'Current streak from DB' as source,
    vote_streak as value
FROM users 
WHERE fid = 123  -- CAMBIAR ESTE FID

UNION ALL

SELECT 
    'Calculated current streak' as source,
    calculate_user_current_streak(123) as value  -- CAMBIAR ESTE FID

UNION ALL

SELECT 
    'Max streak in last 30 days' as source,
    calculate_user_vote_streak(123) as value;  -- CAMBIAR ESTE FID

-- 8. Verificar el historial de votos de los últimos 30 días
-- Reemplazar 123 con un FID real
SELECT 
    DATE(created_at) as vote_date,
    COUNT(*) as votes_count,
    STRING_AGG(DISTINCT vendor_id::text, ', ') as voted_vendors
FROM votes 
WHERE voter_fid = 123  -- CAMBIAR ESTE FID
AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY vote_date DESC;

-- 9. Verificar que los índices están funcionando
-- NOTA: Usamos created_at directamente en lugar de DATE() para el índice
EXPLAIN (ANALYZE, BUFFERS) 
SELECT created_at
FROM votes 
WHERE voter_fid = 123  -- CAMBIAR ESTE FID
AND created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 10. Limpiar y optimizar la base de datos (opcional)
-- VACUUM ANALYZE votes;
-- VACUUM ANALYZE users;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Resumen de la migración
SELECT 
    'Migration Summary' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN vote_streak > 0 THEN 1 END) as users_with_streak,
    AVG(vote_streak) as average_streak,
    MAX(vote_streak) as max_streak,
    MIN(vote_streak) as min_streak
FROM users;

-- Usuarios con streaks más altos
SELECT 
    username,
    vote_streak,
    updated_at
FROM users 
WHERE vote_streak > 0
ORDER BY vote_streak DESC
LIMIT 10;

-- =====================================================
-- VERIFICACIÓN DE ÍNDICES
-- =====================================================

-- Verificar que los índices se crearon correctamente
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE indexname LIKE '%votes%' OR indexname LIKE '%streak%'
ORDER BY indexname;

-- Verificar que las funciones se crearon correctamente
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%streak%'
ORDER BY routine_name;
