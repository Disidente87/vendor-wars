-- =====================================================
-- SCRIPT PARA CORREGIR LA BASE DE DATOS - VENDOR WARS
-- =====================================================

-- 1. Verificar que las tablas existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'zones') THEN
    RAISE EXCEPTION 'La tabla zones no existe';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'zone_delegations') THEN
    RAISE EXCEPTION 'La tabla zone_delegations no existe';
  END IF;
  
  RAISE NOTICE '✅ Todas las tablas necesarias existen';
END $$;

-- 2. Verificar datos en zones
SELECT 'Zones table' as table_name, COUNT(*) as count FROM zones;

-- 3. Verificar datos en zone_delegations
SELECT 'Zone delegations table' as table_name, COUNT(*) as count FROM zone_delegations;

-- 4. Corregir la función get_zone_by_delegation
DROP FUNCTION IF EXISTS get_zone_by_delegation(VARCHAR);

CREATE OR REPLACE FUNCTION get_zone_by_delegation(delegation_name VARCHAR)
RETURNS TEXT AS $$
DECLARE
  zone_id TEXT;
BEGIN
  -- Use explicit table alias to avoid ambiguity
  SELECT zd.zone_id INTO zone_id
  FROM zone_delegations zd
  WHERE zd.delegation_name ILIKE delegation_name;
  
  RETURN zone_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Probar la función con Coyoacán
SELECT 
  'Coyoacán' as delegation,
  get_zone_by_delegation('Coyoacán') as zone_id,
  CASE 
    WHEN get_zone_by_delegation('Coyoacán') IS NOT NULL THEN '✅ FUNCIONA'
    ELSE '❌ NO FUNCIONA'
  END as status;

-- 6. Verificar todas las delegaciones
SELECT 
  zd.delegation_name,
  zd.zone_id,
  z.name as zone_name,
  CASE 
    WHEN get_zone_by_delegation(zd.delegation_name) IS NOT NULL THEN '✅ FUNCIONA'
    ELSE '❌ NO FUNCIONA'
  END as function_status
FROM zone_delegations zd
LEFT JOIN zones z ON zd.zone_id = z.id
ORDER BY zd.delegation_name;

-- 7. Mostrar resumen
SELECT 
  'RESUMEN' as info,
  COUNT(DISTINCT zd.delegation_name) as total_delegations,
  COUNT(DISTINCT zd.zone_id) as total_zones,
  COUNT(DISTINCT z.name) as zone_names
FROM zone_delegations zd
LEFT JOIN zones z ON zd.zone_id = z.id;
