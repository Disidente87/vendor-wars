-- =====================================================
-- SISTEMA DE DELEGACIONES POR ZONA - VENDOR WARS
-- =====================================================

-- 1. Crear tabla para mapear delegaciones a zonas
CREATE TABLE IF NOT EXISTS zone_delegations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id TEXT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  delegation_name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agregar columna delegation a la tabla vendors
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS delegation VARCHAR(255);

-- 3. Crear índice para mejorar performance en búsquedas por delegación
CREATE INDEX IF NOT EXISTS idx_vendors_delegation ON vendors(delegation);

-- 4. Crear trigger para actualizar updated_at en zone_delegations
CREATE OR REPLACE FUNCTION update_zone_delegations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS update_zone_delegations_updated_at ON zone_delegations;
CREATE TRIGGER update_zone_delegations_updated_at 
  BEFORE UPDATE ON zone_delegations 
  FOR EACH ROW EXECUTE FUNCTION update_zone_delegations_updated_at();

-- 5. Insertar las delegaciones según la distribución de zonas
-- Primero, obtener los IDs de las zonas existentes
DO $$
DECLARE
  centro_zone_id TEXT;
  norte_zone_id TEXT;
  este_zone_id TEXT;
  oeste_zone_id TEXT;
  sur_zone_id TEXT;
BEGIN
  -- Obtener IDs de las zonas (ajusta los nombres según tu base de datos)
  SELECT id INTO centro_zone_id FROM zones WHERE name ILIKE '%centro%' OR name ILIKE '%rojo%' LIMIT 1;
  SELECT id INTO norte_zone_id FROM zones WHERE name ILIKE '%norte%' OR name ILIKE '%verde%' LIMIT 1;
  SELECT id INTO este_zone_id FROM zones WHERE name ILIKE '%este%' OR name ILIKE '%azul%' LIMIT 1;
  SELECT id INTO oeste_zone_id FROM zones WHERE name ILIKE '%oeste%' OR name ILIKE '%amarillo%' LIMIT 1;
  SELECT id INTO sur_zone_id FROM zones WHERE name ILIKE '%sur%' OR name ILIKE '%morado%' LIMIT 1;

  -- Si no se encuentran las zonas, crear un log de error
  IF centro_zone_id IS NULL THEN
    RAISE NOTICE '⚠️ Zona Centro no encontrada. Verifica que exista una zona con nombre que contenga "centro" o "rojo"';
  END IF;
  
  IF norte_zone_id IS NULL THEN
    RAISE NOTICE '⚠️ Zona Norte no encontrada. Verifica que exista una zona con nombre que contenga "norte" o "verde"';
  END IF;
  
  IF este_zone_id IS NULL THEN
    RAISE NOTICE '⚠️ Zona Este no encontrada. Verifica que exista una zona con nombre que contenga "este" o "azul"';
  END IF;
  
  IF oeste_zone_id IS NULL THEN
    RAISE NOTICE '⚠️ Zona Oeste no encontrada. Verifica que exista una zona con nombre que contenga "oeste" o "amarillo"';
  END IF;
  
  IF sur_zone_id IS NULL THEN
    RAISE NOTICE '⚠️ Zona Sur no encontrada. Verifica que exista una zona con nombre que contenga "sur" o "morado"';
  END IF;

  -- Insertar delegaciones solo si se encontraron las zonas correspondientes
  
  -- ZONA CENTRO (rojo)
  IF centro_zone_id IS NOT NULL THEN
    INSERT INTO zone_delegations (zone_id, delegation_name) VALUES
      (centro_zone_id, 'Cuauhtémoc'),
      (centro_zone_id, 'Venustiano Carranza'),
      (centro_zone_id, 'Benito Juárez'),
      (centro_zone_id, 'Coyoacán')
    ON CONFLICT (delegation_name) DO NOTHING;
    RAISE NOTICE '✅ Delegaciones de Zona Centro insertadas';
  END IF;

  -- ZONA NORTE (verde)
  IF norte_zone_id IS NOT NULL THEN
    INSERT INTO zone_delegations (zone_id, delegation_name) VALUES
      (norte_zone_id, 'Gustavo A. Madero'),
      (norte_zone_id, 'Azcapotzalco'),
      (norte_zone_id, 'Miguel Hidalgo')
    ON CONFLICT (delegation_name) DO NOTHING;
    RAISE NOTICE '✅ Delegaciones de Zona Norte insertadas';
  END IF;

  -- ZONA ESTE (azul)
  IF este_zone_id IS NOT NULL THEN
    INSERT INTO zone_delegations (zone_id, delegation_name) VALUES
      (este_zone_id, 'Iztapalapa'),
      (este_zone_id, 'Tláhuac'),
      (este_zone_id, 'Iztacalco')
    ON CONFLICT (delegation_name) DO NOTHING;
    RAISE NOTICE '✅ Delegaciones de Zona Este insertadas';
  END IF;

  -- ZONA OESTE (amarillo)
  IF oeste_zone_id IS NOT NULL THEN
    INSERT INTO zone_delegations (zone_id, delegation_name) VALUES
      (oeste_zone_id, 'Cuajimalpa de Morelos'),
      (oeste_zone_id, 'Álvaro Obregón'),
      (oeste_zone_id, 'Magdalena Contreras')
    ON CONFLICT (delegation_name) DO NOTHING;
    RAISE NOTICE '✅ Delegaciones de Zona Oeste insertadas';
  END IF;

  -- ZONA SUR (morado)
  IF sur_zone_id IS NOT NULL THEN
    INSERT INTO zone_delegations (zone_id, delegation_name) VALUES
      (sur_zone_id, 'Tlalpan'),
      (sur_zone_id, 'Xochimilco'),
      (sur_zone_id, 'Milpa Alta')
    ON CONFLICT (delegation_name) DO NOTHING;
    RAISE NOTICE '✅ Delegaciones de Zona Sur insertadas';
  END IF;

