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

                verbRow.innerHTML = `
                    <div class="verb-column">
                        <div class="verb-form">
                            <i class="fas fa-volume-up" onclick="speakWord('${simpleFormLower}')"></i>
                            <span>${simpleForm.charAt(0) + simpleForm.slice(1).toLowerCase()}</span>
                        </div>
                        ${translation ? `<div class="verb-translation">${translation}</div>` : ''}
                    </div>
                    <div class="verb-column">
                        <div class="verb-form-simple">
                            <i class="fas fa-volume-up" onclick="speakWord('${simplePastLower}')"></i>
                            <span>${simplePast}</span>
                        </div>
                    </div>
                    <div class="verb-column">
                        <div class="verb-form-simple">
                            <i class="fas fa-volume-up" onclick="speakWord('${pastParticipleLower}')"></i>
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
            }

        } catch (error) {
            console.error('Error al cargar verbos:', error);
            
            // Si hay error y hay datos en cache, usar esos
            if (!backgroundUpdate && verbsListContent) {
                if (cachedVerbsHtml) {
                    console.log('⚠️ Usando verbos de cache debido al error');
                    verbsListContent.innerHTML = cachedVerbsHtml;
                } else {
                    verbsListContent.innerHTML = '<div style="text-align: center; padding: 20px; color: white;">Error al cargar los verbos. Inténtalo más tarde.</div>';
                }
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













