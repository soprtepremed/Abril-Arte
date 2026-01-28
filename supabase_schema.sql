-- =============================================
-- ABRIL ARTE - Esquema de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Tabla: canciones (repertorio musical)
CREATE TABLE IF NOT EXISTS canciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    artista VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    tipo_evento VARCHAR(100),
    fecha_evento DATE,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: repertorios_asignados (canciones asignadas a cada cliente)
CREATE TABLE IF NOT EXISTS repertorios_asignados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    cancion_id UUID NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    seleccionada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cliente_id, cancion_id)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_repertorios_cliente ON repertorios_asignados(cliente_id);
CREATE INDEX IF NOT EXISTS idx_repertorios_cancion ON repertorios_asignados(cancion_id);
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_canciones_updated_at
    BEFORE UPDATE ON canciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- =============================================

-- Habilitar RLS
ALTER TABLE canciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE repertorios_asignados ENABLE ROW LEVEL SECURITY;

-- Políticas para canciones (lectura pública, escritura autenticada)
CREATE POLICY "Canciones visibles para todos" ON canciones
    FOR SELECT USING (true);

CREATE POLICY "Canciones editables por autenticados" ON canciones
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para clientes
CREATE POLICY "Clientes visibles para todos" ON clientes
    FOR SELECT USING (true);

CREATE POLICY "Clientes editables por autenticados" ON clientes
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para repertorios
CREATE POLICY "Repertorios visibles para todos" ON repertorios_asignados
    FOR SELECT USING (true);

CREATE POLICY "Repertorios editables por autenticados" ON repertorios_asignados
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =============================================

INSERT INTO canciones (titulo, artista, categoria) VALUES
    ('Clair de Lune', 'Debussy', 'Clásica'),
    ('Canon in D', 'Pachelbel', 'Clásica'),
    ('A Thousand Years', 'Christina Perri', 'Romántica'),
    ('Perfect', 'Ed Sheeran', 'Romántica'),
    ('All of Me', 'John Legend', 'Romántica'),
    ('Here Comes the Sun', 'The Beatles', 'Pop'),
    ('La Vie en Rose', 'Edith Piaf', 'Jazz'),
    ('Fly Me to the Moon', 'Frank Sinatra', 'Jazz'),
    ('Ave María', 'Schubert', 'Sacra'),
    ('Hallelujah', 'Leonard Cohen', 'Balada'),
    ('Thinking Out Loud', 'Ed Sheeran', 'Romántica'),
    ('Can''t Help Falling in Love', 'Elvis Presley', 'Romántica')
ON CONFLICT DO NOTHING;