END $$;

-- 6. Crear función helper para obtener zona por delegación
CREATE OR REPLACE FUNCTION get_zone_by_delegation(delegation_name VARCHAR)
RETURNS TEXT AS $$
DECLARE
  zone_id TEXT;
BEGIN
  SELECT zd.zone_id INTO zone_id
  FROM zone_delegations zd
  WHERE zd.delegation_name ILIKE delegation_name;
  
  RETURN zone_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear función para asignar zona automáticamente a un vendor
CREATE OR REPLACE FUNCTION assign_vendor_zone()
RETURNS TRIGGER AS $$
DECLARE
  zone_id TEXT;
BEGIN
  -- Si el vendor ya tiene zone_id, no hacer nada
  IF NEW.zone_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Si tiene delegación, asignar zona automáticamente
  IF NEW.delegation IS NOT NULL THEN
    zone_id := get_zone_by_delegation(NEW.delegation);
    IF zone_id IS NOT NULL THEN
      NEW.zone_id := zone_id;
      RAISE NOTICE '✅ Zona asignada automáticamente: % para delegación %', zone_id, NEW.delegation;
    ELSE
      RAISE NOTICE '⚠️ No se encontró zona para la delegación: %', NEW.delegation;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear trigger para asignar zona automáticamente
DROP TRIGGER IF EXISTS auto_assign_vendor_zone ON vendors;
CREATE TRIGGER auto_assign_vendor_zone
  BEFORE INSERT ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION assign_vendor_zone();

-- 9. Habilitar RLS en la nueva tabla
ALTER TABLE zone_delegations ENABLE ROW LEVEL SECURITY;

-- 10. Crear políticas RLS para zone_delegations
CREATE POLICY "Zone delegations are viewable by everyone" ON zone_delegations
  FOR SELECT USING (true);

CREATE POLICY "Zone delegations can be created by service role" ON zone_delegations
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Zone delegations can be updated by service role" ON zone_delegations
  FOR UPDATE USING (auth.role() = 'service_role');

-- 11. Verificar la estructura creada
SELECT 
  'zone_delegations' as table_name,
  COUNT(*) as total_delegations
FROM zone_delegations
UNION ALL
SELECT 
  'vendors' as table_name,
  COUNT(*) as total_vendors
FROM vendors;

-- 12. Mostrar delegaciones por zona
SELECT 
  z.name as zone_name,
  z.color as zone_color,
  COUNT(zd.delegation_name) as delegations_count,
  STRING_AGG(zd.delegation_name, ', ' ORDER BY zd.delegation_name) as delegations
FROM zones z
LEFT JOIN zone_delegations zd ON z.id = zd.zone_id
GROUP BY z.id, z.name, z.color
ORDER BY z.name;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
