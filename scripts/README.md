# Scripts de Test - Enfoque On-Demand

## 🎯 Filosofía

En lugar de mantener muchos scripts de test específicos, generamos scripts de test según sea necesario para casos específicos.

## 📁 Scripts Esenciales

- `dev.js` - Servidor de desarrollo
- `deploy.ts` - Despliegue a producción
- `setup-supabase.ts` - Configuración inicial de Supabase
- `check-database-status.ts` - Verificación de estado de la DB
- `seed-simplified.ts` - Seed de base de datos
- `test-comprehensive.ts` - Test comprehensivo del sistema
- `test-template.ts` - Plantilla para nuevos tests

## 🚀 Generando Tests Específicos

### 1. Usar la plantilla
```bash
cp scripts/test-template.ts scripts/test-[caso-especifico].ts
```

### 2. Agregar al package.json
```json
{
  "scripts": {
    "test:[caso-especifico]": "npx tsx scripts/test-[caso-especifico].ts"
  }
}
```

### 3. Ejecutar el test
```bash
npm run test:[caso-especifico]
```

## 📋 Casos Comunes

### Test de Votación
- Verificar inserción de votos
- Probar restricciones únicas
- Validar actualización de estadísticas

### Test de Esquema
- Verificar estructura de tablas
- Validar tipos de datos
- Comprobar restricciones

### Test de Integración
- Probar flujo completo de votación
- Validar sincronización Redis-DB
- Verificar manejo de errores

## 🧹 Limpieza

Después de resolver un problema específico, puedes eliminar el script de test temporal:

```bash
rm scripts/test-[caso-especifico].ts
```

Y remover la entrada del package.json.

## 💡 Beneficios

- ✅ Código más limpio
- ✅ Mantenimiento más fácil
- ✅ Tests específicos para cada problema
- ✅ Sin scripts obsoletos
- ✅ Enfoque más ágil
