-- Crear bucket para archivos de audio
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audios', 'audios', true);

-- Política para permitir subir archivos
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'audios');

-- Política para permitir leer archivos
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (bucket_id = 'audios');
