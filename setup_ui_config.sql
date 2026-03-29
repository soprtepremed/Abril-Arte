-- =============================================
-- CONFIGURACIÓN UI Y STORAGE PARA IMÁGENES
-- =============================================

-- 1. Crear Bucket para activos de la landing (si no existe)
-- Nota: Esto puede requerir permisos de superusuario en el Dashboard
INSERT INTO storage.buckets (id, name, public) 
VALUES ('landing-assets', 'landing-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir acceso público a los archivos del bucket
CREATE POLICY "Acceso público landing-assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'landing-assets');

CREATE POLICY "Escritura landing-assets por todos" ON storage.objects
    FOR ALL TO anon, authenticated
    USING (bucket_id = 'landing-assets')
    WITH CHECK (bucket_id = 'landing-assets');

-- 3. Tabla de configuración persistente
CREATE TABLE IF NOT EXISTS configuracion_ui (
    clave VARCHAR(255) PRIMARY KEY,
    valor TEXT NOT NULL,
    categoria VARCHAR(100),
    descripcion TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE configuracion_ui ENABLE ROW LEVEL SECURITY;

-- 5. Políticas para configuracion_ui
-- Lectura permitida para todos
DROP POLICY IF EXISTS "Lectura pública configuracion_ui" ON configuracion_ui;
CREATE POLICY "Lectura pública configuracion_ui" ON configuracion_ui
    FOR SELECT USING (true);

-- Escritura permitida para anon (el admin de la app no usa Supabase Auth)
DROP POLICY IF EXISTS "Escritura configuracion_ui" ON configuracion_ui;
CREATE POLICY "Escritura configuracion_ui" ON configuracion_ui
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Insertar valores iniciales (opcional, actúan como fallback)
-- Se usarán las rutas estáticas si no se han subido nuevas imágenes
INSERT INTO configuracion_ui (clave, valor, categoria, descripcion) VALUES
    ('HERO_BG', '', 'portada', 'Imagen de fondo principal de la landing'),
    ('NOSOTROS_IMG', '', 'nosotros', 'Imagen de la sección Quiénes Somos'),
    ('SERVICIO_VIOLIN_IMG', '', 'servicios', 'Imagen para Abril Ruiz Violinista'),
    ('SERVICIO_TRIARTE_IMG', '', 'servicios', 'Imagen para TriArte Trío'),
    ('SERVICIO_DUO_IMG', '', 'servicios', 'Imagen para Dúo Violín y Saxofón')
ON CONFLICT (clave) DO NOTHING;
