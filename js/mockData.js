const mockData = {
    // Perfiles de usuarias para recomendaciones
    profiles: [
        { id: 'mama', label: 'Mamá', icon: 'baby', desc: 'Espacios Kids Friendly' },
        { id: 'turnos', label: 'Turnos Rotativos', icon: 'clock', desc: 'Horarios flexibles y extendidos' },
        { id: 'ejecutiva', label: 'Ejecutiva', icon: 'briefcase', desc: 'Puntualidad y combos express' },
        { id: 'evento', label: 'Ocasión Especial', icon: 'star', desc: 'Producción completa' }
    ],

    // Categorías de Servicios
    categories: [
        { id: 'manos-pies', label: 'Manicure & Pedicure' },
        { id: 'mirada', label: 'Lashista & Mirada' },
        { id: 'capilar', label: 'Tratamientos Capilares' },
        { id: 'bienestar', label: 'Bienestar y Relax' }
    ],

    // Servicios
    services: [
        {
            id: 's1',
            categoryId: 'manos-pies',
            name: 'Esmaltado Permanente',
            price: 15000,
            duration: 60, // en minutos
            recommendedFor: ['turnos', 'ejecutiva'],
            image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 's2',
            categoryId: 'manos-pies',
            name: 'Uñas Acrílicas',
            price: 25000,
            duration: 120,
            recommendedFor: ['evento'],
            image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 's3',
            categoryId: 'mirada',
            name: 'Lifting de Pestañas',
            price: 18000,
            duration: 60,
            recommendedFor: ['mama', 'ejecutiva'],
            image: 'https://th.bing.com/th/id/OIP.2pIe9UC-BXmhjwRBZtYmDAHaE2?w=305&h=200&c=7&r=0&o=7&pid=1.7&rm=3'
        },
        {
            id: 's4',
            categoryId: 'capilar',
            name: 'Masaje Capilar Nutritivo',
            price: 20000,
            duration: 45,
            recommendedFor: ['mama', 'bienestar'],
            image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ],

    // Profesionales
    professionals: [
        { id: 'p1', name: 'Nicolett', email: 'nicolette@gmail.com', role: 'admin', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
        { id: 'p2', name: 'Camila', email: 'camila@gmail.com', role: 'profesional', avatar: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=150&q=80' }
    ],

    gallery: [
        { id: 'g1', src: 'img/galeria1.jpg', title: 'Manicure Acrílica' },
        { id: 'g2', src: 'img/galeria2.jpg', title: 'Lifting de Pestañas' },
        { id: 'g3', src: 'img/galeria3.jpg', title: 'Tratamiento Capilar' },
        { id: 'g4', src: 'img/galeria4.jpg', title: 'Maquillaje Profesional' },
        { id: 'g5', src: 'img/galeria5.jpg', title: 'Perfilado de Cejas' },
        { id: 'g6', src: 'img/galeria6.jpg', title: 'Pedicure Spa' }
    ],

    // Clientas Globales
    clients: [],

    // Inventario
    inventory: [
        { id: 'inv1', name: 'Esmalte Permanente Rojo', stock: 15, category: 'manos-pies' },
        { id: 'inv2', name: 'Pestañas Seda Curva C', stock: 50, category: 'mirada' },
        { id: 'inv3', name: 'Crema Masaje Capilar', stock: 8, category: 'capilar' },
        { id: 'inv4', name: 'Pegamento Pestañas', stock: 3, category: 'mirada' }
    ],

    // Horarios disponibles (simulados) - extendidos de 9 a 21
    timeSlots: [
        '09:00', '10:00', '11:00', '12:00', '13:00',
        '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00', '21:00'
    ]
};

// Funciones para manejar localStorage y Firebase
const StorageHelper = {
    _appointmentsCache: [],
    _fichasCache: [],
    _professionalsCache: [],
    _inventoryCache: [],

    _refreshAdminIfSafe: function() {
        if(window.location.hash.includes('admin') && typeof AppRouter !== 'undefined') {
            const hasOpenModal = document.querySelector('[id$="-modal"][style*="display: flex"]') || 
                                 document.querySelector('[id$="-modal"][style*="display: block"]');
            if(!hasOpenModal) {
                AppRouter.navigate('admin');
            }
        }
    },

    init: async function () {
        if (!localStorage.getItem('nicolett_appointments')) {
            localStorage.setItem('nicolett_appointments', JSON.stringify([]));
        }
        await this.loadAppointmentsCache();
        
        if (!localStorage.getItem('nicolett_user')) {
            localStorage.setItem('nicolett_user', JSON.stringify({
                name: 'Cliente Prueba',
                phone: '+56912345678',
                email: 'cliente@test.com'
            }));
        }
        if (!localStorage.getItem('nicolett_auth')) {
            localStorage.setItem('nicolett_auth', JSON.stringify({ loggedIn: false, user: null }));
        }

        // Sincronizar estado de autenticación con Firebase
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    const profs = this.getProfessionals();
                    const prof = profs.find(p => p.email === user.email) || { id: 'p_unknown', name: 'Admin', role: 'admin' };
                    localStorage.setItem('nicolett_auth', JSON.stringify({ loggedIn: true, user: prof }));
                    
                    const btnLogout = document.getElementById('btn-logout');
                    if (btnLogout) btnLogout.style.display = 'block';
                    
                    // Si ya estamos en admin, refrescar la vista para mostrar los datos
                    this._refreshAdminIfSafe();
                } else {
                    localStorage.setItem('nicolett_auth', JSON.stringify({ loggedIn: false, user: null }));
                    const btnLogout = document.getElementById('btn-logout');
                    if (btnLogout) btnLogout.style.display = 'none';
                    
                    if(window.location.hash.includes('admin') && typeof AppRouter !== 'undefined') {
                        AppRouter.navigate('home');
                    }
                }
            });
        }
        
        if (!localStorage.getItem('nicolett_gallery_v2')) {
            localStorage.setItem('nicolett_gallery_v2', JSON.stringify(mockData.gallery));
        }
        if (!localStorage.getItem('nicolett_clients')) {
            localStorage.setItem('nicolett_clients', JSON.stringify(mockData.clients));
        }
    },

    getAppointments: function () {
        return this._appointmentsCache;
    },

    loadAppointmentsCache: async function() {
        if(typeof db === 'undefined') return;
        try {
            const querySnapshot = await db.collection("appointments").get();
            const appointments = [];
            querySnapshot.forEach((doc) => {
                appointments.push({ id: doc.id, ...doc.data() });
            });
            this._appointmentsCache = appointments;
            
            const fichasSnapshot = await db.collection("fichas").get();
            const fichas = [];
            fichasSnapshot.forEach((doc) => {
                fichas.push({ id: doc.id, ...doc.data() });
            });
            this._fichasCache = fichas;
            
            const profsSnapshot = await db.collection("professionals").get();
            const profs = [];
            profsSnapshot.forEach((doc) => {
                profs.push({ id: doc.id, ...doc.data() });
            });
            this._professionalsCache = profs.length > 0 ? profs : mockData.professionals;
            
            const invSnapshot = await db.collection("inventory").get();
            const inv = [];
            invSnapshot.forEach((doc) => {
                inv.push({ id: doc.id, ...doc.data() });
            });
            this._inventoryCache = inv.length > 0 ? inv : mockData.inventory;

            this._refreshAdminIfSafe();
        } catch (e) {
            console.error("Error cargando datos de Firebase:", e);
        }
    },

    getAvailableTimeSlots: async function(date, profId) {
        if(typeof db === 'undefined') return mockData.timeSlots;
        
        const prof = this.getProfessionals().find(p => p.id === profId);
        const profName = prof ? prof.name : profId;

        try {
            const querySnapshot = await db.collection("appointments")
                .where("date", "==", date)
                .where("profesional", "==", profName)
                .where("status", "==", "confirmada")
                .get();
            
            const bookedTimes = [];
            querySnapshot.forEach(doc => {
                bookedTimes.push(doc.data().time);
            });
            
            return mockData.timeSlots.filter(t => !bookedTimes.includes(t));
        } catch (e) {
            console.error("Error obteniendo horas de Firebase:", e);
            return mockData.timeSlots;
        }
    },

    saveAppointment: async function (appointment) {
        appointment.status = 'confirmada';
        appointment.createdAt = new Date().toISOString(); // Fallback date

        if(typeof db !== 'undefined') {
            try {
                appointment.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const docRef = await db.collection("appointments").add(appointment);
                appointment.id = docRef.id;
                this._appointmentsCache.push(appointment); // Update local cache
                return appointment;
            } catch (e) {
                console.error("Error guardando cita en Firebase:", e);
                throw e;
            }
        } else {
            // Fallback to local storage if Firebase fails
            const appointments = JSON.parse(localStorage.getItem('nicolett_appointments') || '[]');
            appointment.id = 'appt_' + Date.now();
            appointments.push(appointment);
            localStorage.setItem('nicolett_appointments', JSON.stringify(appointments));
            this._appointmentsCache.push(appointment);
            return appointment;
        }
    },

    getUser: function () {
        return JSON.parse(localStorage.getItem('nicolett_user') || '{}');
    },

    saveUser: function (user) {
        localStorage.setItem('nicolett_user', JSON.stringify(user));
    },

    // Auth
    getAuth: function() {
        return JSON.parse(localStorage.getItem('nicolett_auth') || '{"loggedIn": false, "user": null}');
    },
    setAuth: function(authData) {
        localStorage.setItem('nicolett_auth', JSON.stringify(authData));
    },

    // Inventory
    getInventory: function() {
        return this._inventoryCache;
    },
    updateProductStock: async function(productId, amountUsed) {
        const inv = this.getInventory();
        const p = inv.find(x => x.id === productId);
        if(p && typeof db !== 'undefined') {
            p.stock = Math.max(0, p.stock - amountUsed);
            try {
                await db.collection("inventory").doc(productId).update({ stock: p.stock });
            } catch(e) { console.error("Error updating stock", e); }
        }
    },
    addProduct: async function(product) {
        if(typeof db !== 'undefined') {
            try {
                const docRef = await db.collection("inventory").add(product);
                product.id = docRef.id;
                this._inventoryCache.push(product);
                return product;
            } catch (e) { console.error("Error adding product", e); }
        }
    },

    updateAppointmentStatus: async function(id, newStatus) {
        if(typeof db !== 'undefined') {
            try {
                await db.collection("appointments").doc(id).update({ status: newStatus });
                const appIdx = this._appointmentsCache.findIndex(a => a.id === id);
                if (appIdx > -1) {
                    this._appointmentsCache[appIdx].status = newStatus;
                }
            } catch (e) {
                console.error("Error updating appointment status", e);
            }
        }
    },

    // Professionals
    getProfessionals: function() {
        return this._professionalsCache;
    },
    addProfessional: async function(prof) {
        if(typeof db !== 'undefined') {
            try {
                const docRef = await db.collection("professionals").add(prof);
                prof.id = docRef.id;
                this._professionalsCache.push(prof);
                return prof;
            } catch (e) { console.error("Error adding professional", e); }
        }
    },
    deleteProfessional: async function(id) {
        if(typeof db !== 'undefined') {
            try {
                await db.collection("professionals").doc(id).delete();
                this._professionalsCache = this._professionalsCache.filter(p => p.id !== id);
            } catch (e) { console.error("Error deleting professional", e); }
        }
    },

    // --- Gallery ---
    getGallery: function() {
        const stored = localStorage.getItem('nicolett_gallery_v2');
        if (stored) return JSON.parse(stored);
        
        // Inicializar
        localStorage.setItem('nicolett_gallery_v2', JSON.stringify(mockData.gallery));
        return mockData.gallery;
    },

    addGalleryImage: function(imageObj) {
        const gallery = this.getGallery();
        imageObj.id = 'g' + Date.now();
        gallery.unshift(imageObj); // Agregar al principio
        localStorage.setItem('nicolett_gallery_v2', JSON.stringify(gallery));
        return imageObj;
    },

    deleteGalleryImage: function(id) {
        let gallery = this.getGallery();
        gallery = gallery.filter(img => img.id !== id);
        localStorage.setItem('nicolett_gallery_v2', JSON.stringify(gallery));
    },

    // Fichas Clínicas
    getFichas: function() {
        return this._fichasCache || [];
    },
    saveFicha: async function(ficha) {
        if(typeof db !== 'undefined') {
            try {
                ficha.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const docRef = await db.collection("fichas").add(ficha);
                ficha.id = docRef.id;
                this._fichasCache.push(ficha);
            } catch (e) {
                console.error("Error guardando ficha en Firebase:", e);
                throw e;
            }
        } else {
            // Fallback
            ficha.id = 'ficha_' + Date.now();
            this._fichasCache.push(ficha);
        }
    },
    deleteFicha: async function(id) {
        if(typeof db !== 'undefined') {
            try {
                await db.collection("fichas").doc(id).delete();
                this._fichasCache = this._fichasCache.filter(f => f.id !== id);
            } catch (e) {
                console.error("Error eliminando ficha:", e);
            }
        } else {
            this._fichasCache = this._fichasCache.filter(f => f.id !== id);
        }
    },

    // --- Clientas Globales ---
    getClients: function() {
        return JSON.parse(localStorage.getItem('nicolett_clients') || '[]');
    },
    saveClients: function(clients) {
        localStorage.setItem('nicolett_clients', JSON.stringify(clients));
    },
    addClient: function(client) {
        const clients = this.getClients();
        client.id = 'client_' + Date.now();
        clients.push(client);
        this.saveClients(clients);
        return client;
    },
    updateClient: function(updatedClient) {
        let clients = this.getClients();
        const index = clients.findIndex(c => c.id === updatedClient.id);
        if(index !== -1) {
            clients[index] = updatedClient;
            this.saveClients(clients);
        }
    },
    deleteClient: function(id) {
        let clients = this.getClients();
        clients = clients.filter(c => c.id !== id);
        this.saveClients(clients);
    }
};

StorageHelper.init();
