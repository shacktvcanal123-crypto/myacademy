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
    console.log('🦉 Duolingo Clone cargado exitosamente!');

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
            
            // Mostrar notificación según la sección
            const icon = this.querySelector('i');
            const sectionName = getSectionName(icon.className);
            showNotification(`Navegando a ${sectionName}`, 'info');
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
        if (iconClass.includes('fa-book-open')) return 'Historias';
        if (iconClass.includes('fa-dumbbell')) return 'Práctica';
        if (iconClass.includes('fa-shield-alt')) return 'Ligas';
        if (iconClass.includes('fa-store')) return 'Tienda';
        if (iconClass.includes('fa-user')) return 'Perfil';
        return 'Sección';
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
}

