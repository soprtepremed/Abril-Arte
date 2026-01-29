import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DataContext = createContext()

const categories = ['Clásica', 'Romántica', 'Pop', 'Jazz', 'Sacra', 'Balada', 'Rock', 'Latina', 'Instrumental', 'Bolero', 'Otro']

export function DataProvider({ children }) {
    const [songs, setSongs] = useState([])
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)

    // Cargar datos al iniciar
    useEffect(() => {
        loadSongs()
        loadClients()
    }, [])

    // ========================================
    // CANCIONES
    // ========================================
    const loadSongs = async () => {
        try {
            const { data, error } = await supabase
                .from('canciones')
                .select('*')
                .order('titulo')

            if (error) throw error

            // Mapear campos de la BD a formato de la app
            const mappedSongs = data.map(s => ({
                id: s.id,
                title: s.titulo,
                artist: s.artista,
                category: s.categoria,
                audioUrl: s.audio_url || ''
            }))

            setSongs(mappedSongs)
        } catch (error) {
            console.error('Error cargando canciones:', error)
        } finally {
            setLoading(false)
        }
    }

    const addSong = async (song) => {
        try {
            const { data, error } = await supabase
                .from('canciones')
                .insert({
                    titulo: song.title,
                    artista: song.artist,
                    categoria: song.category,
                    audio_url: song.audioUrl || null
                })
                .select()
                .single()

            if (error) throw error

            const newSong = {
                id: data.id,
                title: data.titulo,
                artist: data.artista,
                category: data.categoria,
                audioUrl: data.audio_url || ''
            }

            setSongs(prev => [...prev, newSong])
            return newSong
        } catch (error) {
            console.error('Error agregando canción:', error)
            return null
        }
    }

    const updateSong = async (id, updates) => {
        try {
            const { error } = await supabase
                .from('canciones')
                .update({
                    titulo: updates.title,
                    artista: updates.artist,
                    categoria: updates.category,
                    audio_url: updates.audioUrl || null
                })
                .eq('id', id)

            if (error) throw error

            setSongs(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
        } catch (error) {
            console.error('Error actualizando canción:', error)
        }
    }

    const deleteSong = async (id) => {
        try {
            const { error } = await supabase
                .from('canciones')
                .delete()
                .eq('id', id)

            if (error) throw error

            setSongs(prev => prev.filter(s => s.id !== id))
        } catch (error) {
            console.error('Error eliminando canción:', error)
        }
    }

    // ========================================
    // CLIENTES
    // ========================================
    const loadClients = async () => {
        try {
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            const mappedClients = data.map(c => ({
                id: c.id,
                name: c.nombre,
                code: c.codigo,
                email: c.email || '',
                phone: c.telefono || '',
                eventType: c.tipo_evento || '',
                eventDate: c.fecha_evento || '',
                notes: c.notas || '',
                createdAt: c.created_at
            }))

            setClients(mappedClients)
        } catch (error) {
            console.error('Error cargando clientes:', error)
        }
    }

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = 'AA-'
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
    }

    const addClient = async (client) => {
        try {
            const code = generateCode()

            const { data, error } = await supabase
                .from('clientes')
                .insert({
                    nombre: client.name,
                    codigo: code,
                    email: client.email || null,
                    telefono: client.phone || null,
                    tipo_evento: client.eventType || null,
                    fecha_evento: client.eventDate || null,
                    notas: client.notes || null
                })
                .select()
                .single()

            if (error) throw error

            const newClient = {
                id: data.id,
                name: data.nombre,
                code: data.codigo,
                email: data.email || '',
                phone: data.telefono || '',
                eventType: data.tipo_evento || '',
                eventDate: data.fecha_evento || '',
                notes: data.notas || '',
                createdAt: data.created_at
            }

            setClients(prev => [newClient, ...prev])
            return newClient
        } catch (error) {
            console.error('Error agregando cliente:', error)
            return null
        }
    }

    const updateClient = async (id, updates) => {
        try {
            const { error } = await supabase
                .from('clientes')
                .update({
                    nombre: updates.name,
                    email: updates.email || null,
                    telefono: updates.phone || null,
                    tipo_evento: updates.eventType || null,
                    fecha_evento: updates.eventDate || null,
                    notas: updates.notes || null
                })
                .eq('id', id)

            if (error) throw error

            setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
        } catch (error) {
            console.error('Error actualizando cliente:', error)
        }
    }

    const deleteClient = async (id) => {
        try {
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', id)

            if (error) throw error

            setClients(prev => prev.filter(c => c.id !== id))
        } catch (error) {
            console.error('Error eliminando cliente:', error)
        }
    }

    const getClientByCode = (code) => {
        return clients.find(c => c.code.toUpperCase() === code.toUpperCase())
    }

    const fetchClientByCode = async (code) => {
        // 1. Buscar en estado local
        const local = clients.find(c => c.code.toUpperCase() === code.toUpperCase())
        if (local) return local

        // 2. Si no está, buscar en DB
        try {
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .ilike('codigo', code) // Case insensitive
                .single()

            if (error || !data) return null

            const mapped = {
                id: data.id,
                name: data.nombre,
                code: data.codigo,
                email: data.email || '',
                phone: data.telefono || '',
                eventType: data.tipo_evento || '',
                eventDate: data.fecha_evento || '',
                notes: data.notas || '',
                createdAt: data.created_at
            }

            // Actualizar estado local
            setClients(prev => {
                if (prev.find(c => c.id === mapped.id)) return prev
                return [mapped, ...prev]
            })

            return mapped
        } catch (e) {
            console.error('Error fetching client code:', e)
            return null
        }
    }

    // ========================================
    // REPERTORIOS ASIGNADOS
    // ========================================
    const getClientRepertory = async (clientId) => {
        try {
            const { data, error } = await supabase
                .from('repertorios_asignados')
                .select('cancion_id, seleccionada')
                .eq('cliente_id', clientId)

            if (error) throw error

            return {
                assignedSongs: data.map(r => r.cancion_id),
                selectedSongs: data.filter(r => r.seleccionada).map(r => r.cancion_id)
            }
        } catch (error) {
            console.error('Error obteniendo repertorio:', error)
            return { assignedSongs: [], selectedSongs: [] }
        }
    }

    const setAssignedSongs = async (clientId, songIds) => {
        // Legacy support o uso futuro si quieres pre-asignar
        // Por ahora mantenemos la lógica pero no es crítica en el nuevo flujo
        try {
            const { data: current } = await supabase
                .from('repertorios_asignados')
                .select('cancion_id')
                .eq('cliente_id', clientId)

            const currentIds = current?.map(r => r.cancion_id) || []
            const toDelete = currentIds.filter(id => !songIds.includes(id))
            const toAdd = songIds.filter(id => !currentIds.includes(id))

            if (toDelete.length > 0) {
                await supabase
                    .from('repertorios_asignados')
                    .delete()
                    .eq('cliente_id', clientId)
                    .in('cancion_id', toDelete)
            }

            if (toAdd.length > 0) {
                await supabase
                    .from('repertorios_asignados')
                    .insert(toAdd.map(songId => ({
                        cliente_id: clientId,
                        cancion_id: songId,
                        seleccionada: false
                    })))
            }
        } catch (error) {
            console.error('Error asignando canciones:', error)
        }
    }

    const setSelectedSongs = async (clientId, selectedIds) => {
        try {
            // Obtener registros existentes para este cliente
            const { data: existingRows, error: fetchError } = await supabase
                .from('repertorios_asignados')
                .select('cancion_id')
                .eq('cliente_id', clientId)

            if (fetchError) throw fetchError

            const existingIds = existingRows?.map(r => r.cancion_id) || []

            // 1. Insertar registros para canciones seleccionadas que no existían
            const toInsert = selectedIds.filter(id => !existingIds.includes(id))
            if (toInsert.length > 0) {
                const { error: insertError } = await supabase.from('repertorios_asignados').insert(
                    toInsert.map(songId => ({
                        cliente_id: clientId,
                        cancion_id: songId,
                        seleccionada: true
                    }))
                )
                if (insertError) throw insertError
            }

            // 2. Actualizar a TRUE las que ya existían y están seleccionadas
            const toUpdateTrue = selectedIds.filter(id => existingIds.includes(id))
            if (toUpdateTrue.length > 0) {
                const { error: updateTrueError } = await supabase.from('repertorios_asignados')
                    .update({ seleccionada: true })
                    .eq('cliente_id', clientId)
                    .in('cancion_id', toUpdateTrue)
                if (updateTrueError) throw updateTrueError
            }

            // 3. Actualizar a FALSE las que existen pero YA NO están seleccionadas
            const toUpdateFalse = existingIds.filter(id => !selectedIds.includes(id))
            if (toUpdateFalse.length > 0) {
                const { error: updateFalseError } = await supabase.from('repertorios_asignados')
                    .update({ seleccionada: false })
                    .eq('cliente_id', clientId)
                    .in('cancion_id', toUpdateFalse)
                if (updateFalseError) throw updateFalseError
            }

        } catch (error) {
            console.error('Error guardando selección:', error)
            throw error // Re-throw para que el caller pueda manejarlo
        }
    }

    const value = {
        songs,
        clients,
        categories,
        loading,
        addSong,
        updateSong,
        deleteSong,
        addClient,
        updateClient,
        deleteClient,
        getClientByCode,
        fetchClientByCode,
        getClientRepertory,
        setAssignedSongs,
        setSelectedSongs,
        refreshSongs: loadSongs,
        refreshClients: loadClients
    }

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    )
}

export const useData = () => useContext(DataContext)
