# Guía de Configuración de Supabase

Esta guía te ayudará a configurar Supabase para la aplicación TravelHub.

## 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en "New Project"
4. Completa los datos:
   - **Name**: TravelHub (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura y guárdala
   - **Region**: Selecciona la región más cercana a tus usuarios
   - **Pricing Plan**: Free tier es suficiente para comenzar
5. Haz clic en "Create new project"

## 2. Obtener Credenciales de API

1. Una vez creado el proyecto, ve a **Settings** (ícono de engranaje en la barra lateral)
2. Ve a **API**
3. Copia los siguientes valores:
   - **Project URL**: bajo "Project URL"
   - **anon public**: bajo "Project API keys"

4. Actualiza tu archivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu-project-url-aquí
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aquí
   ```

## 3. Configurar la Base de Datos

### Ejecutar el Schema

1. Ve a **SQL Editor** en la barra lateral de Supabase
2. Haz clic en "New query"
3. Abre el archivo `supabase/schema.sql` de este proyecto
4. Copia todo el contenido y pégalo en el editor SQL
5. Haz clic en "Run" (o presiona Cmd/Ctrl + Enter)
6. Espera a que se ejecute (puede tomar unos segundos)
7. Deberías ver "Success. No rows returned" si todo salió bien

### Ejecutar las Políticas RLS

1. En el **SQL Editor**, crea una nueva query
2. Abre el archivo `supabase/rls-policies.sql`
3. Copia todo el contenido y pégalo en el editor
4. Haz clic en "Run"
5. Verifica que no haya errores

## 4. Configurar Storage

### Crear Buckets

1. Ve a **Storage** en la barra lateral
2. Haz clic en "Create a new bucket" para cada uno de los siguientes:

#### Bucket: `avatars`
- **Name**: `avatars`
- **Public bucket**: ✅ Activado
- **File size limit**: 2 MB
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`

#### Bucket: `group-covers`
- **Name**: `group-covers`
- **Public bucket**: ✅ Activado
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`

#### Bucket: `photos`
- **Name**: `photos`
- **Public bucket**: ✅ Activado
- **File size limit**: 10 MB
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`, `image/heic`

#### Bucket: `travel-documents`
- **Name**: `travel-documents`
- **Public bucket**: ❌ Desactivado
- **File size limit**: 10 MB
- **Allowed MIME types**: `application/pdf`, `image/png`, `image/jpeg`, `image/jpg`

#### Bucket: `receipts`
- **Name**: `receipts`
- **Public bucket**: ❌ Desactivado
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/jpg`, `application/pdf`

### Configurar Políticas de Storage

Para cada bucket, necesitas configurar políticas de acceso. Aquí están las políticas recomendadas:

#### Políticas para `avatars`:
```sql
-- Permitir a usuarios autenticados subir sus propios avatares
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a usuarios actualizar su propio avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir acceso público de lectura
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Políticas para `photos`:
```sql
-- Permitir a miembros de grupo subir fotos
CREATE POLICY "Group members can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' AND
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = (storage.foldername(name))[1]::uuid
    AND user_id = auth.uid()
  )
);

-- Permitir acceso público de lectura
CREATE POLICY "Photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');
```

#### Políticas para `travel-documents`:
```sql
-- Permitir a miembros de grupo subir documentos
CREATE POLICY "Group members can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'travel-documents' AND
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = (storage.foldername(name))[1]::uuid
    AND user_id = auth.uid()
  )
);

-- Solo miembros pueden ver documentos
CREATE POLICY "Group members can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'travel-documents' AND
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = (storage.foldername(name))[1]::uuid
    AND user_id = auth.uid()
  )
);
```

## 5. Configurar Autenticación

1. Ve a **Authentication** > **Providers**
2. Asegúrate de que **Email** esté habilitado
3. (Opcional) Configura proveedores OAuth si los deseas:
   - Google
   - GitHub
   - etc.

### Configuración de Email

1. Ve a **Authentication** > **Email Templates**
2. Personaliza los templates si lo deseas:
   - Confirm signup
   - Reset password
   - Magic link

### URLs de Redirección

1. Ve a **Authentication** > **URL Configuration**
2. Agrega las siguientes URLs:
   - **Site URL**: `http://localhost:3000` (desarrollo) / `https://tu-dominio.com` (producción)
   - **Redirect URLs**:
     - `http://localhost:3000/**`
     - `https://tu-dominio.com/**`

## 6. Configurar Realtime (Opcional)

Si quieres habilitar actualizaciones en tiempo real:

1. Ve a **Database** > **Replication**
2. Habilita replicación para las tablas que necesites:
   - `group_notes` (para edición colaborativa)
   - `photo_comments` (para comentarios en tiempo real)
   - `expenses` y `expense_splits` (para gastos en tiempo real)

## 7. Crear el Primer Usuario Admin

Una vez que todo esté configurado:

1. Ejecuta la aplicación localmente: `npm run dev`
2. Regístrate con tu email
3. Ve a Supabase **Authentication** > **Users**
4. Encuentra tu usuario y copia su UUID
5. Ve al **SQL Editor** y ejecuta:
   ```sql
   UPDATE public.users
   SET role = 'admin'
   WHERE id = 'tu-user-uuid-aquí';
   ```
6. Ahora eres admin y puedes crear grupos, gestionar usuarios, etc.

## 8. Verificar la Configuración

Ejecuta las siguientes queries en el SQL Editor para verificar:

```sql
-- Verificar que las tablas se crearon correctamente
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar que las políticas RLS están activas
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verificar buckets de storage
SELECT name, public
FROM storage.buckets;
```

## Troubleshooting

### Error: "new row violates row-level security policy"
- Verifica que las políticas RLS estén correctamente configuradas
- Asegúrate de estar autenticado cuando intentas hacer operaciones

### Error: "relation does not exist"
- Asegúrate de haber ejecutado el schema.sql completamente
- Verifica que no haya errores en la ejecución del script

### No puedo subir archivos
- Verifica que los buckets estén creados
- Verifica que las políticas de storage estén configuradas
- Revisa los límites de tamaño y tipos MIME permitidos

## Próximos Pasos

Una vez completada la configuración:

1. Ejecuta `npm run dev` para iniciar la aplicación
2. Regístrate como usuario
3. Conviértete en admin (siguiendo el paso 7)
4. Comienza a crear grupos de viaje

¡Tu aplicación TravelHub está lista para usar!
