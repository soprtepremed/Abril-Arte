import postgres from 'postgres'

// Conexión via Session Pooler (IPv4 compatible) - us-west-2
// Password: cBG?E8Fb_?+qEM$ URL-encoded
const connectionString = 'postgresql://postgres.zdaotvmfbawmitajazgl:cBG%3FE8Fb_%3F%2BqEM%24@aws-0-us-west-2.pooler.supabase.com:5432/postgres'

const sql = postgres(connectionString, {
    ssl: 'require',
    idle_timeout: 20,
    max_lifetime: 60 * 30
})

async function createSolicitudesTable() {
    console.log('🔄 Creando tabla de solicitudes...\n')

    try {
        // Crear tabla de solicitudes
        await sql`
            CREATE TABLE IF NOT EXISTS solicitudes (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                telefono VARCHAR(50),
                fecha_evento DATE,
                tipo_evento VARCHAR(100),
                formato_interes VARCHAR(100),
                mensaje TEXT,
                estado VARCHAR(50) DEFAULT 'pendiente',
                notas TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `
        console.log('✅ Tabla "solicitudes" creada')

        // Habilitar RLS
        await sql`ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY`
        console.log('✅ RLS habilitado')

        // Política para insertar (público)
        await sql`
            DROP POLICY IF EXISTS "Permitir insertar solicitudes" ON solicitudes
        `
        await sql`
            CREATE POLICY "Permitir insertar solicitudes" ON solicitudes
            FOR INSERT TO anon, authenticated
            WITH CHECK (true)
        `
        console.log('✅ Política de inserción creada')

        // Política para leer
        await sql`
            DROP POLICY IF EXISTS "Permitir leer solicitudes" ON solicitudes
        `
        await sql`
            CREATE POLICY "Permitir leer solicitudes" ON solicitudes
            FOR SELECT TO anon, authenticated
            USING (true)
        `
        console.log('✅ Política de lectura creada')

        // Política para actualizar
        await sql`
            DROP POLICY IF EXISTS "Permitir actualizar solicitudes" ON solicitudes
        `
        await sql`
            CREATE POLICY "Permitir actualizar solicitudes" ON solicitudes
            FOR UPDATE TO anon, authenticated
            USING (true)
            WITH CHECK (true)
        `
        console.log('✅ Política de actualización creada')

        // Política para eliminar
        await sql`
            DROP POLICY IF EXISTS "Permitir eliminar solicitudes" ON solicitudes
        `
        await sql`
            CREATE POLICY "Permitir eliminar solicitudes" ON solicitudes
            FOR DELETE TO anon, authenticated
            USING (true)
        `
        console.log('✅ Política de eliminación creada')

        console.log('\n🎉 ¡Tabla de solicitudes creada exitosamente!')

    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await sql.end()
    }
}

createSolicitudesTable()
