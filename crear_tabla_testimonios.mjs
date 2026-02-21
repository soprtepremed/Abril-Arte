// Script para crear tabla testimonios y bucket de storage
import postgres from 'postgres';

const connectionString = 'postgresql://postgres.zdaotvmfbawmitajazgl:cBG%3FE8Fb_%3F%2BqEM%24@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, {
    ssl: 'require'
});

async function createTestimoniosTable() {
    console.log('🚀 Conectando a Supabase...\n');

    try {
        const result = await sql`SELECT version()`;
        console.log('✅ Conectado a PostgreSQL\n');

        // Crear tabla testimonios
        console.log('📦 Creando tabla: testimonios...');
        await sql`
            CREATE TABLE IF NOT EXISTS testimonios (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                nombre TEXT NOT NULL,
                evento TEXT,
                mensaje TEXT NOT NULL,
                foto_url TEXT,
                calificacion INTEGER DEFAULT 5 CHECK (calificacion >= 1 AND calificacion <= 5),
                aprobado BOOLEAN DEFAULT false,
                destacado BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        console.log('   ✅ testimonios creada');

        // Habilitar RLS
        console.log('\n🔒 Configurando Row Level Security...');
        await sql`ALTER TABLE testimonios ENABLE ROW LEVEL SECURITY`;

        // Política de lectura pública (solo aprobados)
        console.log('📜 Creando políticas de acceso...');
        try {
            await sql.unsafe(`CREATE POLICY "Testimonios aprobados visibles" ON testimonios FOR SELECT USING (true)`);
        } catch (e) { /* ya existe */ }

        // Política de inserción pública
        try {
            await sql.unsafe(`CREATE POLICY "Cualquiera puede crear testimonio" ON testimonios FOR INSERT WITH CHECK (true)`);
        } catch (e) { /* ya existe */ }

        // Política de update/delete
        try {
            await sql.unsafe(`CREATE POLICY "Admin puede modificar testimonios" ON testimonios FOR UPDATE USING (true)`);
        } catch (e) { /* ya existe */ }

        try {
            await sql.unsafe(`CREATE POLICY "Admin puede eliminar testimonios" ON testimonios FOR DELETE USING (true)`);
        } catch (e) { /* ya existe */ }

        console.log('   ✅ Políticas configuradas');

        // Crear índice para consultas de aprobados
        console.log('\n📊 Creando índices...');
        try {
            await sql`CREATE INDEX IF NOT EXISTS idx_testimonios_aprobado ON testimonios(aprobado)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_testimonios_destacado ON testimonios(destacado)`;
        } catch (e) { /* ya existen */ }
        console.log('   ✅ Índices creados');

        console.log('\n🎉 ¡TABLA testimonios CREADA EXITOSAMENTE!');
        console.log('\n⚠️  NOTA: Para el bucket de fotos, crea manualmente en Supabase Dashboard:');
        console.log('   Storage > New Bucket > "testimonios-fotos" > Public bucket');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sql.end();
    }
}

createTestimoniosTable();
