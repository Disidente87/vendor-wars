# Estructura de Carpetas para Bucket vendor-wars en Supabase Storage

## Bucket Principal: `vendor-wars`

Crear las siguientes carpetas manualmente en Supabase Storage:

```
vendor-wars/
├── vendors/
│   ├── avatars/           # Fotos de perfil de vendors
│   └── gallery/           # Fotos adicionales de vendors (futuro)
├── zones/
│   └── images/            # Imágenes de zonas (si necesitas)
├── users/
│   └── avatars/           # Avatars de usuarios (futuro)
└── temp/                  # Archivos temporales durante subida
```

## Convención de Nombres de Archivos

### Para Avatars de Vendors:
- **Ubicación**: `vendors/avatars/`
- **Formato**: `{vendor_id}.{extension}`
- **Ejemplo**: `vendors/avatars/123e4567-e89b-12d3-a456-426614174000.jpg`

### Para Imágenes de Galería (futuro):
- **Ubicación**: `vendors/gallery/`
- **Formato**: `{vendor_id}_{timestamp}.{extension}`
- **Ejemplo**: `vendors/gallery/123e4567-e89b-12d3-a456-426614174000_1703123456789.jpg`

## Configuración de Seguridad (RLS Policies)

Necesitarás configurar estas políticas en Supabase Storage:

1. **Lectura Pública**: Todos pueden ver las imágenes
2. **Escritura Restringida**: Solo usuarios autenticados pueden subir
3. **Actualización Restringida**: Solo el admin del vendor puede actualizar sus fotos

## Pasos para Crear en Supabase:

1. Ve a Storage en tu dashboard de Supabase
2. Busca el bucket `vendor-wars` (debería existir)
3. Dentro del bucket, crea estas carpetas una por una:
   - `vendors`
   - `vendors/avatars`
   - `vendors/gallery`
   - `zones`
   - `zones/images`
   - `users`
   - `users/avatars`
   - `temp`

## Políticas de Storage Recomendadas:

```sql
-- Permitir lectura pública de imágenes
CREATE POLICY "Public read access for vendor images" ON storage.objects
FOR SELECT USING (bucket_id = 'vendor-wars');

-- Permitir subida solo a usuarios autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vendor-wars' 
  AND auth.role() = 'authenticated'
);

-- Permitir actualización solo al dueño del vendor
CREATE POLICY "Vendor admins can update their images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'vendor-wars'
  AND auth.role() = 'authenticated'
  -- Aquí necesitarías lógica adicional para verificar ownership
);
```
