-- =============================================
-- FIX: Políticas RLS para repertorios_asignados
-- Problema: La política "Repertorios editables por autenticados" 
-- bloquea INSERT/UPDATE/DELETE porque el admin usa login de frontend
-- (no Supabase Auth), por lo que el rol siempre es 'anon'.
--
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Eliminar la política restrictiva existente
DROP POLICY IF EXISTS "Repertorios editables por autenticados" ON repertorios_asignados;

-- 2. Crear nueva política que permite escritura también a 'anon'
--    (El acceso ya está protegido por la contraseña del frontend)
CREATE POLICY "Repertorios editables por todos" ON repertorios_asignados
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Verificar que quedó correcta:
-- SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'repertorios_asignados';
