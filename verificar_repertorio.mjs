import postgres from 'postgres';

const connectionString = 'postgresql://postgres.zdaotvmfbawmitajazgl:cBG%3FE8Fb_%3F%2BqEM%24@aws-0-us-west-2.pooler.supabase.com:5432/postgres';
const sql = postgres(connectionString, { ssl: 'require' });

async function verificar() {
    try {
        // Buscar cliente con nombre parecido a "micale"
        const clientes = await sql`
            SELECT id, nombre, codigo FROM clientes
            WHERE nombre ILIKE '%mica%'
            ORDER BY created_at DESC
        `;
        console.log('🔍 Clientes encontrados:');
        clientes.forEach(c => console.log(`   - ${c.nombre} (${c.codigo}) | ID: ${c.id}`));

        if (clientes.length === 0) {
            console.log('   ¡No se encontró ningún cliente con ese nombre!');
            await sql.end();
            return;
        }

        // Verificar repertorios asignados para cada cliente encontrado
        for (const cliente of clientes) {
            const rep = await sql`
                SELECT ra.cancion_id, ra.seleccionada, c.titulo, c.artista
                FROM repertorios_asignados ra
                JOIN canciones c ON c.id = ra.cancion_id
                WHERE ra.cliente_id = ${cliente.id}
                ORDER BY c.titulo
            `;
            console.log(`\n🎵 Repertorio de ${cliente.nombre} (${rep.length} canciones):`);
            if (rep.length === 0) {
                console.log('   ❌ No tiene canciones asignadas en la BD');
            } else {
                rep.forEach(r => console.log(`   ✅ ${r.titulo} - ${r.artista} ${r.seleccionada ? '(♥ seleccionada)' : ''}`));
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sql.end();
    }
}

verificar();
