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

    // Event listener para botón "HABILITAR" de Tiro al blanco
    const enableBtn = document.querySelector('.target-practice .enable-btn');
    if (enableBtn) {
        enableBtn.addEventListener('click', function() {
            openVerbsListSection();
        });
    }

    // Event listener para botón de regresar de lista de verbos
    const verbsListBackBtn = document.getElementById('verbsListBackBtn');
    if (verbsListBackBtn) {
        verbsListBackBtn.addEventListener('click', function() {
            closeVerbsListSection();
        });
    }

    // Event listener para botón de búsqueda de verbos
    const verbsListSearchBtn = document.querySelector('.verbs-list-search-btn');
    let isSearchActive = false;
    let originalVerbsContent = null;

    if (verbsListSearchBtn) {
        verbsListSearchBtn.addEventListener('click', function() {
            isSearchActive = !isSearchActive;
            
            if (isSearchActive) {
                // Activar modo de búsqueda
                this.innerHTML = '<i class="fas fa-times"></i>';
                this.style.background = 'rgba(239, 68, 68, 0.2)';
                
                // Crear input de búsqueda
                const searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.placeholder = 'Buscar verbo...';
                searchInput.id = 'verbSearchInput';
                searchInput.className = 'verb-search-input';
                searchInput.style.cssText = `
                    position: absolute;
                    top: 60px;
                    left: 0;
                    right: 0;
                    padding: 12px 20px;
                    background-color: #374151;
                    border: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 16px;
                    outline: none;
                    z-index: 10;
                `;
                
                // Obtener el contenido actual
                const verbsListContent = document.getElementById('verbsListContent');
                if (verbsListContent) {
                    originalVerbsContent = verbsListContent.innerHTML;
                    
                    // Agregar input a la sección
                    const verbsListSection = document.querySelector('.verbs-list-section');
                    if (verbsListSection) {
                        verbsListSection.appendChild(searchInput);
                    }
                    
                    // Agregar padding al contenido
                    verbsListContent.classList.add('verb-search-active');
                    
                    // Event listener para buscar
                    searchInput.addEventListener('input', function(e) {
                        const searchTerm = e.target.value.toLowerCase().trim();
                        
                        if (searchTerm === '') {
                            // Mostrar todos los verbos
                            verbsListContent.innerHTML = originalVerbsContent;
                        } else {
                            // Filtrar verbos
                            filterVerbs(searchTerm);
                        }
                    });
                    
                    // Focus en el input
                    setTimeout(() => {
                        searchInput.focus();
                    }, 100);
                }
            } else {
                // Desactivar modo de búsqueda
                this.innerHTML = '<i class="fas fa-search"></i>';
                this.style.background = 'rgba(255, 255, 255, 0.1)';
                
                // Remover input
                const searchInput = document.getElementById('verbSearchInput');
                if (searchInput) {
                    searchInput.remove();
                }
                
                // Restaurar contenido original
                if (originalVerbsContent) {
                    const verbsListContent = document.getElementById('verbsListContent');
                    if (verbsListContent) {
                        verbsListContent.innerHTML = originalVerbsContent;
                        verbsListContent.classList.remove('verb-search-active');
                    }
                    originalVerbsContent = null;
                }
            }
        });
    }

    // Función para filtrar verbos
    function filterVerbs(searchTerm) {
        const verbsListContent = document.getElementById('verbsListContent');
        if (!verbsListContent || !originalVerbsContent) return;
        
        // Parsear el HTML original para obtener las secciones
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalVerbsContent;
        
        // Obtener todas las filas de verbos
        const allRows = tempDiv.querySelectorAll('.verb-row');
        const sectionTitles = tempDiv.querySelectorAll('.verbs-list-section-title');
        
        // Limpiar contenido
        verbsListContent.innerHTML = '';
        
        // Bandera para saber si encontramos resultados
        let hasResults = false;
        
        // Procesar secciones
        sectionTitles.forEach((title, index) => {
            const titleText = title.textContent;
            let sectionHasResults = false;
            const sectionRows = [];
            
            // Obtener las filas de esta sección
            let rowIndex = 0;
            for (let i = index; i < allRows.length; i++) {
                const nextTitle = sectionTitles[index + 1];
                if (nextTitle && i >= Array.from(tempDiv.children).indexOf(nextTitle)) {
                    break;
                }
                
                const row = allRows[i];
                const verbTexts = row.querySelectorAll('.verb-form, .verb-form-simple');
                
                // Verificar si algún texto coincide con la búsqueda
                let matches = false;
                verbTexts.forEach(verbEl => {
                    const verbText = verbEl.textContent.toLowerCase();
                    if (verbText.includes(searchTerm)) {
                        matches = true;
                    }
                });
                
                if (matches) {
                    sectionRows.push(row.cloneNode(true));
                    sectionHasResults = true;
                    hasResults = true;
                }
            }
            
            // Si esta sección tiene resultados, agregar título y filas
            if (sectionHasResults && sectionRows.length > 0) {
                const sectionTitle = document.createElement('div');
                sectionTitle.className = 'verbs-list-section-title';
                sectionTitle.textContent = titleText;
                verbsListContent.appendChild(sectionTitle);
                
                sectionRows.forEach(row => {
                    verbsListContent.appendChild(row);
                });
            }
        });
        
        // Si no hay resultados, mostrar mensaje
        if (!hasResults) {
            verbsListContent.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #9CA3AF;">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <div style="font-size: 16px;">No se encontraron verbos que coincidan con "${searchTerm}"</div>
                </div>
            `;
        }
    }

    // Función para abrir la sección de lista de verbos
    function openVerbsListSection() {
        const verbsListSection = document.querySelector('.verbs-list-section');
        if (verbsListSection) {
            verbsListSection.style.display = 'flex';
            // Intentar cargar desde cache primero
            loadVerbsList(true);
        }
    }

    // Función para cerrar la sección de lista de verbos
    function closeVerbsListSection() {
        const verbsListSection = document.querySelector('.verbs-list-section');
        if (verbsListSection) {
            verbsListSection.style.display = 'none';
        }
    }

    // Función para cargar la lista de verbos
    async function loadVerbsList(fromCache = false) {
        const verbsListContent = document.getElementById('verbsListContent');
        if (!verbsListContent) return;

        // Verificar si hay verbos en localStorage
        const cachedVerbs = localStorage.getItem('verbsListData');
        const cachedVerbsHtml = localStorage.getItem('verbsListHtml');
        
        // Si se pide desde cache y existe, usarlo
        if (fromCache && cachedVerbs && cachedVerbsHtml) {
            console.log('📦 Verbos cargados desde localStorage');
            verbsListContent.innerHTML = cachedVerbsHtml;
            
            // Configurar event listeners para los botones de audio
            setupVerbAudioListeners(verbsListContent);
            
            // Actualizar en background sin mostrar loading
            fetchAndUpdateVerbs(true);
            return;
        }

        // Limpiar contenido anterior
        if (!fromCache) {
            verbsListContent.innerHTML = '<div style="text-align: center; padding: 20px; color: white;">Cargando verbos...</div>';
        }

        // Cargar desde API
        await fetchAndUpdateVerbs(false);
    }

    // Función auxiliar para cargar verbos desde la API
    async function fetchAndUpdateVerbs(backgroundUpdate = false) {
        const verbsListContent = document.getElementById('verbsListContent');
        const cachedVerbsHtml = localStorage.getItem('verbsListHtml');
        
        if (!verbsListContent && !backgroundUpdate) return;

        try {
            // Cargar verbos desde Google Apps Script
            const response = await fetch('https://script.google.com/macros/s/AKfycbxcgss35tekrMbh0-DRpjYJt2bR-sU6zQRdu8rpoxYi_7O1jd6rVmhFYjV8JvWB9AfH/exec');
            const result = await response.json();
            
            if (!result.success) {
                throw new Error('Error al cargar los verbos');
            }

            // Obtener todos los verbos
            const allVerbs = result.data || [];

            // Guardar verbos en localStorage
            localStorage.setItem('verbsListData', JSON.stringify(allVerbs));

            // Separar verbos irregulares y regulares
            const irregularVerbs = allVerbs.filter(verb => verb.type === 'I');
            const regularVerbs = allVerbs.filter(verb => verb.type === 'R');

            // Crear función para generar una fila de verbo
            const createVerbRow = (verb) => {
                const verbRow = document.createElement('div');
                verbRow.className = 'verb-row';

                const simpleForm = verb.simple_form || verb.simpleForm;  // Columna C
                const simplePast = verb.simple_past || verb.simplePast;  // Columna E
                const pastParticiple = verb.past_participle || verb.pastParticiple;  // Columna F

                const translation = verb.meaning ? verb.meaning.split(' - ')[0] : '';

                const simpleFormLower = simpleForm.toLowerCase();
                const simplePastLower = simplePast.toLowerCase();
                const pastParticipleLower = pastParticiple.toLowerCase();

                // Escapar comillas y caracteres especiales para evitar problemas en HTML
                const escapeHtml = (text) => {
                    return text.replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                };

                verbRow.innerHTML = `
                    <div class="verb-column">
                        <div class="verb-form">
                            <i class="fas fa-volume-up verb-speak-btn" data-word="${escapeHtml(simpleFormLower)}" style="cursor: pointer;"></i>
                            <span>${simpleForm.charAt(0) + simpleForm.slice(1).toLowerCase()}</span>
                        </div>
                        ${translation ? `<div class="verb-translation">${translation}</div>` : ''}
                    </div>
                    <div class="verb-column">
                        <div class="verb-form-simple">
                            <i class="fas fa-volume-up verb-speak-btn" data-word="${escapeHtml(simplePastLower)}" style="cursor: pointer;"></i>
                            <span>${simplePast}</span>
                        </div>
                    </div>
                    <div class="verb-column">
                        <div class="verb-form-simple">
                            <i class="fas fa-volume-up verb-speak-btn" data-word="${escapeHtml(pastParticipleLower)}" style="cursor: pointer;"></i>
                            <span>${pastParticiple}</span>
                        </div>
                    </div>
                `;

                return verbRow;
            };

            // Crear un contenedor temporal para construir el HTML
            const tempContainer = document.createElement('div');

            // Agregar sección de verbos irregulares
            if (irregularVerbs.length > 0) {
                const irregularsTitle = document.createElement('div');
                irregularsTitle.className = 'verbs-list-section-title';
                irregularsTitle.textContent = 'Verbos irregulares';
                tempContainer.appendChild(irregularsTitle);

                irregularVerbs.forEach(verb => {
                    tempContainer.appendChild(createVerbRow(verb));
                });
            }

            // Agregar sección de verbos regulares
            if (regularVerbs.length > 0) {
                const regularsTitle = document.createElement('div');
                regularsTitle.className = 'verbs-list-section-title';
                regularsTitle.textContent = 'Verbos regulares';
                tempContainer.appendChild(regularsTitle);

                regularVerbs.forEach(verb => {
                    tempContainer.appendChild(createVerbRow(verb));
                });
            }

            // Guardar HTML en localStorage para reutilización rápida
            localStorage.setItem('verbsListHtml', tempContainer.innerHTML);
            console.log('💾 Verbos guardados en localStorage');

            // Solo actualizar la UI si no es background update
            if (!backgroundUpdate && verbsListContent) {
                verbsListContent.innerHTML = tempContainer.innerHTML;
                
                // Configurar event listeners para los botones de audio usando event delegation
                setupVerbAudioListeners(verbsListContent);
            }

        } catch (error) {
            console.error('Error al cargar verbos:', error);
            
            // Si hay error y hay datos en cache, usar esos
            if (!backgroundUpdate && verbsListContent) {
                if (cachedVerbsHtml) {
                    console.log('⚠️ Usando verbos de cache debido al error');
                    verbsListContent.innerHTML = cachedVerbsHtml;
                    
                    // Configurar event listeners para los botones de audio
                    setupVerbAudioListeners(verbsListContent);
                } else {
                    verbsListContent.innerHTML = '<div style="text-align: center; padding: 20px; color: white;">Error al cargar los verbos. Inténtalo más tarde.</div>';
                }
            }
        }
    }

    // Función para configurar event listeners de audio para verbos usando event delegation
    function setupVerbAudioListeners(container) {
        if (!container) return;
        
        // Remover listeners anteriores si existen
        container.removeEventListener('click', handleVerbAudioClick);
        
        // Agregar nuevo listener usando event delegation
        container.addEventListener('click', handleVerbAudioClick);
    }
    
    // Función manejadora de clics para botones de audio de verbos
    function handleVerbAudioClick(e) {
        // Verificar si el clic fue en un botón de audio
        const button = e.target.closest('.verb-speak-btn');
        if (button) {
            const word = button.getAttribute('data-word');
            if (word && window.speakWord) {
                // Decodificar HTML entities
                const decodedWord = word
                    .replace(/&#39;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>');
                window.speakWord(decodedWord);
            }
        }
    }

    // Función global para reproducir audio (text-to-speech)
    window.speakWord = function(word) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(voice => 
                voice.lang.startsWith('en') && (voice.name.includes('Female') || voice.name.includes('Zira') || voice.name.includes('Karen'))
            ) || voices.find(voice => voice.lang.startsWith('en'));
            
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        }
    };

    // Event listener para botón "EMPEZAR +10 EXP"
    const startLessonBtn = document.getElementById('startLessonBtn');
    if (startLessonBtn) {
        startLessonBtn.addEventListener('click', function() {
            // Abrir ejercicio de pronunciación
            openPronunciationExercise();
        });
    }

    // Función para abrir el ejercicio de pronunciación
    function openPronunciationExercise() {
        const exerciseSection = document.querySelector('.pronunciation-exercise');
        if (exerciseSection) {
            exerciseSection.style.display = 'flex';
            
            // Resetear contador de ejercicios
            currentExerciseNumber = 0;
            
            // Resetear progreso
            const progressFill = document.getElementById('exerciseProgress');
            if (progressFill) {
                progressFill.style.width = '0%';
            }
            
            // Generar primer ejercicio aleatorio
            const exercise = getRandomExercise();
            correctWord = exercise.correct;
            
            // Actualizar las opciones en el HTML
            const exerciseOptions = document.querySelectorAll('.exercise-option');
            if (exerciseOptions.length >= 2) {
                // Decidir qué opción será la correcta (primera o segunda)
                const correctPosition = Math.random() < 0.5 ? 0 : 1;
                
                exerciseOptions[correctPosition].textContent = exercise.correct;
                exerciseOptions[correctPosition].setAttribute('data-word', exercise.correct);
                
                exerciseOptions[1 - correctPosition].textContent = exercise.incorrect;
                exerciseOptions[1 - correctPosition].setAttribute('data-word', exercise.incorrect);
            }
            
            // Ocultar mensaje de retroalimentación si está visible
            const exerciseFeedback = document.getElementById('exerciseFeedback');
            if (exerciseFeedback) {
                exerciseFeedback.style.display = 'none';
            }
            
            // Mostrar opciones y botón de comprobar
            const exerciseOptionsContainer = document.querySelector('.exercise-options');
            if (exerciseOptionsContainer) {
                exerciseOptionsContainer.style.display = 'flex';
            }
            const exerciseCheckBtn = document.getElementById('exerciseCheckBtn');
            if (exerciseCheckBtn) {
                exerciseCheckBtn.style.display = 'block';
                exerciseCheckBtn.disabled = true;
            }
            
            // Resetear selección
            selectedOption = null;
            exerciseOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Reproducir el audio automáticamente al abrir
            setTimeout(() => {
                playExerciseAudio();
            }, 300);
        }
    }

    // Función para cargar siguiente ejercicio
    function loadNextExercise() {
        // Incrementar contador
        currentExerciseNumber++;
        
        // Generar nuevo ejercicio
        const exercise = getRandomExercise();
        correctWord = exercise.correct;
        
        // Actualizar las opciones
        const exerciseOptionsEl = document.querySelectorAll('.exercise-option');
        if (exerciseOptionsEl.length >= 2) {
            const correctPosition = Math.random() < 0.5 ? 0 : 1;
            
            exerciseOptionsEl[correctPosition].textContent = exercise.correct;
            exerciseOptionsEl[correctPosition].setAttribute('data-word', exercise.correct);
            
            exerciseOptionsEl[1 - correctPosition].textContent = exercise.incorrect;
            exerciseOptionsEl[1 - correctPosition].setAttribute('data-word', exercise.incorrect);
        }
        
        // Mostrar opciones y botón
        const exerciseOptionsContainer = document.querySelector('.exercise-options');
        if (exerciseOptionsContainer) {
            exerciseOptionsContainer.style.display = 'flex';
        }
        const exerciseCheckBtn = document.getElementById('exerciseCheckBtn');
        if (exerciseCheckBtn) {
            exerciseCheckBtn.style.display = 'block';
            exerciseCheckBtn.disabled = true;
        }
        
        // Resetear selección
        selectedOption = null;
        exerciseOptionsEl.forEach(opt => opt.classList.remove('selected'));
        
        // Reproducir audio
        setTimeout(() => {
            playExerciseAudio();
        }, 300);
    }

    // Función para cerrar el ejercicio de pronunciación
    function closePronunciationExercise() {
        const exerciseSection = document.querySelector('.pronunciation-exercise');
        if (exerciseSection) {
            exerciseSection.style.display = 'none';
            // Resetear el ejercicio
            resetExercise();
        }
    }

    // Botón de cerrar ejercicio
    const exerciseCloseBtn = document.getElementById('exerciseCloseBtn');
    if (exerciseCloseBtn) {
        exerciseCloseBtn.addEventListener('click', function() {
            closePronunciationExercise();
        });
    }

    // Lista completa de verbos integrados directamente
    const allVerbsData = [
        {num: '1', type: 'I', simpleForm: 'ABIDE', thirdPerson: 'ABIDES', simplePast: 'ABODE', pastParticiple: 'ABODE', gerund: 'ABIDING', meaning: 'Morar - Habitar - Tolerar'},
        {num: '2', type: 'R', simpleForm: 'ABSORB', thirdPerson: 'ABSORBS', simplePast: 'ABSORBED', pastParticiple: 'ABSORBED', gerund: 'ABSORBING', meaning: 'Absorber'},
        {num: '3', type: 'R', simpleForm: 'ADD', thirdPerson: 'ADDS', simplePast: 'ADDED', pastParticiple: 'ADDED', gerund: 'ADDING', meaning: 'Añadir'},
        {num: '4', type: 'R', simpleForm: 'ADVANCE', thirdPerson: 'ADVANCES', simplePast: 'ADVANCED', pastParticiple: 'ADVANCED', gerund: 'ADVANCING', meaning: 'Avanzar'},
        {num: '5', type: 'R', simpleForm: 'AGREE', thirdPerson: 'AGREES', simplePast: 'AGREED', pastParticiple: 'AGREED', gerund: 'AGREEING', meaning: 'Acordar - Estar De Acuerdo - Acceder'},
        {num: '6', type: 'R', simpleForm: 'ANSWER', thirdPerson: 'ANSWERS', simplePast: 'ANSWERED', pastParticiple: 'ANSWERED', gerund: 'ANSWERING', meaning: 'Contestar - Responder'},
        {num: '7', type: 'R', simpleForm: 'APPEAR', thirdPerson: 'APPEARS', simplePast: 'APPEARED', pastParticiple: 'APPEARED', gerund: 'APPEARING', meaning: 'Aparecer'},
        {num: '8', type: 'I', simpleForm: 'ARISE', thirdPerson: 'ARISES', simplePast: 'AROSE', pastParticiple: 'ARISEN', gerund: 'ARISING', meaning: 'Surgir - Levantarse'},
        {num: '9', type: 'R', simpleForm: 'ARRIVE', thirdPerson: 'ARRIVES', simplePast: 'ARRIVED', pastParticiple: 'ARRIVED', gerund: 'ARRIVING', meaning: 'Llegar'},
        {num: '10', type: 'R', simpleForm: 'ASK', thirdPerson: 'ASKS', simplePast: 'ASKED', pastParticiple: 'ASKED', gerund: 'ASKING', meaning: 'Preguntar'},
        {num: '11', type: 'R', simpleForm: 'ASSIGN', thirdPerson: 'ASSIGNS', simplePast: 'ASSIGNED', pastParticiple: 'ASSIGNED', gerund: 'ASSIGNING', meaning: 'Asignar'},
        {num: '12', type: 'R', simpleForm: 'ASSIST', thirdPerson: 'ASSISTS', simplePast: 'ASSISTED', pastParticiple: 'ASSISTED', gerund: 'ASSISTING', meaning: 'Asistir'},
        {num: '13', type: 'R', simpleForm: 'ATTACH', thirdPerson: 'ATTACHES', simplePast: 'ATTACHED', pastParticiple: 'ATTACHED', gerund: 'ATTACHING', meaning: 'Unir - Juntar - Sujetar - Pegar'},
        {num: '14', type: 'R', simpleForm: 'ATTEND', thirdPerson: 'ATTENDS', simplePast: 'ATTENDED', pastParticiple: 'ATTENDED', gerund: 'ATTENDING', meaning: 'Atender'},
        {num: '15', type: 'I', simpleForm: 'AWAKE', thirdPerson: 'AWAKES', simplePast: 'AWOKE', pastParticiple: 'AWOKE', gerund: 'AWAKING', meaning: 'Despertar(Se)'},
        {num: '16', type: 'R', simpleForm: 'AWARD', thirdPerson: 'AWARDS', simplePast: 'AWARDED', pastParticiple: 'AWARDED', gerund: 'AWARDING', meaning: 'Otorgar'},
        {num: '17', type: 'R', simpleForm: 'BAKE', thirdPerson: 'BAKES', simplePast: 'BAKED', pastParticiple: 'BAKED', gerund: 'BAKING', meaning: 'Hornear'},
        {num: '18', type: 'R', simpleForm: 'BATHE', thirdPerson: 'BATHES', simplePast: 'BATHED', pastParticiple: 'BATHED', gerund: 'BATHING', meaning: 'Bañar'},
        {num: '19', type: 'I', simpleForm: 'BE', thirdPerson: 'IS', simplePast: 'WAS', pastParticiple: 'BEEN', gerund: 'BEING', meaning: 'Ser-Estar'},
        {num: '20', type: 'I', simpleForm: 'BEAR', thirdPerson: 'BEARS', simplePast: 'BORE', pastParticiple: 'BORN', gerund: 'BEARING', meaning: 'Soportar - Aguantar'},
        {num: '21', type: 'I', simpleForm: 'BEAT', thirdPerson: 'BEATS', simplePast: 'BEAT', pastParticiple: 'BEATEN', gerund: 'BEATING', meaning: 'Vencer - Batir'},
        {num: '22', type: 'I', simpleForm: 'BECOME', thirdPerson: 'BECOMES', simplePast: 'BECAME', pastParticiple: 'BECOME', gerund: 'BECOMING', meaning: 'Llegar A Ser - Ponerse - Volverse'},
        {num: '23', type: 'I', simpleForm: 'BEFALL', thirdPerson: 'BEFALLS', simplePast: 'BEFELL', pastParticiple: 'BEFALLEN', gerund: 'BEFALLING', meaning: 'Suceder - Acontecer - Ocurrir'},
        {num: '24', type: 'I', simpleForm: 'BEGIN', thirdPerson: 'BEGINS', simplePast: 'BEGAN', pastParticiple: 'BEGUN', gerund: 'BEGINNING', meaning: 'Comenzar - Empezar'},
        {num: '25', type: 'I', simpleForm: 'BEHOLD', thirdPerson: 'BEHOLDS', simplePast: 'BEHELD', pastParticiple: 'BEHELD', gerund: 'BEHOLDING', meaning: 'Contemplar - Mirar'},
        {num: '26', type: 'R', simpleForm: 'BELIEVE', thirdPerson: 'BELIEVES', simplePast: 'BELIEVED', pastParticiple: 'BELIEVED', gerund: 'BELIEVING', meaning: 'Creer'},
        {num: '27', type: 'R', simpleForm: 'BELONG', thirdPerson: 'BELONGS', simplePast: 'BELONGED', pastParticiple: 'BELONGED', gerund: 'BELONGING', meaning: 'Pertenecer'},
        {num: '28', type: 'I', simpleForm: 'BEND', thirdPerson: 'BENDS', simplePast: 'BENT', pastParticiple: 'BENT', gerund: 'BENDING', meaning: 'Doblar(Se) - Encorvar(Se)'},
        {num: '29', type: 'I', simpleForm: 'BET', thirdPerson: 'BETS', simplePast: 'BET', pastParticiple: 'BET', gerund: 'BETTING', meaning: 'Apostar'},
        {num: '30', type: 'I', simpleForm: 'BID', thirdPerson: 'BIDS', simplePast: 'BID', pastParticiple: 'BID', gerund: 'BIDDING', meaning: 'Mandar - Ordenar'},
        {num: '31', type: 'I', simpleForm: 'BIND', thirdPerson: 'BINDS', simplePast: 'BOUND', pastParticiple: 'BOUND', gerund: 'BINDING', meaning: 'Unir - Ligar - Atar - Amarrar'},
        {num: '32', type: 'I', simpleForm: 'BITE', thirdPerson: 'BITES', simplePast: 'BIT', pastParticiple: 'BITTEN', gerund: 'BITTING', meaning: 'Morder - Picar'},
        {num: '33', type: 'R', simpleForm: 'BLEED', thirdPerson: 'BLEEDS', simplePast: 'BLED', pastParticiple: 'BLED', gerund: 'BLEEDING', meaning: 'Sangrar'},
        {num: '34', type: 'I', simpleForm: 'BLOW', thirdPerson: 'BLOWS', simplePast: 'BLEW', pastParticiple: 'BLOWN', gerund: 'BLOWING', meaning: 'Soplar - Ventear'},
        {num: '35', type: 'R', simpleForm: 'BLUSH', thirdPerson: 'BLUSHES', simplePast: 'BLUSHED', pastParticiple: 'BLUSHED', gerund: 'BLUSHING', meaning: 'Sonrojar'},
        {num: '36', type: 'R', simpleForm: 'BOIL', thirdPerson: 'BOILS', simplePast: 'BOILED', pastParticiple: 'BOILED', gerund: 'BOILING', meaning: 'Hervir'},
        {num: '37', type: 'R', simpleForm: 'BORROW', thirdPerson: 'BORROWS', simplePast: 'BORROWED', pastParticiple: 'BORROWED', gerund: 'BORROWING', meaning: 'Pedir prestado'},
        {num: '38', type: 'R', simpleForm: 'BOTHER', thirdPerson: 'BOTHERS', simplePast: 'BOTHERED', pastParticiple: 'BOTHERED', gerund: 'BOTHERING', meaning: 'Molestar'},
        {num: '39', type: 'I', simpleForm: 'BREAK', thirdPerson: 'BREAKS', simplePast: 'BROKE', pastParticiple: 'BROKEN', gerund: 'BREAKING', meaning: 'Quebrar - Romper'},
        {num: '40', type: 'R', simpleForm: 'BREED', thirdPerson: 'BREEDS', simplePast: 'BRED', pastParticiple: 'BRED', gerund: 'BREEDING', meaning: 'Criar - Educar'},
        {num: '41', type: 'I', simpleForm: 'BRING', thirdPerson: 'BRINGS', simplePast: 'BROUGHT', pastParticiple: 'BROUGHT', gerund: 'BRINGING', meaning: 'Traer - Llevar'},
        {num: '42', type: 'I', simpleForm: 'BROADCAST', thirdPerson: 'BROADCASTS', simplePast: 'BROADCAST', pastParticiple: 'BROADCAST', gerund: 'BROADCASTING', meaning: 'Difundir - Emitir'},
        {num: '43', type: 'R', simpleForm: 'BROIL', thirdPerson: 'BROILS', simplePast: 'BROILED', pastParticiple: 'BROILED', gerund: 'BROILING', meaning: 'Asar'},
        {num: '44', type: 'R', simpleForm: 'BROWN', thirdPerson: 'BROWNS', simplePast: 'BROWNED', pastParticiple: 'BROWNED', gerund: 'BROWNING', meaning: 'Tostar'},
        {num: '45', type: 'R', simpleForm: 'BRUSH', thirdPerson: 'BRUSHES', simplePast: 'BRUSHED', pastParticiple: 'BRUSHED', gerund: 'BRUSHING', meaning: 'Cepillar'},
        {num: '46', type: 'I', simpleForm: 'BUILD', thirdPerson: 'BUILDS', simplePast: 'BUILT', pastParticiple: 'BUILT', gerund: 'BUILDING', meaning: 'Construir - Fundar - Edificar'},
        {num: '47', type: 'R', simpleForm: 'BURN', thirdPerson: 'BURNS', simplePast: 'BURNT', pastParticiple: 'BURNT', gerund: 'BURNING', meaning: 'Quemar - Incendiar'},
        {num: '48', type: 'I', simpleForm: 'BURST', thirdPerson: 'BURSTS', simplePast: 'BURST', pastParticiple: 'BURST', gerund: 'BURSTING', meaning: 'Estallar - Reventar'},
        {num: '49', type: 'I', simpleForm: 'BUY', thirdPerson: 'BUYS', simplePast: 'BOUGHT', pastParticiple: 'BOUGHT', gerund: 'BUYING', meaning: 'Comprar - Adquirir'},
        {num: '50', type: 'R', simpleForm: 'CALL', thirdPerson: 'CALLS', simplePast: 'CALLED', pastParticiple: 'CALLED', gerund: 'CALLING', meaning: 'Llamar'}
    ];
    
    console.log(`✅ ${allVerbsData.length} verbos cargados en memoria`);
    
    // Función para generar palabra trampa que suene igual a la correcta
    function generateTrapWord(correctWord) {
        const word = correctWord.toLowerCase();
        const variations = [];
        
        // Cambios que mantienen el sonido similar pero cambian la ortografía
        const phoneticChanges = [];
        
        // Cambio 1: Duplicar consonantes mudas o que suenan igual
        for (let i = 1; i < word.length - 1; i++) {
            if (word[i] !== word[i + 1] && /[bcdfghklmnprstvwxyz]/i.test(word[i])) {
                const trapWord = word.slice(0, i + 1) + word[i] + word.slice(i + 1);
                phoneticChanges.push(trapWord);
            }
        }
        
        // Cambio 2: Homófonos comunes en inglés
        const homophones = {
            'd': 't', 't': 'd',
            'p': 'b', 'b': 'p',
            'f': 'v', 'v': 'f',
            's': 'z', 'z': 's',
            'k': 'c', 'c': 'k',
            'ck': 'k', 'k': 'ck'
        };
        
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            if (homophones[letter]) {
                const replacement = homophones[letter];
                const trapWord = word.slice(0, i) + replacement + word.slice(i + 1);
                phoneticChanges.push(trapWord);
            }
        }
        
        // Cambio 3: Variaciones de vocales que suenan similar
        // Estas son trampas comunes que suenan casi igual
        const vowelSwaps = {
            'a': ['e'],
            'e': ['a', 'i'],
            'i': ['e', 'y'],
            'o': ['u'],
            'u': ['o'],
            'ou': ['ow'],
            'ow': ['ou']
        };
        
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            if (vowelSwaps[letter]) {
                const replacement = vowelSwaps[letter][Math.floor(Math.random() * vowelSwaps[letter].length)];
                const trapWord = word.slice(0, i) + replacement + word.slice(i + 1);
                phoneticChanges.push(trapWord);
            }
        }
        
        // Cambio 4: Agregar o quitar 'e' silenciosa al final
        if (word.length > 3) {
            if (word.endsWith('e')) {
                const trapWord = word.slice(0, -1);
                phoneticChanges.push(trapWord);
            } else {
                const trapWord = word + 'e';
                phoneticChanges.push(trapWord);
            }
        }
        
        // Cambio 5: Duplicar letra final silenciosa
        if (word.length > 2) {
            const trapWord = word + word[word.length - 1];
            phoneticChanges.push(trapWord);
        }
        
        // Cambio 6: Cambiar 'y' por 'i' o viceversa
        if (word.includes('y')) {
            const trapWord = word.replace(/y/g, 'i');
            phoneticChanges.push(trapWord);
        } else if (word.includes('i') && word.length > 3) {
            const trapWord = word.replace(/i(?![aeiou])/g, 'y');
            if (trapWord !== word) phoneticChanges.push(trapWord);
        }
        
        // Cambio 7: Cambiar 'ck' por 'k' o viceversa
        if (word.includes('ck')) {
            const trapWord = word.replace(/ck/g, 'k');
            phoneticChanges.push(trapWord);
        } else if (word.includes('k') && word.length > 2) {
            const trapWord = word.replace(/k(?![eia])/g, 'ck');
            if (trapWord !== word) phoneticChanges.push(trapWord);
        }
        
        // Eliminar duplicados
        const uniqueVariations = [...new Set(phoneticChanges)];
        
        // Seleccionar una variación aleatoria que sea diferente a la original
        const validVariations = uniqueVariations.filter(v => v !== word && v.length >= 2);
        
        if (validVariations.length > 0) {
            return validVariations[Math.floor(Math.random() * validVariations.length)];
        }
        
        // Fallback: duplicar última letra
        return word + word[word.length - 1];
    }
    
    // Función para obtener verbos aleatorios para un ejercicio
    function getRandomExercise() {
        if (allVerbsData.length === 0) {
            // Fallback si no se cargaron verbos
            return {
                correct: 'dock',
                incorrect: 'deck'
            };
        }
        
        // Seleccionar verbo correcto aleatorio
        const correctIndex = Math.floor(Math.random() * allVerbsData.length);
        const correctVerb = allVerbsData[correctIndex];
        
        // Generar diferentes tipos de ejercicios basados en formas del verbo
        const exerciseType = Math.floor(Math.random() * 4);
        
        let correctWord, incorrectWord;
        
        switch (exerciseType) {
            case 0: // Presente simple
                correctWord = correctVerb.simpleForm.toLowerCase();
                // Generar palabra trampa similar
                incorrectWord = generateTrapWord(correctWord);
                break;
                
            case 1: // Tercera persona
                correctWord = correctVerb.thirdPerson.toLowerCase();
                // Generar palabra trampa similar
                incorrectWord = generateTrapWord(correctWord);
                break;
                
            case 2: // Pasado simple
                correctWord = correctVerb.simplePast.toLowerCase();
                // Generar palabra trampa similar
                incorrectWord = generateTrapWord(correctWord);
                break;
                
            case 3: // Participio pasado
                correctWord = correctVerb.pastParticiple.toLowerCase();
                // Generar palabra trampa similar
                incorrectWord = generateTrapWord(correctWord);
                break;
        }
        
        return {
            correct: correctWord,
            incorrect: incorrectWord
        };
    }
    
    // Variable para almacenar la palabra correcta
    let correctWord = 'dock'; // Valor inicial, se actualizará con ejercicios aleatorios

    // Función para reproducir audio del ejercicio
    function playExerciseAudio() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(correctWord);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Seleccionar voz en inglés si está disponible (misma lógica que las opciones)
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(voice => 
                voice.lang.startsWith('en') && voice.name.includes('Female')
            ) || voices.find(voice => voice.lang.startsWith('en'));
            
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        }
    }

    // Botón de audio del ejercicio
    const exerciseAudioBtn = document.getElementById('exerciseAudioBtn');
    if (exerciseAudioBtn) {
        exerciseAudioBtn.addEventListener('click', function() {
            playExerciseAudio();
        });
    }

    // Variables del ejercicio
    let selectedOption = null;
    let currentExerciseNumber = 0;
    const totalExercises = 10;

    // Funcionalidad de selección de opciones
    const exerciseOptions = document.querySelectorAll('.exercise-option');
    const exerciseCheckBtn = document.getElementById('exerciseCheckBtn');

    exerciseOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remover selección anterior
            exerciseOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Seleccionar esta opción
            this.classList.add('selected');
            selectedOption = this.getAttribute('data-word');
            
            // Reproducir la pronunciación de la palabra seleccionada
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(selectedOption);
                utterance.lang = 'en-US';
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                
                // Seleccionar voz en inglés si está disponible
                const voices = window.speechSynthesis.getVoices();
                const englishVoice = voices.find(voice => 
                    voice.lang.startsWith('en') && voice.name.includes('Female')
                ) || voices.find(voice => voice.lang.startsWith('en'));
                
                if (englishVoice) {
                    utterance.voice = englishVoice;
                }
                
                window.speechSynthesis.speak(utterance);
            }
            
            // Habilitar botón de comprobar
            if (exerciseCheckBtn) {
                exerciseCheckBtn.disabled = false;
            }
        });
    });

    // Botón de comprobar respuesta
    if (exerciseCheckBtn) {
        exerciseCheckBtn.addEventListener('click', function() {
            if (selectedOption === null) return;
            
            // Obtener elementos del mensaje de retroalimentación
            const exerciseFeedback = document.getElementById('exerciseFeedback');
            const feedbackMessage = exerciseFeedback ? exerciseFeedback.querySelector('.feedback-message') : null;
            
            // Verificar si la respuesta es correcta
            if (selectedOption === correctWord) {
                // Respuesta correcta
                // Ocultar opciones y botón de comprobar
                const exerciseOptionsContainer = document.querySelector('.exercise-options');
                if (exerciseOptionsContainer) {
                    exerciseOptionsContainer.style.display = 'none';
                }
                exerciseCheckBtn.style.display = 'none';
                
                // Cambiar mensaje a éxito
                if (feedbackMessage) {
                    feedbackMessage.textContent = 'Muy bien. ¡Repetir los sonidos está funcionando!';
                    feedbackMessage.style.color = '#58CC02';
                }
                
                // Mostrar botón CONTINUAR
                const feedbackContinueBtn = document.getElementById('feedbackContinueBtn');
                if (feedbackContinueBtn) {
                    feedbackContinueBtn.style.display = 'block';
                }
                
                // Mostrar mensaje de retroalimentación
                if (exerciseFeedback) {
                    exerciseFeedback.style.display = 'block';
                    exerciseFeedback.style.position = 'fixed';
                    exerciseFeedback.style.bottom = '20px';
                    exerciseFeedback.style.left = '50%';
                    exerciseFeedback.style.transform = 'translateX(-50%)';
                    exerciseFeedback.style.zIndex = '10005';
                }
                
                // Incrementar contador de ejercicios
                currentExerciseNumber++;
                
                // Verificar si completamos los 10 ejercicios
                if (currentExerciseNumber >= totalExercises) {
                    // Lección completada
                    if (feedbackMessage) {
                        feedbackMessage.textContent = '¡Excelente! Has completado la lección';
                        feedbackMessage.style.color = '#58CC02';
                    }
                } else {
                    // Más ejercicios por hacer
                    if (feedbackMessage) {
                        feedbackMessage.textContent = `¡Correcto! Ejercicio ${currentExerciseNumber}/${totalExercises}`;
                        feedbackMessage.style.color = '#58CC02';
                    }
                }
                
                // Actualizar progreso
                const progressFill = document.getElementById('exerciseProgress');
                if (progressFill) {
                    const progressPercent = (currentExerciseNumber / totalExercises) * 100;
                    progressFill.style.width = progressPercent + '%';
                }
            } else {
                // Respuesta incorrecta
                // Cambiar mensaje a error
                if (feedbackMessage) {
                    feedbackMessage.textContent = 'Incorrecto. Inténtalo de nuevo';
                    feedbackMessage.style.color = '#FF4B4B';
                }
                
                // Ocultar botón CONTINUAR
                const feedbackContinueBtn = document.getElementById('feedbackContinueBtn');
                if (feedbackContinueBtn) {
                    feedbackContinueBtn.style.display = 'none';
                }
                
                // Mostrar mensaje de retroalimentación con color de error
                if (exerciseFeedback) {
                    exerciseFeedback.style.display = 'block';
                    exerciseFeedback.style.position = 'fixed';
                    exerciseFeedback.style.bottom = '20px';
                    exerciseFeedback.style.left = '50%';
                    exerciseFeedback.style.transform = 'translateX(-50%)';
                    exerciseFeedback.style.zIndex = '10005';
                }
                
                // Deseleccionar y resetear
                const exerciseOptionsEl = document.querySelectorAll('.exercise-option');
                exerciseOptionsEl.forEach(opt => opt.classList.remove('selected'));
                selectedOption = null;
                if (exerciseCheckBtn) {
                    exerciseCheckBtn.disabled = true;
                }
                
                // Ocultar el mensaje después de 2 segundos y generar nuevo ejercicio
                setTimeout(() => {
                    if (exerciseFeedback) {
                        exerciseFeedback.style.display = 'none';
                    }
                    // Usar la función para cargar siguiente ejercicio
                    loadNextExercise();
                }, 2000);
            }
        });
    }

    // Función para resetear el ejercicio
    function resetExercise() {
        selectedOption = null;
        const exerciseOptionsEl = document.querySelectorAll('.exercise-option');
        exerciseOptionsEl.forEach(opt => opt.classList.remove('selected'));
        const exerciseCheckBtn = document.getElementById('exerciseCheckBtn');
        if (exerciseCheckBtn) {
            exerciseCheckBtn.disabled = true;
            exerciseCheckBtn.style.display = 'block';
        }
        // Ocultar mensaje de retroalimentación
        const exerciseFeedback = document.getElementById('exerciseFeedback');
        if (exerciseFeedback) {
            exerciseFeedback.style.display = 'none';
        }
        // Mostrar opciones
        const exerciseOptionsContainer = document.querySelector('.exercise-options');
        if (exerciseOptionsContainer) {
            exerciseOptionsContainer.style.display = 'flex';
        }
        const progressFill = document.getElementById('exerciseProgress');
        if (progressFill) {
            progressFill.style.width = '0%';
        }
        window.speechSynthesis.cancel();
    }

    // Botón de continuar en el mensaje de retroalimentación
    const feedbackContinueBtn = document.getElementById('feedbackContinueBtn');
    if (feedbackContinueBtn) {
        feedbackContinueBtn.addEventListener('click', function() {
            // Ocultar mensaje de retroalimentación
            const exerciseFeedback = document.getElementById('exerciseFeedback');
            if (exerciseFeedback) {
                exerciseFeedback.style.display = 'none';
            }
            
            // Verificar si completamos los 10 ejercicios
            if (currentExerciseNumber >= totalExercises) {
                // Mostrar notificación de lección completada
                if (window.showNotification) {
                    showNotification('🎉 ¡Lección completada! +10 EXP', 'success');
                }
                
                // Cerrar el ejercicio después de un breve delay
                setTimeout(() => {
                    closePronunciationExercise();
                }, 1000);
            } else {
                // Cargar siguiente ejercicio
                loadNextExercise();
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

    // Función para mostrar notificaciones (global)
    window.showNotification = function(message, type) {
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
    };

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

    // Cerrar overlays/modales y secciones especiales
    function closeAllOverlays() {
        // Cerrar detalle de lección
        const lessonDetailSection = document.querySelector('.lesson-detail-section');
        if (lessonDetailSection) lessonDetailSection.style.display = 'none';
        // Limpiar historial de lecciones al cerrar overlays
        try { lessonHistory = []; isNavigatingHistory = false; } catch (_) {}

        // Cerrar ejercicio de pronunciación
        const pronunciationExercise = document.querySelector('.pronunciation-exercise');
        if (pronunciationExercise) pronunciationExercise.style.display = 'none';

        // Cerrar Verb To Be exercise
        const verbToBeExercise = document.querySelector('.verb-to-be-exercise');
        if (verbToBeExercise) verbToBeExercise.style.display = 'none';

        // Cerrar lista de verbos
        const verbsListSection = document.querySelector('.verbs-list-section');
        if (verbsListSection) verbsListSection.style.display = 'none';

        // Cerrar videollamada
        const videoCallSection = document.querySelector('.video-call-section');
        if (videoCallSection) videoCallSection.style.display = 'none';

        // Parar cualquier TTS en curso
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }

    // Función para manejar la navegación entre secciones
    function handleNavigation(section) {
        const mainContent = document.querySelector('.main-content');
        const profileSection = document.querySelector('.profile-section');
        const classificationSection = document.querySelector('.classification-section');
        const lessonsSection = document.querySelector('.lessons-section');
        const practiceSection = document.querySelector('.practice-section');
        const videoCallSection = document.querySelector('.video-call-section');

        // Cerrar cualquier overlay activo
        closeAllOverlays();

        // Ocultar todas las secciones base
        if (mainContent) mainContent.style.display = 'none';
        if (profileSection) profileSection.style.display = 'none';
        if (classificationSection) classificationSection.style.display = 'none';
        if (lessonsSection) lessonsSection.style.display = 'none';
        if (practiceSection) practiceSection.style.display = 'none';
        if (videoCallSection) videoCallSection.style.display = 'none';

        // Mostrar sección objetivo
        if (section === 'profile') {
            if (profileSection) {
                profileSection.style.display = 'flex';
                updateProfileInfo();
            }
        } else if (section === 'store') {
            if (classificationSection) classificationSection.style.display = 'flex';
        } else if (section === 'stories') {
            if (lessonsSection) lessonsSection.style.display = 'flex';
        } else if (section === 'practice') {
            if (practiceSection) {
                practiceSection.style.display = 'block';
                // Solo construir si no se ha hecho aún
                if (typeof loadLessons === 'function') {
                    loadLessons();
                }
                // Asegurar que la vista de práctica inicie arriba
                try { practiceSection.scrollTop = 0; } catch (_) {}
                const practiceContainer = document.querySelector('.practice-container');
                if (practiceContainer) {
                    try { practiceContainer.scrollTop = 0; } catch (_) {}
                }
                try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (_) { try { window.scrollTo(0, 0); } catch (_) {} }
            }
        } else if (section === 'video') {
            if (videoCallSection) videoCallSection.style.display = 'flex';
        } else {
            if (mainContent) mainContent.style.display = 'flex';
        }
    }

    // URL de Google Apps Script para lecciones
    const LESSONS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzwcW3HIeNSdIpFLPuKzeXW1oj96ZMl5VymbLLQ59sOXvUdoIl1PWdwFpA265DZYhHp/exec';

    // Función para cargar lecciones dinámicamente
    let lessonsBuilt = false;
    async function loadLessons() {
        if (lessonsBuilt) return; // evitar reconstruir si ya se generaron
        const practiceContainer = document.querySelector('.practice-container');
        if (!practiceContainer) return;

        // Eliminar contenedor de lecciones dinámicas si existe
        const existingLessonsContainer = document.getElementById('dynamicLessonsContainer');
        if (existingLessonsContainer) {
            existingLessonsContainer.remove();
        }

        try {
            // Cargar lecciones desde Google Apps Script
            const response = await fetch(LESSONS_SCRIPT_URL);
            const result = await response.json();

            if (!result.success || !result.data || result.data.length === 0) {
                console.error('No se pudieron cargar las lecciones');
                return;
            }

            const lessons = result.data;

            // Agrupar lecciones por tema_general
            const groupedLessons = {};
            lessons.forEach(lesson => {
                const tema = lesson.tema_general || 'General';
                if (!groupedLessons[tema]) {
                    groupedLessons[tema] = [];
                }
                groupedLessons[tema].push(lesson);
            });

            // Crear contenedor para lecciones dinámicas
            const lessonsContainer = document.createElement('div');
            lessonsContainer.id = 'dynamicLessonsContainer';

            // Iterar sobre cada tema general
            Object.keys(groupedLessons).forEach(temaGeneral => {
                // Crear título del tema
                const title = document.createElement('h1');
                title.className = 'practice-title';
                title.textContent = temaGeneral;
                lessonsContainer.appendChild(title);

                // Crear tarjetas para cada subtema
                groupedLessons[temaGeneral].forEach((lesson, index) => {
                    const card = createLessonCard(lesson);
                    lessonsContainer.appendChild(card);
                });
            });

            // Agregar al final del contenedor de práctica
            practiceContainer.appendChild(lessonsContainer);

            // Marcar como construido para no recargar en siguientes visitas
            lessonsBuilt = true;

        } catch (error) {
            console.error('Error al cargar lecciones:', error);
        }
    }

    // Construir dinámicamente la ruta de lecciones (Units) en la sección principal
    /* removed buildUnitsPath per user request */
    /* async function buildUnitsPath() {
        const pathContainer = document.querySelector('.lesson-path');
        if (!pathContainer) return;

        // Obtener lecciones del cache o desde el endpoint
        let lessons = [];
        try {
            const cached = localStorage.getItem('lessonsData');
            if (cached) lessons = JSON.parse(cached);
        } catch (_) {}
        if (!lessons || lessons.length === 0) {
            try {
                const resp = await fetch(LESSONS_SCRIPT_URL);
                const res = await resp.json();
                if (res && res.success && res.data) {
                    lessons = res.data;
                    try { localStorage.setItem('lessonsData', JSON.stringify(lessons)); } catch (_) {}
                }
            } catch (_) {}
        }

        if (!lessons || lessons.length === 0) return;

        // Extraer Units únicas en orden de aparición
        const unitOrder = [];
        const unitSet = new Set();
        lessons.forEach(l => {
            const u = (l.unit || '').toString().trim();
            if (u && !unitSet.has(u)) { unitSet.add(u); unitOrder.push(u); }
        });
        if (unitOrder.length === 0) return;

        // Progreso actual guardado
        let currentUnitIndex = 0;
        try {
            const stored = localStorage.getItem('currentUnitIndex');
            if (stored !== null) currentUnitIndex = Math.max(0, Math.min(unitOrder.length - 1, parseInt(stored, 10)));
        } catch (_) {}

        // Limpiar nodos previos (mantener la SVG del path si existe)
        const children = Array.from(pathContainer.children);
        children.forEach(ch => {
            if (!ch.classList || (!ch.classList.contains('path-line') && !ch.matches('svg.path-line'))) {
                pathContainer.removeChild(ch);
            }
        });

        // Asegurar existir la línea del camino
        let pathSvg = pathContainer.querySelector('svg.path-line');
        if (!pathSvg) {
            pathSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            pathSvg.setAttribute('class', 'path-line');
            pathSvg.setAttribute('width', '100%');
            pathSvg.setAttribute('height', '100%');
            pathSvg.setAttribute('style', 'position: absolute; top: 0; left: 0; pointer-events: none;');
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('class', 'path-stroke');
            p.setAttribute('fill', 'none');
            p.setAttribute('stroke', '#374151');
            p.setAttribute('stroke-width', '18');
            p.setAttribute('stroke-linecap', 'round');
            p.setAttribute('d', '');
            pathSvg.appendChild(p);
            pathContainer.appendChild(pathSvg);
        }

        // Generar nodos por Unit
        const positions = ['center', 'right', 'left'];
        let top = 20; // px inicial
        const topStep = 60; // separación vertical

        unitOrder.forEach((unitName, idx) => {
            const node = document.createElement('div');
            node.className = 'lesson-node';
            const pos = positions[idx % positions.length];
            node.setAttribute('data-position', pos);
            node.setAttribute('style', `top: ${top}px;`);

            const module = document.createElement('div');
            let moduleClass = 'lesson-module ';
            if (idx < currentUnitIndex) moduleClass += 'completed';
            else if (idx === currentUnitIndex) moduleClass += 'current';
            else moduleClass += 'locked';
            module.className = moduleClass;

            // Ícono según estado
            if (moduleClass.includes('completed')) {
                module.innerHTML = '<i class="fas fa-check"></i>';
            } else if (moduleClass.includes('locked')) {
                module.innerHTML = '<i class="fas fa-star"></i>';
            } else {
                // current: cabeza duo + número de unidad
                const head = document.createElement('div');
                head.className = 'duo-head';
                head.innerHTML = '<svg width="60" height="60" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="#41C282"></circle><circle cx="18" cy="22" r="5" fill="#FFFFFF"></circle><circle cx="32" cy="22" r="5" fill="#FFFFFF"></circle><circle cx="19" cy="23" r="3" fill="#000000"></circle><circle cx="33" cy="23" r="3" fill="#000000"></circle><path d="M25,28 L20,30 L25,32 L30,30 Z" fill="#FF9600"></path></svg>';
                module.appendChild(head);
                const num = document.createElement('div');
                num.className = 'lesson-number';
                num.textContent = (idx + 1).toString();
                module.appendChild(num);
            }

            // Click: abrir primera lección de la unidad si está disponible (no locked)
            module.addEventListener('click', function() {
                if (moduleClass.includes('locked')) return;
                const unitLessons = lessons.filter(l => (l.unit || '').toString().trim() === unitName);
                if (unitLessons && unitLessons.length > 0) {
                    // Abrir la primera lección de la unidad
                    openLesson(unitLessons[0]);
                }
            });

            node.appendChild(module);
            pathContainer.appendChild(node);
            top += topStep;
        });

        // Opcional: colocar un cofre al final
        const chestNode = document.createElement('div');
        chestNode.className = 'lesson-node';
        chestNode.setAttribute('data-position', 'center');
        chestNode.setAttribute('style', `top: ${top + 20}px;`);
        const chest = document.createElement('div');
        chest.className = 'treasure-chest';
        chest.innerHTML = '<img src="images/cofre1.png" width="64" height="64" alt="Treasure Chest"/>';
        chestNode.appendChild(chest);
        pathContainer.appendChild(chestNode);
    } */

    // Función para crear una tarjeta de lección
    function createLessonCard(lesson) {
        const card = document.createElement('div');
        card.className = 'practice-card conversation-card';
        card.style.cursor = 'pointer';

        // Iconos SVG según el tema (simplificado, puedes personalizar)
        const getIconSvg = () => {
            const tema = (lesson.tema_general || '').toLowerCase();
            if (tema.includes('verb')) {
                return `
                    <svg viewBox="0 0 100 100" width="140" height="140">
                        <circle cx="50" cy="30" r="15" fill="#FBBF24"/>
                        <rect x="45" y="45" width="10" height="25" rx="5" fill="#60A5FA"/>
                        <circle cx="70" cy="25" r="8" fill="white"/>
                        <circle cx="75" cy="20" r="5" fill="white"/>
                        <circle cx="80" cy="15" r="3" fill="white"/>
                    </svg>
                `;
            } else if (tema.includes('noun')) {
                return `
                    <svg viewBox="0 0 100 100" width="140" height="140">
                        <rect x="30" y="30" width="40" height="40" rx="5" fill="#10B981"/>
                        <rect x="35" y="35" width="30" height="30" rx="3" fill="#12D889"/>
                        <circle cx="50" cy="50" r="5" fill="white"/>
                    </svg>
                `;
            } else if (tema.includes('adjective')) {
                return `
                    <svg viewBox="0 0 100 100" width="140" height="140">
                        <rect x="20" y="40" width="60" height="20" rx="10" fill="#8B5CF6"/>
                        <rect x="25" y="45" width="50" height="10" rx="5" fill="#A78BFA"/>
                        <circle cx="50" cy="50" r="8" fill="white"/>
                    </svg>
                `;
            } else {
                return `
                    <svg viewBox="0 0 100 100" width="140" height="140">
                        <rect x="25" y="25" width="50" height="50" rx="10" fill="#3B82F6"/>
                        <rect x="30" y="30" width="40" height="40" rx="5" fill="#60A5FA"/>
                        <circle cx="50" cy="50" r="10" fill="white"/>
                    </svg>
                `;
            }
        };

        card.innerHTML = `
            <div class="super-badge">SUPER</div>
            <div class="practice-card-content">
                <div class="practice-card-left">
                    <h2 class="practice-card-title">${lesson.subtema || 'Lección'}</h2>
                    <p class="practice-card-description">${lesson.descripcion || ''}</p>
                    <button class="enable-btn lesson-btn" data-unit="${lesson.unit}" data-tema="${lesson.tema_general}" data-subtema="${lesson.subtema}">ENTRAR</button>
                </div>
                <div class="practice-card-right">
                    <div class="lesson-icon">
                        ${getIconSvg()}
                    </div>
                </div>
            </div>
        `;

        // Event listener para el botón
        const btn = card.querySelector('.lesson-btn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                openLesson(lesson);
            });
        }

        // Event listener para toda la tarjeta
        card.addEventListener('click', function() {
            openLesson(lesson);
        });

        return card;
    }

    // Historial de lecciones abiertas
    let lessonHistory = [];
    let isNavigatingHistory = false;

    // Función para abrir una lección
    function openLesson(lesson) {
        console.log('Abrir lección:', lesson);
        // Registrar en historial si no es navegación desde back
        if (!isNavigatingHistory) {
            lessonHistory.push(lesson);
        }
        // Resetear flag por si quedó activo
        isNavigatingHistory = false;
        
        // Ocultar sección de práctica
        const practiceSection = document.querySelector('.practice-section');
        if (practiceSection) {
            practiceSection.style.display = 'none';
        }

        // Mostrar sección de lección detallada
        const lessonDetailSection = document.querySelector('.lesson-detail-section');
        if (lessonDetailSection) {
            lessonDetailSection.style.display = 'block';
            // Resetear scroll al inicio de la vista de lección
            try { lessonDetailSection.scrollTop = 0; } catch (_) {}
            try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (_) { try { window.scrollTo(0, 0); } catch (_) {} }
            
            // Generar y mostrar contenido de la lección
            const lessonContent = document.getElementById('lessonContent');
            if (lessonContent) {
                lessonContent.innerHTML = generateLessonContent(lesson);
                // Asegurar scroll arriba del contenedor de contenido
                try { lessonContent.scrollTop = 0; } catch (_) {}
            }
            
            // Configurar event listeners después de crear el contenido
            setupLessonEventListeners();
        }
    }

    // Función para generar el contenido HTML de la lección
    function generateLessonContent(lesson) {
        const tema = lesson.tema_general || '';
        const subtema = lesson.subtema || '';
        
        // Obtener contenido generado dinámicamente basado en tema y subtema
        const content = getLessonContent(tema, subtema);
        
        let html = `
            <div class="lesson-header">
                <div class="lesson-badge">${lesson.unit || ''}</div>
                <h1 class="lesson-main-title">${tema}</h1>
                <h2 class="lesson-subtitle">${subtema}</h2>
            </div>
            
            <div class="lesson-body">
        `;

        // Agregar descripción inicial
        if (content.intro) {
            html += `<div class="lesson-intro">${content.intro}</div>`;
        }

        // Agregar secciones/tablas
        if (content.sections && content.sections.length > 0) {
            content.sections.forEach(section => {
                html += `<div class="lesson-section">`;
                html += `<h3 class="section-title">${section.title}</h3>`;
                
                if (section.table) {
                    html += `<table class="lesson-table">`;
                    html += `<thead><tr>`;
                    section.table.headers.forEach(header => {
                        html += `<th>${header}</th>`;
                    });
                    html += `</tr></thead>`;
                    html += `<tbody>`;
                    // Helper para extraer el texto en inglés de una celda de ejemplo
                    const extractEnglishFromCell = (cellHtml) => {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = cellHtml;
                        const text = tmp.textContent || tmp.innerText || '';
                        // Si contiene traducción entre paréntesis, tomar lo anterior
                        const beforeParen = text.split('(')[0].trim();
                        // Si tiene saltos (por ejemplo con ejemplos múltiples), tomar la primera línea
                        const firstLine = beforeParen.split('\n')[0].split('  ')[0].split(' - ')[0].trim();
                        return firstLine;
                    };

                    section.table.rows.forEach(row => {
                        html += `<tr>`;
                        row.forEach((cell, ci) => {
                            const header = (section.table.headers && section.table.headers[ci]) ? section.table.headers[ci].toString().toLowerCase() : '';
                            if (header.includes('ejemplo')) {
                                const english = extractEnglishFromCell(cell);
                                // Escapar comillas y caracteres especiales para evitar problemas en HTML
                                const escapeHtml = (text) => {
                                    return text.replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                                };
                                const safeWord = escapeHtml(english);
                                html += `<td>${cell} <button class="table-play-btn" title="Escuchar" data-word="${safeWord}" style="margin-left:8px;background:#60A5FA;border:none;border-radius:50%;width:28px;height:28px;color:white;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;"><i class="fas fa-volume-up"></i></button></td>`;
                            } else {
                                html += `<td>${cell}</td>`;
                            }
                        });
                        html += `</tr>`;
                    });
                    html += `</tbody></table>`;
                }
                
                if (section.content) {
                    html += `<div class="section-content">${section.content}</div>`;
                }
                
                html += `</div>`;
            });
        }

        // Agregar notas
        if (content.notes && content.notes.length > 0) {
            content.notes.forEach(note => {
                html += `<div class="lesson-note">`;
                html += `<strong>Nota:</strong> ${note}`;
                html += `</div>`;
            });
        }

        // Agregar ejemplos adicionales
        if (content.examples && content.examples.length > 0) {
            html += `<div class="lesson-examples">`;
            html += `<h3 class="examples-title">Ejemplos:</h3>`;
            content.examples.forEach(example => {
                const englishText = example.english || '';
                const escapeHtml = (text) => {
                    return text.replace(/'/g, "&#39;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                };
                const safeWord = escapeHtml(englishText);
                html += `<div class="example-item">`;
                html += `<div class="example-english">${englishText}
                            <button class="example-play-btn" title="Escuchar" data-word="${safeWord}" style="margin-left:8px;background:#60A5FA;border:none;border-radius:50%;width:28px;height:28px;color:white;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;">
                                <i class="fas fa-volume-up"></i>
                            </button>
                        </div>`;
                html += `<div class="example-translation">${example.translation || ''}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        html += `</div>`;

        return html;
    }

    // Función para obtener el contenido de la lección basado en tema y subtema
    function getLessonContent(tema, subtema) {
        const temaLower = (tema || '').toLowerCase();
        const subtemaLower = (subtema || '').toLowerCase();

        // PRONOUNS - Personal Pronouns
        if (temaLower.includes('pronoun') && subtemaLower.includes('personal')) {
            return {
                intro: 'Dentro de los pronombres personales, la lengua inglesa distingue entre pronombres en función de sujeto (subject pronouns) y pronombres en función de objeto (object pronouns).',
                sections: [
                    {
                        title: 'Pronombres (en función de sujeto)',
                        table: {
                            headers: ['Pronombre', 'Traducción', 'Ejemplo'],
                            rows: [
                                ['I', 'yo', 'I am ill.<br>(Yo estoy enfermo.)'],
                                ['you', 'tú, usted', 'You are tall.<br>(Tú eres alto. / Usted es alto.)'],
                                ['he', 'él', 'He is handsome.<br>(Él es guapo.)'],
                                ['she', 'ella', 'She is pretty.<br>(Ella es guapa.)'],
                                ['it', 'ello (neutro)', 'It is cold today.<br>(Hoy hace frío.)'],
                                ['we', 'nosotros', 'We are tired.<br>(Nosotros estamos cansados.)'],
                                ['you', 'vosotros, ustedes', 'You are angry.<br>(Vosotros estáis enfadados. / Ustedes están enfadados.)'],
                                ['they', 'ellos, ellas', 'They are at the cinema.<br>(Ellos están en el cine.)']
                            ]
                        },
                        content: 'Los pronombres en función de sujeto se utilizan cuando el pronombre es el sujeto de la oración. Este pronombre en inglés, a diferencia del español, debe figurar siempre.'
                    },
                    {
                        title: 'Pronombres (en función de objeto)',
                        table: {
                            headers: ['Pronombre', 'Traducción', 'Ejemplo'],
                            rows: [
                                ['me', 'mi', 'Can you help me?<br>(¿Puedes ayudarme?)'],
                                ['you', 'a ti, a usted', 'I can help you.<br>(Puedo ayudarte. / Puedo ayudarle.)'],
                                ['him', 'a él', 'Can you see him?<br>(¿Le puedes ver?)'],
                                ['her', 'a ella', 'Give it to her.<br>(Dáselo a ella.)'],
                                ['it', 'a ello', 'Give it a kick.<br>(Dale una patada.)'],
                                ['us', 'a nosotros', 'Can you see us?<br>(¿Nos puedes ver?)'],
                                ['you', 'a vosotros, a ustedes', 'I see you.<br>(Os veo. / Les veo.)'],
                                ['them', 'a ellos', 'He can help them.<br>(Les puede ayudar.)']
                            ]
                        },
                        content: 'Este pronombre se coloca a continuación del verbo al que complementa o a continuación de preposiciones como "for", "to", "with" y "at".'
                    },
                    {
                        title: 'Function (Función)',
                        content: `
                            <p><strong>1. El pronombre en función de sujeto</strong></p>
                            <p>El sujeto de una oración es la persona o cosa que realiza la acción del verbo. Se utilizan los pronombres en función de sujeto cuando el pronombre es el sujeto de la oración. Este pronombre en inglés, a diferencia del español, debe figurar siempre.</p>
                            
                            <p><strong>2. El pronombre en función de objeto</strong></p>
                            <p>Este pronombre se coloca a continuación del verbo al que complementa o a continuación de preposiciones como "for", "to", "with" y "at".</p>
                        `
                    },
                    {
                        title: 'Neuter Form (Forma neutra)',
                        content: 'Los pronombres en inglés distinguen entre masculino (he), femenino (she) y neutro (it). El pronombre personal "it" se utiliza cuando nos referimos a cosas, a animales que no sabemos su sexo o al tiempo (calendario y meteorológico). La forma plural de "it" es "they".',
                        table: {
                            headers: ['Ejemplo', 'Traducción'],
                            rows: [
                                ['Where is it [the book]?', '¿Dónde está [el libro]?'],
                                ['What time is it?', '¿Qué hora es?'],
                                ['It is raining.', 'Está lloviendo.']
                            ]
                        }
                    }
                ],
                notes: [
                    'En inglés no existe la forma "usted" o "ustedes" formal. Por lo tanto los nativos de la lengua ni siquiera lo tienen conceptualizado como una forma aquí llamada "formal". Se tiene que entender por tanto, que la forma masculina, femenina y neutra son lo mismo, lo único que las diferencia es el género.',
                    'Además, ten en cuenta que en inglés sólo existe una forma para "tú" y "vosotros", "you", excepto en la forma reflexiva que distingue entre el singular (yourself) y plural (yourselves).',
                    '"It" es una partícula muy importante en inglés de la que los hablantes de lengua española se suelen olvidar.'
                ],
                examples: [
                    { english: 'I am ill.', translation: 'Yo estoy enfermo.' },
                    { english: 'You are tall.', translation: 'Tú eres alto.' },
                    { english: 'He is handsome.', translation: 'Él es guapo.' },
                    { english: 'We are tired.', translation: 'Nosotros estamos cansados.' },
                    { english: 'I can help you.', translation: 'Puedo ayudarte.' },
                    { english: 'Can you see him?', translation: '¿Puedes verle?' },
                    { english: 'He is going to the party with us.', translation: 'Él va a la fiesta con nosotros.' },
                    { english: 'It [the letter] is for you.', translation: 'Es [la carta] para ti.' }
                ]
            };
        }
        
        // READING COMPREHENSION
        if (temaLower.includes('reading') || temaLower.includes('comprehension')) {
            const passage = 'Emma lives in a small town near the mountains. Every morning, she wakes up early and walks her dog, Max, around the lake. After breakfast, she rides her bike to the library where she works. She loves helping people find books and recommends stories to children. On weekends, Emma visits her grandparents and they cook together. Her favorite dish is apple pie.';
            return {
                intro: 'Lee el texto y responde a las preguntas de comprensión lectora. Practica vocabulario y estructuras en contexto.',
                sections: [
                    {
                        title: 'Texto',
                        content: passage
                    },
                    {
                        title: 'Preguntas de comprensión',
                        table: {
                            headers: ['Pregunta', 'Respuesta'],
                            rows: [
                                ['Where does Emma live?', 'She lives in a small town near the mountains.'],
                                ['What does Emma do every morning?', 'She walks her dog, Max, around the lake.'],
                                ['How does she go to the library?', 'She rides her bike.'],
                                ['What does she love about her job?', 'Helping people find books and recommending stories to children.'],
                                ['What does Emma do on weekends?', 'She visits her grandparents and they cook together.'],
                                ['What is her favorite dish?', 'Apple pie.']
                            ]
                        }
                    },
                    {
                        title: 'Vocabulario útil',
                        table: {
                            headers: ['Palabra/Frase', 'Significado', 'Ejemplo'],
                            rows: [
                                ['near the mountains', 'cerca de las montañas', 'They live near the mountains. (Viven cerca de las montañas.)'],
                                ['walk the dog', 'pasear al perro', 'She walks the dog every morning. (Ella pasea al perro cada mañana.)'],
                                ['ride a bike', 'andar en bicicleta', 'He rides a bike to work. (Él va al trabajo en bicicleta.)'],
                                ['recommend', 'recomendar', 'I recommend this book. (Recomiendo este libro.)'],
                                ['favorite dish', 'plato favorito', 'My favorite dish is pasta. (Mi plato favorito es la pasta.)']
                            ]
                        }
                    }
                ],
                notes: [
                    'Fíjate en el uso del presente simple para rutinas: wakes up, walks, rides, works, visits.'
                ],
                examples: [
                    { english: 'She walks her dog every morning.', translation: 'Ella pasea a su perro cada mañana.' },
                    { english: 'He rides a bike to work.', translation: 'Él va al trabajo en bicicleta.' },
                    { english: 'This is my favorite dish.', translation: 'Este es mi plato favorito.' }
                ]
            };
        }

        // PRONOUNS - Possessives
        if (temaLower.includes('pronoun') && subtemaLower.includes('possessiv')) {
            return {
                intro: 'Los posesivos en inglés se utilizan para indicar pertenencia o posesión. Existen dos tipos: adjetivos posesivos (possessive adjectives) y pronombres posesivos (possessive pronouns).',
                sections: [
                    {
                        title: 'Adjetivos Posesivos (Possessive Adjectives)',
                        table: {
                            headers: ['Adjetivo', 'Traducción', 'Ejemplo'],
                            rows: [
                                ['my', 'mi, mis', 'my house<br>(mi casa)'],
                                ['your', 'tu, tus', 'your pen<br>(tu pluma)'],
                                ['his', 'su, sus (de él)', 'his car<br>(su coche)'],
                                ['her', 'su, sus (de ella)', 'her book<br>(su libro)'],
                                ['its', 'su, sus (de ello)', 'its tail<br>(su cola)'],
                                ['our', 'nuestro/a/os/as', 'our friends<br>(nuestros amigos)'],
                                ['your', 'vuestro/a/os/as', 'your school<br>(vuestra escuela)'],
                                ['their', 'su, sus (de ellos)', 'their house<br>(su casa)']
                            ]
                        },
                        content: 'Los adjetivos posesivos siempre van delante del sustantivo y lo modifican.'
                    },
                    {
                        title: 'Pronombres Posesivos (Possessive Pronouns)',
                        table: {
                            headers: ['Pronombre', 'Traducción', 'Ejemplo'],
                            rows: [
                                ['mine', 'mío/a/os/as', 'The pen is mine.<br>(La pluma es mía.)'],
                                ['yours', 'tuyo/a/os/as', 'This book is yours.<br>(Este libro es tuyo.)'],
                                ['his', 'suyo/a/os/as (de él)', 'That car is his.<br>(Ese coche es suyo.)'],
                                ['hers', 'suyo/a/os/as (de ella)', 'The bag is hers.<br>(La bolsa es suya.)'],
                                ['ours', 'nuestro/a/os/as', 'The house is ours.<br>(La casa es nuestra.)'],
                                ['yours', 'vuestro/a/os/as', 'These books are yours.<br>(Estos libros son vuestros.)'],
                                ['theirs', 'suyo/a/os/as (de ellos)', 'Those dogs are theirs.<br>(Esos perros son suyos.)']
                            ]
                        },
                        content: 'Los pronombres posesivos reemplazan al sustantivo y no necesitan ir acompañados de otro sustantivo.'
                    }
                ],
                examples: [
                    { english: "This is my house.", translation: 'Esta es mi casa.' },
                    { english: "The book is mine.", translation: 'El libro es mío.' },
                    { english: "Is this your pen?", translation: '¿Es esta tu pluma?' },
                    { english: "This pen is yours.", translation: 'Esta pluma es tuya.' },
                    { english: "Her car is red.", translation: 'Su coche es rojo.' },
                    { english: "The red car is hers.", translation: 'El coche rojo es suyo.' }
                ]
            };
        }

        // PRONOUNS - Demonstrative Pronouns
        if (temaLower.includes('pronoun') && subtemaLower.includes('demonstrativ')) {
            return {
                intro: 'Los pronombres demostrativos "demuestran" algo, como si estuviéramos señalando algo con el dedo. Se utilizan para indicar distancia o proximidad.',
                sections: [
                    {
                        title: 'Pronombres Demostrativos',
                        table: {
                            headers: ['Pronombre', 'Uso', 'Ejemplo'],
                            rows: [
                                ['this', 'cerca (singular)', 'This book is mine.<br>(Este libro es mío.)'],
                                ['that', 'lejos (singular)', 'That car is red.<br>(Ese coche es rojo.)'],
                                ['these', 'cerca (plural)', 'These books are mine.<br>(Estos libros son míos.)'],
                                ['those', 'lejos (plural)', 'Those cars are red.<br>(Esos coches son rojos.)']
                            ]
                        },
                        content: 'Los pronombres demostrativos pueden funcionar como pronombres (reemplazando al sustantivo) o como adjetivos (modificando al sustantivo).'
                    }
                ],
                examples: [
                    { english: 'This is my house.', translation: 'Esta es mi casa.' },
                    { english: 'That is his car.', translation: 'Ese es su coche.' },
                    { english: 'These are my books.', translation: 'Estos son mis libros.' },
                    { english: 'Those are their dogs.', translation: 'Esos son sus perros.' },
                    { english: 'I want this one.', translation: 'Quiero este.' },
                    { english: 'Can you see that?', translation: '¿Puedes ver eso?' }
                ]
            };
        }

        // PRONOUNS - Reflexive Pronouns
        if (temaLower.includes('pronoun') && subtemaLower.includes('reflexiv')) {
            return {
                intro: 'Los pronombres reflexivos se utilizan cuando el sujeto hace la acción a sí mismo. En español equivalen a "me", "te", "se", "nos", "os" cuando indican acción reflexiva.',
                sections: [
                    {
                        title: 'Pronombres Reflexivos',
                        table: {
                            headers: ['Pronombre', 'Traducción', 'Ejemplo'],
                            rows: [
                                ['myself', 'me (a mí mismo)', 'I cooked this myself.<br>(Yo cociné esto yo mismo.)'],
                                ['yourself', 'te (a ti mismo)', 'You did it yourself.<br>(Tú lo hiciste tú mismo.)'],
                                ['himself', 'se (a él mismo)', 'He washed himself.<br>(Él se lavó.)'],
                                ['herself', 'se (a ella misma)', 'She dressed herself.<br>(Ella se vistió.)'],
                                ['itself', 'se (a ello mismo)', 'The door opened itself.<br>(La puerta se abrió.)'],
                                ['ourselves', 'nos (a nosotros mismos)', 'We enjoyed ourselves.<br>(Nos divertimos.)'],
                                ['yourselves', 'os (a vosotros mismos)', 'You hurt yourselves.<br>(Os lastimasteis.)'],
                                ['themselves', 'se (a ellos mismos)', 'They helped themselves.<br>(Ellos se ayudaron.)']
                            ]
                        },
                        content: 'Los pronombres reflexivos siempre concuerdan con el sujeto de la oración. Se colocan después del verbo o después de preposiciones.'
                    }
                ],
                examples: [
                    { english: 'I cooked this myself.', translation: 'Yo cociné esto yo mismo.' },
                    { english: 'She cut herself.', translation: 'Ella se cortó.' },
                    { english: 'We enjoyed ourselves at the party.', translation: 'Nos divertimos en la fiesta.' },
                    { english: 'They talk about themselves.', translation: 'Ellos hablan de sí mismos.' },
                    { english: 'Be yourself!', translation: '¡Sé tú mismo!' },
                    { english: 'I did it myself.', translation: 'Lo hice yo mismo.' }
                ]
            };
        }

        // ARTICLES - The Definite Article
        if (temaLower.includes('article') && subtemaLower.includes('definit')) {
            return {
                intro: 'El artículo determinado en inglés es "the". Usamos "the" cuando nos referimos a un sustantivo específico o conocido tanto por el hablante como por el oyente.',
                sections: [
                    {
                        title: 'Usos de "the"',
                        content: `
                            <p><strong>1. Sustantivos específicos conocidos:</strong> Usamos "the" cuando hablamos de algo específico que ambos conocen.</p>
                            <p><strong>2. Cosas únicas:</strong> Para referirnos a cosas que solo hay una (el sol, la luna, etc.)</p>
                            <p><strong>3. Segundo mencionado:</strong> Cuando mencionamos algo por segunda vez</p>
                            <p><strong>4. Superlativos:</strong> Con adjetivos en grado superlativo</p>
                            <p><strong>5. Nombres geográficos específicos:</strong> Con algunos nombres de lugares</p>
                        `
                    }
                ],
                examples: [
                    { english: 'The book is on the table.', translation: 'El libro está en la mesa.' },
                    { english: 'The sun is bright today.', translation: 'El sol está brillante hoy.' },
                    { english: 'I bought a car. The car is red.', translation: 'Compré un coche. El coche es rojo.' },
                    { english: 'She is the best student.', translation: 'Ella es la mejor estudiante.' },
                    { english: 'The United States is big.', translation: 'Los Estados Unidos es grande.' },
                    { english: 'Close the door, please.', translation: 'Cierra la puerta, por favor.' }
                ],
                notes: [
                    '"The" se pronuncia diferente según la palabra que sigue: /ði/ antes de vocales y /ðə/ antes de consonantes.',
                    'No usamos "the" con sustantivos plurales genéricos: "Dogs are friendly" (no "The dogs").'
                ]
            };
        }

        // ARTICLES - The Indefinite Article
        if (temaLower.includes('article') && subtemaLower.includes('indefinit')) {
            return {
                intro: 'Los artículos indeterminados "a" y "an" se usan para referirse a algo indeterminado o no conocido. "A" se usa antes de consonantes y "an" antes de vocales.',
                sections: [
                    {
                        title: 'Reglas de "a" y "an"',
                        table: {
                            headers: ['Artículo', 'Uso', 'Ejemplo'],
                            rows: [
                                ['a', 'Antes de consonantes', 'a car<br>(un coche)<br>a book<br>(un libro)'],
                                ['an', 'Antes de vocales', 'an apple<br>(una manzana)<br>an elephant<br>(un elefante)'],
                                ['a', 'Antes de "u" o "eu" que suenan como consonante', 'a university<br>(una universidad)<br>a European<br>(un europeo)'],
                                ['an', 'Antes de "h" muda', 'an hour<br>(una hora)<br>an honor<br>(un honor)']
                            ]
                        },
                        content: 'Usamos "a" o "an" solo con sustantivos contables en singular. Para plurales o sustantivos no contables usamos "some" o no usamos artículo.'
                    }
                ],
                examples: [
                    { english: 'I need a pen.', translation: 'Necesito un bolígrafo.' },
                    { english: 'She has an umbrella.', translation: 'Ella tiene un paraguas.' },
                    { english: 'He is a teacher.', translation: 'Él es un profesor.' },
                    { english: 'It is an apple.', translation: 'Es una manzana.' },
                    { english: 'I saw a cat in the garden.', translation: 'Vi un gato en el jardín.' },
                    { english: 'An hour has passed.', translation: 'Ha pasado una hora.' }
                ],
                notes: [
                    'La regla de "a" o "an" depende del SONIDO, no de la letra escrita. Por ejemplo: "an hour" porque la "h" es muda.',
                    'No usamos "a" o "an" con sustantivos en plural o no contables.'
                ]
            };
        }

        // PREPOSITIONS
        if (temaLower.includes('preposition')) {
            if (subtemaLower.includes('place')) {
                return {
                    intro: 'Las preposiciones de lugar se utilizan para expresar dónde está un objeto o persona.',
                    sections: [{
                        title: 'Preposiciones de Lugar',
                        table: {
                            headers: ['Preposición', 'Uso', 'Ejemplo'],
                            rows: [
                                ['in', 'Dentro de (espacios cerrados)', 'The book is in the bag.<br>(El libro está en la bolsa.)'],
                                ['on', 'Sobre, encima de (superficie)', 'The book is on the table.<br>(El libro está sobre la mesa.)'],
                                ['at', 'En (puntos específicos)', 'She is at the door.<br>(Ella está en la puerta.)'],
                                ['under', 'Debajo de', 'The cat is under the table.<br>(El gato está debajo de la mesa.)'],
                                ['behind', 'Detrás de', 'The car is behind the house.<br>(El coche está detrás de la casa.)'],
                                ['in front of', 'Delante de', 'I am in front of the school.<br>(Estoy delante de la escuela.)'],
                                ['next to', 'Al lado de', 'She sits next to me.<br>(Ella se sienta al lado de mí.)'],
                                ['between', 'Entre (dos cosas)', 'The cat is between the two dogs.<br>(El gato está entre los dos perros.)']
                            ]
                        }
                    }],
                    examples: [
                        { english: 'The book is on the table.', translation: 'El libro está sobre la mesa.' },
                        { english: 'I am at the school.', translation: 'Estoy en la escuela.' },
                        { english: 'The ball is under the bed.', translation: 'La pelota está debajo de la cama.' }
                    ]
                };
            }
            if (subtemaLower.includes('time')) {
                return {
                    intro: 'Las preposiciones de tiempo se utilizan para expresar cuándo ocurre algo.',
                    sections: [{
                        title: 'Preposiciones de Tiempo',
                        table: {
                            headers: ['Preposición', 'Uso', 'Ejemplo'],
                            rows: [
                                ['in', 'Meses, años, estaciones', 'in January<br>in 2024<br>in summer<br>(en enero / en 2024 / en verano)'],
                                ['on', 'Días de la semana, fechas', 'on Monday<br>on January 15th<br>(el lunes / el 15 de enero)'],
                                ['at', 'Horas específicas', 'at 3 o\'clock<br>at noon<br>at midnight<br>(a las 3 / al mediodía / a medianoche)'],
                                ['before', 'Antes de', 'before dinner<br>(antes de la cena)'],
                                ['after', 'Después de', 'after school<br>(después de la escuela)'],
                                ['during', 'Durante', 'during the class<br>(durante la clase)']
                            ]
                        }
                    }],
                    examples: [
                        { english: 'I wake up at 7 o\'clock.', translation: 'Me despierto a las 7.' },
                        { english: 'I have class on Monday.', translation: 'Tengo clase el lunes.' },
                        { english: 'It rains in winter.', translation: 'Llueve en invierno.' }
                    ]
                };
            }
            if (subtemaLower.includes('movement') || subtemaLower.includes('direction')) {
                return {
                    intro: 'Las preposiciones de movimiento o dirección indican hacia dónde se mueve algo o alguien.',
                    sections: [{
                        title: 'Preposiciones de Movimiento',
                        table: {
                            headers: ['Preposición', 'Uso', 'Ejemplo'],
                            rows: [
                                ['to', 'Hacia, a (dirección)', 'Go to the store.<br>(Ve a la tienda.)'],
                                ['into', 'Hacia dentro de', 'Come into the house.<br>(Entra a la casa.)'],
                                ['out of', 'Fuera de', 'Get out of the car.<br>(Sal del coche.)'],
                                ['through', 'A través de', 'Walk through the park.<br>(Camina a través del parque.)'],
                                ['over', 'Sobre, por encima de', 'Jump over the fence.<br>(Salta sobre la valla.)'],
                                ['across', 'A través de (superficie)', 'Walk across the street.<br>(Cruza la calle.)'],
                                ['around', 'Alrededor de', 'Walk around the building.<br>(Camina alrededor del edificio.)']
                            ]
                        }
                    }],
                    examples: [
                        { english: 'Go to the store.', translation: 'Ve a la tienda.' },
                        { english: 'Jump over the fence.', translation: 'Salta sobre la valla.' },
                        { english: 'Walk through the park.', translation: 'Camina a través del parque.' }
                    ]
                };
            }
            return {
                intro: 'Las preposiciones "in", "at" y "on" se utilizan para expresar ubicación, posición, lugar o tiempo.',
                sections: [{
                    title: 'Preposiciones Comunes',
                    content: 'Las preposiciones relacionan palabras en una oración y pueden indicar lugar, tiempo, dirección, etc.'
                }],
                examples: [
                    { english: 'I am in the room.', translation: 'Estoy en la habitación.' },
                    { english: 'She is at home.', translation: 'Ella está en casa.' },
                    { english: 'The book is on the table.', translation: 'El libro está sobre la mesa.' }
                ]
            };
        }

        // NOUNS
        if (temaLower.includes('noun')) {
            if (subtemaLower.includes('proper')) {
                return {
                    intro: 'Los nombres propios son palabras específicas para una persona, lugar o cosa. Siempre empiezan con mayúscula.',
                    sections: [{
                        title: 'Nombres Propios',
                        table: {
                            headers: ['Tipo', 'Ejemplo'],
                            rows: [
                                ['Personas', 'John, Mary, David'],
                                ['Lugares', 'London, New York, Spain'],
                                ['Días/Meses', 'Monday, January, Christmas'],
                                ['Marcas', 'Coca-Cola, Toyota, Apple']
                            ]
                        }
                    }],
                    examples: [
                        { english: 'John lives in London.', translation: 'John vive en Londres.' },
                        { english: 'I was born in January.', translation: 'Nací en enero.' },
                        { english: 'Mary is from Spain.', translation: 'Mary es de España.' }
                    ],
                    notes: ['Los nombres propios siempre se escriben con mayúscula inicial, sin importar su posición en la oración.']
                };
            }
            if (subtemaLower.includes('countable') || subtemaLower.includes('uncountable')) {
                return {
                    intro: 'Los sustantivos en inglés pueden ser contables (countable) o no contables (uncountable).',
                    sections: [
                        {
                            title: 'Sustantivos Contables',
                            content: 'Son sustantivos que se pueden contar. Tienen forma singular y plural.',
                            table: {
                                headers: ['Ejemplo'],
                                rows: [
                                    ['a book / books<br>(un libro / libros)'],
                                    ['a car / cars<br>(un coche / coches)'],
                                    ['an apple / apples<br>(una manzana / manzanas)']
                                ]
                            }
                        },
                        {
                            title: 'Sustantivos No Contables',
                            content: 'Son sustantivos que no se pueden contar. No tienen forma plural.',
                            table: {
                                headers: ['Ejemplo'],
                                rows: [
                                    ['water<br>(agua)'],
                                    ['milk<br>(leche)'],
                                    ['rice<br>(arroz)'],
                                    ['information<br>(información)']
                                ]
                            }
                        }
                    ],
                    examples: [
                        { english: 'I have two books.', translation: 'Tengo dos libros.' },
                        { english: 'I need some water.', translation: 'Necesito un poco de agua.' },
                        { english: 'She has three cars.', translation: 'Ella tiene tres coches.' }
                    ]
                };
            }
            if (subtemaLower.includes('there') && subtemaLower.includes('be')) {
                return {
                    intro: '"There is" y "There are" se utilizan para indicar existencia. Equivalen a "hay" en español.',
                    sections: [{
                        title: 'There Be',
                        table: {
                            headers: ['Forma', 'Uso', 'Ejemplo'],
                            rows: [
                                ['There is', 'Singular', 'There is a cat.<br>(Hay un gato.)'],
                                ['There are', 'Plural', 'There are four chairs.<br>(Hay cuatro sillas.)'],
                                ['There isn\'t', 'Negativo singular', 'There isn\'t a dog.<br>(No hay un perro.)'],
                                ['There aren\'t', 'Negativo plural', 'There aren\'t any books.<br>(No hay libros.)']
                            ]
                        }
                    }],
                    examples: [
                        { english: 'There is a cat in the garden.', translation: 'Hay un gato en el jardín.' },
                        { english: 'There are four chairs in the room.', translation: 'Hay cuatro sillas en la habitación.' },
                        { english: 'Is there a pen?', translation: '¿Hay un bolígrafo?' }
                    ]
                };
            }
            if (subtemaLower.includes('quantifier')) {
                return {
                    intro: 'Los cuantificadores indican cantidad de sustantivos contables o no contables.',
                    sections: [{
                        title: 'Cuantificadores',
                        table: {
                            headers: ['Cuantificador', 'Uso', 'Ejemplo'],
                            rows: [
                                ['some', 'Afirmativo (contables/ no contables)', 'I have some eggs.<br>I need some water.'],
                                ['any', 'Negativo e interrogativo', 'I don\'t have any eggs.<br>Do you have any water?'],
                                ['many', 'Plural contables', 'I have many books.'],
                                ['much', 'No contables', 'I don\'t have much time.'],
                                ['a lot of', 'Muchos/as', 'She has a lot of friends.'],
                                ['few', 'Pocos (contables)', 'I have few books.'],
                                ['little', 'Poco (no contables)', 'I have little time.']
                            ]
                        }
                    }],
                    examples: [
                        { english: 'Have you got any eggs?', translation: '¿Tienes huevos?' },
                        { english: 'Yes, there are some in the fridge.', translation: 'Sí, hay algunos en la nevera.' },
                        { english: 'I have many friends.', translation: 'Tengo muchos amigos.' }
                    ]
                };
            }
        }

        // VERBS - To Be
        if (temaLower.includes('verb') && subtemaLower.includes('be')) {
            return {
                intro: 'El verbo "to be" (ser/estar) es uno de los más importantes en inglés. Tiene diferentes formas según el sujeto y el tiempo.',
                sections: [
                    {
                        title: 'Presente (Present)',
                        table: {
                            headers: ['Sujeto', 'Forma', 'Ejemplo'],
                            rows: [
                                ['I', 'am', 'I am a teacher.<br>(Soy un profesor.)'],
                                ['you', 'are', 'You are tall.<br>(Tú eres alto.)'],
                                ['he/she/it', 'is', 'He is my friend.<br>(Él es mi amigo.)'],
                                ['we/you/they', 'are', 'We are students.<br>(Somos estudiantes.)']
                            ]
                        }
                    },
                    {
                        title: 'Pasado (Past)',
                        table: {
                            headers: ['Sujeto', 'Forma', 'Ejemplo'],
                            rows: [
                                ['I/he/she/it', 'was', 'I was happy yesterday.<br>(Estaba feliz ayer.)'],
                                ['we/you/they', 'were', 'We were at school.<br>(Estábamos en la escuela.)']
                            ]
                        }
                    },
                    {
                        title: 'Participio Pasado (Past Participle)',
                        table: {
                            headers: ['Forma', 'Ejemplo'],
                            rows: [
                                ['been', 'I have been blessed.<br>(He sido bendecido.)'],
                                ['been', 'They have been working.<br>(Han estado trabajando.)']
                            ]
                        }
                    }
                ],
                examples: [
                    { english: 'I am a teacher.', translation: 'Soy un profesor.' },
                    { english: 'She is happy.', translation: 'Ella está feliz.' },
                    { english: 'They are friends.', translation: 'Ellos son amigos.' },
                    { english: 'I was a child.', translation: 'Yo era un niño.' },
                    { english: 'We were students.', translation: 'Nosotros éramos estudiantes.' },
                    { english: 'I have been waiting.', translation: 'He estado esperando.' }
                ]
            };
        }

        // VERBS - Modal Verbs
        if (temaLower.includes('verb') && subtemaLower.includes('modal')) {
            return {
                intro: 'Los verbos modales expresan posibilidad, permiso, obligación, habilidad, etc. Van seguidos del infinitivo sin "to".',
                sections: [{
                    title: 'Verbos Modales Comunes',
                    table: {
                        headers: ['Modal', 'Uso', 'Ejemplo'],
                        rows: [
                            ['can', 'Habilidad, permiso', 'She can play the piano.<br>(Ella puede tocar el piano.)'],
                            ['could', 'Posibilidad pasada, cortesía', 'I could help you.<br>(Podría ayudarte.)'],
                            ['may', 'Posibilidad, permiso', 'May I come in?<br>(¿Puedo entrar?)'],
                            ['might', 'Posibilidad débil', 'I might buy this.<br>(Podría comprar esto.)'],
                            ['must', 'Obligación, deducción', 'You must study.<br>(Debes estudiar.)'],
                            ['should', 'Recomendación, consejo', 'You should rest.<br>(Deberías descansar.)'],
                            ['will', 'Futuro, voluntad', 'I will help you.<br>(Te ayudaré.)'],
                            ['would', 'Cortesía, condicional', 'Would you help me?<br>(¿Me ayudarías?)']
                        ]
                    }
                }],
                examples: [
                    { english: 'She can play the piano.', translation: 'Ella puede tocar el piano.' },
                    { english: 'I might buy this.', translation: 'Podría comprar esto.' },
                    { english: 'You must study.', translation: 'Debes estudiar.' },
                    { english: 'You should rest.', translation: 'Deberías descansar.' }
                ],
                notes: ['Los verbos modales no cambian según el sujeto (no tienen -s en tercera persona) y van seguidos del infinitivo sin "to".']
            };
        }

        // ADJECTIVES
        if (temaLower.includes('adjective')) {
            return {
                intro: 'Los adjetivos describen o modifican a los nombres. Van delante del sustantivo o después de verbos como "be".',
                sections: [{
                    title: 'Adjetivos Comunes',
                    table: {
                        headers: ['Adjetivo', 'Traducción', 'Ejemplo'],
                        rows: [
                            ['big', 'grande', 'a big house<br>(una casa grande)'],
                            ['small', 'pequeño', 'a small car<br>(un coche pequeño)'],
                            ['tall', 'alto', '2 tall men<br>(2 hombres altos)'],
                            ['short', 'bajo, corto', 'short hair<br>(pelo corto)'],
                            ['long', 'largo', 'long hair<br>(pelo largo)'],
                            ['good', 'bueno', 'a good student<br>(un buen estudiante)'],
                            ['bad', 'malo', 'bad weather<br>(mal tiempo)'],
                            ['happy', 'feliz', 'a happy child<br>(un niño feliz)'],
                            ['sad', 'triste', 'a sad story<br>(una historia triste)']
                        ]
                    }
                }],
                examples: [
                    { english: 'A big house.', translation: 'Una casa grande.' },
                    { english: 'Two tall men.', translation: 'Dos hombres altos.' },
                    { english: 'She has long hair.', translation: 'Ella tiene pelo largo.' },
                    { english: 'The house is big.', translation: 'La casa es grande.' }
                ],
                notes: ['En inglés, el adjetivo siempre va ANTES del sustantivo (no después como en español).']
            };
        }

        // PRESENT TENSES
        if (temaLower.includes('present')) {
            if (subtemaLower.includes('simple')) {
                return {
                    intro: 'El presente simple se usa para acciones rutinarias, hechos generales, verdades universales y estados permanentes.',
                    sections: [{
                        title: 'Presente Simple',
                        table: {
                            headers: ['Sujeto', 'Forma', 'Ejemplo'],
                            rows: [
                                ['I/you/we/they', 'Infinitivo', 'I speak English.<br>(Hablo inglés.)'],
                                ['he/she/it', 'Infinitivo + s', 'He works at a factory.<br>(Él trabaja en una fábrica.)'],
                                ['Negativo', 'don\'t/doesn\'t + infinitivo', 'I don\'t speak French.<br>She doesn\'t work here.'],
                                ['Interrogativo', 'Do/Does + sujeto + infinitivo', 'Do you speak English?<br>Does he work here?']
                            ]
                        }
                    }],
                    examples: [
                        { english: 'I speak English.', translation: 'Hablo inglés.' },
                        { english: 'He works at a factory.', translation: 'Él trabaja en una fábrica.' },
                        { english: 'We eat breakfast every day.', translation: 'Desayunamos todos los días.' },
                        { english: 'The sun rises in the east.', translation: 'El sol sale por el este.' }
                    ]
                };
            }
            if (subtemaLower.includes('continuous')) {
                return {
                    intro: 'El presente continuo se usa para acciones que están ocurriendo ahora, en el momento del habla.',
                    sections: [{
                        title: 'Presente Continuo',
                        table: {
                            headers: ['Forma', 'Ejemplo'],
                            rows: [
                                ['am/is/are + gerundio', 'I am wearing a blue jacket.<br>(Estoy usando una chaqueta azul.)'],
                                ['Negativo: am/is/are + not + gerundio', 'She is not sleeping.<br>(Ella no está durmiendo.)'],
                                ['Interrogativo: Am/Is/Are + sujeto + gerundio', 'Are you studying?<br>(¿Estás estudiando?)']
                            ]
                        }
                    }],
                    examples: [
                        { english: 'I am wearing a blue jacket.', translation: 'Estoy usando una chaqueta azul.' },
                        { english: 'She is sleeping now.', translation: 'Ella está durmiendo ahora.' },
                        { english: 'They are studying English.', translation: 'Ellos están estudiando inglés.' },
                        { english: 'We are having lunch.', translation: 'Estamos almorzando.' }
                    ],
                    notes: ['El presente continuo se forma con "am/is/are" + verbo en gerundio (-ing).']
                };
            }
        }

        // NUMBERS, DATES, TIME
        if (temaLower.includes('number') || temaLower.includes('date') || temaLower.includes('time')) {
            if (subtemaLower.includes('cardinal')) {
                return {
                    intro: 'Los números cardinales se usan para contar.',
                    sections: [{
                        title: 'Números Cardinales',
                        table: {
                            headers: ['Número', 'Escritura'],
                            rows: [
                                ['1-10', 'one, two, three, four, five, six, seven, eight, nine, ten'],
                                ['11-20', 'eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty'],
                                ['20-100', 'twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred']
                            ]
                        }
                    }],
                    examples: [
                        { english: 'I have five apples.', translation: 'Tengo cinco manzanas.' },
                        { english: 'She is twenty years old.', translation: 'Ella tiene veinte años.' },
                        { english: 'There are one hundred books.', translation: 'Hay cien libros.' }
                    ]
                };
            }
            if (subtemaLower.includes('ordinal')) {
                return {
                    intro: 'Los números ordinales indican posición u orden.',
                    sections: [{
                        title: 'Números Ordinales',
                        table: {
                            headers: ['Posición', 'Ordinal'],
                            rows: [
                                ['1st', 'first<br>(primero)'],
                                ['2nd', 'second<br>(segundo)'],
                                ['3rd', 'third<br>(tercero)'],
                                ['4th', 'fourth<br>(cuarto)'],
                                ['5th', 'fifth<br>(quinto)']
                            ]
                        }
                    }],
                    examples: [
                        { english: 'Tom is first, Sally is second.', translation: 'Tom es primero, Sally es segunda.' },
                        { english: 'This is my third visit.', translation: 'Esta es mi tercera visita.' }
                    ]
                };
            }
            if (subtemaLower.includes('date')) {
                return {
                    intro: 'Las fechas en inglés se expresan de forma diferente al español.',
                    sections: [{
                        title: 'Formato de Fechas',
                        content: 'En inglés americano: Mes + día + año<br>En inglés británico: Día + mes + año'
                    }],
                    examples: [
                        { english: 'Today is the 14th of December.', translation: 'Hoy es el 14 de diciembre.' },
                        { english: 'My birthday is January 15th.', translation: 'Mi cumpleaños es el 15 de enero.' }
                    ]
                };
            }
            if (subtemaLower.includes('time')) {
                return {
                    intro: 'Cómo expresar la hora en inglés.',
                    sections: [{
                        title: 'Expresiones de Tiempo',
                        table: {
                            headers: ['Formato', 'Ejemplo'],
                            rows: [
                                ['What time is it?', '¿Qué hora es?'],
                                ['It\'s four o\'clock.', 'Son las cuatro.'],
                                ['It\'s half past three.', 'Son las tres y media.'],
                                ['It\'s quarter past two.', 'Son las dos y cuarto.'],
                                ['It\'s quarter to five.', 'Son las cinco menos cuarto.']
                            ]
                        }
                    }],
                    examples: [
                        { english: 'What time is it?', translation: '¿Qué hora es?' },
                        { english: 'It\'s four o\'clock.', translation: 'Son las cuatro.' },
                        { english: 'It\'s half past three.', translation: 'Son las tres y media.' }
                    ]
                };
            }
        }

        // Si no hay contenido específico, devolver contenido genérico
        return {
            intro: 'Contenido de la lección',
            sections: [],
            notes: [],
            examples: []
        };
    }

    // Función para parsear la descripción de la lección
    function parseLessonDescription(descripcion) {
        const result = {
            intro: '',
            sections: [],
            notes: [],
            examples: []
        };

        if (!descripcion) return result;

        // Dividir por líneas
        const lines = descripcion.split('\n').map(line => line.trim()).filter(line => line);

        let currentSection = null;
        let inTable = false;
        let tableHeaders = [];
        let tableRows = [];
        let currentTableRow = [];
        let currentExample = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const nextLine = i < lines.length - 1 ? lines[i + 1] : '';

            // Detectar secciones/títulos (líneas seguidas de guiones o que terminan en :)
            if (line.includes('\t') || line.match(/^[A-ZÁÉÍÓÚÑ][^:]*(:|$)/)) {
                // Si es una tabla (contiene tabs)
                if (line.includes('\t')) {
                    if (!inTable) {
                        inTable = true;
                        // Primera línea puede ser el encabezado
                        if (line.split('\t').length > 2) {
                            tableHeaders = line.split('\t').filter(h => h.trim());
                        }
                    }
                    
                    const cells = line.split('\t').filter(c => c.trim());
                    if (cells.length > 0) {
                        tableRows.push(cells);
                    }
                } else if (line.match(/^[A-ZÁÉÍÓÚÑ][^:]*:$/)) {
                    // Es un título de sección
                    if (currentSection && inTable) {
                        currentSection.table = {
                            headers: tableHeaders.length > 0 ? tableHeaders : ['Concepto', 'Ejemplo'],
                            rows: tableRows
                        };
                        result.sections.push(currentSection);
                        inTable = false;
                        tableHeaders = [];
                        tableRows = [];
                    }
                    
                    currentSection = {
                        title: line.replace(':', ''),
                        content: '',
                        table: null
                    };
                } else if (line.startsWith('Nota:')) {
                    // Es una nota
                    result.notes.push(line.replace(/^Nota:\s*/i, ''));
                } else if (currentSection && !inTable) {
                    // Agregar contenido a la sección actual
                    currentSection.content += (currentSection.content ? '<br>' : '') + line;
                }
            } else {
                // Línea normal de contenido
                if (line.includes('(') && line.includes(')')) {
                    // Puede ser un ejemplo en formato "English (Spanish)"
                    const match = line.match(/^(.+?)\s*\(([^)]+)\)$/);
                    if (match) {
                        currentExample.english = match[1].trim();
                        currentExample.translation = match[2].trim();
                        result.examples.push(currentExample);
                        currentExample = {};
                    }
                } else if (!currentSection) {
                    // Es parte de la introducción
                    result.intro += (result.intro ? '<br><br>' : '') + line;
                } else if (!inTable) {
                    currentSection.content += (currentSection.content ? '<br>' : '') + line;
                }
            }

            // Si la siguiente línea no es una tabla y estamos en modo tabla, cerrar tabla
            if (inTable && nextLine && !nextLine.includes('\t') && !nextLine.match(/^[A-ZÁÉÍÓÚÑ][^:]*:$/)) {
                if (currentSection) {
                    currentSection.table = {
                        headers: tableHeaders.length > 0 ? tableHeaders : ['Concepto', 'Ejemplo'],
                        rows: tableRows
                    };
                }
                inTable = false;
                tableHeaders = [];
                tableRows = [];
            }
        }

        // Cerrar sección pendiente
        if (currentSection) {
            if (inTable && tableRows.length > 0) {
                currentSection.table = {
                    headers: tableHeaders.length > 0 ? tableHeaders : ['Concepto', 'Ejemplo'],
                    rows: tableRows
                };
            }
            result.sections.push(currentSection);
        }

        return result;
    }

    // Función para cerrar la vista de lección detallada
    function closeLessonDetail() {
        const lessonDetailSection = document.querySelector('.lesson-detail-section');
        if (lessonDetailSection) {
            lessonDetailSection.style.display = 'none';
            // Resetear scroll para la próxima apertura
            try { lessonDetailSection.scrollTop = 0; } catch (_) {}
        }

        // Volver a mostrar sección de práctica
        const practiceSection = document.querySelector('.practice-section');
        if (practiceSection) {
            practiceSection.style.display = 'block';
            // Asegurar que práctica comience arriba
            try { practiceSection.scrollTop = 0; } catch (_) {}
            const practiceContainer = document.querySelector('.practice-container');
            if (practiceContainer) {
                try { practiceContainer.scrollTop = 0; } catch (_) {}
            }
            try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (_) { try { window.scrollTo(0, 0); } catch (_) {} }
        }
    }

    // Event listeners para cerrar/volver de la lección (se asignan cuando se crea el contenido)
    function setupLessonEventListeners() {
        const lessonCloseBtn = document.getElementById('lessonCloseBtn');
        const lessonBackBtn = document.getElementById('lessonBackBtn');
        const lessonContent = document.getElementById('lessonContent');

        if (lessonCloseBtn) {
            lessonCloseBtn.addEventListener('click', function() {
                closeLessonDetail();
            });
        }

        if (lessonBackBtn) {
            lessonBackBtn.addEventListener('click', function() {
                closeLessonDetailPreserve();
            });
        }

        // Configurar event delegation para botones de audio en las tablas
        if (lessonContent) {
            // Remover listener anterior si existe
            lessonContent.removeEventListener('click', handleTableAudioClick);
            // Agregar nuevo listener usando event delegation
            lessonContent.addEventListener('click', handleTableAudioClick);
        }
    }

    // Función manejadora de clics para botones de audio en tablas
    function handleTableAudioClick(e) {
        // Verificar si el clic fue en un botón de audio (tablas o ejemplos)
        const button = e.target.closest('.table-play-btn, .example-play-btn');
        if (button) {
            const word = button.getAttribute('data-word');
            if (word && window.speakWord) {
                // Decodificar HTML entities
                const decodedWord = word
                    .replace(/&#39;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>');
                window.speakWord(decodedWord);
            }
        }
    }

    // Cerrar la vista de lección sin reiniciar scroll ni recargar práctica
    function closeLessonDetailPreserve() {
        const lessonDetailSection = document.querySelector('.lesson-detail-section');
        if (lessonDetailSection) {
            lessonDetailSection.style.display = 'none';
        }
        const practiceSection = document.querySelector('.practice-section');
        if (practiceSection) {
            practiceSection.style.display = 'block';
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
        if (topBar) topBar.style.display = 'none';
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
        
        // Precargar verbos en background si no están en cache
        const cachedVerbs = localStorage.getItem('verbsListData');
        if (!cachedVerbs) {
            console.log('🔄 Precargando verbos en background...');
            setTimeout(() => {
                loadVerbsList(false);
            }, 1000);
        }

        // Precargar lecciones dinámicas al entrar a la app (una sola vez)
        setTimeout(() => {
            if (typeof loadLessons === 'function') {
                loadLessons();
            }
        }, 800);
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
            
            // Manejo de errores - ignorar "interrupted" que es normal al cancelar
            utterance.onerror = function(event) {
                // Solo mostrar errores reales, no "interrupted" (cancelación normal)
                if (event.error !== 'interrupted' && event.error !== 'canceled') {
                    console.error('Error al reproducir:', event.error);
                    if (window.showNotification) {
                        showNotification('Error al reproducir la pronunciación', 'warning');
                    }
                }
            };
            
            // Retornar promesa para manejar la secuencia
            return new Promise((resolve) => {
                utterance.onend = function() {
                    resolve();
                };
            });
        } else {
            showNotification('Tu navegador no soporta la reproducción de voz', 'warning');
            return Promise.resolve();
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
        card.addEventListener('click', async function() {
            const ipaSymbol = this.querySelector('.ipa-symbol');
            const exampleWord = this.querySelector('.example-word');
            
            // Efecto visual al hacer clic
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Primero reproducir el símbolo IPA, luego la palabra de ejemplo
            if (ipaSymbol && exampleWord) {
                const symbol = ipaSymbol.textContent.trim();
                const word = exampleWord.textContent.trim();
                
                // Esperar a que termine el símbolo antes de reproducir la palabra
                await speakText(symbol, 'en-US');
                await speakText(word, 'en-US');
            }
        });

        // Cambiar cursor al pasar el mouse
        card.style.cursor = 'pointer';
    });

    // ===== EJERCICIO VERB TO BE =====
    
    // Datos de ejemplos para el verbo to be
    const verbToBeExamples = {
        present: [
            { sentence: "I am a teacher", translation: "Soy un profesor" },
            { sentence: "She is happy", translation: "Ella está feliz" },
            { sentence: "They are friends", translation: "Ellos son amigos" },
            { sentence: "I am from Mexico", translation: "Soy de México" },
            { sentence: "You are late", translation: "Tú estás tarde" },
            { sentence: "We are ready", translation: "Nosotros estamos listos" },
            { sentence: "He is my friend", translation: "Él es mi amigo" },
            { sentence: "It is sunny today", translation: "Hoy está soleado" },
            { sentence: "You are smart", translation: "Tú eres inteligente" },
            { sentence: "I am learning English", translation: "Estoy aprendiendo inglés" },
            { sentence: "She is at home", translation: "Ella está en casa" },
            { sentence: "They are studying", translation: "Ellos están estudiando" },
            { sentence: "We are good students", translation: "Somos buenos estudiantes" },
            { sentence: "He is very tall", translation: "Él es muy alto" },
            { sentence: "I am not tired", translation: "No estoy cansado" }
        ],
        past: [
            { sentence: "I was a child", translation: "Yo era un niño" },
            { sentence: "We were students", translation: "Nosotros éramos estudiantes" },
            { sentence: "She was here yesterday", translation: "Ella estuvo aquí ayer" },
            { sentence: "They were at the party", translation: "Ellos estaban en la fiesta" },
            { sentence: "I was happy yesterday", translation: "Ayer yo estaba feliz" },
            { sentence: "You were very young", translation: "Tú eras muy joven" },
            { sentence: "She was in London", translation: "Ella estaba en Londres" },
            { sentence: "We were friends", translation: "Éramos amigos" },
            { sentence: "He was a doctor", translation: "Él era doctor" },
            { sentence: "It was cold last night", translation: "Anoche hizo frío" },
            { sentence: "You were late again", translation: "Llegaste tarde de nuevo" },
            { sentence: "They were studying hard", translation: "Estaban estudiando mucho" },
            { sentence: "I was sleeping", translation: "Estaba durmiendo" },
            { sentence: "She was reading a book", translation: "Estaba leyendo un libro" },
            { sentence: "We were playing soccer", translation: "Estábamos jugando fútbol" }
        ],
        participle: [
            { sentence: "I have been blessed", translation: "He sido bendecido" },
            { sentence: "They have been working", translation: "Han estado trabajando" },
            { sentence: "She has been there", translation: "Ella ha estado allí" },
            { sentence: "I have been waiting", translation: "He estado esperando" },
            { sentence: "We have been traveling", translation: "Hemos estado viajando" },
            { sentence: "You have been studying", translation: "Has estado estudiando" },
            { sentence: "She has been sick", translation: "Ha estado enferma" },
            { sentence: "They have been here", translation: "Han estado aquí" },
            { sentence: "I have been working hard", translation: "He estado trabajando duro" },
            { sentence: "He has been sleeping", translation: "Ha estado durmiendo" },
            { sentence: "We have been learning", translation: "Hemos estado aprendiendo" },
            { sentence: "You have been quiet", translation: "Has estado callado" },
            { sentence: "She has been teaching", translation: "Ha estado enseñando" },
            { sentence: "They have been reading", translation: "Han estado leyendo" },
            { sentence: "I have been thinking", translation: "He estado pensando" }
        ]
    };

    // Event listener para botón Verb To Be
    const verbToBeBtn = document.querySelector('.verb-to-be-btn');
    if (verbToBeBtn) {
        verbToBeBtn.addEventListener('click', function() {
            openVerbToBeExercise();
        });
    }

    // Event listener para botón de cerrar Verb To Be
    const verbToBeCloseBtn = document.getElementById('verbToBeCloseBtn');
    if (verbToBeCloseBtn) {
        verbToBeCloseBtn.addEventListener('click', function() {
            closeVerbToBeExercise();
        });
    }

    // Función para abrir el ejercicio Verb To Be
    function openVerbToBeExercise() {
        const exerciseSection = document.querySelector('.verb-to-be-exercise');
        if (exerciseSection) {
            exerciseSection.style.display = 'flex';
            // Activar primer botón por defecto
            const verbFormBtns = document.querySelectorAll('.verb-form-btn');
            if (verbFormBtns.length > 0) {
                verbFormBtns.forEach(b => b.classList.remove('active'));
                verbFormBtns[0].classList.add('active');
            }
            // Cargar ejemplos por defecto (presente)
            loadVerbToBeExamples('present');
        }
    }

    // Función para cerrar el ejercicio Verb To Be
    function closeVerbToBeExercise() {
        const exerciseSection = document.querySelector('.verb-to-be-exercise');
        if (exerciseSection) {
            exerciseSection.style.display = 'none';
        }
    }

    // Event listeners para botones de formas del verbo
    const verbFormBtns = document.querySelectorAll('.verb-form-btn');
    verbFormBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos
            verbFormBtns.forEach(b => b.classList.remove('active'));
            // Agregar active al clickeado
            this.classList.add('active');
            // Cargar ejemplos de esa forma
            const form = this.getAttribute('data-form');
            loadVerbToBeExamples(form);
        });
    });

    // Función para cargar ejemplos según la forma del verbo
    function loadVerbToBeExamples(form) {
        const verbExamples = document.getElementById('verbExamples');
        if (!verbExamples) return;

        const allExamples = verbToBeExamples[form] || [];
        
        // Seleccionar 10 ejemplos aleatorios
        const shuffled = [...allExamples].sort(() => Math.random() - 0.5);
        const examples = shuffled.slice(0, 10);
        
        // Limpiar ejemplos anteriores
        verbExamples.innerHTML = '';

        // Crear items de ejemplo
        examples.forEach(example => {
            const exampleItem = document.createElement('div');
            exampleItem.className = 'verb-example-item';
            exampleItem.style.cursor = 'pointer';
            
            exampleItem.innerHTML = `
                <div style="flex: 1;">
                    <div class="verb-example-text">${example.sentence}</div>
                    <div class="verb-example-translation">${example.translation}</div>
                </div>
                <div class="verb-example-play-icon">
                    <i class="fas fa-volume-up"></i>
                </div>
            `;
            
            // Event listener para reproducir al hacer clic
            exampleItem.addEventListener('click', async function() {
                await speakText(example.sentence, 'en-US');
            });
            
            verbExamples.appendChild(exampleItem);
        });
    }

    // Event listener para botón de reproducir
    const verbPlayBtn = document.getElementById('verbPlayBtn');
    if (verbPlayBtn) {
        verbPlayBtn.addEventListener('click', async function() {
            // Reproducir todos los ejemplos de la forma seleccionada
            const activeBtn = document.querySelector('.verb-form-btn.active');
            if (!activeBtn) return;
            
            const form = activeBtn.getAttribute('data-form');
            const examples = verbToBeExamples[form] || [];
            
            // Reproducir cada ejemplo secuencialmente
            for (const example of examples) {
                await speakText(example.sentence, 'en-US');
                // Esperar un poco entre ejemplos
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        });
    }
}













