# Storage Upload Fix - Vendor Avatar Upload Error

## ❌ Problema Original
```
POST https://pncwlterhkclvpgcbuce.supabase.co/storage/v1/object/vendor-wars/vendors/avatars/cdb9a1f3-54e3-4845-9466-7fc147f6f498.png 400 (Bad Request)
Storage upload error: StorageApiError: new row violates row-level security policy
```

## 🔧 Cambios Realizados

### 1. **Corregido Storage Service** (`src/services/storage.ts`)
- **Problema**: Cliente de Supabase usaba solo `anon` key, no tenía permisos para subir archivos
- **Solución**: Configurado para usar `SUPABASE_SERVICE_ROLE_KEY` cuando esté disponible
- **Fallback**: Si no hay service role key, usa anon key pero con mejor manejo de errores

### 2. **Corregido API de Registro** (`src/app/api/vendors/register/route.ts`)
- **Problema**: Usaba `ownerFid` en lugar del `ownerFidValue` validado
- **Solución**: Cambiado a usar `ownerFidValue` que ya está validado y verificado

### 3. **Mejoradas Políticas de Storage** (`supabase/storage-setup.sql`)
- **Problema**: Políticas de RLS muy restrictivas para uploads
- **Solución**: 
  - Políticas más específicas para `service_role`
  - Soporte para usuarios autenticados
  - Políticas específicas para `vendors/avatars/` folder

### 4. **Script de Actualización** (`scripts/update-storage-policies.ts`)
- Nuevo script para aplicar automáticamente las políticas de storage
- Ejecuta el SQL de `supabase/storage-setup.sql`
- Manejo de errores y logs detallados

### 5. **Package.json Scripts**
- Añadido: `"update:storage-policies": "npx tsx scripts/update-storage-policies.ts"`

## 🚀 Pasos para Completar la Corrección

### 1. **Configurar Variable de Entorno**
Añade a tu `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

> **¿Dónde encontrar el Service Role Key?**
> 1. Ve a tu proyecto en Supabase Dashboard
> 2. Settings → API
> 3. Copia el "service_role" key (¡NO el anon key!)

### 2. **Ejecutar Actualización de Políticas**
```bash
npm run update:storage-policies
```

### 3. **Verificar el Bucket**
Asegúrate de que el bucket `vendor-wars` existe en Supabase Storage:
1. Ve a Storage en tu Supabase Dashboard
2. Si no existe el bucket `vendor-wars`, créalo como público

### 4. **Rebuild y Test**
```bash
npm run build
npm run dev
```

Luego prueba registrar un vendor con imagen.

## 🔍 Verificación

### ✅ Checklist Post-Fix
- [ ] Variable `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] Script `update:storage-policies` ejecutado sin errores
- [ ] Bucket `vendor-wars` existe y es público
- [ ] Registro de vendor con imagen funciona
- [ ] No hay errores 400 de RLS policy

### 🧪 Test Manual
1. Ir a `/vendors/register`
2. Llenar formulario con imagen
3. Submitir
4. ✅ Debería subir la imagen sin errores de RLS
5. ✅ El vendor debería crearse correctamente

## 💡 Notas Técnicas

### Cambios en el Flujo de Upload
1. **Antes**: `anon` key → RLS policy violation → 400 error
2. **Ahora**: `service_role` key → bypass RLS → upload success

### Políticas de Seguridad
- Las políticas permiten tanto `service_role` como `authenticated` users
- Específicas para el path `vendors/avatars/`
- Mantienen seguridad pero permiten uploads necesarios

### Fallback Strategy
- Si no hay `service_role` key, usa `anon` key
- Si upload falla, retorna imagen por defecto de Unsplash
- El registro de vendor siempre funciona, con o sin imagen custom

## 🐛 Debugging

### Si el error persiste:
1. Verificar que `SUPABASE_SERVICE_ROLE_KEY` esté correctamente configurada
2. Revisar logs del script `update:storage-policies`
3. Verificar en Supabase Dashboard → Storage → Policies
4. Comprobar que el bucket `vendor-wars` existe

### Logs útiles:
```bash
# Para verificar variables de entorno
echo $SUPABASE_SERVICE_ROLE_KEY

# Para ver logs de storage service
# Revisar Network tab en Developer Tools
# Buscar el POST request que falla
```
