/**
 * Inicialización principal y manejo de eventos específicos por vista
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Iconos
    lucide.createIcons();
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }

    // Iniciar Router
    AppRouter.init();

    // Iniciar Auth
    setupAuth();
});

function setupAuth() {
    const btnLogout = document.getElementById('btn-logout');
    const authModal = document.getElementById('auth-modal');
    const profilesContainer = document.getElementById('auth-profiles-container');
    
    const updateNav = () => {
        const auth = StorageHelper.getAuth();
        if(auth.loggedIn && btnLogout) {
            btnLogout.style.display = 'block';
        } else if(btnLogout) {
            btnLogout.style.display = 'none';
        }
    };
    
    updateNav();
    
    if(btnLogout) {
        btnLogout.addEventListener('click', async () => {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                await firebase.auth().signOut();
            } else {
                StorageHelper.setAuth({ loggedIn: false, user: null });
                updateNav();
                AppRouter.navigate('home');
            }
        });
    }
    
    // Interceptar click en "Portal Interno"
    const adminLink = document.querySelector('a[data-route="admin"]');
    if(adminLink) {
        adminLink.addEventListener('click', (e) => {
            const auth = StorageHelper.getAuth();
            if(!auth.loggedIn) {
                e.stopImmediatePropagation(); // Evitar absolutamente que AppRouter navegue
                e.preventDefault();
                // Solo mostrar modal
                authModal.style.display = 'flex';
            }
        }, true); // Fase de captura para ejecutar antes que AppRouter
    }

    // Inicializar Formulario de Autenticación Firebase
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            const errorEl = document.getElementById('auth-error');
            const btnLogin = document.getElementById('btn-login');

            errorEl.style.display = 'none';
            btnLogin.disabled = true;
            btnLogin.innerHTML = 'Ingresando...';

            try {
                if (typeof firebase === 'undefined' || !firebase.auth) {
                    throw new Error("Firebase Auth no está inicializado");
                }
                await firebase.auth().signInWithEmailAndPassword(email, password);
                
                // Si el login es exitoso, el onAuthStateChanged en mockData.js
                // se encargará de configurar StorageHelper, actualizar nav y navegar a 'admin'
                document.getElementById('auth-modal').style.display = 'none';
                
            } catch (error) {
                console.error("Error Auth:", error);
                errorEl.innerText = 'Credenciales inválidas. Intenta de nuevo.';
                errorEl.style.display = 'block';
            } finally {
                btnLogin.disabled = false;
                btnLogin.innerHTML = 'Ingresar';
            }
        });
    }
}

// --- Eventos de Home ---
function initHomeEvents() {
    // Ya no hay perfiles dinámicos; el carrusel es estático.
}

// --- Eventos de Agendamiento ---
// Estado global del flujo de reserva actual
const bookingState = {
    serviceId: null,
    profId: null,
    date: null,
    time: null,
    needs: { kids: false, time: false, event: false },
    notes: ''
};

function initAgendarEvents() {
    // Navegación de pasos
    const showStep = (stepNumber) => {
        document.querySelectorAll('.booking-step').forEach(el => el.style.display = 'none');
        document.getElementById(`booking-step-${stepNumber}`).style.display = 'block';
        
        // Update circles
        document.querySelectorAll('.step-circle').forEach((el, index) => {
            if(index + 1 <= stepNumber) {
                el.style.background = 'var(--clr-rose-gold)';
                el.style.color = 'white';
            } else {
                el.style.background = 'var(--clr-nude)';
                el.style.color = 'var(--clr-neutral-gray)';
            }
        });
    };

    // Step 1: Services
    const serviceCards = document.querySelectorAll('.service-select-card');
    const btnNext1 = document.getElementById('btn-next-1');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            serviceCards.forEach(c => c.style.borderColor = 'transparent');
            card.style.borderColor = 'var(--clr-rose-gold)';
            bookingState.serviceId = card.getAttribute('data-service-id');
            btnNext1.disabled = false;
        });
    });
    
    btnNext1?.addEventListener('click', () => {
        // Re-render prof-grid just in case data loaded late
        const profGrid = document.querySelector('.prof-grid');
        const btnNext2 = document.getElementById('btn-next-2');
        if (profGrid) {
            const professionals = StorageHelper.getProfessionals();
            profGrid.innerHTML = professionals.map(p => `
                <div class="prof-select-card card text-center" data-prof-id="${p.id}" style="cursor: pointer; border: 2px solid transparent;">
                    <img src="${p.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}" alt="${p.name || 'Profesional'}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; object-fit: cover;">
                    <h4>${p.name || 'Sin Nombre'}</h4>
                </div>
            `).join('');

            // Re-bind events
            const profCards = document.querySelectorAll('.prof-select-card');
            profCards.forEach(card => {
                card.addEventListener('click', () => {
                    profCards.forEach(c => c.style.borderColor = 'transparent');
                    card.style.borderColor = 'var(--clr-rose-gold)';
                    bookingState.profId = card.getAttribute('data-prof-id');
                    if (btnNext2) btnNext2.disabled = false;
                });
            });
        }
        showStep(2);
    });

    // Step 2: Professional
    const btnNext2 = document.getElementById('btn-next-2');
    const btnPrev2 = document.getElementById('btn-prev-2');

    btnPrev2?.addEventListener('click', () => showStep(1));
    btnNext2?.addEventListener('click', () => {
        // Set min date to today
        const dateInput = document.getElementById('booking-date');
        const today = new Date().toISOString().split('T')[0];
        if(dateInput) {
            dateInput.min = today;
            if(!dateInput.value) dateInput.value = today;
            
            // Disparar evento change para cargar horas disponibles automáticamente
            const event = new Event('change');
            dateInput.dispatchEvent(event);
        }
        showStep(3);
    });

    // Step 3: Date & Time
    const dateInput = document.getElementById('booking-date');
    const timeSlotsGrid = document.getElementById('time-slots-container');
    const btnNext3 = document.getElementById('btn-next-3');
    const btnPrev3 = document.getElementById('btn-prev-3');
    
    // Simulate updating time slots on date change
    dateInput?.addEventListener('change', async () => {
        bookingState.date = dateInput.value;
        bookingState.time = null;
        btnNext3.disabled = true;

        if (timeSlotsGrid && bookingState.profId && bookingState.date) {
            timeSlotsGrid.innerHTML = '<p>Buscando horas disponibles...</p>';
            const availableSlots = await StorageHelper.getAvailableTimeSlots(bookingState.date, bookingState.profId);
            
            if (availableSlots.length === 0) {
                timeSlotsGrid.innerHTML = '<p style="color:red; grid-column: 1/-1;">No hay horas disponibles para esta fecha. Por favor, selecciona otra.</p>';
            } else {
                timeSlotsGrid.innerHTML = availableSlots.map(time => `
                    <button class="time-slot-btn" data-time="${time}" style="padding: 10px; border: 1px solid var(--clr-nude); border-radius: var(--radius-sm); background: white; cursor: pointer; transition: all 0.2s;">${time}</button>
                `).join('');
                
                // Re-bind click events for new buttons
                const newTimeSlots = timeSlotsGrid.querySelectorAll('.time-slot-btn');
                newTimeSlots.forEach(btn => {
                    btn.addEventListener('click', () => {
                        newTimeSlots.forEach(b => {
                            b.style.background = 'white';
                            b.style.color = 'var(--clr-neutral-dark)';
                        });
                        btn.style.background = 'var(--clr-rose-gold)';
                        btn.style.color = 'white';
                        bookingState.time = btn.getAttribute('data-time');
                        
                        if(bookingState.date && bookingState.time) {
                            btnNext3.disabled = false;
                        }
                    });
                });
            }
        }
    });

    btnPrev3?.addEventListener('click', () => showStep(2));
    btnNext3?.addEventListener('click', () => {
        // Recoger necesidades
        bookingState.needs.kids = document.getElementById('check-kids')?.checked || false;
        bookingState.needs.time = document.getElementById('check-time')?.checked || false;
        bookingState.needs.event = document.getElementById('check-event')?.checked || false;
        bookingState.notes = document.getElementById('booking-notes')?.value || '';
        
        showStep(4);
    });

    // Step 4: Tus Datos
    const btnPrev4 = document.getElementById('btn-prev-4');
    const btnNext4 = document.getElementById('btn-next-4');
    const inputName = document.getElementById('client-name');
    const inputPhone = document.getElementById('client-phone');
    const inputEmail = document.getElementById('client-email');
    
    // Validate inputs for Step 4
    const validateStep4 = () => {
        const nameVal = inputName?.value.trim() || '';
        const phoneVal = inputPhone?.value.trim() || '';
        const emailVal = inputEmail?.value.trim() || '';

        // Validaciones
        const nameValid = nameVal.length >= 2; // Al menos 2 caracteres
        const digits = phoneVal.replace(/[^0-9]/g, '');
        const phoneValid = digits.length >= 8 && digits.length <= 15; // Que tenga entre 8 y 15 números reales
        const emailValid = !emailVal || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal); // Vacío o formato correcto

        const errorName = document.getElementById('error-name');
        const errorPhone = document.getElementById('error-phone');
        const errorEmail = document.getElementById('error-email');

        // Feedback visual con los bordes y textos
        if (inputName) {
            if (!nameVal) {
                inputName.style.borderColor = 'var(--clr-nude)';
                if(errorName) errorName.innerText = '';
            } else if (nameValid) {
                inputName.style.borderColor = 'var(--clr-rose-gold)';
                if(errorName) errorName.innerText = '';
            } else {
                inputName.style.borderColor = 'red';
                if(errorName) errorName.innerText = 'Por favor, ingresa un nombre válido.';
            }
        }
        
        if (inputPhone) {
            if (!phoneVal) {
                inputPhone.style.borderColor = 'var(--clr-nude)';
                if(errorPhone) errorPhone.innerText = '';
            } else if (phoneValid) {
                inputPhone.style.borderColor = 'var(--clr-rose-gold)';
                if(errorPhone) errorPhone.innerText = '';
            } else {
                inputPhone.style.borderColor = 'red';
                if(errorPhone) errorPhone.innerText = 'El número debe tener al menos 8 dígitos.';
            }
        }
        
        if (inputEmail) {
            if (!emailVal || emailValid) {
                inputEmail.style.borderColor = emailVal ? 'var(--clr-rose-gold)' : 'var(--clr-nude)';
                if(errorEmail) errorEmail.innerText = '';
            } else {
                inputEmail.style.borderColor = 'red';
                if(errorEmail) errorEmail.innerText = 'El formato del correo es incorrecto (ej: nombre@correo.com).';
            }
        }

        // Habilitar botón solo si todo lo necesario es válido
        if(nameValid && phoneValid && emailValid) {
            btnNext4.disabled = false;
        } else {
            btnNext4.disabled = true;
        }
    };
    
    inputName?.addEventListener('input', validateStep4);
    inputPhone?.addEventListener('input', validateStep4);
    inputEmail?.addEventListener('input', validateStep4);

    btnPrev4?.addEventListener('click', () => showStep(3));
    btnNext4?.addEventListener('click', () => {
        bookingState.clientName = inputName.value.trim();
        bookingState.clientPhone = inputPhone.value.trim();
        bookingState.clientEmail = inputEmail?.value.trim() || '';
        
        // Llenar resumen final
        const s = mockData.services.find(x => x.id === bookingState.serviceId);
        const professionals = StorageHelper.getProfessionals();
        const p = professionals.find(x => x.id === bookingState.profId);
        
        document.getElementById('summary-client').innerText = bookingState.clientName;
        document.getElementById('summary-service').innerText = s ? s.name : '';
        document.getElementById('summary-prof').innerText = p ? p.name : '';
        document.getElementById('summary-date').innerText = bookingState.date;
        document.getElementById('summary-time').innerText = bookingState.time;
        document.getElementById('summary-price').innerText = s ? `$${s.price.toLocaleString('es-CL')}` : '';
        
        showStep(5);
    });

    // Step 5: Confirm
    const btnPrev5 = document.getElementById('btn-prev-5');
    const btnConfirm = document.getElementById('btn-confirm-booking');
    
    btnPrev5?.addEventListener('click', () => showStep(4));
    
    btnConfirm?.addEventListener('click', async () => {
        btnConfirm.disabled = true;
        btnConfirm.innerHTML = 'Procesando...';

        const professionals = StorageHelper.getProfessionals();
        const prof = professionals.find(p => p.id === bookingState.profId);
        const service = mockData.services.find(s => s.id === bookingState.serviceId);

        // Guardar cita
        const appointmentData = {
            servicio: service ? service.name : bookingState.serviceId,
            profesional: prof ? prof.name : bookingState.profId,
            profId: bookingState.profId,
            serviceId: bookingState.serviceId,
            date: bookingState.date,
            time: bookingState.time,
            needs: bookingState.needs,
            notes: bookingState.notes,
            clientName: bookingState.clientName,
            clientPhone: bookingState.clientPhone,
            clientEmail: bookingState.clientEmail
        };
        
        try {
            await StorageHelper.saveAppointment(appointmentData);
            document.getElementById('success-modal').style.display = 'flex';
        } catch (e) {
            alert('Error al guardar la cita. Intenta de nuevo.');
            btnConfirm.disabled = false;
            btnConfirm.innerHTML = 'Confirmar Reserva';
        }
    });
}


// --- Eventos de Admin ---
function initAdminEvents() {
    if(window.lucide) window.lucide.createIcons();

    const auth = StorageHelper.getAuth();
    if(!auth.loggedIn) return;

    // Pestañas (Tabs)
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.borderBottomColor = 'transparent';
                t.style.color = 'var(--clr-neutral-gray)';
            });
            contents.forEach(c => c.style.display = 'none');
            
            tab.classList.add('active');
            tab.style.borderBottomColor = 'var(--clr-rose-gold)';
            tab.style.color = 'var(--clr-neutral-dark)';
            const targetId = tab.getAttribute('data-target');
            if(document.getElementById(targetId)) {
                document.getElementById(targetId).style.display = 'block';
            }
        });
    });

    // Selectores de estado de Citas
    const statusSelectors = document.querySelectorAll('.status-selector');
    statusSelectors.forEach(select => {
        // Inicializar color según el estado actual
        const val = select.value;
        if(val === 'cancelada' || val === 'no asiste') {
            select.style.background = '#ffebee';
            select.style.color = '#c62828';
        } else if (val === 'completada') {
            select.style.background = '#e3f2fd';
            select.style.color = '#1565c0';
        } else {
            select.style.background = '#e8f5e9';
            select.style.color = '#2e7d32';
        }

        select.addEventListener('change', async (e) => {
            const appId = e.target.getAttribute('data-appid');
            const newStatus = e.target.value;
            
            if(newStatus === 'cancelada' || newStatus === 'no asiste') {
                e.target.style.background = '#ffebee';
                e.target.style.color = '#c62828';
            } else if (newStatus === 'completada') {
                e.target.style.background = '#e3f2fd';
                e.target.style.color = '#1565c0';
            } else {
                e.target.style.background = '#e8f5e9';
                e.target.style.color = '#2e7d32';
            }
            
            await StorageHelper.updateAppointmentStatus(appId, newStatus);
        });
    });

    // Modal de Creación de Ficha
    const btnFichas = document.querySelectorAll('.btn-ficha');
    const fichaModal = document.getElementById('ficha-modal');
    const btnCloseFicha = document.getElementById('close-ficha');
    const formFicha = document.getElementById('form-ficha');
    const dynFields = document.getElementById('ficha-dynamic-fields');

    // Botón manual
    const btnCrearFichaManual = document.getElementById('btn-crear-ficha-manual');
    if (btnCrearFichaManual) {
        btnCrearFichaManual.addEventListener('click', () => {
            document.getElementById('ficha-appid').value = '';
            document.getElementById('ficha-client').value = '';
            document.getElementById('ficha-service').value = '';
            formFicha.reset();
            document.querySelectorAll('.ficha-prod-qty').forEach(input => input.disabled = true);
            dynFields.style.display = 'block'; // Mostrar siempre por si quieren agregar mapping manual
            dynFields.innerHTML = `
                <h4 style="margin-bottom:10px; font-size:1rem;">Mapping de Pestañas (Opcional)</h4>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:0.9rem;">Ojo Izquierdo</label>
                        <input type="text" id="ficha-map-izq" placeholder="Ej: 9, 10, 11" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:inherit;">
                    </div>
                    <div>
                        <label style="font-size:0.9rem;">Ojo Derecho</label>
                        <input type="text" id="ficha-map-der" placeholder="Ej: 9, 10, 11" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:inherit;">
                    </div>
                </div>
            `;
            fichaModal.style.display = 'flex';
        });
    }

    btnFichas.forEach(btn => {
        btn.addEventListener('click', () => {
            const appId = btn.getAttribute('data-appid');
            const app = StorageHelper.getAppointments().find(a => a.id === appId);
            if(!app) return;

            const service = mockData.services.find(s => s.id === app.serviceId);

            document.getElementById('ficha-appid').value = appId;
            document.getElementById('ficha-client').value = app.clientName;
            document.getElementById('ficha-service').value = service ? service.name : '';

            // Limpiar form
            formFicha.reset();
            document.querySelectorAll('.ficha-prod-qty').forEach(input => input.disabled = true);

            // Mostrar campos dinámicos si es de la categoría 'mirada' (pestañas)
            if(service && service.categoryId === 'mirada') {
                dynFields.style.display = 'block';
                dynFields.innerHTML = `
                    <h4 style="margin-bottom:10px; font-size:1rem;">Mapping de Pestañas</h4>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <div>
                            <label style="font-size:0.9rem;">Ojo Izquierdo (Tamaños ej: 9-13)</label>
                            <input type="text" id="ficha-map-izq" placeholder="Ej: 9, 10, 11, 12, 13" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:inherit;">
                        </div>
                        <div>
                            <label style="font-size:0.9rem;">Ojo Derecho (Tamaños ej: 9-13)</label>
                            <input type="text" id="ficha-map-der" placeholder="Ej: 9, 10, 11, 12, 13" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:inherit;">
                        </div>
                    </div>
                `;
            } else {
                dynFields.style.display = 'none';
                dynFields.innerHTML = '';
            }

            fichaModal.style.display = 'flex';
        });
    });

    btnCloseFicha?.addEventListener('click', () => {
        fichaModal.style.display = 'none';
    });

    // Habilitar/Deshabilitar cantidad de productos al hacer check
    const prodChecks = document.querySelectorAll('.ficha-prod-check');
    prodChecks.forEach(chk => {
        chk.addEventListener('change', (e) => {
            const qtyInput = document.getElementById('qty_' + e.target.value);
            if(qtyInput) {
                qtyInput.disabled = !e.target.checked;
                if(!e.target.checked) qtyInput.value = 1;
            }
        });
    });

    // Guardar Ficha
    formFicha?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const appId = document.getElementById('ficha-appid').value;
        const app = appId ? StorageHelper.getAppointments().find(a => a.id === appId) : null;
        
        const clientName = document.getElementById('ficha-client').value.trim();
        const serviceName = document.getElementById('ficha-service').value.trim();

        // Productos usados
        const usedProds = [];
        prodChecks.forEach(chk => {
            if(chk.checked) {
                const qty = parseInt(document.getElementById('qty_' + chk.value).value) || 1;
                usedProds.push({ id: chk.value, name: chk.getAttribute('data-name'), quantity: qty });
                // Descontar stock
                StorageHelper.updateProductStock(chk.value, qty);
            }
        });

        // Extra data (Mapping de pestañas)
        const mapIzq = document.getElementById('ficha-map-izq')?.value || '';
        const mapDer = document.getElementById('ficha-map-der')?.value || '';
        
        const btnSubmit = formFicha.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Guardando...";

        const ficha = {
            appointmentId: appId || null,
            date: new Date().toLocaleDateString('es-CL'),
            clientName: clientName,
            serviceName: serviceName,
            products: usedProds,
            mapping: (mapIzq || mapDer) ? { left: mapIzq, right: mapDer } : null
        };
        
        await StorageHelper.saveFicha(ficha);
        
        // Actualizar o crear clienta
        const clientsList = StorageHelper.getClients();
        let existingClient = clientsList.find(c => c.name.toLowerCase() === clientName.toLowerCase());
        if(existingClient) {
            existingClient.lastVisit = ficha.date;
            StorageHelper.updateClient(existingClient);
        } else {
            let prodNames = usedProds.map(p => p.name).join(', ');
            StorageHelper.addClient({
                name: clientName,
                phone: app ? app.clientPhone : '',
                lastVisit: ficha.date,
                products: prodNames ? `Productos usados: ${prodNames}` : ''
            });
        }
        
        fichaModal.style.display = 'none';
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Guardar Ficha";
        
        if(typeof AppRouter !== 'undefined') {
            AppRouter.navigate('admin'); // Refrescar vista
        }
    });

    // Modal Ver Ficha
    const viewFichaModal = document.getElementById('view-ficha-modal');
    const viewFichaContent = document.getElementById('view-ficha-content');
    
    document.querySelectorAll('.btn-view-ficha').forEach(btn => {
        btn.addEventListener('click', () => {
            const fichaId = btn.getAttribute('data-fichaid');
            const ficha = StorageHelper.getFichas().find(f => f.id === fichaId);
            if(!ficha) return;

            let prodsHtml = (ficha.products && ficha.products.length > 0)
                ? ficha.products.map(p => `<li style="margin-bottom:5px;"><i data-lucide="package" style="width:14px; display:inline;"></i> ${p.quantity}x ${p.name}</li>`).join('')
                : 'Ningún producto registrado';

            let extraHtml = '';
            if(ficha.mapping) {
                extraHtml = `
                    <div style="background:var(--clr-nude-light); padding:15px; border-radius:var(--radius-sm); margin-bottom:15px;">
                        <h4 style="margin-bottom:10px; font-size:1rem; color:var(--clr-rose-gold-dark);">Lash Mapping Utilizado</h4>
                        <p style="margin-bottom:5px;"><strong>Ojo Izquierdo:</strong> ${ficha.mapping.left || 'N/A'}</p>
                        <p style="margin-bottom:0;"><strong>Ojo Derecho:</strong> ${ficha.mapping.right || 'N/A'}</p>
                    </div>
                `;
            }

            viewFichaContent.innerHTML = `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">
                    <div><span style="color:var(--clr-neutral-gray); font-size:0.9rem;">Cliente</span><br><strong>${ficha.clientName}</strong></div>
                    <div><span style="color:var(--clr-neutral-gray); font-size:0.9rem;">Fecha</span><br><strong>${ficha.date}</strong></div>
                    <div style="grid-column: 1/-1;"><span style="color:var(--clr-neutral-gray); font-size:0.9rem;">Servicio</span><br><strong>${ficha.serviceName}</strong></div>
                </div>
                ${extraHtml}
                <div style="margin-bottom:20px;">
                    <h4 style="margin-bottom:10px; font-size:1rem; color:var(--clr-rose-gold-dark);">Productos Usados</h4>
                    <ul style="list-style:none; padding:0; margin:0;">${prodsHtml}</ul>
                </div>
                <div>
                    <h4 style="margin-bottom:10px; font-size:1rem; color:var(--clr-rose-gold-dark);">Observaciones</h4>
                    <p style="background:#f9f9f9; padding:15px; border-radius:var(--radius-sm); border:1px solid #eee; margin:0;">${ficha.notes || 'Ninguna'}</p>
                </div>
            `;
            
            if(window.lucide) window.lucide.createIcons();

            // Configurar botón de WhatsApp
            const btnWsp = document.getElementById('btn-whatsapp-reminder');
            if(btnWsp && ficha.clientPhone) {
                btnWsp.style.display = 'inline-block';
                btnWsp.onclick = () => {
                    const phone = ficha.clientPhone.replace(/[^0-9+]/g, '');
                    const msg = encodeURIComponent(`Hola ${ficha.clientName}! Te escribimos de Nicolett Studio Fantasy. Esperamos que hayas disfrutado tu servicio de ${ficha.serviceName}. Recuerda que para mantener los resultados te sugerimos... ¡Te esperamos pronto!`);
                    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                };
            } else if(btnWsp) {
                btnWsp.style.display = 'none';
            }

            viewFichaModal.style.display = 'flex';
        });
    });

    // Eliminar Ficha (Solo Admin)
    document.querySelectorAll('.btn-del-ficha').forEach(btn => {
        btn.addEventListener('click', () => {
            if(confirm('¿Estás segura de eliminar esta ficha clínica? Esta acción no se puede deshacer.')) {
                StorageHelper.deleteFicha(btn.getAttribute('data-fichaid'));
                AppRouter.navigate('admin');
            }
        });
    });

    // Eliminar Profesional (Solo Admin)
    document.querySelectorAll('.btn-del-prof').forEach(btn => {
        btn.addEventListener('click', () => {
            if(confirm('¿Estás segura de eliminar a esta trabajadora del sistema?')) {
                StorageHelper.deleteProfessional(btn.getAttribute('data-profid'));
                AppRouter.navigate('admin');
            }
        });
    });

    // --- Lógica de Galería (Solo Admin) ---
    const formGallery = document.getElementById('form-upload-gallery');
    const statusGallery = document.getElementById('upload-status');
    
    if (formGallery) {
        formGallery.addEventListener('submit', (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('gallery-file');
            const titleInput = document.getElementById('gallery-title');
            const btnSubmit = document.getElementById('btn-upload-gallery');
            
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                statusGallery.style.display = 'block';
                btnSubmit.disabled = true;
                btnSubmit.innerText = "Procesando...";
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const MAX_WIDTH = 800;

                        if (width > MAX_WIDTH) {
                            height = Math.round(height * (MAX_WIDTH / width));
                            width = MAX_WIDTH;
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Compress to JPEG, quality 0.7 para reducir el peso para localStorage
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        
                        try {
                            StorageHelper.addGalleryImage({
                                title: titleInput.value.trim(),
                                src: dataUrl
                            });
                            AppRouter.navigate('admin'); // Recargar para ver los cambios
                        } catch(err) {
                            alert("Error: No hay más espacio en la memoria. Por favor, elimina algunas fotos de la galería primero.");
                            statusGallery.style.display = 'none';
                            btnSubmit.disabled = false;
                            btnSubmit.innerText = "Subir a Galería";
                        }
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Eliminar Ficha
    document.querySelectorAll('.btn-del-ficha').forEach(btn => {
        btn.addEventListener('click', async () => {
            if(confirm('¿Estás segura de eliminar permanentemente esta ficha?')) {
                await StorageHelper.deleteFicha(btn.getAttribute('data-fichaid'));
                if (typeof AppRouter !== 'undefined') AppRouter.navigate('admin');
            }
        });
    });

    // Eliminar imagen de galería
    document.querySelectorAll('.btn-del-gallery').forEach(btn => {
        btn.addEventListener('click', () => {
            if(confirm('¿Estás segura de eliminar esta imagen de la galería pública?')) {
                StorageHelper.deleteGalleryImage(btn.getAttribute('data-id'));
                AppRouter.navigate('admin');
            }
        });
    });

    // --- Lógica de Nueva Trabajadora ---
    const btnAddWorker = document.getElementById('btn-add-worker');
    const workerModal = document.getElementById('worker-modal');
    const closeWorker = document.getElementById('close-worker');
    const formWorker = document.getElementById('form-worker');
    
    if(btnAddWorker) {
        btnAddWorker.addEventListener('click', () => {
            if(workerModal) workerModal.style.display = 'flex';
        });
    }
    
    if(closeWorker) {
        closeWorker.addEventListener('click', () => {
            workerModal.style.display = 'none';
        });
    }

    if(formWorker) {
        formWorker.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('worker-name').value.trim();
            const email = document.getElementById('worker-email').value.trim();
            const photoInput = document.getElementById('worker-photo');
            const btnSave = document.getElementById('btn-save-worker');
            const status = document.getElementById('worker-upload-status');
            
            btnSave.disabled = true;
            status.style.display = 'block';

            let reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = async function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX = 400; // Avatar pequeño
                    if (width > MAX) { height = Math.round(height * (MAX / width)); width = MAX; }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    
                    if (typeof firebase !== 'undefined' && firebase.auth) {
                        try {
                            const secondaryAppName = "SecondaryApp" + Date.now();
                            const secondaryApp = firebase.initializeApp(firebase.app().options, secondaryAppName);
                            await secondaryApp.auth().createUserWithEmailAndPassword(email, "Nicolett123!");
                            await secondaryApp.auth().signOut();
                            secondaryApp.delete();
                        } catch (err) {
                            console.error("No se pudo crear el usuario en Auth (puede que ya exista):", err);
                        }
                    }

                    await StorageHelper.addProfessional({
                        name: name,
                        email: email,
                        role: 'profesional',
                        avatar: dataUrl
                    });
                    
                    workerModal.style.display = 'none';
                    btnSave.disabled = false;
                    status.style.display = 'none';
                    formWorker.reset();
                    if (typeof AppRouter !== 'undefined') AppRouter.navigate('admin');
                };
                img.src = event.target.result;
            };
            
            if(photoInput.files && photoInput.files[0]) {
                reader.readAsDataURL(photoInput.files[0]);
            }
        });
    }

    // --- Lógica de Nueva Clienta ---
    const btnAddClient = document.getElementById('btn-add-client');
    const clientModal = document.getElementById('client-modal');
    const closeClient = document.getElementById('close-client');
    const formClient = document.getElementById('form-client');
    
    if(btnAddClient) {
        btnAddClient.addEventListener('click', () => {
            if(clientModal) clientModal.style.display = 'flex';
        });
    }
    
    if(closeClient) {
        closeClient.addEventListener('click', () => {
            clientModal.style.display = 'none';
        });
    }

    if(formClient) {
        formClient.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('client-name-input').value.trim();
            const phone = document.getElementById('client-phone-input').value.trim();
            const products = document.getElementById('client-products').value.trim();
            
            StorageHelper.addClient({
                name,
                phone,
                lastVisit: '',
                products
            });
            
            clientModal.style.display = 'none';
            formClient.reset();
            if (typeof AppRouter !== 'undefined') AppRouter.navigate('admin');
        });
    }

    // Eliminar Clienta
    document.querySelectorAll('.btn-del-client').forEach(btn => {
        btn.addEventListener('click', () => {
            if(confirm('¿Estás segura de eliminar este registro del directorio de clientas?')) {
                StorageHelper.deleteClient(btn.getAttribute('data-id'));
                if (typeof AppRouter !== 'undefined') AppRouter.navigate('admin');
            }
        });
    });

    // --- Lógica de Nuevo Producto ---
    const btnAddProduct = document.getElementById('btn-add-product');
    const productModal = document.getElementById('product-modal');
    const closeProduct = document.getElementById('close-product');
    const formProduct = document.getElementById('form-product');
    
    if(btnAddProduct) {
        btnAddProduct.addEventListener('click', () => {
            if(productModal) productModal.style.display = 'flex';
        });
    }
    
    if(closeProduct) {
        closeProduct.addEventListener('click', () => {
            productModal.style.display = 'none';
        });
    }

    if(formProduct) {
        formProduct.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('prod-name').value.trim();
            const cat = document.getElementById('prod-cat').value;
            const stock = parseInt(document.getElementById('prod-stock').value);
            const btnSave = document.getElementById('btn-save-product');
            
            btnSave.disabled = true;
            btnSave.innerText = "Guardando...";
            
            await StorageHelper.addProduct({
                name: name,
                category: cat,
                stock: stock
            });
            
            productModal.style.display = 'none';
            btnSave.disabled = false;
            btnSave.innerText = "Guardar Producto";
            formProduct.reset();
            if (typeof AppRouter !== 'undefined') AppRouter.navigate('admin');
        });
    }
}
