import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Music, Users, ListChecks, Plus, Edit, Trash2, Play, Copy, Check, X, Home, ArrowRight, ArrowLeft, Save, Loader2, MessageSquare, Phone, Calendar, Mail, Eye, EyeOff, LogOut, Heart, FileText, Printer, DollarSign } from 'lucide-react'
import { useData } from '../context/DataContext'
import { supabase } from '../lib/supabase'

export default function Admin() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('songs')
    const { songs, clients, categories, loading, addSong, updateSong, deleteSong, addClient, updateClient, deleteClient, getClientRepertory, setAssignedSongs } = useData()

    // Autenticación
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loginForm, setLoginForm] = useState({ username: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loginError, setLoginError] = useState('')

    // Verificar sesión guardada
    useEffect(() => {
        const session = localStorage.getItem('admin_session')
        if (session === 'authenticated') {
            setIsAuthenticated(true)
        }
    }, [])

    const handleLogin = (e) => {
        e.preventDefault()
        if (loginForm.username === 'abril.arte1' && loginForm.password === 'ilvolo25') {
            setIsAuthenticated(true)
            localStorage.setItem('admin_session', 'authenticated')
            setLoginError('')
        } else {
            setLoginError('Usuario o contraseña incorrectos')
        }
    }

    const handleLogout = () => {
        setIsAuthenticated(false)
        localStorage.removeItem('admin_session')
        setLoginForm({ username: '', password: '' })
        navigate('/')
    }

    // Modal states
    const [songModal, setSongModal] = useState({ open: false, song: null })
    const [clientModal, setClientModal] = useState({ open: false, client: null })
    const [selectedClient, setSelectedClient] = useState('')
    const [copiedCode, setCopiedCode] = useState('')

    // Song form
    const [songForm, setSongForm] = useState({ title: '', artist: '', category: '', audioUrl: '', linkVideo: '' })
    const [audioFile, setAudioFile] = useState(null)
    const [uploadingAudio, setUploadingAudio] = useState(false)
    const [clientForm, setClientForm] = useState({ name: '', email: '', phone: '', eventType: '', eventDate: '', notes: '' })

    // Repertory assignment
    const [availableSelected, setAvailableSelected] = useState([])
    const [assignedSelected, setAssignedSelected] = useState([])
    const [currentRepertory, setCurrentRepertory] = useState({ assignedSongs: [], selectedSongs: [] })
    const [clientRepertories, setClientRepertories] = useState({})

    // Solicitudes
    const [solicitudes, setSolicitudes] = useState([])
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(false)

    // Recibos de Anticipo
    const [reciboModal, setReciboModal] = useState({ open: false, solicitud: null, showPreview: false })
    const [reciboForm, setReciboForm] = useState({
        cliente_nombre: '',
        cliente_telefono: '',
        monto: '',
        concepto: '',
        fecha_evento: '',
        metodo_pago: 'efectivo',
        notas: ''
    })
    const [savingRecibo, setSavingRecibo] = useState(false)
    const [recibos, setRecibos] = useState([])
    const [loadingRecibos, setLoadingRecibos] = useState(false)


    // Cargar solicitudes
    useEffect(() => {
        const loadSolicitudes = async () => {
            setLoadingSolicitudes(true)
            const { data, error } = await supabase
                .from('solicitudes')
                .select('*')
                .order('created_at', { ascending: false })
            if (!error) setSolicitudes(data || [])
            setLoadingSolicitudes(false)
        }
        loadSolicitudes()
    }, [])

    // Cargar recibos cuando se activa la pestaña
    useEffect(() => {
        if (activeTab === 'recibos') {
            const loadRecibos = async () => {
                setLoadingRecibos(true)
                const { data, error } = await supabase
                    .from('recibos_anticipos')
                    .select('*')
                    .order('created_at', { ascending: false })
                if (!error) setRecibos(data || [])
                setLoadingRecibos(false)
            }
            loadRecibos()
        }
    }, [activeTab])

    const updateSolicitudEstado = async (id, estado) => {
        const { error } = await supabase
            .from('solicitudes')
            .update({ estado, updated_at: new Date().toISOString() })
            .eq('id', id)
        if (!error) {
            setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado } : s))
        }
    }

    const deleteSolicitud = async (id) => {
        if (!confirm('¿Eliminar esta solicitud?')) return
        const { error } = await supabase.from('solicitudes').delete().eq('id', id)
        if (!error) {
            setSolicitudes(prev => prev.filter(s => s.id !== id))
        }
    }

    // Abrir modal de recibo con datos pre-llenados
    const openReciboModal = (solicitud) => {
        setReciboForm({
            cliente_nombre: solicitud.nombre || '',
            cliente_telefono: solicitud.telefono || '',
            monto: '',
            concepto: `${solicitud.tipo_evento || 'Evento'} - ${solicitud.formato_interes || ''}`.trim(),
            fecha_evento: solicitud.fecha_evento || '',
            metodo_pago: 'efectivo',
            notas: ''
        })
        setReciboModal({ open: true, solicitud, showPreview: false })
    }

    // Guardar recibo en base de datos
    const saveRecibo = async () => {
        if (!reciboForm.monto || !reciboForm.concepto) {
            alert('Por favor ingresa el monto y concepto')
            return
        }
        setSavingRecibo(true)
        try {
            const { error } = await supabase.from('recibos_anticipos').insert({
                solicitud_id: reciboModal.solicitud?.id || null,
                cliente_nombre: reciboForm.cliente_nombre,
                cliente_telefono: reciboForm.cliente_telefono,
                monto: parseFloat(reciboForm.monto),
                concepto: reciboForm.concepto,
                fecha_evento: reciboForm.fecha_evento || null,
                metodo_pago: reciboForm.metodo_pago,
                notas: reciboForm.notas || null
            })
            if (error) throw error
            // Generate PDF and reset form
            generateReciboPDF()
            setReciboForm({ cliente_nombre: '', cliente_telefono: '', monto: '', concepto: '', fecha_evento: '', metodo_pago: 'efectivo', notas: '' })
        } catch (err) {
            alert('Error al guardar: ' + err.message)
        } finally {
            setSavingRecibo(false)
        }
    }

    // Generar PDF para imprimir - Estilo Ticket de Compra
    const generateReciboPDF = () => {
        const fechaEmision = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
        const horaEmision = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        const folio = `AA-${Date.now().toString().slice(-6)}`

        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Recibo - ${reciboForm.cliente_nombre}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&family=Playfair+Display:wght@600;700&display=swap');
                    @page { size: auto; margin: 10mm; }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Roboto Mono', monospace; 
                        background: #fff; 
                        color: #333;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    .ticket {
                        max-width: 400px;
                        margin: 0 auto;
                        padding: 20px;
                        background: #fff;
                    }
                    
                    /* Header */
                    .header {
                        text-align: center;
                        padding-bottom: 12px;
                        border-bottom: 2px dashed #C9A962;
                    }
                    .logo {
                        font-family: 'Playfair Display', serif;
                        font-size: 1.6rem;
                        font-weight: 700;
                        color: #C9A962;
                    }
                    .logo-note { color: #3D3426; }
                    .tagline {
                        font-size: 9px;
                        color: #666;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        margin-top: 3px;
                    }
                    
                    /* Folio y fecha */
                    .meta {
                        text-align: center;
                        padding: 10px 0;
                        border-bottom: 1px dashed #ddd;
                    }
                    .folio {
                        font-size: 14px;
                        font-weight: 700;
                        color: #333;
                    }
                    .fecha {
                        font-size: 10px;
                        color: #666;
                        margin-top: 3px;
                    }
                    
                    /* Título */
                    .titulo {
                        text-align: center;
                        padding: 12px 0;
                        font-size: 14px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        background: #3D3426;
                        color: #C9A962;
                        margin: 10px -15px;
                    }
                    
                    /* Datos */
                    .datos {
                        padding: 10px 0;
                    }
                    .row {
                        display: flex;
                        justify-content: space-between;
                        padding: 5px 0;
                        border-bottom: 1px dotted #eee;
                    }
                    .row:last-child { border-bottom: none; }
                    .label {
                        color: #888;
                        font-size: 10px;
                        text-transform: uppercase;
                    }
                    .value {
                        font-weight: 500;
                        color: #333;
                        text-align: right;
                        max-width: 60%;
                    }
                    
                    /* Monto */
                    .total-section {
                        background: #FAF7F2;
                        margin: 10px -15px;
                        padding: 15px;
                        text-align: center;
                        border-top: 2px dashed #C9A962;
                        border-bottom: 2px dashed #C9A962;
                    }
                    .total-label {
                        font-size: 10px;
                        color: #888;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .total-value {
                        font-size: 28px;
                        font-weight: 700;
                        color: #C9A962;
                        margin: 5px 0;
                    }
                    .total-text {
                        font-size: 9px;
                        color: #666;
                    }
                    
                    /* Notas */
                    .notas {
                        padding: 10px 0;
                        font-size: 10px;
                        color: #666;
                        text-align: center;
                        border-bottom: 1px dashed #ddd;
                    }
                    
                    /* Footer */
                    .footer {
                        padding: 12px 0;
                        text-align: center;
                    }
                    .gracias {
                        font-size: 12px;
                        font-weight: 700;
                        color: #3D3426;
                        margin-bottom: 5px;
                    }
                    .contacto {
                        font-size: 9px;
                        color: #888;
                        line-height: 1.5;
                    }
                    
                    /* Corte */
                    .corte {
                        text-align: center;
                        padding: 10px 0;
                        margin-top: 5px;
                    }
                    .corte-line {
                        border-top: 1px dashed #aaa;
                        position: relative;
                    }
                    .corte-text {
                        font-size: 8px;
                        color: #aaa;
                        margin-top: 5px;
                    }
                    
                    @media print { 
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">
                        <div class="logo"><span class="logo-note">♪</span> Abril Arte</div>
                        <div class="tagline">Música para Eventos Sociales</div>
                    </div>
                    
                    <div class="meta">
                        <div class="folio">${folio}</div>
                        <div class="fecha">${fechaEmision} • ${horaEmision}</div>
                    </div>
                    
                    <div class="titulo">Recibo de Anticipo</div>
                    
                    <div class="datos">
                        <div class="row">
                            <span class="label">Cliente</span>
                            <span class="value">${reciboForm.cliente_nombre}</span>
                        </div>
                        ${reciboForm.cliente_telefono ? `
                        <div class="row">
                            <span class="label">Tel</span>
                            <span class="value">${reciboForm.cliente_telefono}</span>
                        </div>` : ''}
                        <div class="row">
                            <span class="label">Concepto</span>
                            <span class="value">${reciboForm.concepto}</span>
                        </div>
                        ${reciboForm.fecha_evento ? `
                        <div class="row">
                            <span class="label">Evento</span>
                            <span class="value">${new Date(reciboForm.fecha_evento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>` : ''}
                        <div class="row">
                            <span class="label">Pago</span>
                            <span class="value">${reciboForm.metodo_pago.charAt(0).toUpperCase() + reciboForm.metodo_pago.slice(1)}</span>
                        </div>
                    </div>
                    
                    <div class="total-section">
                        <div class="total-label">Anticipo Recibido</div>
                        <div class="total-value">$${parseFloat(reciboForm.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                        <div class="total-text">MXN • Pesos Mexicanos</div>
                    </div>
                    
                    ${reciboForm.notas ? `
                    <div class="notas">
                        <strong>Notas:</strong> ${reciboForm.notas}
                    </div>` : ''}
                    
                    <div class="notas">
                        El saldo restante deberá cubrirse antes del evento.
                    </div>
                    
                    <div class="footer">
                        <div class="gracias">¡Gracias por su preferencia!</div>
                        <div class="contacto">
                            Abril Arte<br>
                            Tuxtla Gutiérrez, Chiapas
                        </div>
                    </div>
                    
                    <div class="corte">
                        <div class="corte-line"></div>
                        <div class="corte-text">✂ CONSERVE ESTE TICKET</div>
                    </div>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `)
        printWindow.document.close()
    }

    // Cargar repertorios de todos los clientes
    useEffect(() => {
        const loadAllRepertories = async () => {
            const reps = {}
            for (const client of clients) {
                const rep = await getClientRepertory(client.id)
                reps[client.id] = rep
            }
            setClientRepertories(reps)
        }
        if (clients.length > 0) {
            loadAllRepertories()
        }
    }, [clients])

    // Cargar repertorio cuando cambia el cliente seleccionado
    useEffect(() => {
        const loadRepertory = async () => {
            if (selectedClient) {
                const rep = await getClientRepertory(selectedClient)
                setCurrentRepertory(rep)
            } else {
                setCurrentRepertory({ assignedSongs: [], selectedSongs: [] })
            }
        }
        loadRepertory()
    }, [selectedClient])

    const openSongModal = (song = null) => {
        if (song) {
            setSongForm({ title: song.title, artist: song.artist, category: song.category, audioUrl: song.audioUrl || '', linkVideo: song.linkVideo || '' })
        } else {
            setSongForm({ title: '', artist: '', category: '', audioUrl: '', linkVideo: '' })
        }
        setAudioFile(null)
        setSongModal({ open: true, song })
    }

    // Subir archivo de audio a Supabase Storage
    const uploadAudio = async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
        const filePath = `canciones/${fileName}`

        const { data, error } = await supabase.storage
            .from('audios')
            .upload(filePath, file)

        if (error) {
            console.error('Error uploading:', error)
            throw error
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('audios')
            .getPublicUrl(filePath)

        return publicUrl
    }

    const saveSong = async (e) => {
        e.preventDefault()
        setUploadingAudio(true)

        try {
            let audioUrl = songForm.audioUrl

            // Si hay archivo seleccionado, subirlo primero
            if (audioFile) {
                audioUrl = await uploadAudio(audioFile)
            }

            const songData = { ...songForm, audioUrl }

            if (songModal.song) {
                await updateSong(songModal.song.id, songData)
            } else {
                await addSong(songData)
            }
            setSongModal({ open: false, song: null })
            setAudioFile(null)
        } catch (error) {
            alert('Error al guardar: ' + error.message)
        } finally {
            setUploadingAudio(false)
        }
    }

    const openClientModal = (client = null) => {
        if (client) {
            setClientForm({ name: client.name, email: client.email || '', phone: client.phone || '', eventType: client.eventType || '', eventDate: client.eventDate || '', notes: client.notes || '' })
        } else {
            setClientForm({ name: '', email: '', phone: '', eventType: '', eventDate: '', notes: '' })
        }
        setClientModal({ open: true, client })
    }

    const saveClient = async (e) => {
        e.preventDefault()
        if (clientModal.client) {
            await updateClient(clientModal.client.id, clientForm)
        } else {
            await addClient(clientForm)
        }
        setClientModal({ open: false, client: null })
    }

    const copyLink = (code) => {
        const link = `${window.location.origin}/cliente?code=${code}`
        navigator.clipboard.writeText(link)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(''), 2000)
    }

    const availableSongs = songs.filter(s => !currentRepertory.assignedSongs.includes(s.id))
    const assignedSongs = songs.filter(s => currentRepertory.assignedSongs.includes(s.id))

    const assignSongsToClient = async () => {
        if (!selectedClient || availableSelected.length === 0) return
        const newAssigned = [...currentRepertory.assignedSongs, ...availableSelected]
        await setAssignedSongs(selectedClient, newAssigned)
        setCurrentRepertory({ ...currentRepertory, assignedSongs: newAssigned })
        setAvailableSelected([])
    }

    const removeSongsFromClient = async () => {
        if (!selectedClient || assignedSelected.length === 0) return
        const newAssigned = currentRepertory.assignedSongs.filter(id => !assignedSelected.includes(id))
        await setAssignedSongs(selectedClient, newAssigned)
        setCurrentRepertory({ ...currentRepertory, assignedSongs: newAssigned })
        setAssignedSelected([])
    }

    const tabs = [
        { id: 'songs', label: 'Mi Repertorio', icon: Music },
        { id: 'clients', label: 'Clientes', icon: Users },
        { id: 'assign', label: 'Asignar Repertorio', icon: ListChecks },
        { id: 'solicitudes', label: 'Solicitudes', icon: MessageSquare, count: solicitudes.filter(s => s.estado === 'pendiente').length },
        { id: 'recibos', label: 'Recibos', icon: FileText },
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#C9A962] animate-spin mx-auto mb-4" />
                    <p className="text-[#6B5E4F]">Cargando datos...</p>
                </div>
            </div>
        )
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#FAF3EB] to-[#E8DDD4]">
                <div className="w-full max-w-md">
                    <div className="glass rounded-3xl p-10 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#C9A962] to-[#A68B3D] flex items-center justify-center shadow-xl animate-pulse-glow">
                                <Music className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="font-display text-3xl font-bold text-[#3D3426] mb-2">Panel de Administración</h1>
                            <p className="text-[#6B5E4F]">Ingresa tus credenciales para continuar</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[#3D3426] mb-2">Usuario</label>
                                <input
                                    type="text"
                                    value={loginForm.username}
                                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] bg-white/50 focus:border-[#C9A962] focus:outline-none transition-colors"
                                    placeholder="Ingresa tu usuario"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#3D3426] mb-2">Contraseña</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={loginForm.password}
                                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] bg-white/50 focus:border-[#C9A962] focus:outline-none transition-colors pr-12"
                                        placeholder="Ingresa tu contraseña"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#8B7D6B] hover:text-[#C9A962] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {loginError && (
                                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                                    <X className="w-5 h-5 flex-shrink-0" />
                                    {loginError}
                                </div>
                            )}

                            <button type="submit" className="btn-shine w-full py-4 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full shadow-lg shadow-[#C9A962]/30 text-lg">
                                Iniciar Sesión
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-[#E8DDD4] text-center">
                            <Link to="/" className="text-sm text-[#8B7D6B] hover:text-[#C9A962] transition-colors">
                                ← Volver al sitio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-4">
            {/* Header */}
            <header className="glass border-b border-[#C9A962]/20 px-6 py-4 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl text-[#C9A962]">♪</span>
                            <span className="font-display text-xl font-bold text-[#C9A962]">Abril Arte</span>
                        </Link>
                        <span className="text-[#8B7D6B]">|</span>
                        <h1 className="text-[#3D3426] font-semibold">Panel de Administración</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 text-[#6B5E4F] hover:text-[#C9A962] transition-colors">
                            <Home className="w-4 h-4" />
                            Ver Sitio
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar a la izquierda */}
                <aside className="w-56 flex-shrink-0 fixed left-0 top-20 h-[calc(100vh-5rem)] overflow-y-auto">
                    <nav className="glass m-4 rounded-2xl p-3 space-y-1 sticky top-24">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white shadow-lg shadow-[#C9A962]/30'
                                    : 'text-[#6B5E4F] hover:bg-[#E8DDD4]/50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="truncate">{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-56 px-8 py-8">
                    {/* Songs Tab */}
                    {activeTab === 'songs' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-2xl font-bold text-[#3D3426] flex items-center gap-3">
                                    <Music className="w-6 h-6 text-[#C9A962]" />
                                    Mi Repertorio de Canciones
                                </h2>
                                <button onClick={() => openSongModal()} className="btn-shine flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full shadow-lg">
                                    <Plus className="w-5 h-5" />
                                    Nueva Canción
                                </button>
                            </div>

                            {songs.length === 0 ? (
                                <div className="glass rounded-2xl p-12 text-center">
                                    <Music className="w-16 h-16 text-[#C9A962] mx-auto mb-4 opacity-50" />
                                    <p className="text-[#8B7D6B] mb-4">No hay canciones en tu repertorio</p>
                                    <button onClick={() => openSongModal()} className="btn-shine px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full">
                                        Agregar Primera Canción
                                    </button>
                                </div>
                            ) : (
                                <div className="glass rounded-2xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-[#FAF3EB]">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#3D3426] uppercase tracking-wider">Título</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#3D3426] uppercase tracking-wider">Artista</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#3D3426] uppercase tracking-wider">Categoría</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#3D3426] uppercase tracking-wider">Audio</th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-[#3D3426] uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E8DDD4]">
                                            {songs.map(song => (
                                                <tr key={song.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-[#3D3426]">{song.title}</td>
                                                    <td className="px-6 py-4 text-[#6B5E4F]">{song.artist}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-3 py-1 text-xs font-medium bg-[#E8DDD4] text-[#6B5E4F] rounded-full">{song.category}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {song.audioUrl ? (
                                                            <span className="flex items-center gap-1 text-green-600 text-sm"><Check className="w-4 h-4" /> Sí</span>
                                                        ) : (
                                                            <span className="text-[#A69A8A] text-sm">No</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <button onClick={() => openSongModal(song)} className="p-2 rounded-lg bg-[#FAF3EB] text-[#C9A962] hover:bg-[#C9A962] hover:text-white transition-colors">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => deleteSong(song.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Clients Tab */}
                    {activeTab === 'clients' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-2xl font-bold text-[#3D3426] flex items-center gap-3">
                                    <Users className="w-6 h-6 text-[#C9A962]" />
                                    Mis Clientes
                                </h2>
                                <button onClick={() => openClientModal()} className="btn-shine flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full shadow-lg">
                                    <Plus className="w-5 h-5" />
                                    Nuevo Cliente
                                </button>
                            </div>

                            {clients.length === 0 ? (
                                <div className="glass rounded-2xl p-12 text-center">
                                    <Users className="w-16 h-16 text-[#C9A962] mx-auto mb-4 opacity-50" />
                                    <p className="text-[#8B7D6B] mb-4">No hay clientes registrados</p>
                                    <button onClick={() => openClientModal()} className="btn-shine px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold rounded-full">
                                        Agregar Primer Cliente
                                    </button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {clients.map(client => {
                                        const rep = clientRepertories[client.id] || { assignedSongs: [], selectedSongs: [] }
                                        return (
                                            <div key={client.id} className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#C9A962]/30">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="font-semibold text-lg text-[#3D3426]">{client.name}</h3>
                                                    <span className="px-3 py-1 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white text-xs font-bold rounded-full">{client.code}</span>
                                                </div>
                                                <div className="space-y-2 text-sm text-[#6B5E4F] mb-4">
                                                    {client.email && <p>📧 {client.email}</p>}
                                                    {client.eventType && <p>🎉 {client.eventType}</p>}
                                                    {client.eventDate && <p>📅 {new Date(client.eventDate).toLocaleDateString()}</p>}
                                                </div>

                                                {/* Canciones seleccionadas por el cliente */}
                                                {rep.selectedSongs.length > 0 && (
                                                    <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Heart className="w-4 h-4 text-green-600" />
                                                            <span className="font-semibold text-green-800 text-sm">Canciones que eligió ({rep.selectedSongs.length}):</span>
                                                        </div>
                                                        <ol className="space-y-1 text-sm max-h-40 overflow-y-auto">
                                                            {rep.selectedSongs.map((songId, index) => {
                                                                const song = songs.find(s => s.id === songId)
                                                                return song ? (
                                                                    <li key={songId} className="flex items-center gap-2 text-[#3D3426]">
                                                                        <span className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                                                                        <span className="font-medium">{song.title}</span>
                                                                        <span className="text-[#8B7D6B]">- {song.artist}</span>
                                                                    </li>
                                                                ) : null
                                                            })}
                                                        </ol>
                                                    </div>
                                                )}

                                                {rep.selectedSongs.length === 0 && (
                                                    <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                                                        <p className="text-sm text-[#8B7D6B]">El cliente aún no ha seleccionado canciones</p>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <button onClick={() => openClientModal(client)} className="flex-1 p-2 rounded-lg bg-[#FAF3EB] text-[#C9A962] hover:bg-[#C9A962] hover:text-white transition-colors flex items-center justify-center gap-1 text-sm">
                                                        <Edit className="w-4 h-4" /> Editar
                                                    </button>
                                                    <button onClick={() => deleteClient(client.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => copyLink(client.code)} className="flex-1 p-2 rounded-lg bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white flex items-center justify-center gap-1 text-sm">
                                                        {copiedCode === client.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                        {copiedCode === client.code ? '¡Copiado!' : 'Link'}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Assign Repertory Tab */}
                    {activeTab === 'assign' && (
                        <div className="space-y-6">
                            <h2 className="font-display text-2xl font-bold text-[#3D3426] flex items-center gap-3">
                                <ListChecks className="w-6 h-6 text-[#C9A962]" />
                                Asignar Repertorio a Cliente
                            </h2>

                            <div className="glass rounded-2xl p-6">
                                <label className="block text-sm font-semibold text-[#3D3426] mb-2">Seleccionar Cliente:</label>
                                <select
                                    value={selectedClient}
                                    onChange={(e) => { setSelectedClient(e.target.value); setAvailableSelected([]); setAssignedSelected([]) }}
                                    className="w-full max-w-md px-4 py-3 rounded-xl border-2 border-[#E8DDD4] bg-white/50 focus:border-[#C9A962] focus:outline-none"
                                >
                                    <option value="">Seleccionar...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                                </select>
                            </div>

                            {selectedClient && (
                                <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-6">
                                    {/* Available Songs */}
                                    <div className="glass rounded-2xl p-6">
                                        <h3 className="font-semibold text-[#3D3426] mb-4 flex items-center gap-2">
                                            <Music className="w-5 h-5 text-[#C9A962]" />
                                            Canciones Disponibles ({availableSongs.length})
                                        </h3>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {availableSongs.map(song => (
                                                <label key={song.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${availableSelected.includes(song.id) ? 'bg-[#C9A962]/10 border-2 border-[#C9A962]' : 'bg-white hover:bg-[#FAF3EB] border-2 border-transparent'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={availableSelected.includes(song.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setAvailableSelected([...availableSelected, song.id])
                                                            } else {
                                                                setAvailableSelected(availableSelected.filter(id => id !== song.id))
                                                            }
                                                        }}
                                                        className="w-5 h-5 accent-[#C9A962]"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-[#3D3426]">{song.title}</p>
                                                        <p className="text-sm text-[#8B7D6B]">{song.artist}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex lg:flex-col items-center justify-center gap-4 py-8">
                                        <button onClick={assignSongsToClient} className="p-4 rounded-full bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white shadow-lg disabled:opacity-50" disabled={availableSelected.length === 0}>
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                        <button onClick={removeSongsFromClient} className="p-4 rounded-full bg-white border-2 border-[#C9A962] text-[#C9A962] shadow-lg disabled:opacity-50" disabled={assignedSelected.length === 0}>
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Assigned Songs */}
                                    <div className="glass rounded-2xl p-6">
                                        <h3 className="font-semibold text-[#3D3426] mb-4 flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            Canciones Asignadas ({assignedSongs.length})
                                        </h3>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {assignedSongs.length === 0 ? (
                                                <p className="text-center text-[#8B7D6B] py-8">Sin canciones asignadas</p>
                                            ) : (
                                                assignedSongs.map(song => (
                                                    <label key={song.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${assignedSelected.includes(song.id) ? 'bg-[#C9A962]/10 border-2 border-[#C9A962]' : 'bg-white hover:bg-[#FAF3EB] border-2 border-transparent'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={assignedSelected.includes(song.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setAssignedSelected([...assignedSelected, song.id])
                                                                } else {
                                                                    setAssignedSelected(assignedSelected.filter(id => id !== song.id))
                                                                }
                                                            }}
                                                            className="w-5 h-5 accent-[#C9A962]"
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-[#3D3426]">{song.title}</p>
                                                            <p className="text-sm text-[#8B7D6B]">{song.artist}</p>
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Solicitudes Tab */}
                    {activeTab === 'solicitudes' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-2xl font-bold text-[#3D3426] flex items-center gap-3">
                                    <MessageSquare className="w-7 h-7 text-[#C9A962]" />
                                    Solicitudes de Información
                                    {solicitudes.filter(s => s.estado === 'pendiente').length > 0 && (
                                        <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                                            {solicitudes.filter(s => s.estado === 'pendiente').length} nuevas
                                        </span>
                                    )}
                                </h2>
                            </div>

                            {loadingSolicitudes ? (
                                <div className="text-center py-12">
                                    <Loader2 className="w-8 h-8 text-[#C9A962] animate-spin mx-auto" />
                                </div>
                            ) : solicitudes.length === 0 ? (
                                <div className="glass rounded-2xl p-12 text-center">
                                    <MessageSquare className="w-16 h-16 text-[#C9A962]/30 mx-auto mb-4" />
                                    <p className="text-[#8B7D6B]">No hay solicitudes aún</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {solicitudes.map(s => (
                                        <div
                                            key={s.id}
                                            className={`glass rounded-2xl p-6 border-l-4 ${s.estado === 'pendiente' ? 'border-l-yellow-500' :
                                                s.estado === 'contactado' ? 'border-l-blue-500' :
                                                    s.estado === 'confirmado' ? 'border-l-green-500' :
                                                        'border-l-gray-400'
                                                }`}
                                        >
                                            <div className="flex flex-wrap gap-4 justify-between items-start">
                                                <div className="flex-1 min-w-[200px]">
                                                    <h3 className="font-bold text-[#3D3426] text-lg">{s.nombre}</h3>
                                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#6B5E4F]">
                                                        {s.telefono && (
                                                            <a href={`tel:${s.telefono}`} className="flex items-center gap-1 hover:text-[#C9A962]">
                                                                <Phone className="w-4 h-4" />
                                                                {s.telefono}
                                                            </a>
                                                        )}
                                                        {s.fecha_evento && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(s.fecha_evento).toLocaleDateString('es-MX')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {s.tipo_evento && (
                                                        <p className="text-sm text-[#8B7D6B] mt-1">
                                                            <strong>Tipo:</strong> {s.tipo_evento}
                                                        </p>
                                                    )}
                                                    {s.formato_interes && (
                                                        <p className="text-sm text-[#8B7D6B]">
                                                            <strong>Formato:</strong> {s.formato_interes}
                                                        </p>
                                                    )}
                                                    {s.mensaje && (
                                                        <p className="text-sm text-[#5A5A5A] mt-2 italic">"{s.mensaje}"</p>
                                                    )}
                                                    <p className="text-xs text-[#A69A8A] mt-2">
                                                        Recibido: {new Date(s.created_at).toLocaleString('es-MX')}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <select
                                                        value={s.estado}
                                                        onChange={(e) => updateSolicitudEstado(s.id, e.target.value)}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium border-2 ${s.estado === 'pendiente' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' :
                                                            s.estado === 'contactado' ? 'border-blue-400 bg-blue-50 text-blue-700' :
                                                                s.estado === 'confirmado' ? 'border-green-400 bg-green-50 text-green-700' :
                                                                    'border-gray-300 bg-gray-50 text-gray-600'
                                                            }`}
                                                    >
                                                        <option value="pendiente">⏳ Pendiente</option>
                                                        <option value="contactado">📞 Contactado</option>
                                                        <option value="confirmado">✅ Confirmado</option>
                                                        <option value="descartado">❌ Descartado</option>
                                                    </select>
                                                    {s.telefono && (
                                                        <a
                                                            href={`https://wa.me/52${s.telefono.replace(/\D/g, '')}?text=Hola ${s.nombre}, gracias por contactar a Abril Arte.`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-2 bg-[#25D366] text-white text-sm font-medium rounded-lg text-center hover:bg-[#20BA5A] transition-colors"
                                                        >
                                                            WhatsApp
                                                        </a>
                                                    )}

                                                    <button
                                                        onClick={() => deleteSolicitud(s.id)}
                                                        className="px-3 py-2 text-red-500 text-sm hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recibos Tab */}
                    {activeTab === 'recibos' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-2xl font-bold text-[#3D3426] flex items-center gap-3">
                                    <FileText className="w-7 h-7 text-[#C9A962]" />
                                    Recibos de Anticipo
                                </h2>
                                <button
                                    onClick={() => openReciboModal(null)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    Nuevo Recibo
                                </button>
                            </div>

                            {/* Formulario de Recibo */}
                            <div className="glass rounded-2xl p-6">
                                <h3 className="font-display text-xl font-bold text-[#3D3426] mb-6">Generar Recibo de Anticipo</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#3D3426] mb-2">Cliente *</label>
                                        <input
                                            type="text"
                                            value={reciboForm.cliente_nombre}
                                            onChange={e => setReciboForm({ ...reciboForm, cliente_nombre: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none"
                                            placeholder="Nombre del cliente"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#3D3426] mb-2">Teléfono</label>
                                        <input
                                            type="tel"
                                            value={reciboForm.cliente_telefono}
                                            onChange={e => setReciboForm({ ...reciboForm, cliente_telefono: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none"
                                            placeholder="Opcional"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#3D3426] mb-2">Monto del Anticipo *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B5E4F] font-semibold">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={reciboForm.monto}
                                                onChange={e => setReciboForm({ ...reciboForm, monto: e.target.value })}
                                                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none text-xl font-bold text-[#C9A962]"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#3D3426] mb-2">Método de Pago</label>
                                        <select
                                            value={reciboForm.metodo_pago}
                                            onChange={e => setReciboForm({ ...reciboForm, metodo_pago: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none"
                                        >
                                            <option value="efectivo">Efectivo</option>
                                            <option value="transferencia">Transferencia</option>
                                            <option value="tarjeta">Tarjeta</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-[#3D3426] mb-2">Concepto *</label>
                                        <input
                                            type="text"
                                            value={reciboForm.concepto}
                                            onChange={e => setReciboForm({ ...reciboForm, concepto: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none"
                                            placeholder="Ej: Boda - Trío de cuerdas en ceremonia"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#3D3426] mb-2">Fecha del Evento</label>
                                        <input
                                            type="date"
                                            value={reciboForm.fecha_evento}
                                            onChange={e => setReciboForm({ ...reciboForm, fecha_evento: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#3D3426] mb-2">Notas (opcional)</label>
                                        <input
                                            type="text"
                                            value={reciboForm.notas}
                                            onChange={e => setReciboForm({ ...reciboForm, notas: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none"
                                            placeholder="Notas adicionales..."
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setReciboForm({ cliente_nombre: '', cliente_telefono: '', monto: '', concepto: '', fecha_evento: '', metodo_pago: 'efectivo', notas: '' })}
                                        className="px-6 py-3 rounded-xl border-2 border-[#E8DDD4] text-[#6B5E4F] font-medium hover:bg-[#E8DDD4] transition-colors"
                                    >
                                        Limpiar
                                    </button>
                                    <button
                                        onClick={saveRecibo}
                                        disabled={savingRecibo || !reciboForm.cliente_nombre || !reciboForm.monto || !reciboForm.concepto}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {savingRecibo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                                        {savingRecibo ? 'Guardando...' : 'Guardar e Imprimir'}
                                    </button>
                                </div>
                            </div>

                            {/* Historial de Ventas */}
                            <div className="glass rounded-2xl p-6 mt-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-display text-xl font-bold text-[#3D3426] flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-[#C9A962]" />
                                        Historial de Ventas
                                    </h3>
                                    {recibos.length > 0 && (
                                        <div className="flex gap-4">
                                            <div className="text-right">
                                                <p className="text-xs text-[#8B7D6B]">Total Anticipos</p>
                                                <p className="text-lg font-bold text-[#C9A962]">
                                                    ${recibos.reduce((sum, r) => sum + parseFloat(r.monto || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-[#8B7D6B]">Recibos</p>
                                                <p className="text-lg font-bold text-[#3D3426]">{recibos.length}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {loadingRecibos ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#C9A962]" />
                                        <span className="ml-2 text-[#8B7D6B]">Cargando...</span>
                                    </div>
                                ) : recibos.length === 0 ? (
                                    <div className="text-center py-8 text-[#8B7D6B]">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>No hay recibos registrados</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-[#E8DDD4]">
                                                    <th className="text-left py-3 px-2 text-[#6B5E4F] font-semibold">Fecha</th>
                                                    <th className="text-left py-3 px-2 text-[#6B5E4F] font-semibold">Cliente</th>
                                                    <th className="text-left py-3 px-2 text-[#6B5E4F] font-semibold">Concepto</th>
                                                    <th className="text-right py-3 px-2 text-[#6B5E4F] font-semibold">Monto</th>
                                                    <th className="text-center py-3 px-2 text-[#6B5E4F] font-semibold">Pago</th>
                                                    <th className="text-center py-3 px-2 text-[#6B5E4F] font-semibold">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recibos.map((r) => (
                                                    <tr key={r.id} className="border-b border-[#E8DDD4] hover:bg-[#FAF7F2] transition-colors">
                                                        <td className="py-3 px-2 text-[#5A5A5A]">
                                                            {new Date(r.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <p className="font-medium text-[#3D3426]">{r.cliente_nombre}</p>
                                                            {r.cliente_telefono && (
                                                                <p className="text-xs text-[#8B7D6B]">{r.cliente_telefono}</p>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-2 text-[#5A5A5A] max-w-[200px] truncate">{r.concepto}</td>
                                                        <td className="py-3 px-2 text-right font-bold text-[#C9A962]">
                                                            ${parseFloat(r.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.metodo_pago === 'efectivo' ? 'bg-green-100 text-green-700' :
                                                                r.metodo_pago === 'transferencia' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-purple-100 text-purple-700'
                                                                }`}>
                                                                {r.metodo_pago?.charAt(0).toUpperCase() + r.metodo_pago?.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setReciboForm({
                                                                        cliente_nombre: r.cliente_nombre,
                                                                        cliente_telefono: r.cliente_telefono || '',
                                                                        monto: r.monto,
                                                                        concepto: r.concepto,
                                                                        fecha_evento: r.fecha_evento || '',
                                                                        metodo_pago: r.metodo_pago || 'efectivo',
                                                                        notas: r.notas || ''
                                                                    })
                                                                    generateReciboPDF()
                                                                }}
                                                                className="p-2 text-[#C9A962] hover:bg-[#C9A962]/10 rounded-lg transition-colors"
                                                                title="Reimprimir"
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Song Modal */}
            {
                songModal.open && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-gradient-to-br from-white to-[#FAF3EB] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#E8DDD4]">
                            {/* Header con gradiente */}
                            <div className="bg-gradient-to-r from-[#C9A962] to-[#A68B3D] p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                            <Music className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-2xl font-bold text-white">{songModal.song ? 'Editar' : 'Nueva'} Canción</h3>
                                            <p className="text-white/70 text-sm">Completa los detalles</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSongModal({ open: false, song: null })} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={saveSong} className="p-6 space-y-5">
                                {/* Título y Artista en fila */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-[#3D3426] mb-2">
                                            <span className="w-6 h-6 bg-[#C9A962]/10 rounded-lg flex items-center justify-center text-[#C9A962] text-xs">1</span>
                                            Título
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={songForm.title}
                                            onChange={e => setSongForm({ ...songForm, title: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] bg-white focus:border-[#C9A962] outline-none transition-all focus:shadow-lg focus:shadow-[#C9A962]/10"
                                            placeholder="Nombre de la canción"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-[#3D3426] mb-2">
                                            <span className="w-6 h-6 bg-[#C9A962]/10 rounded-lg flex items-center justify-center text-[#C9A962] text-xs">2</span>
                                            Artista
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={songForm.artist}
                                            onChange={e => setSongForm({ ...songForm, artist: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] bg-white focus:border-[#C9A962] outline-none transition-all focus:shadow-lg focus:shadow-[#C9A962]/10"
                                            placeholder="Nombre del artista"
                                        />
                                    </div>
                                </div>

                                {/* Categoría */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#3D3426] mb-2">
                                        <span className="w-6 h-6 bg-[#C9A962]/10 rounded-lg flex items-center justify-center text-[#C9A962] text-xs">3</span>
                                        Categoría
                                    </label>
                                    <select
                                        required
                                        value={songForm.category}
                                        onChange={e => setSongForm({ ...songForm, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] bg-white focus:border-[#C9A962] outline-none transition-all focus:shadow-lg focus:shadow-[#C9A962]/10"
                                    >
                                        <option value="">Seleccionar categoría...</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="Violín Solo">Violín Solo</option>
                                        <option value="Dúo">Dúo</option>
                                        <option value="Trío">Trío</option>
                                        <option value="Cuarteto">Cuarteto</option>
                                    </select>
                                </div>

                                {/* Archivo de Audio */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#3D3426] mb-2">
                                        <span className="w-6 h-6 bg-[#C9A962]/10 rounded-lg flex items-center justify-center text-[#C9A962] text-xs">4</span>
                                        Archivo de Audio
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            onChange={(e) => setAudioFile(e.target.files[0])}
                                            className="hidden"
                                            id="audioFileInput"
                                        />
                                        <label
                                            htmlFor="audioFileInput"
                                            className="flex items-center gap-3 w-full px-4 py-4 rounded-xl border-2 border-dashed border-[#C9A962]/40 bg-[#C9A962]/5 hover:bg-[#C9A962]/10 cursor-pointer transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9A962] to-[#A68B3D] flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Play className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                {audioFile ? (
                                                    <>
                                                        <p className="font-medium text-[#3D3426]">{audioFile.name}</p>
                                                        <p className="text-xs text-[#8B7D6B]">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                    </>
                                                ) : songForm.audioUrl ? (
                                                    <>
                                                        <p className="font-medium text-[#3D3426]">Audio actual cargado</p>
                                                        <p className="text-xs text-[#8B7D6B] truncate">{songForm.audioUrl}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="font-medium text-[#6B5E4F]">Haz clic para seleccionar archivo</p>
                                                        <p className="text-xs text-[#8B7D6B]">MP3, WAV, M4A (Max 10MB)</p>
                                                    </>
                                                )}
                                            </div>
                                            {(audioFile || songForm.audioUrl) && (
                                                <Check className="w-5 h-5 text-green-500" />
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* Link de Video */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#3D3426] mb-2">
                                        <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs">▶</span>
                                        Link de Video (opcional)
                                    </label>
                                    <input
                                        type="url"
                                        value={songForm.linkVideo}
                                        onChange={e => setSongForm({ ...songForm, linkVideo: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] bg-white focus:border-blue-400 outline-none transition-all focus:shadow-lg focus:shadow-blue-100"
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setSongModal({ open: false, song: null })}
                                        className="flex-1 py-4 rounded-2xl border-2 border-[#E8DDD4] text-[#6B5E4F] font-semibold hover:bg-[#E8DDD4] transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploadingAudio}
                                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold shadow-lg shadow-[#C9A962]/30 hover:shadow-xl hover:shadow-[#C9A962]/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {uploadingAudio ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Subiendo...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Guardar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Client Modal */}
            {
                clientModal.open && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="glass rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-[#E8DDD4] sticky top-0 bg-white/90 backdrop-blur-sm">
                                <h3 className="font-display text-xl font-bold text-[#3D3426]">{clientModal.client ? 'Editar' : 'Nuevo'} Cliente</h3>
                                <button onClick={() => setClientModal({ open: false, client: null })} className="p-2 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                                    <X className="w-5 h-5 text-[#6B5E4F]" />
                                </button>
                            </div>
                            <form onSubmit={saveClient} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#3D3426] mb-2">Nombre *</label>
                                    <input type="text" required value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#3D3426] mb-2">Email</label>
                                    <input type="email" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#3D3426] mb-2">Teléfono</label>
                                    <input type="tel" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#3D3426] mb-2">Tipo de Evento</label>
                                    <select value={clientForm.eventType} onChange={e => setClientForm({ ...clientForm, eventType: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors">
                                        <option value="">Seleccionar...</option>
                                        <option>Boda</option>
                                        <option>XV Años</option>
                                        <option>Cumpleaños</option>
                                        <option>Corporativo</option>
                                        <option>Ceremonia</option>
                                        <option>Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#3D3426] mb-2">Fecha del Evento</label>
                                    <input type="date" value={clientForm.eventDate} onChange={e => setClientForm({ ...clientForm, eventDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#3D3426] mb-2">Notas</label>
                                    <textarea rows={3} value={clientForm.notes} onChange={e => setClientForm({ ...clientForm, notes: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none transition-colors resize-none" />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setClientModal({ open: false, client: null })} className="flex-1 py-3 rounded-full border-2 border-[#E8DDD4] text-[#6B5E4F] font-medium hover:bg-[#E8DDD4] transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold shadow-lg">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Recibo Modal */}
            {reciboModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-gradient-to-br from-white to-[#FAF3EB] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8DDD4]">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#C9A962] to-[#A68B3D] p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-2xl font-bold text-white">Recibo de Anticipo</h3>
                                        <p className="text-white/70 text-sm">{reciboModal.showPreview ? 'Listo para imprimir' : 'Completa los datos'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setReciboModal({ open: false, solicitud: null, showPreview: false })} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {!reciboModal.showPreview ? (
                            /* Formulario */
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#3D3426] mb-2">Cliente *</label>
                                        <input
                                            type="text"
                                            value={reciboForm.cliente_nombre}
                                            onChange={e => setReciboForm({ ...reciboForm, cliente_nombre: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#3D3426] mb-2">Teléfono</label>
                                        <input
                                            type="tel"
                                            value={reciboForm.cliente_telefono}
                                            onChange={e => setReciboForm({ ...reciboForm, cliente_telefono: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#3D3426] mb-2">Monto del Anticipo *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B5E4F] font-semibold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={reciboForm.monto}
                                            onChange={e => setReciboForm({ ...reciboForm, monto: e.target.value })}
                                            className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none text-2xl font-bold text-[#C9A962]"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#3D3426] mb-2">Concepto *</label>
                                    <input
                                        type="text"
                                        value={reciboForm.concepto}
                                        onChange={e => setReciboForm({ ...reciboForm, concepto: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none"
                                        placeholder="Ej: Boda - Trío de cuerdas"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#3D3426] mb-2">Fecha del Evento</label>
                                        <input
                                            type="date"
                                            value={reciboForm.fecha_evento}
                                            onChange={e => setReciboForm({ ...reciboForm, fecha_evento: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#3D3426] mb-2">Método de Pago</label>
                                        <select
                                            value={reciboForm.metodo_pago}
                                            onChange={e => setReciboForm({ ...reciboForm, metodo_pago: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none"
                                        >
                                            <option value="efectivo">Efectivo</option>
                                            <option value="transferencia">Transferencia</option>
                                            <option value="tarjeta">Tarjeta</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#3D3426] mb-2">Notas (opcional)</label>
                                    <textarea
                                        rows={2}
                                        value={reciboForm.notas}
                                        onChange={e => setReciboForm({ ...reciboForm, notas: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD4] focus:border-[#C9A962] outline-none resize-none"
                                        placeholder="Notas adicionales..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setReciboModal({ open: false, solicitud: null, showPreview: false })}
                                        className="flex-1 py-3 rounded-full border-2 border-[#E8DDD4] text-[#6B5E4F] font-medium hover:bg-[#E8DDD4] transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={saveRecibo}
                                        disabled={savingRecibo}
                                        className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {savingRecibo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {savingRecibo ? 'Guardando...' : 'Guardar y Continuar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Vista previa confirmación */
                            <div className="p-6 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                                    <Check className="w-10 h-10 text-green-600" />
                                </div>
                                <h4 className="font-display text-2xl font-bold text-[#3D3426] mb-2">¡Recibo Guardado!</h4>
                                <p className="text-[#6B5E4F] mb-6">El recibo ha sido guardado en la base de datos.</p>
                                <div className="bg-[#FAF3EB] rounded-2xl p-4 mb-6 text-left">
                                    <p className="text-sm text-[#8B7D6B]">Cliente: <span className="font-semibold text-[#3D3426]">{reciboForm.cliente_nombre}</span></p>
                                    <p className="text-sm text-[#8B7D6B]">Monto: <span className="font-bold text-[#C9A962] text-xl">${parseFloat(reciboForm.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setReciboModal({ open: false, solicitud: null, showPreview: false })}
                                        className="flex-1 py-3 rounded-full border-2 border-[#E8DDD4] text-[#6B5E4F] font-medium hover:bg-[#E8DDD4] transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={generateReciboPDF}
                                        className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#C9A962] to-[#A68B3D] text-white font-semibold shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Printer className="w-5 h-5" />
                                        Imprimir PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div >
    )
}
