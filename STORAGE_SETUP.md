# Configuración de Supabase Storage

Este documento explica cómo configurar los Storage Buckets necesarios para TravelHub.

## Storage Buckets Requeridos

TravelHub necesita los siguientes buckets para almacenar archivos:

### 1. `group-covers` (Público)
Para imágenes de portada de grupos de viaje.

**Pasos para crear:**

1. Ve a tu proyecto de Supabase
2. Click en **Storage** en el menú lateral
3. Click en **New bucket**
4. Configuración:
   - **Name**: `group-covers`
   - **Public bucket**: ✅ Activado (las imágenes deben ser públicas)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/*`
5. Click **Create bucket**

**Políticas de Storage (RLS):**

Después de crear el bucket, ve a **Policies** y agrega:

```sql
-- Policy: Cualquier usuario autenticado puede subir
CREATE POLICY "Authenticated users can upload group covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'group-covers');

-- Policy: Todos pueden ver las covers (público)
CREATE POLICY "Public group covers are viewable by everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'group-covers');

-- Policy: Usuarios pueden eliminar sus propias imágenes
CREATE POLICY "Users can delete their own group covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'group-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 2. `avatars` (Público)
Para avatares de usuarios.

**Pasos para crear:**

1. En Storage, click **New bucket**
2. Configuración:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Activado
   - **File size limit**: 2 MB
   - **Allowed MIME types**: `image/*`
3. Click **Create bucket**

**Políticas:**

```sql
-- Policy: Usuarios pueden subir su propio avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Avatares son públicos
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Usuarios pueden actualizar su avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuarios pueden eliminar su avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 3. `photos` (Público)
Para fotos de viajes compartidas.

**Pasos para crear:**

1. En Storage, click **New bucket**
2. Configuración:
   - **Name**: `photos`
   - **Public bucket**: ✅ Activado
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `image/*`
3. Click **Create bucket**

**Políticas:**

```sql
-- Policy: Miembros del grupo pueden subir fotos
CREATE POLICY "Group members can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- Policy: Fotos son públicas
CREATE POLICY "Photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

-- Policy: Usuarios pueden eliminar sus propias fotos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 4. `travel-documents` (Privado)
Para documentos de viaje (tickets, reservas, etc.)

**Pasos para crear:**

1. En Storage, click **New bucket**
2. Configuración:
   - **Name**: `travel-documents`
   - **Public bucket**: ❌ Desactivado (privado)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document`
3. Click **Create bucket**

**Políticas:**

```sql
-- Policy: Miembros del grupo pueden subir documentos
CREATE POLICY "Group members can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'travel-documents');

-- Policy: Solo miembros del grupo pueden ver documentos
-- Nota: Esto es simplificado. En producción, deberías verificar membresía del grupo
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'travel-documents');

-- Policy: Usuarios pueden eliminar sus propios documentos
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'travel-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 5. `receipts` (Privado)
Para recibos de gastos.

**Pasos para crear:**

1. En Storage, click **New bucket**
2. Configuración:
   - **Name**: `receipts`
   - **Public bucket**: ❌ Desactivado (privado)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/*,application/pdf`
3. Click **Create bucket**

**Políticas:**

```sql
-- Policy: Miembros del grupo pueden subir recibos
CREATE POLICY "Group members can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

-- Policy: Miembros del grupo pueden ver recibos
CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'receipts');

-- Policy: Solo quien subió puede eliminar
CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Verificación Rápida

Para verificar que todo está configurado correctamente:

1. Ve a **Storage** en Supabase
2. Deberías ver 5 buckets:
   - ✅ `group-covers` (público)
   - ✅ `avatars` (público)
   - ✅ `photos` (público)
   - ✅ `travel-documents` (privado)
   - ✅ `receipts` (privado)

3. Cada bucket debe tener políticas RLS configuradas
4. Prueba subiendo una imagen desde la app

## Estructura de Carpetas en Buckets

### group-covers
```
group-covers/
└── {user-id}-{timestamp}.{ext}
```

### avatars
```
avatars/
└── {user-id}/
    └── avatar.{ext}
```

### photos
```
photos/
└── {group-id}/
    └── {user-id}-{timestamp}.{ext}
```

### travel-documents
```
travel-documents/
└── {group-id}/
    └── {document-id}.{ext}
```

### receipts
```
receipts/
└── {group-id}/
    └── {expense-id}/
        └── receipt.{ext}
```

---

## Comandos Útiles SQL

### Ver todos los buckets
```sql
SELECT * FROM storage.buckets;
```

### Ver políticas de un bucket
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'group-covers';
```

### Eliminar todas las políticas de un bucket (si necesitas reiniciar)
```sql
DELETE FROM storage.policies WHERE bucket_id = 'group-covers';
```

---

## Troubleshooting

### Error: "new row violates row-level security policy"
- Verifica que las políticas RLS estén creadas correctamente
- Asegúrate de estar autenticado
- Revisa que el bucket_id en las políticas coincida con el nombre del bucket

### Error: "File size limit exceeded"
- Verifica el límite configurado en el bucket
- Reduce el tamaño de la imagen antes de subir
- En la app, validamos 5MB para group-covers

### Imágenes no se muestran
- Verifica que el bucket sea público
- Revisa que la política SELECT esté configurada para `public`
- Asegúrate de usar `getPublicUrl()` en el código

---

## Próximos Pasos

Una vez configurado el storage:

1. ✅ Crear el bucket `group-covers` (requerido para crear grupos)
2. Probar crear un grupo con imagen
3. Configurar los otros buckets según vayas necesitándolos
4. Implementar las funciones de upload en la app

---

**Nota importante**: El bucket `group-covers` es **OBLIGATORIO** para que funcione la creación de grupos con imágenes. Los demás buckets puedes crearlos después según vayas implementando las features.
