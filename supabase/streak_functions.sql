-- =====================================================
-- FUNCIONES ROBUSTAS PARA CALCULAR VOTE_STREAK
-- =====================================================

-- Función para calcular el streak de un usuario específico
-- Basándose en los votos reales de la base de datos
CREATE OR REPLACE FUNCTION calculate_user_vote_streak(user_fid_param BIGINT)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER := 0;
    current_date DATE := CURRENT_DATE;
    check_date DATE := CURRENT_DATE;
    has_vote BOOLEAN;
    consecutive_days INTEGER := 0;
    max_consecutive_days INTEGER := 0;
BEGIN
    -- Empezar desde hoy y ir hacia atrás hasta 30 días
    WHILE check_date >= current_date - INTERVAL '30 days' LOOP
        -- Verificar si el usuario votó en esta fecha específica
        SELECT EXISTS(
            SELECT 1 FROM votes 
            WHERE voter_fid = user_fid_param 
            AND DATE(created_at) = check_date
        ) INTO has_vote;
        
        IF has_vote THEN
            consecutive_days := consecutive_days + 1;
            -- Actualizar el máximo streak si es necesario
            IF consecutive_days > max_consecutive_days THEN
                max_consecutive_days := consecutive_days;
            END IF;
        ELSE
            -- Si no votó, romper la secuencia consecutiva
            consecutive_days := 0;
        END IF;
        
        check_date := check_date - INTERVAL '1 day';
    END LOOP;
    
    -- Retornar el streak más alto encontrado
    RETURN max_consecutive_days;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular el streak actual (días consecutivos hasta hoy)
CREATE OR REPLACE FUNCTION calculate_user_current_streak(user_fid_param BIGINT)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER := 0;
    current_date DATE := CURRENT_DATE;
    check_date DATE := CURRENT_DATE;
    has_vote BOOLEAN;
BEGIN
    -- Empezar desde hoy y ir hacia atrás hasta encontrar un día sin voto
    WHILE check_date >= current_date - INTERVAL '30 days' LOOP
        -- Verificar si el usuario votó en esta fecha específica
        SELECT EXISTS(
            SELECT 1 FROM votes 
            WHERE voter_fid = user_fid_param 
            AND vote_date = check_date
        ) INTO has_vote;
        
        IF has_vote THEN
            current_streak := current_streak + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            -- Si no votó, romper el streak
            EXIT;
        END IF;
    END LOOP;

    RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar el streak de un usuario específico
CREATE OR REPLACE FUNCTION update_user_streak(user_fid_param BIGINT)
RETURNS INTEGER AS $$
DECLARE
    calculated_streak INTEGER;
BEGIN
    -- Calcular el streak actual basándose en los votos reales
    calculated_streak := calculate_user_current_streak(user_fid_param);
    
    -- Actualizar la base de datos
    UPDATE users 
    SET 
        vote_streak = calculated_streak,
        updated_at = NOW()
    WHERE fid = user_fid_param;
    
    RETURN calculated_streak;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar streaks de todos los usuarios
CREATE OR REPLACE FUNCTION update_all_user_streaks()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    FOR user_record IN SELECT fid FROM users LOOP
        PERFORM update_user_streak(user_record.fid);
        updated_count := updated_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Updated streaks for % users', updated_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el streak de un usuario con prioridad en la base de datos
CREATE OR REPLACE FUNCTION get_user_streak_with_priority(user_fid_param BIGINT)
RETURNS INTEGER AS $$
DECLARE
    db_streak INTEGER;
    calculated_streak INTEGER;
BEGIN
    -- Obtener el streak actual de la base de datos
    SELECT vote_streak INTO db_streak
    FROM users 
    WHERE fid = user_fid_param;
    
    -- Si no hay streak o es 0, calcularlo
    IF db_streak IS NULL OR db_streak = 0 THEN
        calculated_streak := calculate_user_current_streak(user_fid_param);
        
        -- Actualizar la base de datos con el valor calculado
        UPDATE users 
        SET 
            vote_streak = calculated_streak,
            updated_at = NOW()
        WHERE fid = user_fid_param;
        
        RETURN calculated_streak;
    END IF;
    
    -- Retornar el streak de la base de datos
    RETURN db_streak;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR EL CÁLCULO DE STREAKS
-- =====================================================

-- Índice para optimizar las consultas de streak por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_votes_voter_date ON votes(voter_fid, vote_date);

-- Índice para optimizar las consultas de streak por fecha
CREATE INDEX IF NOT EXISTS idx_votes_date ON votes(vote_date);

-- =====================================================
-- TRIGGERS PARA MANTENER STREAKS ACTUALIZADOS
-- =====================================================

-- Función del trigger que se ejecuta cuando se inserta un voto
CREATE OR REPLACE FUNCTION trigger_update_streak_on_vote()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el streak del usuario automáticamente
    PERFORM update_user_streak(NEW.voter_fid);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para mantener streaks actualizados
DROP TRIGGER IF EXISTS trigger_update_streak_on_vote ON votes;
CREATE TRIGGER trigger_update_streak_on_vote
    AFTER INSERT OR UPDATE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_streak_on_vote();

-- =====================================================
-- CRON JOB PARA ACTUALIZACIÓN DIARIA AUTOMÁTICA
-- =====================================================

-- Nota: Para usar esto, necesitas habilitar la extensión pg_cron en Supabase
-- SELECT cron.schedule(
--     'update-vote-streaks-daily',
--     '0 1 * * *', -- Todos los días a la 1:00 AM
--     'SELECT update_all_user_streaks();'
-- );
