// Script para crear tabla recibos_anticipos via PostgreSQL
import postgres from 'postgres';

const connectionString = 'postgresql://postgres.zdaotvmfbawmitajazgl:cBG%3FE8Fb_%3F%2BqEM%24@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, {
    ssl: 'require'
});

async function createRecibosTable() {
    console.log('🚀 Conectando a Supabase...\n');

    try {
        const result = await sql`SELECT version()`;
        console.log('✅ Conectado a PostgreSQL\n');

        // Crear tabla recibos_anticipos
        console.log('📦 Creando tabla: recibos_anticipos...');
        await sql`
            CREATE TABLE IF NOT EXISTS recibos_anticipos (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                folio SERIAL,
                solicitud_id UUID REFERENCES solicitudes(id) ON DELETE SET NULL,
                cliente_nombre TEXT NOT NULL,
                cliente_telefono TEXT,
                monto DECIMAL(10,2) NOT NULL,
                concepto TEXT NOT NULL,
                fecha_evento DATE,
                metodo_pago TEXT DEFAULT 'efectivo',
                notas TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        console.log('   ✅ recibos_anticipos creada');

        // Habilitar RLS
        console.log('\n🔒 Configurando Row Level Security...');
        await sql`ALTER TABLE recibos_anticipos ENABLE ROW LEVEL SECURITY`;

        // Crear política
        console.log('📜 Creando políticas de acceso...');
        try {
            await sql.unsafe(`CREATE POLICY "Acceso completo recibos" ON recibos_anticipos FOR ALL USING (true)`);
        } catch (e) { /* ya existe */ }

        console.log('   ✅ Políticas configuradas');
        console.log('\n🎉 ¡TABLA recibos_anticipos CREADA EXITOSAMENTE!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sql.end();
    }
}

createRecibosTable();
