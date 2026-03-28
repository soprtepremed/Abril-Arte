// Script para corregir la política RLS de repertorios_asignados
// Ejecuta via PostgreSQL Session Pooler (IPv4 compatible)
import postgres from 'postgres';

const connectionString = 'postgresql://postgres.zdaotvmfbawmitajazgl:cBG%3FE8Fb_%3F%2BqEM%24@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, { ssl: 'require' });

async function fixRLS() {
    console.log('🔧 Conectando a Supabase...\n');
    try {
        await sql`SELECT 1`; // test conexión
        console.log('✅ Conexión exitosa\n');

        // 1. Ver políticas actuales
        console.log('📋 Políticas actuales en repertorios_asignados:');
        const policies = await sql`
            SELECT policyname, cmd, roles
            FROM pg_policies
            WHERE tablename = 'repertorios_asignados'
        `;
        policies.forEach(p => console.log(`   - [${p.cmd}] "${p.policyname}" → roles: ${p.roles}`));

        // 2. Eliminar política restrictiva
        console.log('\n🗑️  Eliminando política restrictiva...');
        try {
            await sql.unsafe(`DROP POLICY IF EXISTS "Repertorios editables por autenticados" ON repertorios_asignados`);
            console.log('   ✅ Eliminada "Repertorios editables por autenticados"');
        } catch (e) {
            console.log('   ℹ️  No existía esa política');
        }

        // 3. Crear política abierta (igual que canciones y clientes)
        console.log('\n📜 Creando política de escritura abierta...');
        try {
            await sql.unsafe(`CREATE POLICY "Escritura repertorios" ON repertorios_asignados FOR ALL USING (true) WITH CHECK (true)`);
            console.log('   ✅ Creada "Escritura repertorios" (ALL roles, USING true)');
        } catch (e) {
            if (e.message.includes('already exists')) {
                console.log('   ℹ️  Ya existía "Escritura repertorios" - OK');
            } else {
                throw e;
            }
        }

        // 4. Verificar estado final
        console.log('\n✅ Políticas finales en repertorios_asignados:');
        const finalPolicies = await sql`
            SELECT policyname, cmd, roles
            FROM pg_policies
            WHERE tablename = 'repertorios_asignados'
        `;
        finalPolicies.forEach(p => console.log(`   - [${p.cmd}] "${p.policyname}" → roles: ${p.roles}`));

        console.log('\n🎉 ¡Fix aplicado! La asignación de repertorios ya debe funcionar.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sql.end();
    }
}

fixRLS();
