import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://rrspxolhflisylffmgjn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyc3B4b2xoZmxpc3lsZmZtZ2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3NjkwNDAsImV4cCI6MjA1MzM0NTA0MH0.KxAhOUSg9cOyYP8dxfxed1cYtwqH9Kj2n45o0dpnrXw'
)

const { error } = await supabase
    .from('recibos_anticipos')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

if (error) {
    console.error('Error:', error.message)
} else {
    console.log('✓ Tabla recibos_anticipos vaciada exitosamente')
}
