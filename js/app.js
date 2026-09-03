/**
 * Router simple basado en JavaScript puro para inyectar vistas
 */

const AppRouter = {
    _navTimeout: null,
    routes: {
        'home': renderHomeView,
        'galeria': renderGaleriaView,
        'agendar': renderAgendarView,
        'admin': renderAdminView
    },

    init: function () {
        // Interceptar clicks en enlaces de navegación
        document.querySelectorAll('a[data-route]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = e.currentTarget.getAttribute('data-route');
                this.navigate(route);

                // Actualizar clase activa en el menú desktop
                if (e.currentTarget.classList.contains('nav-link')) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                }

                // Cerrar menú móvil si está abierto
                const navLinks = document.getElementById('nav-links');
                if (navLinks.classList.contains('show')) {
                    navLinks.classList.remove('show');
                }
            });
        });

        // Cargar ruta inicial
        this.navigate('home');
    },

    navigate: function (route) {
        const contentArea = document.getElementById('app-content');
        if (this.routes[route]) {
            if (this._navTimeout) clearTimeout(this._navTimeout);

            // Animación de salida (opcional)
            contentArea.style.opacity = '0';

            this._navTimeout = setTimeout(() => {
                // Inyectar HTML de la nueva vista
                contentArea.innerHTML = this.routes[route]();

                // Re-inicializar iconos de Lucide para los nuevos elementos inyectados
                if (window.lucide) {
                    window.lucide.createIcons();
                }

                // Ejecutar scripts específicos de la vista si existen
                if (route === 'home') initHomeEvents();
                if (route === 'agendar') initAgendarEvents();
                if (route === 'admin') initAdminEvents();

                // Animación de entrada
                contentArea.style.transition = 'opacity 0.3s ease';
                contentArea.style.opacity = '1';

                // Scroll top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
        }
    }
};

// --- VISTAS (Views) ---

function renderHomeView() {
    return `
        <!-- Hero Section -->
        <section class="hero-section" style="padding: 100px 0; background: linear-gradient(to right, var(--clr-nude-light), white); position:relative; overflow:hidden;">
            <div class="container" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 40px;">
                <div style="flex: 1; min-width: 300px; z-index: 1;">
                    <h1 style="font-size: 3.5rem; color: var(--clr-rose-gold-dark); margin-bottom: 20px; line-height: 1.2;">
                        Belleza a tu ritmo<br>y sin barreras.
                    </h1>
                    <p style="font-size: 1.2rem; color: var(--clr-neutral-gray); margin-bottom: 30px;">
                        Descubre una experiencia integral, cercana y adaptada a tus tiempos. Agenda tu momento de autocuidado hoy.
                    </p>
                    <button class="btn btn-primary" onclick="AppRouter.navigate('agendar')" style="font-size: 1.1rem; padding: 15px 35px;">
                        <i data-lucide="calendar"></i> Agenda tu cita
                    </button>
                </div>
                <div style="flex: 1; min-width: 300px; position: relative;">
                    <!-- Imagen decorativa con bordes redondeados y sombra -->
                    <img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                         alt="Nicolett Studio" 
                         style="width: 100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-medium); transform: rotate(2deg);">
                </div>
            </div>
        </section>

        <!-- About Us Section -->
        <section class="section" id="sobre-nosotros" style="background-color: white;">
            <div class="container">
                <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 50px;">
                    <div style="flex: 1; min-width: 300px; position: relative;">
                        <!-- Imagen decorativa 1 -->
                        <img src="img/sobre-nosotros.jpg" 
                             alt="Sobre Nicolett Studio" 
                             style="width: 100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-medium); position: relative; z-index: 2; object-fit: cover; aspect-ratio: 4/3;">
                        <!-- Fondo decorativo -->
                        <div style="position: absolute; top: 20px; left: -20px; right: 20px; bottom: -20px; border: 2px solid var(--clr-rose-gold); border-radius: var(--radius-lg); z-index: 1;"></div>
                    </div>
                    <div style="flex: 1; min-width: 300px;">
                        <h2 class="section-title" style="text-align: left; margin-bottom: 10px;">Sobre Nosotros</h2>
                        <h3 style="color: var(--clr-rose-gold); margin-bottom: 20px; font-family: var(--font-heading); font-size: 1.5rem; font-style: italic;">Tu espacio seguro de belleza</h3>
                        <p style="font-size: 1.1rem; color: var(--clr-neutral-gray); margin-bottom: 20px; line-height: 1.8;">
                            En <strong>Nicolett Studio Fantasy</strong>, creemos que la belleza no tiene reglas, géneros ni barreras. Nacimos con el propósito de crear un ambiente cercano y relajante, donde cada persona pueda desconectarse del estrés diario y potenciar su estilo único.
                        </p>
                        <p style="font-size: 1.1rem; color: var(--clr-neutral-gray); margin-bottom: 30px; line-height: 1.8;">
                            Nuestro equipo está formado por especialistas apasionadas que no solo dominan las últimas tendencias, sino que te escuchan para entender exactamente lo que buscas. Aquí, la atención es a tu ritmo.
                        </p>
                        <div style="display: flex; gap: 40px;">
                            <div>
                                <h4 style="color: var(--clr-rose-gold-dark); font-size: 2rem; margin-bottom: 5px; font-family: var(--font-heading);">+500</h4>
                                <p style="font-size: 0.95rem; color: var(--clr-neutral-gray); font-weight: 500;">Clientas Felices</p>
                            </div>
                            <div>
                                <h4 style="color: var(--clr-rose-gold-dark); font-size: 2rem; margin-bottom: 5px; font-family: var(--font-heading);">100%</h4>
                                <p style="font-size: 0.95rem; color: var(--clr-neutral-gray); font-weight: 500;">Personalizado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Carousel Section -->
        <section class="section" style="background-color: var(--clr-nude-light);">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Nuestros Servicios</h2>
                    <p class="section-subtitle">Explora algunos de los servicios favoritos de nuestras clientas.</p>
                </div>
                
                <div class="carousel-container" style="display: flex; overflow-x: auto; gap: 20px; padding-bottom: 20px; scroll-snap-type: x mandatory; scrollbar-width: thin; scrollbar-color: var(--clr-rose-gold) var(--clr-nude-light);">
                    ${mockData.services.map(s => `
                        <div class="card" style="min-width: 300px; max-width: 300px; flex: 0 0 auto; scroll-snap-align: start; padding: 0; overflow: hidden; border: none; box-shadow: var(--shadow-medium);">
                            <img src="${s.image}" alt="${s.name}" style="width: 100%; height: 250px; object-fit: cover;">
                            <div style="padding: 20px;">
                                <h3 style="font-size: 1.2rem; margin-bottom: 10px;">${s.name}</h3>
                                <div style="display:flex; justify-content: space-between; align-items:center;">
                                    <span style="color: var(--clr-rose-gold-dark); font-weight: bold; font-size:1.1rem;">$${s.price.toLocaleString('es-CL')}</span>
                                    <button class="btn btn-primary btn-sm" style="padding: 5px 10px;" onclick="AppRouter.navigate('agendar')">Agendar</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
        
        <!-- Location & Hours Section -->
        <section class="section" style="background-color: var(--clr-nude-light);">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Ubicación y Horarios</h2>
                    <p class="section-subtitle">Encuéntranos fácilmente y visítanos en el horario que más te acomode.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; align-items: start;">
                    <div class="card" style="padding: 30px; border: none; box-shadow: var(--shadow-medium);">
                        <h3 style="margin-bottom: 15px; color: var(--clr-rose-gold-dark); display: flex; align-items: center; gap: 10px;">
                            <i data-lucide="map-pin" style="color: var(--clr-rose-gold);"></i> Nuestra Dirección
                        </h3>
                        <p style="font-size: 1.1rem; margin-bottom: 30px; color: var(--clr-neutral-dark);">
                            Avenida Bernardo O'Higgins 979, Buin
                        </p>
                        
                        <h3 style="margin-bottom: 15px; color: var(--clr-rose-gold-dark); display: flex; align-items: center; gap: 10px;">
                            <i data-lucide="clock" style="color: var(--clr-rose-gold);"></i> Horario de Atención
                        </h3>
                        <ul style="list-style: none; padding: 0; color: var(--clr-neutral-gray);">
                            <li style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--clr-nude);">
                                <span>Lunes a Sábado</span>
                                <strong>09:00 - 21:00</strong>
                            </li>
                            <li style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px;">
                                <span>Domingo</span>
                                <strong>Cerrado</strong>
                            </li>
                        </ul>
                    </div>
                    
                    <div style="border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-medium); height: 100%; min-height: 350px;">
                        <iframe 
                            src="https://maps.google.com/maps?q=avenida+bernardo+o'higgins+979,+buin&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                            width="100%" 
                            height="100%" 
                            style="border:0; min-height: 350px;" 
                            allowfullscreen="" 
                            loading="lazy" 
                            referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function renderGaleriaView() {
    const images = StorageHelper.getGallery();

    return `
        <div class="container section">
            <div class="section-header">
                <h2 class="section-title">Galería de Trabajos</h2>
                <p class="section-subtitle">Conoce los espectaculares resultados creados por nuestras especialistas. Desliza para ver más.</p>
            </div>
            
            <div style="display: flex; overflow-x: auto; gap: 30px; padding: 20px 0 40px; scroll-snap-type: x mandatory; scrollbar-width: thin; scrollbar-color: var(--clr-rose-gold) var(--clr-nude-light);">
                ${images.length === 0 ? '<p style="text-align:center; width:100%;">Aún no hay fotos en la galería.</p>' : ''}
                ${images.map(img => `
                    <div style="width: 85vw; max-width: 600px; flex: 0 0 auto; scroll-snap-align: center; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-medium); position: relative; aspect-ratio: 1/1;">
                        <img src="${img.src}" alt="${img.title}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    </div>
                `).join('')}
            </div>

            <div style="text-align: center; margin-top: 10px; padding: 30px 20px; border-top: 1px solid var(--clr-nude);">
                <p style="font-size: 1.1rem; color: var(--clr-neutral-gray); margin-bottom: 15px;">Para ver más de nuestros trabajos, visita nuestro Instagram:</p>
                <a href="https://instagram.com/nicolettstudiofantasy" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size: 1.1rem; padding: 12px 30px;">
                    <i data-lucide="instagram"></i> @nicolettstudiofantasy
                </a>
            </div>
        </div>
    `;
}

function renderAgendarView() {
    const professionals = StorageHelper.getProfessionals();
    return `
        <div class="container section">
            <div class="section-header">
                <h2 class="section-title">Agendar Cita</h2>
                <p class="section-subtitle">Sigue estos simples pasos para reservar tu momento.</p>
            </div>
            
            <div class="booking-container" style="max-width: 800px; margin: 0 auto; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-medium); padding: 40px; position: relative;">
                
                <!-- Progress Tabs -->
                <div style="display: flex; justify-content: space-between; margin-bottom: 40px; position: relative;">
                    <div style="position: absolute; top: 15px; left: 0; right: 0; height: 2px; background: var(--clr-nude); z-index: 1;"></div>
                    ${['Servicio', 'Profesional', 'Fecha', 'Tus Datos', 'Confirmar'].map((step, index) => `
                        <div style="z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                            <div class="step-circle ${index === 0 ? 'active' : ''}" id="step-circle-${index + 1}" style="width: 32px; height: 32px; border-radius: 50%; background: ${index === 0 ? 'var(--clr-rose-gold)' : 'var(--clr-nude)'}; color: ${index === 0 ? 'white' : 'var(--clr-neutral-gray)'}; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: all 0.3s;">
                                ${index + 1}
                            </div>
                            <span style="font-size: 0.85rem; font-weight: 500; color: ${index === 0 ? 'var(--clr-neutral-dark)' : 'var(--clr-neutral-gray)'};">${step}</span>
                        </div>
                    `).join('')}
                </div>

                <!-- Step 1: Services -->
                <div id="booking-step-1" class="booking-step">
                    <h3 style="margin-bottom: 20px;">1. Selecciona un Servicio</h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        ${mockData.services.map(s => `
                            <div class="service-select-card card" data-service-id="${s.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; cursor: pointer; border: 2px solid transparent;">
                                <div>
                                    <h4 style="font-size: 1.1rem; margin-bottom: 5px;">${s.name}</h4>
                                    <p style="font-size: 0.9rem; color: var(--clr-neutral-gray);"><i data-lucide="clock" style="width:14px; height:14px; display:inline; vertical-align:middle;"></i> ${s.duration} min</p>
                                </div>
                                <div style="font-weight: 600; color: var(--clr-rose-gold-dark);">
                                    $${s.price.toLocaleString('es-CL')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 30px; text-align: right;">
                        <button class="btn btn-primary" id="btn-next-1" disabled>Siguiente <i data-lucide="chevron-right"></i></button>
                    </div>
                </div>

                <!-- Step 2: Professional -->
                <div id="booking-step-2" class="booking-step" style="display: none;">
                    <h3 style="margin-bottom: 20px;">2. Selecciona un Profesional</h3>
                    <div class="prof-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                        ${professionals.map(p => `
                            <div class="prof-select-card card text-center" data-prof-id="${p.id}" style="cursor: pointer; border: 2px solid transparent;">
                                <img src="${p.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}" alt="${p.name || 'Profesional'}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; object-fit: cover;">
                                <h4>${p.name || 'Sin Nombre'}</h4>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                        <button class="btn btn-outline" id="btn-prev-2"><i data-lucide="chevron-left"></i> Atrás</button>
                        <button class="btn btn-primary" id="btn-next-2" disabled>Siguiente <i data-lucide="chevron-right"></i></button>
                    </div>
                </div>

                <!-- Step 3: Date & Needs -->
                <div id="booking-step-3" class="booking-step" style="display: none;">
                    <h3 style="margin-bottom: 20px;">3. Fecha, Hora y Necesidades</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                        <div>
                            <label style="display: block; margin-bottom: 10px; font-weight: 500;">Fecha</label>
                            <input type="date" id="booking-date" style="width: 100%; padding: 12px; border: 1px solid var(--clr-nude); border-radius: var(--radius-sm); font-family: inherit; margin-bottom: 20px;">
                            
                            <label style="display: block; margin-bottom: 10px; font-weight: 500;">Hora Disponible</label>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-height: 200px; overflow-y: auto; padding-right: 10px;" id="time-slots-container">
                                ${mockData.timeSlots.map(t => `
                                    <button class="time-slot-btn" data-time="${t}" style="padding: 10px; border: 1px solid var(--clr-nude); border-radius: var(--radius-sm); background: white; transition: all 0.2s;">${t}</button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 15px; font-weight: 500;">Checklist Especial (Opcional)</label>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox" id="check-kids" style="width: 18px; height: 18px;">
                                    <span>Asistiré con niños (Kids Friendly)</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox" id="check-time" style="width: 18px; height: 18px;">
                                    <span>Tengo el tiempo justo</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox" id="check-event" style="width: 18px; height: 18px;">
                                    <span>Es para un evento especial</span>
                                </label>
                            </div>
                            
                            <label style="display: block; margin-top: 20px; margin-bottom: 10px; font-weight: 500;">Notas adicionales</label>
                            <textarea id="booking-notes" rows="3" style="width: 100%; padding: 12px; border: 1px solid var(--clr-nude); border-radius: var(--radius-sm); font-family: inherit; resize: vertical;"></textarea>
                        </div>
                    </div>

                    <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                        <button class="btn btn-outline" id="btn-prev-3"><i data-lucide="chevron-left"></i> Atrás</button>
                        <button class="btn btn-primary" id="btn-next-3" disabled>Siguiente <i data-lucide="chevron-right"></i></button>
                    </div>
                </div>

                <!-- Step 4: Personal Info -->
                <div id="booking-step-4" class="booking-step" style="display: none;">
                    <h3 style="margin-bottom: 20px;">4. Tus Datos</h3>
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 10px; font-weight: 500;">Nombre Completo</label>
                            <input type="text" id="client-name" placeholder="Ej. Camila Silva" style="width: 100%; padding: 12px; border: 1px solid var(--clr-nude); border-radius: var(--radius-sm); font-family: inherit;">
                            <span id="error-name" style="color: red; font-size: 0.85rem; display: none; margin-top: 5px; display:block;"></span>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 10px; font-weight: 500;">Teléfono</label>
                            <input type="tel" id="client-phone" placeholder="Ej. +56 9 4032 2551" style="width: 100%; padding: 12px; border: 1px solid var(--clr-nude); border-radius: var(--radius-sm); font-family: inherit;">
                            <span id="error-phone" style="color: red; font-size: 0.85rem; display: none; margin-top: 5px; display:block;"></span>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 10px; font-weight: 500;">Correo Electrónico (Opcional)</label>
                            <input type="email" id="client-email" placeholder="Ej. correo@email.com" style="width: 100%; padding: 12px; border: 1px solid var(--clr-nude); border-radius: var(--radius-sm); font-family: inherit;">
                            <span id="error-email" style="color: red; font-size: 0.85rem; display: none; margin-top: 5px; display:block;"></span>
                        </div>
                    </div>
                    <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                        <button class="btn btn-outline" id="btn-prev-4"><i data-lucide="chevron-left"></i> Atrás</button>
                        <button class="btn btn-primary" id="btn-next-4" disabled>Siguiente <i data-lucide="chevron-right"></i></button>
                    </div>
                </div>

                <!-- Step 5: Summary -->
                <div id="booking-step-5" class="booking-step" style="display: none;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="width: 60px; height: 60px; background: #4CAF50; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                            <i data-lucide="check" style="width: 30px; height: 30px;"></i>
                        </div>
                        <h3>Confirma tu cita</h3>
                    </div>
                    
                    <div class="card" style="background: var(--clr-nude-light); border: none; margin-bottom: 30px;">
                        <h4 style="margin-bottom: 15px; border-bottom: 1px solid var(--clr-nude); padding-bottom: 10px;">Resumen</h4>
                        <p style="margin-bottom: 8px;"><strong>Cliente:</strong> <span id="summary-client">-</span></p>
                        <p style="margin-bottom: 8px;"><strong>Servicio:</strong> <span id="summary-service">-</span></p>
                        <p style="margin-bottom: 8px;"><strong>Profesional:</strong> <span id="summary-prof">-</span></p>
                        <p style="margin-bottom: 8px;"><strong>Fecha:</strong> <span id="summary-date">-</span></p>
                        <p style="margin-bottom: 8px;"><strong>Hora:</strong> <span id="summary-time">-</span></p>
                        <p style="margin-bottom: 8px; font-size: 1.2rem; color: var(--clr-rose-gold-dark); margin-top: 15px;"><strong>Total:</strong> <span id="summary-price">-</span></p>
                    </div>

                    <!-- Política de Reserva -->
                    <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: var(--radius-sm); margin-bottom: 30px; font-size: 0.9rem;">
                        <strong><i data-lucide="alert-circle" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle;"></i> Política de Reserva:</strong> Para confirmar la cita se debe realizar un abono de $5.000. Si necesita cancelar o reprogramar, debe avisar con al menos <strong>24 horas de anticipación</strong>, de lo contrario no se devolverá el abono.
                    </div>

                    <div style="display: flex; justify-content: space-between;">
                        <button class="btn btn-outline" id="btn-prev-5"><i data-lucide="chevron-left"></i> Atrás</button>
                        <button class="btn btn-primary" id="btn-confirm-booking">Confirmar Reserva</button>
                    </div>
                </div>
            </div>
            
            <!-- Modal de Éxito Oculto -->
            <div id="success-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index: 2000; align-items:center; justify-content:center;">
                <div class="card text-center" style="max-width: 400px; width: 90%;">
                    <i data-lucide="party-popper" style="color: var(--clr-rose-gold); width: 60px; height: 60px; margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 15px;">¡Cita Agendada!</h3>
                    <p style="color: var(--clr-neutral-gray); margin-bottom: 25px;">¡Ganaste 50 Fantasy Points!</p>
                    <button class="btn btn-primary btn-block" onclick="document.getElementById('success-modal').style.display='none'; AppRouter.navigate('home')">Volver al Inicio</button>
                </div>
            </div>
        </div>
    `;
}

function renderAdminView() {
    const auth = StorageHelper.getAuth();
    if (!auth.loggedIn) {
        return `<div class="container section text-center"><h3>Acceso Restringido</h3><p>Por favor inicie sesión desde el botón "Portal Interno".</p></div>`;
    }

    const isAdmin = auth.user.role === 'admin';
    const appointments = StorageHelper.getAppointments();
    const inventory = StorageHelper.getInventory();
    const professionals = StorageHelper.getProfessionals();
    const fichas = StorageHelper.getFichas();
    const clientsList = StorageHelper.getClients();

    // Filtramos la agenda según el rol
    let myAppointments = appointments;
    if (!isAdmin) {
        myAppointments = appointments.filter(a => (a.profesional === auth.user.name) || (a.profId === auth.user.id));
    }

    // Tabla de Agenda
    let agendaRows = '';
    if (myAppointments.length === 0) {
        agendaRows = `<tr><td colspan="6" class="text-center" style="padding: 20px;">No hay citas para mostrar.</td></tr>`;
    } else {
        myAppointments.forEach(app => {
            const serviceName = app.servicio || mockData.services.find(s => s.id === app.serviceId)?.name || 'Servicio';
            const profName = app.profesional || professionals.find(p => p.id === app.profId)?.name || 'Prof.';
            const isFichaDone = fichas.some(f => f.appointmentId === app.id);
            
            let needsHtml = '';
            if (app.needs) {
                const tags = [];
                if (app.needs.kids) tags.push('Ir con Niños');
                if (app.needs.time) tags.push('Poco tiempo');
                if (app.needs.event) tags.push('Evento especial');
                if (tags.length > 0) {
                    needsHtml = `<div style="margin-top: 5px; display: flex; gap: 5px; flex-wrap: wrap;">
                        ${tags.map(t => `<span style="background: var(--clr-nude-light); color: var(--clr-rose-gold-dark); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">${t}</span>`).join('')}
                    </div>`;
                }
            }

            let notesHtml = '';
            if (app.notes && app.notes.trim() !== '') {
                notesHtml = `<div style="margin-top: 5px; font-size: 0.8rem; color: var(--clr-neutral-gray); font-style: italic; border-left: 2px solid var(--clr-rose-gold); padding-left: 5px;">"${app.notes}"</div>`;
            }

            agendaRows += `
                <tr style="border-bottom: 1px solid var(--clr-nude);">
                    <td style="padding: 15px;">${app.date} <br><strong style="color: var(--clr-rose-gold-dark);">${app.time}</strong></td>
                    <td style="padding: 15px;"><strong>${app.clientName || 'Cliente'}</strong><br><small>${app.clientPhone}</small></td>
                    <td style="padding: 15px;">
                        ${serviceName} ${isAdmin ? `<br><small>${profName}</small>` : ''}
                        ${needsHtml}
                        ${notesHtml}
                    </td>
                    <td style="padding: 15px;">
                        <select class="status-selector" data-appid="${app.id}" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc; font-size: 0.85rem; outline: none; background: #e8f5e9; color: #2e7d32; font-weight: bold; cursor:pointer;">
                            <option value="confirmada" ${(app.status || 'confirmada') === 'confirmada' ? 'selected' : ''}>CONFIRMADA</option>
                            <option value="completada" ${app.status === 'completada' ? 'selected' : ''}>COMPLETADA</option>
                            <option value="cancelada" ${app.status === 'cancelada' ? 'selected' : ''}>CANCELADA</option>
                            <option value="no asiste" ${app.status === 'no asiste' ? 'selected' : ''}>NO ASISTE</option>
                        </select>
                    </td>
                    <td style="padding: 15px;">
                        ${!isFichaDone ? `<button class="btn btn-outline btn-sm btn-ficha" data-appid="${app.id}">Crear Ficha</button>` : `<span style="color: #4CAF50;"><i data-lucide="check-circle" style="width:16px; display:inline; vertical-align:middle;"></i> Ficha Lista</span>`}
                    </td>
                </tr>
            `;
        });
    }

    // Tabla de Fichas
    let myFichas = fichas;
    if (!isAdmin) {
        myFichas = fichas.filter(f => {
            const appointment = appointments.find(a => a.id === f.appointmentId);
            return appointment && (appointment.profesional === auth.user.name || appointment.profId === auth.user.id);
        });
    }

    let fichasRows = '';
    if (myFichas.length === 0) {
        fichasRows = `<tr><td colspan="5" class="text-center" style="padding: 20px;">No hay fichas registradas.</td></tr>`;
    } else {
        myFichas.forEach(f => {
            fichasRows += `
                <tr style="border-bottom: 1px solid var(--clr-nude);">
                    <td style="padding: 15px;">${f.date}</td>
                    <td style="padding: 15px;"><strong>${f.clientName}</strong></td>
                    <td style="padding: 15px;">${f.serviceName}</td>
                    <td style="padding: 15px;">
                        <button class="btn btn-outline btn-sm btn-view-ficha" data-fichaid="${f.id}"><i data-lucide="eye"></i></button>
                        ${isAdmin ? `<button class="btn btn-outline btn-sm btn-del-ficha" style="color:red; border-color:red;" data-fichaid="${f.id}"><i data-lucide="trash-2"></i></button>` : ''}
                    </td>
                </tr>
            `;
        });
    }

    // Tabla de Inventario
    let invRows = '';
    inventory.forEach(p => {
        invRows += `
            <tr style="border-bottom: 1px solid var(--clr-nude);">
                <td style="padding: 15px;">${p.name}</td>
                <td style="padding: 15px;">${mockData.categories.find(c => c.id === p.category)?.label || p.category}</td>
                <td style="padding: 15px;"><strong>${p.stock}</strong></td>
            </tr>
        `;
    });

    // Tabla Trabajadoras
    let profRows = '';
    professionals.forEach(p => {
        profRows += `
            <tr style="border-bottom: 1px solid var(--clr-nude);">
                <td style="padding: 15px; display:flex; align-items:center; gap:10px;">
                    <img src="${p.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">
                    ${p.name || 'Sin Nombre'}
                </td>
                <td style="padding: 15px;">${(p.role || 'profesional').toUpperCase()}</td>
                <td style="padding: 15px;">
                    ${isAdmin && p.id !== auth.user.id ? `<button class="btn btn-outline btn-sm btn-del-prof" style="color:red; border-color:red;" data-profid="${p.id}"><i data-lucide="trash-2"></i></button>` : ''}
                </td>
            </tr>
        `;
    });

    // Tabla Clientas
    let clientRows = '';
    if (clientsList.length === 0) {
        clientRows = `<tr><td colspan="4" class="text-center" style="padding: 20px;">No hay clientas en el directorio.</td></tr>`;
    } else {
        clientsList.forEach(c => {
            clientRows += `
                <tr style="border-bottom: 1px solid var(--clr-nude);">
                    <td style="padding: 15px;"><strong>${c.name}</strong><br><small>${c.phone || ''}</small></td>
                    <td style="padding: 15px;">${c.lastVisit || 'Sin registro'}</td>
                    <td style="padding: 15px;">${c.products || 'N/A'}</td>
                    <td style="padding: 15px;">
                        <button class="btn btn-outline btn-sm btn-del-client" style="color:red; border-color:red;" data-id="${c.id}"><i data-lucide="trash-2"></i></button>
                    </td>
                </tr>
            `;
        });
    }

    return `
        <div class="container section">
            <div class="section-header" style="margin-bottom: 30px; display:flex; justify-content: space-between; align-items:center;">
                <h2 class="section-title" style="text-align: left; margin:0;">Portal ${isAdmin ? 'Administrador' : 'Trabajadora'}</h2>
                <div style="font-weight:bold; color:var(--clr-rose-gold);">${auth.user.name}</div>
            </div>
            
            <div class="tabs-container" style="display:flex; gap:10px; margin-bottom:20px; border-bottom:1px solid #ddd;">
                <button class="admin-tab active" data-target="tab-agenda" style="background:none; border:none; padding:10px 20px; cursor:pointer; border-bottom:3px solid var(--clr-rose-gold); font-weight:bold; color:var(--clr-neutral-dark);">Agenda</button>
                <button class="admin-tab" data-target="tab-fichas" style="background:none; border:none; padding:10px 20px; cursor:pointer; border-bottom:3px solid transparent; color:var(--clr-neutral-gray);">Fichas Clínicas</button>
                ${isAdmin ? `
                <button class="admin-tab" data-target="tab-clientas" style="background:none; border:none; padding:10px 20px; cursor:pointer; border-bottom:3px solid transparent; color:var(--clr-neutral-gray);">Directorio Clientas</button>
                <button class="admin-tab" data-target="tab-inventario" style="background:none; border:none; padding:10px 20px; cursor:pointer; border-bottom:3px solid transparent; color:var(--clr-neutral-gray);">Inventario</button>
                <button class="admin-tab" data-target="tab-profs" style="background:none; border:none; padding:10px 20px; cursor:pointer; border-bottom:3px solid transparent; color:var(--clr-neutral-gray);">Trabajadoras</button>
                <button class="admin-tab" data-target="tab-galeria" style="background:none; border:none; padding:10px 20px; cursor:pointer; border-bottom:3px solid transparent; color:var(--clr-neutral-gray);">Galería</button>
                ` : ''}
            </div>

            <!-- Tab Agenda -->
            <div id="tab-agenda" class="admin-tab-content">
                <div class="card" style="padding: 0; overflow: hidden;">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background: var(--clr-nude-light); color: var(--clr-neutral-dark);">
                                    <th style="padding: 15px;">Fecha / Hora</th>
                                    <th style="padding: 15px;">Cliente</th>
                                    <th style="padding: 15px;">Servicio</th>
                                    <th style="padding: 15px;">Estado</th>
                                    <th style="padding: 15px;">Acción</th>
                                </tr>
                            </thead>
                            <tbody>${agendaRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Tab Fichas -->
            <div id="tab-fichas" class="admin-tab-content" style="display:none;">
                <div style="display:flex; justify-content:flex-end; margin-bottom: 15px;">
                    <button class="btn btn-primary" id="btn-crear-ficha-manual"><i data-lucide="plus"></i> Crear Ficha Manual</button>
                </div>
                <div class="card" style="padding: 0; overflow: hidden;">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background: var(--clr-nude-light); color: var(--clr-neutral-dark);">
                                    <th style="padding: 15px;">Fecha</th>
                                    <th style="padding: 15px;">Cliente</th>
                                    <th style="padding: 15px;">Servicio</th>
                                    <th style="padding: 15px;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>${fichasRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            ${isAdmin ? `
            <!-- Tab Inventario -->
            <div id="tab-inventario" class="admin-tab-content" style="display:none;">
                <div style="display:flex; justify-content:flex-end; margin-bottom: 15px;">
                    <button class="btn btn-primary" id="btn-add-product"><i data-lucide="plus"></i> Añadir Producto</button>
                </div>
                <div class="card" style="padding: 0; overflow: hidden;">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background: var(--clr-nude-light); color: var(--clr-neutral-dark);">
                                    <th style="padding: 15px;">Producto</th>
                                    <th style="padding: 15px;">Categoría</th>
                                    <th style="padding: 15px;">Stock Actual</th>
                                </tr>
                            </thead>
                            <tbody>${invRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Tab Clientas -->
            <div id="tab-clientas" class="admin-tab-content" style="display:none;">
                <div style="display:flex; justify-content:flex-end; margin-bottom: 15px;">
                    <button class="btn btn-primary" id="btn-add-client"><i data-lucide="plus"></i> Añadir Clienta</button>
                </div>
                <div class="card" style="padding: 0; overflow: hidden;">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background: var(--clr-nude-light); color: var(--clr-neutral-dark);">
                                    <th style="padding: 15px;">Clienta</th>
                                    <th style="padding: 15px;">Última Visita</th>
                                    <th style="padding: 15px;">Productos / Preferencias</th>
                                    <th style="padding: 15px;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>${clientRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Tab Trabajadoras -->
            <div id="tab-profs" class="admin-tab-content" style="display:none;">
                <div style="display:flex; justify-content:flex-end; margin-bottom: 15px;">
                    <button class="btn btn-primary" id="btn-add-worker"><i data-lucide="plus"></i> Añadir Trabajadora</button>
                </div>
                <div class="card" style="padding: 0; overflow: hidden;">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background: var(--clr-nude-light); color: var(--clr-neutral-dark);">
                                    <th style="padding: 15px;">Nombre</th>
                                    <th style="padding: 15px;">Rol</th>
                                    <th style="padding: 15px;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>${profRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Tab Galería -->
            <div id="tab-galeria" class="admin-tab-content" style="display:none;">
                <div class="card" style="margin-bottom:20px; padding:20px;">
                    <h3 style="margin-bottom:15px;">Subir Nueva Foto</h3>
                    <form id="form-upload-gallery" style="display:flex; flex-wrap:wrap; gap:15px; align-items:flex-end;">
                        <div style="flex: 1; min-width: 200px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Título / Servicio</label>
                            <input type="text" id="gallery-title" required placeholder="Ej: Manicure Permanente" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        <div style="flex: 1; min-width: 250px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Seleccionar Imagen (Máx 5MB, se comprimirá automáticamente)</label>
                            <input type="file" id="gallery-file" required accept="image/*" style="width:100%; padding:7px; border:1px solid #ccc; border-radius:4px; background:white;">
                        </div>
                        <div style="flex: 0 0 auto;">
                            <button type="submit" class="btn btn-primary" id="btn-upload-gallery"><i data-lucide="upload"></i> Subir a Galería</button>
                        </div>
                    </form>
                    <p id="upload-status" style="margin-top:10px; color:var(--clr-neutral-gray); font-size:0.9rem; display:none;">Comprimiendo imagen...</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    ${StorageHelper.getGallery().map(img => `
                        <div style="border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-medium); position: relative; height: 200px;">
                            <img src="${img.src}" alt="${img.title}" style="width:100%; height:100%; object-fit:cover;">
                            <div style="position:absolute; bottom:0; left:0; width:100%; padding:10px; background:rgba(0,0,0,0.7); color:white; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${img.title}</span>
                                <button class="btn-del-gallery" data-id="${img.id}" style="background:none; border:none; color:var(--clr-rose-gold); cursor:pointer;"><i data-lucide="trash-2" style="width:18px;"></i></button>
                            </div>
                        </div>
                    `).join('')}
                    ${StorageHelper.getGallery().length === 0 ? '<p>No hay imágenes en la galería.</p>' : ''}
                </div>
            </div>
            ` : ''}
            
            <!-- Modal Ficha Form (Oculto) -->
            <div id="ficha-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index: 2000; align-items:center; justify-content:center; padding:20px;">
                <div class="card" style="max-width: 500px; width: 100%; position:relative; max-height:90vh; overflow-y:auto; background:white;">
                    <button id="close-ficha" style="position:absolute; top:15px; right:15px; background:none; border:none; cursor:pointer;"><i data-lucide="x"></i></button>
                    <h3 style="margin-bottom: 20px;">Ficha Clínica</h3>
                    <form id="form-ficha">
                        <input type="hidden" id="ficha-appid">
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Cliente:</label>
                            <input type="text" id="ficha-client" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Servicio:</label>
                            <input type="text" id="ficha-service" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        
                        <!-- Campos Dinámicos -->
                        <div id="ficha-dynamic-fields" style="background: var(--clr-nude-light); padding:15px; border-radius:4px; margin-bottom:15px; display:none;">
                            <!-- Inyectado por JS -->
                        </div>

                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Productos Utilizados:</label>
                            <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding:10px; border-radius:4px;" id="ficha-products-list">
                                ${inventory.map(p => `
                                    <label style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; cursor:pointer;">
                                        <span><input type="checkbox" class="ficha-prod-check" value="${p.id}" data-name="${p.name}"> ${p.name} (Stock: ${p.stock})</span>
                                        <input type="number" class="ficha-prod-qty" id="qty_${p.id}" value="1" min="1" max="${p.stock}" style="width:60px; padding:4px;" disabled>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Observaciones:</label>
                            <textarea id="ficha-notes" rows="3" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; font-family:inherit;"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Guardar Ficha</button>
                    </form>
                </div>
            </div>
            
            <!-- Modal Ver Ficha -->
            <div id="view-ficha-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index: 2000; align-items:center; justify-content:center; padding:20px;">
                <div class="card" style="max-width: 500px; width: 100%; position:relative; max-height:90vh; overflow-y:auto; background:white;">
                    <button onclick="document.getElementById('view-ficha-modal').style.display='none'" style="position:absolute; top:15px; right:15px; background:none; border:none; cursor:pointer;"><i data-lucide="x"></i></button>
                    <h3 style="margin-bottom: 20px;">Detalle de Ficha</h3>
                    <div id="view-ficha-content"></div>
                    <div style="margin-top: 20px; text-align:center;">
                        <button class="btn btn-outline" id="btn-whatsapp-reminder" style="border-color:#25D366; color:#25D366;"><i data-lucide="message-circle" style="display:inline; vertical-align:middle; width:18px;"></i> Enviar Recordatorio</button>
                    </div>
                </div>
            </div>

            <!-- Modal Trabajadora -->
            <div id="worker-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index: 2000; align-items:center; justify-content:center; padding:20px;">
                <div class="card" style="max-width: 400px; width: 100%; position:relative; background:white;">
                    <button id="close-worker" style="position:absolute; top:15px; right:15px; background:none; border:none; cursor:pointer;"><i data-lucide="x"></i></button>
                    <h3 style="margin-bottom: 20px;">Añadir Trabajadora</h3>
                    <form id="form-worker">
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Nombre Completo:</label>
                            <input type="text" id="worker-name" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Correo Electrónico:</label>
                            <input type="email" id="worker-email" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Foto de Perfil:</label>
                            <input type="file" id="worker-photo" accept="image/*" required style="width:100%; padding:7px; border:1px solid #ccc; border-radius:4px; background:white;">
                        </div>
                        <p style="margin-bottom: 15px; color: var(--clr-neutral-gray); font-size: 0.85rem; border-left: 3px solid var(--clr-rose-gold); padding-left: 10px;">
                            La contraseña de acceso será: <strong>Nicolett123!</strong>
                        </p>
                        <button type="submit" class="btn btn-primary btn-block" id="btn-save-worker">Guardar Trabajadora</button>
                    </form>
                    <p id="worker-upload-status" style="margin-top:10px; color:var(--clr-neutral-gray); font-size:0.9rem; display:none;">Procesando...</p>
                </div>
            </div>

            <!-- Modal Clienta -->
            <div id="client-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index: 2000; align-items:center; justify-content:center; padding:20px;">
                <div class="card" style="max-width: 400px; width: 100%; position:relative; background:white;">
                    <button id="close-client" style="position:absolute; top:15px; right:15px; background:none; border:none; cursor:pointer;"><i data-lucide="x"></i></button>
                    <h3 style="margin-bottom: 20px;">Añadir Clienta</h3>
                    <form id="form-client">
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Nombre Completo:</label>
                            <input type="text" id="client-name-input" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Teléfono:</label>
                            <input type="tel" id="client-phone-input" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Productos Favoritos / Notas:</label>
                            <textarea id="client-products" rows="3" placeholder="Ej: Ocupa acrílico marca X" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; font-family:inherit;"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" id="btn-save-client">Guardar Clienta</button>
                    </form>
                </div>
            </div>

            <!-- Modal Producto -->
            <div id="product-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index: 2000; align-items:center; justify-content:center; padding:20px;">
                <div class="card" style="max-width: 400px; width: 100%; position:relative; background:white;">
                    <button id="close-product" style="position:absolute; top:15px; right:15px; background:none; border:none; cursor:pointer;"><i data-lucide="x"></i></button>
                    <h3 style="margin-bottom: 20px;">Añadir Producto</h3>
                    <form id="form-product">
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Nombre del Producto:</label>
                            <input type="text" id="prod-name" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Categoría:</label>
                            <select id="prod-cat" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                                <option value="manos-pies">Manicure & Pedicure</option>
                                <option value="mirada">Lashista & Mirada</option>
                                <option value="capilar">Tratamientos Capilares</option>
                                <option value="bienestar">Bienestar y Relax</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Stock Inicial:</label>
                            <input type="number" id="prod-stock" required min="0" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" id="btn-save-product">Guardar Producto</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}
