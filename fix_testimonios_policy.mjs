import postgres from 'postgres';

const connectionString = 'postgresql://postgres.zdaotvmfbawmitajazgl:cBG%3FE8Fb_%3F%2BqEM%24@aws-0-us-west-2.pooler.supabase.com:5432/postgres';
const sql = postgres(connectionString, { ssl: 'require' });

async function fixStorage() {
    console.log('=== ARREGLANDO STORAGE ===\n');

    // 1. Check current storage policies
    console.log('1. Políticas de storage actuales:');
    const policies = await sql`
        SELECT policyname, cmd, permissive, roles, qual, with_check 
        FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
        AND (policyname LIKE '%testimonios%' OR policyname LIKE '%fotos%')
    `;
    for (const p of policies) {
        console.log(`   ${p.policyname} | ${p.cmd} | roles: ${p.roles}`);
    }

    // 2. Drop all old storage policies for this bucket
    console.log('\n2. Eliminando políticas viejas...');
    for (const p of policies) {
        await sql.unsafe(`DROP POLICY IF EXISTS "${p.policyname}" ON storage.objects`);
        console.log(`   Eliminada: ${p.policyname}`);
    }

    // 3. Create proper policies
    console.log('\n3. Creando políticas correctas...');

    await sql.unsafe(`CREATE POLICY "testimonios_fotos_select" ON storage.objects FOR SELECT USING (bucket_id = 'testimonios-fotos')`);
    console.log('   ✅ SELECT');

    await sql.unsafe(`CREATE POLICY "testimonios_fotos_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'testimonios-fotos')`);
    console.log('   ✅ INSERT');

    await sql.unsafe(`CREATE POLICY "testimonios_fotos_update" ON storage.objects FOR UPDATE USING (bucket_id = 'testimonios-fotos') WITH CHECK (bucket_id = 'testimonios-fotos')`);
    console.log('   ✅ UPDATE');

    await sql.unsafe(`CREATE POLICY "testimonios_fotos_delete" ON storage.objects FOR DELETE USING (bucket_id = 'testimonios-fotos')`);
    console.log('   ✅ DELETE');

    console.log('\n🎉 ¡Storage arreglado!');
    await sql.end();
}

fixStorage();
