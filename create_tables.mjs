// Script para crear tablas via PostgreSQL Session Pooler (IPv4 compatible)
import postgres from 'postgres';

// Session Pooler URL CORRECTA (IPv4 compatible)
// Host: aws-0-us-west-2.pooler.supabase.com
// User: postgres.zdaotvmfbawmitajazgl
// Password: cBG?E8Fb_?+qEM$ (URL encoded)
const connectionString = 'postgresql://postgres.zdaotvmfbawmitajazgl:cBG%3FE8Fb_%3F%2BqEM%24@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, {
    ssl: 'require'
});

async function createTables() {
    console.log('🚀 Conectando a Supabase via Session Pooler (IPv4)...\n');

    try {
        // Verificar conexión
        const result = await sql`SELECT version()`;
        console.log('✅ Conectado a PostgreSQL');
        console.log(`   Versión: ${result[0].version.split(' ').slice(0, 2).join(' ')}\n`);

        // Crear tabla canciones
        console.log('📦 Creando tabla: canciones...');
        await sql`
            CREATE TABLE IF NOT EXISTS canciones (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                titulo VARCHAR(255) NOT NULL,
                artista VARCHAR(255) NOT NULL,
                categoria VARCHAR(100) NOT NULL,
                audio_url TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        console.log('   ✅ canciones creada');

        // Crear tabla clientes
        console.log('📦 Creando tabla: clientes...');
        await sql`
            CREATE TABLE IF NOT EXISTS clientes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                nombre VARCHAR(255) NOT NULL,
                codigo VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(255),
                telefono VARCHAR(50),
                tipo_evento VARCHAR(100),
                fecha_evento DATE,
                notas TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        console.log('   ✅ clientes creada');

        // Crear tabla repertorios_asignados
        console.log('📦 Creando tabla: repertorios_asignados...');
        await sql`
            CREATE TABLE IF NOT EXISTS repertorios_asignados (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
                cancion_id UUID NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
                seleccionada BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(cliente_id, cancion_id)
            )
        `;
        console.log('   ✅ repertorios_asignados creada');

        // Habilitar RLS
        console.log('\n🔒 Configurando Row Level Security...');
        await sql`ALTER TABLE canciones ENABLE ROW LEVEL SECURITY`;
        await sql`ALTER TABLE clientes ENABLE ROW LEVEL SECURITY`;
        await sql`ALTER TABLE repertorios_asignados ENABLE ROW LEVEL SECURITY`;
        console.log('   ✅ RLS habilitado');

        // Crear políticas
        console.log('\n📜 Creando políticas de acceso...');

        // Políticas para canciones
        try {
            await sql.unsafe(`CREATE POLICY "Lectura pública canciones" ON canciones FOR SELECT USING (true)`);
        } catch (e) { /* ya existe */ }
        try {
            await sql.unsafe(`CREATE POLICY "Escritura canciones" ON canciones FOR ALL USING (true)`);
        } catch (e) { /* ya existe */ }

        // Políticas para clientes
        try {
            await sql.unsafe(`CREATE POLICY "Lectura pública clientes" ON clientes FOR SELECT USING (true)`);
        } catch (e) { /* ya existe */ }
        try {
            await sql.unsafe(`CREATE POLICY "Escritura clientes" ON clientes FOR ALL USING (true)`);
        } catch (e) { /* ya existe */ }

        // Políticas para repertorios
        try {
            await sql.unsafe(`CREATE POLICY "Lectura pública repertorios" ON repertorios_asignados FOR SELECT USING (true)`);
        } catch (e) { /* ya existe */ }
        try {
            await sql.unsafe(`CREATE POLICY "Escritura repertorios" ON repertorios_asignados FOR ALL USING (true)`);
        } catch (e) { /* ya existe */ }

        console.log('   ✅ Políticas configuradas');

        // Insertar datos de ejemplo
        console.log('\n🎵 Insertando canciones de ejemplo...');

        const canciones = [
            { titulo: 'Clair de Lune', artista: 'Debussy', categoria: 'Clásica' },
            { titulo: 'Canon in D', artista: 'Pachelbel', categoria: 'Clásica' },
            { titulo: 'A Thousand Years', artista: 'Christina Perri', categoria: 'Romántica' },
            { titulo: 'Perfect', artista: 'Ed Sheeran', categoria: 'Romántica' },
            { titulo: 'All of Me', artista: 'John Legend', categoria: 'Romántica' },
            { titulo: 'Here Comes the Sun', artista: 'The Beatles', categoria: 'Pop' },
            { titulo: 'La Vie en Rose', artista: 'Edith Piaf', categoria: 'Jazz' },
            { titulo: 'Fly Me to the Moon', artista: 'Frank Sinatra', categoria: 'Jazz' },
            { titulo: 'Ave María', artista: 'Schubert', categoria: 'Sacra' },
            { titulo: 'Hallelujah', artista: 'Leonard Cohen', categoria: 'Balada' },
            { titulo: 'Thinking Out Loud', artista: 'Ed Sheeran', categoria: 'Romántica' },
            { titulo: "Can't Help Falling in Love", artista: 'Elvis Presley', categoria: 'Romántica' }
        ];

        let inserted = 0;
        for (const cancion of canciones) {
            try {
                await sql`
                    INSERT INTO canciones (titulo, artista, categoria)
                    VALUES (${cancion.titulo}, ${cancion.artista}, ${cancion.categoria})
                `;
                inserted++;
            } catch (e) {
                // Duplicado, ignorar
            }
        }
        console.log(`   ✅ ${inserted} canciones nuevas insertadas`);

        // Verificar
        const count = await sql`SELECT COUNT(*) as total FROM canciones`;
        console.log(`\n📊 Total de canciones en la base de datos: ${count[0].total}`);

        console.log('\n🎉 ¡BASE DE DATOS CONFIGURADA EXITOSAMENTE!');
        console.log('\n   Tu aplicación ahora puede usar Supabase 🚀');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sql.end();
    }
}

createTables();
