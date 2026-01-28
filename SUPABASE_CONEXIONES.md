# 🔐 Credenciales de Supabase - Abril Arte

## Proyecto
- **Nombre:** Abril Arte
- **Email:** abrilruizlopez5@gmail.com
- **URL del Proyecto:** https://zdaotvmfbawmitajazgl.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/zdaotvmfbawmitajazgl

---

## API Keys

### Anon Key (Pública - para el frontend)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYW90dm1mYmF3bWl0YWphemdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NzE2MzgsImV4cCI6MjA4NTE0NzYzOH0.3UdkHNA_4G1aN-xwldxEr1bQFQlKNGDrcb0YtmbfKrg
```

### Service Role Key (Secreta - NUNCA en frontend)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYW90dm1mYmF3bWl0YWphemdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU3MTYzOCwiZXhwIjoyMDg1MTQ3NjM4fQ.QdfwuL3wmz3YarOLi6nvH1NB2JU7VrA809IVQ4-clMA
```

### Publishable Key
```
sb_publishable_O_qy4adlTvl_zLfA67WOgg_e1bxXoOj
```

---

## Conexión PostgreSQL

### Conexión Directa (requiere IPv6)
```
postgresql://postgres:[PASSWORD]@db.zdaotvmfbawmitajazgl.supabase.co:5432/postgres
```

### Session Pooler (✅ IPv4 Compatible)
```
postgresql://postgres.zdaotvmfbawmitajazgl:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

| Campo | Valor |
|-------|-------|
| Host | aws-0-us-west-2.pooler.supabase.com |
| Puerto | 5432 |
| Base de datos | postgres |
| Usuario | postgres.zdaotvmfbawmitajazgl |
| Pool Mode | session |

### Datos de Conexión Directa
| Campo | Valor |
|-------|-------|
| Host | db.zdaotvmfbawmitajazgl.supabase.co |
| Puerto | 5432 |
| Base de datos | postgres |
| Usuario | postgres |
| Contraseña | cBG?E8Fb_?+qEM$ |

---

## Uso en la Aplicación

### Variables de Entorno (.env)
```env
VITE_SUPABASE_URL=https://zdaotvmfbawmitajazgl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYW90dm1mYmF3bWl0YWphemdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NzE2MzgsImV4cCI6MjA4NTE0NzYzOH0.3UdkHNA_4G1aN-xwldxEr1bQFQlKNGDrcb0YtmbfKrg
```

---

## Tablas de la Base de Datos

| Tabla | Descripción |
|-------|-------------|
| `canciones` | Repertorio musical (título, artista, categoría, audio_url) |
| `clientes` | Clientes con código de acceso único |
| `repertorios_asignados` | Relación canciones-clientes |

---

## Notas Importantes

⚠️ **NUNCA** uses la Service Role Key en el frontend/código cliente
⚠️ La conexión directa PostgreSQL **NO funciona con IPv4** - usa la API REST
✅ La API REST (HTTPS) funciona correctamente
