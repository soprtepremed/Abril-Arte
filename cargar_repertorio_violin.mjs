import postgres from 'postgres'

// Conexión via Session Pooler (IPv4 compatible)
const connectionString = 'postgresql://postgres.zdaotvmfbawmitajazgl:cBG%3FE8Fb_%3F%2BqEM%24@aws-0-us-west-2.pooler.supabase.com:5432/postgres'

const sql = postgres(connectionString, {
    ssl: 'require',
    idle_timeout: 20,
    max_lifetime: 60 * 30
})

const canciones = [
    { titulo: 'Sin ti', artista: 'Luis Miguel', categoria: 'Violín Solo' },
    { titulo: 'Fly Me to the Moon', artista: 'Frank Sinatra', categoria: 'Violín Solo' },
    { titulo: 'Sarà perché ti amo', artista: 'Ricchi e Poveri', categoria: 'Violín Solo' },
    { titulo: 'Trío Bolero (Sabor a mí, Bésame mucho, Solamente una vez)', artista: 'Varios', categoria: 'Violín Solo' },
    { titulo: 'Medley (La vie en Rose, Beyond the sea, Blue Moon)', artista: 'Varios', categoria: 'Violín Solo' },
    { titulo: 'Chiquitita', artista: 'ABBA', categoria: 'Violín Solo' },
    { titulo: 'Viva la Vida', artista: 'Coldplay', categoria: 'Violín Solo' },
    { titulo: 'Die With a Smile', artista: 'Lady Gaga & Bruno Mars', categoria: 'Violín Solo' },
    { titulo: 'Flowers', artista: 'Miley Cyrus', categoria: 'Violín Solo' },
    { titulo: 'The Girl from Ipanema', artista: 'Antônio Carlos Jobim', categoria: 'Violín Solo' },
    { titulo: 'Yellow', artista: 'Coldplay', categoria: 'Violín Solo' },
    { titulo: 'A Thousand Years', artista: 'Christina Perri', categoria: 'Violín Solo' },
    { titulo: 'Fix You', artista: 'Coldplay', categoria: 'Violín Solo' },
    { titulo: 'Until I Found You', artista: 'Stephen Sanchez', categoria: 'Violín Solo' },
    { titulo: 'Somewhere Only We Know', artista: 'Keane', categoria: 'Violín Solo' },
    { titulo: 'Photograph', artista: 'Ed Sheeran', categoria: 'Violín Solo' },
    { titulo: 'A Sky Full of Stars', artista: 'Coldplay', categoria: 'Violín Solo' },
    { titulo: 'Golden Hour', artista: 'JVKE', categoria: 'Violín Solo' },
    { titulo: 'Just the Way You Are', artista: 'Bruno Mars', categoria: 'Violín Solo' },
    { titulo: 'All of Me', artista: 'John Legend', categoria: 'Violín Solo' },
    { titulo: 'Merry Go Round of Life', artista: 'Joe Hisaishi', categoria: 'Violín Solo' },
    { titulo: 'Por una Cabeza', artista: 'Carlos Gardel', categoria: 'Violín Solo' },
    { titulo: 'Close to You', artista: 'The Carpenters', categoria: 'Violín Solo' },
    { titulo: 'O Sole Mio', artista: 'Eduardo di Capua', categoria: 'Violín Solo' },
    { titulo: 'Lover', artista: 'Taylor Swift', categoria: 'Violín Solo' },
    { titulo: 'This Will Be', artista: 'Natalie Cole', categoria: 'Violín Solo' },
    { titulo: 'City of Stars', artista: 'La La Land', categoria: 'Violín Solo' },
    { titulo: 'Turning Page', artista: 'Sleeping At Last', categoria: 'Violín Solo' },
    { titulo: 'Mi Corazón Encantado', artista: 'Dragon Ball GT', categoria: 'Violín Solo' },
    { titulo: 'Sign of the Times', artista: 'Harry Styles', categoria: 'Violín Solo' },
    { titulo: 'Firework', artista: 'Katy Perry', categoria: 'Violín Solo' },
    { titulo: 'One and Only', artista: 'Adele', categoria: 'Violín Solo' },
    { titulo: 'Always Remember Us This Way', artista: 'Lady Gaga', categoria: 'Violín Solo' },
    { titulo: 'Hasta Mi Final', artista: 'Il Divo', categoria: 'Violín Solo' },
    { titulo: 'Married Life', artista: 'Up (Película)', categoria: 'Violín Solo' },
    { titulo: 'Marry You', artista: 'Bruno Mars', categoria: 'Violín Solo' },
    { titulo: 'Thinking Out Loud', artista: 'Ed Sheeran', categoria: 'Violín Solo' },
    { titulo: 'Por Ti Volaré', artista: 'Andrea Bocelli', categoria: 'Violín Solo' },
    { titulo: "Can't Take My Eyes Off You", artista: 'Frankie Valli', categoria: 'Violín Solo' },
    { titulo: 'Te regalo', artista: 'Carla Morrison', categoria: 'Violín Solo' },
    { titulo: 'Contigo', artista: 'Los Panchos', categoria: 'Violín Solo' },
]

async function insertarCanciones() {
    console.log('🎵 Insertando repertorio de Violín Solo...\n')

    try {
        let insertadas = 0
        let errores = 0

        for (const cancion of canciones) {
            try {
                await sql`
                    INSERT INTO canciones (title, artist, category)
                    VALUES (${cancion.titulo}, ${cancion.artista}, ${cancion.categoria})
                `
                console.log(`✅ ${cancion.titulo} - ${cancion.artista}`)
                insertadas++
            } catch (error) {
                if (error.code === '23505') { // Duplicate key
                    console.log(`⚠️  Ya existe: ${cancion.titulo}`)
                } else {
                    console.error(`❌ Error en ${cancion.titulo}:`, error.message)
                    errores++
                }
            }
        }

        console.log(`\n📊 Resumen:`)
        console.log(`   ✅ Insertadas: ${insertadas}`)
        console.log(`   ⚠️  Ya existían: ${canciones.length - insertadas - errores}`)
        console.log(`   ❌ Errores: ${errores}`)
        console.log(`\n🎉 ¡Proceso completado!`)

    } catch (error) {
        console.error('❌ Error general:', error.message)
    } finally {
        await sql.end()
    }
}

insertarCanciones()
