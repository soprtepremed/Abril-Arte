-- Agregar columnas para audio y link de video a la tabla canciones
ALTER TABLE canciones 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS link_video TEXT;
