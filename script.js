// Interactividad para la aplicación Duolingo Clone

// Variable para guardar el evento de instalación
let deferredPrompt;
let installButton;

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('SW registrado exitosamente:', registration.scope);
            })
            .catch(function(registrationError) {
                console.log('SW falló al registrarse:', registrationError);
            });
    });
}

// Capturar el evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt disparado');
    // Prevenir que el mini-infobar aparezca en móvil
    e.preventDefault();
    // Guardar el evento para usarlo después
    deferredPrompt = e;
    // Mostrar el botón de instalación
    showInstallButton();
});

// Crear y mostrar el botón de instalación
function showInstallButton() {
    // Crear el botón si no existe
    if (!installButton) {
        installButton = document.createElement('button');
        installButton.id = 'install-button';
        installButton.innerHTML = '<i class="fas fa-download"></i> Instalar App';
        installButton.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: linear-gradient(135deg, #58CC02 0%, #41C282 100%);
            color: white;
            border: none;
            padding: 15px 25px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(88, 204, 2, 0.4);
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease;
            animation: pulse 2s infinite;
        `;
        
        // Evento click para instalar
        installButton.addEventListener('click', async () => {
            if (!deferredPrompt) {
                alert('La instalación no está disponible en este momento. Asegúrate de estar usando HTTPS.');
                return;
            }
            
            // Mostrar el prompt de instalación
            deferredPrompt.prompt();
            
            // Esperar la respuesta del usuario
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
            
            // Limpiar el prompt guardado
            deferredPrompt = null;
            
            // Ocultar el botón
            installButton.style.display = 'none';
        });
        
        // Efecto hover
        installButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 6px 20px rgba(88, 204, 2, 0.6)';
        });
        
        installButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(88, 204, 2, 0.4)';
        });
        
        document.body.appendChild(installButton);
    } else {
        installButton.style.display = 'flex';
    }
}

// Detectar cuando la app ya está instalada
window.addEventListener('appinstalled', () => {
    console.log('PWA instalada exitosamente');
    if (installButton) {
        installButton.style.display = 'none';
    }
    // Mostrar notificación de éxito
    setTimeout(() => {
        showNotification('✅ ¡App instalada exitosamente!', 'success');
    }, 1000);
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('🦉 Academy cargado exitosamente!');

    // Elementos del DOM
    const lessonModules = document.querySelectorAll('.lesson-module');
    const navItems = document.querySelectorAll('.nav-item');
    const lessonDetailsBtn = document.querySelector('.lesson-details-btn');
    const treasureChest = document.querySelector('.treasure-chest');
    const scrollDownBtn = document.querySelector('.scroll-down');
    const duoCharacter = document.querySelector('.duo-character');
    const gemsElement = document.querySelector('.gems');
    const heartsElement = document.querySelector('.hearts');
    const streakElement = document.querySelector('.streak');
    
    // Dibujar el camino zigzag
    drawLessonPath();

    // Animación de entrada para los módulos
    lessonModules.forEach((module, index) => {
        module.style.opacity = '0';
        module.style.transform = 'scale(0.5)';
        
        setTimeout(() => {
            module.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            module.style.opacity = '1';
            module.style.transform = 'scale(1)';
        }, index * 150);
    });

    // Animación de entrada para Duo
    if (duoCharacter) {
        duoCharacter.style.opacity = '0';
        setTimeout(() => {
            duoCharacter.style.transition = 'opacity 0.8s ease';
            duoCharacter.style.opacity = '1';
        }, 800);
    }

    // Interactividad de los módulos de lección
    lessonModules.forEach(module => {
        module.addEventListener('click', function() {
            const rect = this.getBoundingClientRect();
            
            if (this.classList.contains('completed')) {
                // Efecto de pulso para lecciones completadas
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
                
                showNotification('✓ Lección completada', 'success');
                createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, '#58CC02');
            } else if (this.classList.contains('current')) {
                // Efecto para la lección actual
                this.style.transform = 'scale(1.15)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 300);
                
                showNotification('¡Comienza esta lección!', 'info');
            } else if (this.classList.contains('story')) {
                // Efecto para historias
                this.style.transform = 'scale(1.2) rotate(5deg)';
                setTimeout(() => {
                    this.style.transform = 'scale(1) rotate(0deg)';
                }, 200);
                
                showNotification('📖 Historia completada', 'success');
            } else if (this.classList.contains('locked')) {
                // Efecto para lecciones bloqueadas
                this.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
                
                // Efecto de sacudida
                this.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    this.style.animation = '';
                }, 500);
                
                showNotification('🔒 Completa la lección anterior primero', 'warning');
            }
        });

        // Efecto hover mejorado
        module.addEventListener('mouseenter', function() {
            if (!this.style.animation) {
                this.style.transform = 'scale(1.1)';
            }
        });

        module.addEventListener('mouseleave', function() {
            if (!this.style.animation) {
                this.style.transform = 'scale(1)';
            }
        });
    });

    // Interactividad del botón de detalles
    if (lessonDetailsBtn) {
        lessonDetailsBtn.addEventListener('click', function() {
            this.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                this.style.transform = 'rotate(0deg)';
            }, 300);
            
            showNotification('Detalles de la lección', 'info');
        });
    }

    // Interactividad del cofre del tesoro
    if (treasureChest) {
        treasureChest.addEventListener('click', function() {
            const rect = this.getBoundingClientRect();
            
            this.style.transform = 'scale(1.2) rotate(10deg)';
            this.style.filter = 'grayscale(0) brightness(1.5)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1) rotate(0deg)';
                this.style.filter = 'grayscale(0.3) brightness(0.8)';
            }, 500);
            
            showNotification('🔒 Completa más lecciones para desbloquear', 'warning');
            createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, '#FFD700');
        });
    }

    // Interactividad del botón de scroll
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener('click', function() {
            const lessonPath = document.querySelector('.lesson-path');
            lessonPath.scrollTo({
                top: lessonPath.scrollHeight,
                behavior: 'smooth'
            });
        });
    }

    // Interactividad de la barra de navegación
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remover clase active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Agregar clase active al clickeado
            this.classList.add('active');
            
            // Efecto de pulso
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Obtener la sección
            const section = this.getAttribute('data-section');
            
            // Mostrar/ocultar secciones
            handleNavigation(section);
        });
    });

    // Interactividad de las gemas
    if (gemsElement) {
        gemsElement.addEventListener('click', function() {
            const icon = this.querySelector('i');
            icon.style.transform = 'rotate(360deg) scale(1.3)';
            
            setTimeout(() => {
                icon.style.transform = 'rotate(0deg) scale(1)';
            }, 500);
            
            const rect = this.getBoundingClientRect();
            createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, '#1CB0F6');
            showNotification('💎 Tienes 770 gemas', 'success');
        });
    }

    // Event listener para botón "HAZ UNA LECCIÓN"
    const doLessonBtn = document.getElementById('doLessonBtn');
    if (doLessonBtn) {
        doLessonBtn.addEventListener('click', function() {
            // Redirigir a la sección de práctica
            const practiceNav = document.querySelector('.nav-item[data-section="practice"]');
            if (practiceNav) {
                practiceNav.click();
            }
        });
    }

    // Event listener para botón "EMPEZAR +10 EXP"
    const startLessonBtn = document.getElementById('startLessonBtn');
    if (startLessonBtn) {
        startLessonBtn.addEventListener('click', function() {
            // Aquí puedes agregar la lógica para iniciar la lección
            showNotification('🎉 ¡Lección iniciada! +10 EXP', 'success');
            
            // Actualizar EXP del usuario (ejemplo)
            const userExp = document.querySelector('.user-exp');
            if (userExp) {
                const currentExp = parseInt(userExp.textContent) || 0;
                userExp.textContent = (currentExp + 10) + ' EXP';
            }
        });
    }

    // Interactividad de las vidas
    if (heartsElement) {
        heartsElement.addEventListener('click', function() {
            const icon = this.querySelector('i');
            icon.style.transform = 'scale(1.4)';
            
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 300);
            
            const rect = this.getBoundingClientRect();
            createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, '#FF4B4B');
            showNotification('❤️ Tienes 5 vidas', 'info');
        });
    }

    // Animación periódica del streak
    if (streakElement) {
        setInterval(() => {
            const icon = streakElement.querySelector('i');
            icon.style.transform = 'scale(1.2)';
            icon.style.filter = 'brightness(1.5)';
            
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
                icon.style.filter = 'brightness(1)';
            }, 300);
        }, 5000);

        streakElement.addEventListener('click', function() {
            const rect = this.getBoundingClientRect();
            createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, '#FF9600');
            showNotification('🔥 ¡Mantén tu racha!', 'warning');
        });
    }

    // Interactividad del personaje Duo
    if (duoCharacter) {
        const duoVideo = duoCharacter.querySelector('video');
        if (duoVideo) {
            duoVideo.loop = true;
        }

        duoCharacter.addEventListener('click', function() {
            const svg = this.querySelector('svg');
            if (svg) svg.style.transform = 'scale(1.2) rotate(10deg)';
            
            setTimeout(() => {
                if (svg) svg.style.transform = 'scale(1) rotate(-10deg)';
            }, 150);
            
            setTimeout(() => {
                if (svg) svg.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
            
            const messages = [
                '¡Hola! Soy Duo 🦉',
                '¡Sigue practicando!',
                '¡Excelente trabajo!',
                '¡No olvides tu lección diaria!'
            ];
            
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            showNotification(randomMessage, 'success');
        });
    }

    // Función para mostrar notificaciones
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 12px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            transform: translateX(120%);
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-size: 14px;
            max-width: 300px;
        `;
        
        // Colores según el tipo
        switch(type) {
            case 'success':
                notification.style.backgroundColor = '#58CC02';
                break;
            case 'warning':
                notification.style.backgroundColor = '#FF9600';
                break;
            case 'info':
                notification.style.backgroundColor = '#1CB0F6';
                break;
            default:
                notification.style.backgroundColor = '#4B5563';
        }
        
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 400);
        }, 3000);
    }

    // Función para crear partículas
    function createParticles(x, y, color) {
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background-color: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1;
                left: ${x}px;
                top: ${y}px;
            `;
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 50 + Math.random() * 30;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            let currentX = x;
            let currentY = y; // Posición original
            let opacity = 1;
            
            const animate = () => {
                currentX += vx * 0.016;
                currentY += vy * 0.016 + 2;
                opacity -= 0.02;
                
                particle.style.left = currentX + 'px';
                particle.style.top = currentY + 'px';
                particle.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    if (particle.parentNode) {
                        document.body.removeChild(particle);
                    }
                }
            };
            
            animate();
        }
    }

    // Función para obtener el nombre de la sección
    function getSectionName(iconClass) {
        if (iconClass.includes('fa-home')) return 'Aprender';
        if (iconClass.includes('fa-book-open')) return 'Lecciones';
        if (iconClass.includes('fa-dumbbell')) return 'Práctica';
        if (iconClass.includes('fa-store')) return 'Clasificación';
        if (iconClass.includes('fa-user')) return 'Perfil';
        return 'Sección';
    }

    // Variables globales
    // URL de tu Google Apps Script (usuarios)
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw5Yczns7SocEbmnS9Yi_u6cvdicpn1n4BsTlpO7awYclRnfKY7gWasmJCIrA6FT6AlCA/exec';
    
    // Usuario actual (puedes obtenerlo de localStorage o login)
    let currentUser = {
        email: localStorage.getItem('userEmail') || 'invitado@ejemplo.com',
        isAdmin: false
    };

    // Función para manejar la navegación entre secciones
    function handleNavigation(section) {
        const mainContent = document.querySelector('.main-content');
        const profileSection = document.querySelector('.profile-section');
        const classificationSection = document.querySelector('.classification-section');
        const lessonsSection = document.querySelector('.lessons-section');
        const practiceSection = document.querySelector('.practice-section');

        // Ocultar todas las secciones
        mainContent.style.display = 'none';
        if (profileSection) profileSection.style.display = 'none';
        if (classificationSection) classificationSection.style.display = 'none';
        if (lessonsSection) lessonsSection.style.display = 'none';
        if (practiceSection) practiceSection.style.display = 'none';

        if (section === 'profile') {
            // Mostrar sección de perfil
            if (profileSection) {
                profileSection.style.display = 'flex';
                updateProfileInfo();
            }
        } else if (section === 'store') {
            // Mostrar sección de clasificación
            if (classificationSection) {
                classificationSection.style.display = 'flex';
            }
        } else if (section === 'stories') {
            // Mostrar sección de lecciones
            if (lessonsSection) {
                lessonsSection.style.display = 'flex';
            }
        } else if (section === 'practice') {
            // Mostrar sección de práctica/repaso
            if (practiceSection) {
                practiceSection.style.display = 'block';
            }
        } else {
            // Mostrar contenido principal
            if (mainContent) {
                mainContent.style.display = 'flex';
            }
        }
    }

    // Actualizar información del perfil
    function updateProfileInfo() {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileRole = document.getElementById('profileRole');
        const profileBadge = document.querySelector('.profile-badge');

        if (profileEmail) {
            profileEmail.textContent = currentUser.email;
        }

        if (profileName) {
            // Extraer nombre del email
            const name = currentUser.email.split('@')[0];
            profileName.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        }

        if (profileRole) {
            const rolText = currentUser.isAdmin ? 'Profesor' : 'Alumno';
            profileRole.textContent = rolText;
        }

        if (profileBadge) {
            if (currentUser.isAdmin) {
                profileBadge.classList.add('admin');
            } else {
                profileBadge.classList.remove('admin');
            }
        }
    }


    // ===== SISTEMA DE LOGIN =====
    
    // Obtener elementos del DOM primero
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.querySelector('.login-section');
    const topBar = document.querySelector('.top-bar');
    const bottomNav = document.querySelector('.bottom-nav');
                
    // Verificar estado de login
    function checkLoginStatus() {
        const userEmail = localStorage.getItem('userEmail');
        const userLoggedIn = localStorage.getItem('userLoggedIn');
        
        if (userEmail && userLoggedIn === 'true') {
            // Usuario ya logueado
            showMainApp();
            } else {
            // Mostrar login
            showLogin();
        }
    }

    // Mostrar pantalla de login
    function showLogin() {
        const mainContent = document.querySelector('.main-content');
        if (loginSection) loginSection.style.display = 'flex';
        if (mainContent) mainContent.style.display = 'none';
        if (topBar) topBar.style.display = 'flex';
        if (bottomNav) bottomNav.style.display = 'none';
    }

    // Mostrar app principal
    function showMainApp() {
        const mainContent = document.querySelector('.main-content');
        const classificationSection = document.querySelector('.classification-section');
        const lessonsSection = document.querySelector('.lessons-section');
        const practiceSection = document.querySelector('.practice-section');
        if (loginSection) loginSection.style.display = 'none';
        if (mainContent) mainContent.style.display = 'flex';
        if (classificationSection) classificationSection.style.display = 'none';
        if (lessonsSection) lessonsSection.style.display = 'none';
        if (practiceSection) practiceSection.style.display = 'none';
        if (topBar) topBar.style.display = 'flex';
        if (bottomNav) bottomNav.style.display = 'flex';
    }

    // Verificar login al cargar
    checkLoginStatus();

    // Manejar submit del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const loginError = document.getElementById('loginError');
            const errorMessage = document.getElementById('errorMessage');
            
            // Deshabilitar botón
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Verificando...</span>';
            
            // Ocultar error previo
            loginError.style.display = 'none';
            
            try {
                // Obtener todos los usuarios desde Google Sheets
                const response = await fetch(GOOGLE_SCRIPT_URL);
                const result = await response.json();
                
                console.log('📥 Respuesta del servidor:', result);
                
                if (!result.success) {
                    throw new Error(result.message || 'Error al conectar con el servidor');
                }
                
                console.log('👥 Usuarios recibidos:', result.data);
                console.log('🔍 Buscando email:', email.toLowerCase());
                
                // Buscar el usuario
                const usuario = result.data.find(u => 
                    u.correo.toLowerCase() === email.toLowerCase()
                );
                
                if (!usuario) {
                    console.error('❌ Usuario no encontrado');
                    throw new Error('Usuario no encontrado');
                }
                
                console.log('✅ Usuario encontrado:', usuario);
                
                // Verificar contraseña (convertir ambos a string para comparar)
                if (usuario.contraseña.toString() !== password.toString()) {
                    console.error('❌ Contraseña incorrecta');
                    throw new Error('Contraseña incorrecta');
                }
                
                // Login exitoso
                console.log('✅ Login exitoso:', usuario);
                
                // Guardar en localStorage
                localStorage.setItem('userEmail', usuario.correo);
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userRol', usuario.rol);
                
                // Actualizar usuario actual
                currentUser.email = usuario.correo;
                const rolLower = usuario.rol.toLowerCase();
                currentUser.isAdmin = rolLower === 'admin' || rolLower === 'profesor' || rolLower === 'maestro';
                
                // Esperar un momento y mostrar la app
                setTimeout(() => {
                    showMainApp();
                }, 500);
                
            } catch (error) {
                console.error('❌ Error en login:', error);
                
                // Mostrar error
                errorMessage.textContent = error.message || 'Error al iniciar sesión';
                loginError.style.display = 'flex';
                
                // Restaurar botón
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<span>Iniciar Sesión</span><i class="fas fa-arrow-right"></i>';
            }
        });
    }

    // Función para cerrar sesión
    window.logout = function() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userRol');
            
            // Limpiar usuario actual
            currentUser = {
                email: 'invitado@ejemplo.com',
                isAdmin: false
            };
            
            
            showLogin();
            }
    };

    // Botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }

    // Botón de regresar del perfil
    const profileBackBtn = document.getElementById('profileBackBtn');
    if (profileBackBtn) {
        profileBackBtn.addEventListener('click', function() {
            const mainNavItem = document.querySelector('.nav-item[data-section="main"]');
            if (mainNavItem) {
                mainNavItem.click();
            }
        });
    }

    // Animación de carga inicial
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);

    // Easter egg: Konami code
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            showNotification('🎮 ¡Código secreto activado! 🦉', 'success');
            document.body.style.animation = 'rainbow 2s infinite';
        }
    });
});

// Animación arcoíris para el easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Función para dibujar el camino zigzag
function drawLessonPath() {
    const lessonPath = document.querySelector('.lesson-path');
    const pathStroke = document.querySelector('.path-stroke');
    const lessonNodes = document.querySelectorAll('.lesson-node');
    
    if (!pathStroke || lessonNodes.length === 0) return;
    
    let pathData = '';
    const positions = [];
    
    // Obtener las posiciones de cada nodo
    lessonNodes.forEach(node => {
        const position = node.getAttribute('data-position');
        const top = parseFloat(node.style.top);
        
        let leftPercent;
        if (position === 'center') {
            leftPercent = 50;
        } else if (position === 'left') {
            leftPercent = 20;
        } else if (position === 'right') {
            leftPercent = 80;
        }
        
        positions.push({ x: leftPercent, y: top });
    });
    
    // Construir el path SVG con curvas suaves
    if (positions.length > 0) {
        const pathWidth = lessonPath.offsetWidth;
        
        pathData = `M ${positions[0].x * pathWidth / 100} ${positions[0].y + 48}`;
        
        for (let i = 1; i < positions.length; i++) {
            const prev = positions[i - 1];
            const curr = positions[i];
            
            const x1 = prev.x * pathWidth / 100;
            const y1 = prev.y + 48;
            let x2 = curr.x * pathWidth / 100;
            const y2 = curr.y + 48;
            
            // Si es el último punto, moverlo 10% a la izquierda
            if (i === positions.length - 1) {
                x2 = (curr.x - 10) * pathWidth / 100;
            }
            
            // Punto de control para curva suave
            const controlY = (y1 + y2) / 2;
            
            pathData += ` Q ${x1} ${controlY}, ${x2} ${y2}`;
        }
        
        pathStroke.setAttribute('d', pathData);
    }
    
    // Redibujar el camino cuando se redimensiona la ventana
    window.addEventListener('resize', () => {
        drawLessonPath();
    });

    // ===== FUNCIÓN DE REPRODUCCIÓN DE VOZ (TEXT-TO-SPEECH) =====
    
    // Función para reproducir texto en inglés
    function speakText(text, language = 'en-US') {
        // Cancelar cualquier reproducción anterior
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language; // 'en-US' para inglés
            utterance.rate = 0.9; // Velocidad ligeramente más lenta para mejor comprensión
            utterance.pitch = 1.0; // Tono normal
            utterance.volume = 1.0; // Volumen máximo
            
            // Seleccionar voz femenina en inglés si está disponible
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(voice => 
                voice.lang.startsWith('en') && 
                (voice.name.includes('Female') || voice.name.includes('Zira') || voice.name.includes('Karen'))
            ) || voices.find(voice => voice.lang.startsWith('en'));
            
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
            
            window.speechSynthesis.speak(utterance);
            
            // Evento cuando termina de hablar
            utterance.onend = function() {
                console.log('Pronunciación completada');
            };
            
            // Manejo de errores
            utterance.onerror = function(event) {
                console.error('Error al reproducir:', event);
                showNotification('Error al reproducir la pronunciación', 'warning');
            };
        } else {
            showNotification('Tu navegador no soporta la reproducción de voz', 'warning');
        }
    }

    // Cargar voces disponibles cuando estén listas
    if ('speechSynthesis' in window) {
        let voicesLoaded = false;
        
        function loadVoices() {
            if (window.speechSynthesis.getVoices().length !== 0) {
                voicesLoaded = true;
            }
        }
        
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Agregar funcionalidad de clic a las tarjetas de vocales
    const vowelCards = document.querySelectorAll('.vowel-card');
    vowelCards.forEach(card => {
        card.addEventListener('click', function() {
            const exampleWord = this.querySelector('.example-word');
            if (exampleWord) {
                const word = exampleWord.textContent.trim();
                
                // Efecto visual al hacer clic
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // Reproducir la palabra
                speakText(word, 'en-US');
                
                // Mostrar notificación
                showNotification(`🔊 Pronunciando: ${word}`, 'info');
            }
        });

        // Cambiar cursor al pasar el mouse
        card.style.cursor = 'pointer';
    });
}











