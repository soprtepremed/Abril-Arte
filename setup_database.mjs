// Script para crear las tablas en Supabase
// Ejecutar con: node setup_database.mjs

const SUPABASE_URL = 'https://zdaotvmfbawmitajazgl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'NECESITAS_SERVICE_KEY';

const sql = `
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

-- Tabla: repertorios_asignados
CREATE TABLE IF NOT EXISTS repertorios_asignados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    cancion_id UUID NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    seleccionada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cliente_id, cancion_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_repertorios_cliente ON repertorios_asignados(cliente_id);
CREATE INDEX IF NOT EXISTS idx_repertorios_cancion ON repertorios_asignados(cancion_id);
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo);
`;

const sampleData = `
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
`;

async function executeSQL(query) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ query })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error: ${response.status} - ${error}`);
    }

    return await response.json();
}

async function main() {
    console.log('🚀 Configurando base de datos de Abril Arte...\n');

    try {
        console.log('📦 Creando tablas...');
        await executeSQL(sql);
        console.log('✅ Tablas creadas\n');

        console.log('🎵 Insertando canciones de ejemplo...');
        await executeSQL(sampleData);
        console.log('✅ Datos de ejemplo insertados\n');

        console.log('🎉 ¡Base de datos configurada exitosamente!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Alternativa: Copia el contenido de supabase_schema.sql');
        console.log('   y ejecútalo manualmente en Supabase SQL Editor');
    }
}

main();
