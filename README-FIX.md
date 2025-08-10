# 🔧 Fix para Error "Invalid delegation selected"

## 🚨 Problema Identificado

El error 500 en el registro de vendors se debe a un problema en la función SQL `get_zone_by_delegation`. La función tiene un error de ambigüedad en la columna `delegation_name`.

## 📋 Diagnóstico

```bash
❌ Error: column reference "delegation_name" is ambiguous
```

**Causa:** La función SQL no especifica correctamente la tabla para la columna `delegation_name`.

## 🛠️ Solución

### Opción 1: Ejecutar el Script SQL (Recomendado)

1. **Ve a tu dashboard de Supabase**
2. **Abre el SQL Editor**
3. **Copia y pega el contenido de `fix-database.sql`**
4. **Ejecuta el script**

### Opción 2: Ejecutar Solo la Función

Si solo quieres arreglar la función:

```sql
-- Corregir la función get_zone_by_delegation
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
```

## ✅ Verificación

Después de ejecutar el script, deberías ver:

```
✅ Todas las tablas necesarias existen
✅ Zone result for Coyoacán: 1
✅ FUNCIONA
```

## 🧪 Prueba la Función

```sql
-- Probar con Coyoacán
SELECT get_zone_by_delegation('Coyoacán') as zone_id;

-- Debería retornar: 1
```

## 📊 Estado Actual de la Base de Datos

Según el test:
- ✅ **Zones:** 5 zonas (Centro, Norte, Sur, Este, Oeste)
- ✅ **Delegaciones:** 18 delegaciones mapeadas
- ✅ **Coyoacán:** Mapeado a zona '1' (Centro)
- ❌ **Función:** Necesita corrección

## 🚀 Después de la Corrección

1. **El registro de vendors funcionará** con delegación "Coyoacán"
2. **No más errores 500** en el endpoint `/api/vendors/register`
3. **Todas las delegaciones funcionarán** correctamente

## 📝 Notas Técnicas

- **Problema:** Ambigüedad en columna SQL
- **Solución:** Alias explícito de tabla (`zd.delegation_name`)
- **Impacto:** Solo afecta la función RPC, no los datos
- **Tiempo de ejecución:** ~1 minuto
