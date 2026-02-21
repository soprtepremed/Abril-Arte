import postgres from 'postgres';

const connectionString = 'postgresql://postgres.zdaotvmfbawmitajazgl:cBG%3FE8Fb_%3F%2BqEM%24@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, { ssl: 'require' });

async function createBucket() {
    console.log('🪣 Creando bucket testimonios-fotos...');
    try {
        await sql.unsafe(`INSERT INTO storage.buckets (id, name, public) VALUES ('testimonios-fotos', 'testimonios-fotos', true) ON CONFLICT DO NOTHING`);
        console.log('✅ Bucket creado');

        // Políticas de acceso
        const policies = [
            { name: 'Lectura publica fotos testimonios', op: 'SELECT' },
            { name: 'Subida publica fotos testimonios', op: 'INSERT' },
            { name: 'Borrado fotos testimonios', op: 'DELETE' },
        ];
        for (const p of policies) {
            try {
                await sql.unsafe(`CREATE POLICY "${p.name}" ON storage.objects FOR ${p.op} USING (bucket_id = 'testimonios-fotos')`);
            } catch (e) { /* ya existe */ }
        }
        // INSERT also needs WITH CHECK
        try {
            await sql.unsafe(`DROP POLICY "Subida publica fotos testimonios" ON storage.objects`);
            await sql.unsafe(`CREATE POLICY "Subida publica fotos testimonios" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'testimonios-fotos')`);
        } catch (e) { /* ya existe */ }
        console.log('✅ Políticas de storage creadas');
    } catch (e) {
        console.error('❌', e.message);
    } finally {
        await sql.end();
    }
}

createBucket();
