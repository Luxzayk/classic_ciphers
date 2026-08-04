// js/pages/escitala-page.js
document.addEventListener("DOMContentLoaded", () => {
    // Referencias DOM
    const inputTexto  = document.getElementById('textoEntrada');
    const outputTexto = document.getElementById('textoSalida');
    const inputClave  = document.getElementById('clave');
    const displayClave = document.getElementById('claveValueDisplay');
    const radiosOperacion = document.querySelectorAll('input[name="operacion"]');

    const btnCopiar  = document.getElementById('btnCopiar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnPegar   = document.getElementById('btnPegar');
    const btnCopiarOriginal = document.getElementById('btnCopiarOriginal');
    const btnPegarCifrado = document.getElementById("btnPegarCifrado");

    // Controles 3D
    const btnAutoGiro   = document.getElementById('btnAutoGiro');
    const btnViewHoriz  = document.getElementById('btnViewHoriz');
    const btnViewVert   = document.getElementById('btnViewVert');
    const sceneContainer = document.getElementById('sceneContainer');
    const cylinder      = document.getElementById('cylinder');

    // Estado Motor 3D
    let autoGiroActivo = false;
    let vistaActual    = 'HORIZONTAL';
    let currentAngle   = 0;
    let animationFrameId = null;
    const faceSize = 40;

    function enviarDatos() {
        const texto = inputTexto.value;
        const caras = parseInt(inputClave.value);

        construirCilindro3D(texto, caras);

        if (!texto) {
            outputTexto.value = "";
            return;
        }

        const operacion = document.querySelector('input[name="operacion"]:checked').value;
        try {
            const res = EscitalaCipher.procesar(texto, caras, operacion);
            outputTexto.value = res;
        } catch (err) {
            CryptoUX.showToast("Error", err.message, "error");
        }
    }

    function construirCilindro3D(texto, diametro) {
        cylinder.innerHTML = "";
        cylinder.style.transformStyle = "preserve-3d";

        let txt = texto.replace(/\s+/g, '').toUpperCase();
        let longitudOriginal = txt.length;
        let relleno = 0;

        if (longitudOriginal > 0) {
            while (txt.length % diametro !== 0) { txt += "X"; relleno++; }
        }

        let caracteresPorVuelta = longitudOriginal > 0 ? txt.length / diametro : 0;

        document.getElementById("statLongitud").textContent = longitudOriginal;
        document.getElementById("statVueltas").textContent  = diametro;
        document.getElementById("statRelleno").textContent  = relleno;

        const textRadius = Math.max(Math.round((diametro * faceSize) / (2 * Math.PI)), 22);
        const anglePerFace = 360 / diametro;

        // Capa 1: El bastón
        const bastonGroup = document.createElement("div");
        bastonGroup.className = "absolute inset-0";
        bastonGroup.style.transformStyle = "preserve-3d";

        const rodFaces = 36;
        const rodAngle = 360 / rodFaces;
        const rodRadius = textRadius - 4;
        const rodFaceSize = (2 * rodRadius * Math.tan(Math.PI / rodFaces)) + 1;

        for (let i = 0; i < rodFaces; i++) {
            const rFace = document.createElement("div");
            rFace.style.position = "absolute";
            rFace.style.backfaceVisibility = "hidden";
            rFace.className = "bg-slate-800/95 border-x border-slate-700/40";

            if (vistaActual === 'HORIZONTAL') {
                rFace.style.width = "100%";
                rFace.style.height = `${rodFaceSize}px`;
                rFace.style.top = `calc(50% - ${rodFaceSize/2}px)`;
                rFace.style.transform = `rotateX(${i * rodAngle}deg) translateZ(${rodRadius}px)`;
            } else {
                rFace.style.height = "100%";
                rFace.style.width = `${rodFaceSize}px`;
                rFace.style.left = `calc(50% - ${rodFaceSize/2}px)`;
                rFace.style.transform = `rotateY(${i * rodAngle}deg) translateZ(${rodRadius}px)`;
            }
            bastonGroup.appendChild(rFace);
        }
        cylinder.appendChild(bastonGroup);

        sceneContainer.className = vistaActual === 'HORIZONTAL'
            ? "scene-3d w-full h-40 sm:h-48 flex items-center justify-center relative rounded-xl border border-cyan-500/15 bg-slate-950/60 overflow-visible transition-all duration-500 my-1"
            : "scene-3d w-full h-64 sm:h-72 flex items-center justify-center relative rounded-xl border border-cyan-500/15 bg-slate-950/60 overflow-visible transition-all duration-500 my-1";

        cylinder.style.width  = vistaActual === 'HORIZONTAL' ? "100%" : `${faceSize}px`;
        cylinder.style.height = vistaActual === 'HORIZONTAL' ? `${faceSize}px` : "100%";

        // Capa 2: El pergamino
        for (let i = 0; i < diametro; i++) {
            const face = document.createElement("div");
            let textoCara = "";

            if (longitudOriginal > 0) {
                for (let j = 0; j < caracteresPorVuelta; j++) {
                    textoCara += txt.charAt(i * caracteresPorVuelta + j);
                }
            } else {
                textoCara = "·".repeat(8);
            }

            face.style.position = "absolute";
            face.style.backfaceVisibility = "hidden";

            if (vistaActual === 'HORIZONTAL') {
                face.className = "face-3d flex flex-row items-center justify-center font-mono font-black text-lg text-cyan-300 gap-x-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]";
                face.style.width     = "100%";
                face.style.height    = `${faceSize}px`;
                face.style.top       = `calc(50% - ${faceSize/2}px)`;
                face.style.transform = `rotateX(${i * anglePerFace}deg) translateZ(${textRadius}px)`;

                if (longitudOriginal > 0) {
                    for (let j = 0; j < caracteresPorVuelta; j++) {
                        const span = document.createElement('span');
                        span.textContent = textoCara.charAt(j);
                        span.className = "baston-char";
                        span.dataset.index = i * caracteresPorVuelta + j;
                        face.appendChild(span);
                    }
                } else {
                    face.textContent = textoCara;
                }
            } else {
                face.className = "face-3d flex flex-col items-center justify-center font-mono font-black text-lg text-cyan-300 gap-1 py-3 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]";
                face.style.width     = `${faceSize}px`;
                face.style.height    = "100%";
                face.style.left      = `calc(50% - ${faceSize/2}px)`;
                face.style.transform = `rotateY(${i * anglePerFace}deg) translateZ(${textRadius}px)`;

                if (longitudOriginal > 0) {
                    for (let j = 0; j < caracteresPorVuelta; j++) {
                        const span = document.createElement('span');
                        span.textContent = textoCara.charAt(j);
                        span.className = "baston-char";
                        span.dataset.index = i * caracteresPorVuelta + j;
                        face.appendChild(span);
                    }
                } else {
                    for (let char of textoCara) {
                        const span = document.createElement('span');
                        span.textContent = char;
                        face.appendChild(span);
                    }
                }
            }
            cylinder.appendChild(face);
        }

        // Capa 3: Cinta desenrollada
        const cintaEl = document.getElementById("cintaDesenrollada");
        cintaEl.innerHTML = "";

        if (longitudOriginal > 0) {
            for (let k = 0; k < txt.length; k++) {
                const charCell = document.createElement("div");
                charCell.className = "cinta-cell w-9 h-9 rounded-lg flex items-center justify-center font-mono font-black text-sm relative border border-slate-700/60 shadow-md cursor-pointer select-none";

                const c = k % diametro;
                const f = Math.floor(k / diametro);
                const originalIdx = c * caracteresPorVuelta + f;

                charCell.dataset.index = originalIdx;
                charCell.textContent = txt.charAt(originalIdx);

                const indexLabel = document.createElement("span");
                indexLabel.className = "absolute bottom-0.5 right-1 text-[8px] text-slate-500 font-semibold";
                indexLabel.textContent = k + 1;
                charCell.appendChild(indexLabel);

                cintaEl.appendChild(charCell);
            }

            const ribbonCells = cintaEl.querySelectorAll(".cinta-cell");
            const cylinderChars = cylinder.querySelectorAll(".baston-char");

            ribbonCells.forEach(cell => {
                cell.addEventListener("mouseenter", () => {
                    const idx = cell.dataset.index;
                    cell.classList.add("highlighted");

                    const targetChar = cylinder.querySelector(`.baston-char[data-index="${idx}"]`);
                    if (targetChar) {
                        targetChar.classList.add("highlighted");
                        const c = Math.floor(idx / caracteresPorVuelta);
                        const targetAngle = -c * anglePerFace;
                        if (!autoGiroActivo) {
                            aplicarGiro(targetAngle);
                        }
                    }
                });

                cell.addEventListener("mouseleave", () => {
                    const idx = cell.dataset.index;
                    cell.classList.remove("highlighted");

                    const targetChar = cylinder.querySelector(`.baston-char[data-index="${idx}"]`);
                    if (targetChar) {
                        targetChar.classList.remove("highlighted");
                    }
                    if (!autoGiroActivo) {
                        aplicarGiro(currentAngle);
                    }
                });
            });

            cylinderChars.forEach(char => {
                char.addEventListener("mouseenter", () => {
                    const idx = char.dataset.index;
                    char.classList.add("highlighted");

                    const targetCell = cintaEl.querySelector(`.cinta-cell[data-index="${idx}"]`);
                    if (targetCell) {
                        targetCell.classList.add("highlighted");
                        targetCell.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                    }
                });

                char.addEventListener("mouseleave", () => {
                    const idx = char.dataset.index;
                    char.classList.remove("highlighted");

                    const targetCell = cintaEl.querySelector(`.cinta-cell[data-index="${idx}"]`);
                    if (targetCell) {
                        targetCell.classList.remove("highlighted");
                    }
                });
            });
        } else {
            cintaEl.innerHTML = `<span class="text-xs text-slate-500 dark:text-slate-655 font-mono italic">Esperando entrada...</span>`;
        }

        aplicarGiro(currentAngle);
    }

    function aplicarGiro(angulo) {
        if (vistaActual === 'HORIZONTAL') {
            cylinder.style.transform = `rotateX(${angulo}deg)`;
        } else {
            cylinder.style.transform = `rotateY(${angulo}deg)`;
        }
    }

    function rotarCilindro() {
        if (autoGiroActivo) {
            currentAngle -= 0.6;
            aplicarGiro(currentAngle);
            animationFrameId = requestAnimationFrame(rotarCilindro);
        }
    }

    function setView(horiz) {
        vistaActual = horiz ? 'HORIZONTAL' : 'VERTICAL';
        btnViewHoriz.classList.toggle('active', horiz);
        btnViewVert.classList.toggle('active', !horiz);
        construirCilindro3D(inputTexto.value, parseInt(inputClave.value));
    }

    btnViewHoriz.addEventListener('click', () => setView(true));
    btnViewVert.addEventListener('click', () => setView(false));

    btnAutoGiro.addEventListener('click', () => {
        autoGiroActivo = !autoGiroActivo;
        btnAutoGiro.classList.toggle('active', autoGiroActivo);

        if (autoGiroActivo) {
            btnAutoGiro.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Pausar`;
            cylinder.style.transition = 'none';
            rotarCilindro();
        } else {
            btnAutoGiro.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Girar`;
            cancelAnimationFrame(animationFrameId);
            const anglePerFace = 360 / parseInt(inputClave.value);
            currentAngle = Math.round(currentAngle / anglePerFace) * anglePerFace;
            cylinder.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)';
            aplicarGiro(currentAngle);
        }
    });

    inputClave.addEventListener('input', (e) => {
        displayClave.innerText = e.target.value;
        const min = +e.target.min, max = +e.target.max, val = +e.target.value;
        e.target.style.setProperty('--fill', ((val - min) / (max - min) * 100) + '%');
        enviarDatos();
    });

    function actualizarEtiquetas() {
        const operacionChecked = document.querySelector('input[name="operacion"]:checked');
        if (!operacionChecked) return;
        const operacion = operacionChecked.value;
        const isCifrar = (operacion === 'CIFRAR');

        const lblEntrada = document.getElementById("labelEntrada");
        const lblSalida = document.getElementById("labelSalida");

        if (lblEntrada) lblEntrada.textContent = isCifrar ? "Texto Original" : "Texto Cifrado";
        if (lblSalida) lblSalida.textContent = isCifrar ? "Texto Cifrado" : "Texto Original";

        if (inputTexto) inputTexto.placeholder = isCifrar ? "Escribe el texto claro para cifrarlo.. Ej: escitala" : "Escribe el texto cifrado para descifrarlo..";
        if (outputTexto) outputTexto.placeholder = isCifrar ? "El texto cifrado se mostrará aquí..." : "El texto original descifrado se mostrará aquí...";
    }

    inputTexto.addEventListener('input', enviarDatos);
    radiosOperacion.forEach(r => r.addEventListener('change', () => {
        actualizarEtiquetas();
        enviarDatos();
        inputTexto.focus();
    }));

    btnPegar.addEventListener('click', async () => {
        try {
            const textoPortapapeles = await navigator.clipboard.readText();
            if (textoPortapapeles) {
                inputTexto.value = textoPortapapeles;
                enviarDatos();
                inputTexto.focus();
                CryptoUX.showToast("Pegado", "Texto insertado correctamente.", "success");
            }
        } catch {
            CryptoUX.showToast("Permiso denegado", "Concede acceso al portapapeles en tu navegador.", "error");
        }
    });

    btnCopiarOriginal.addEventListener('click', async () => {
        if (!inputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto para copiar.", "info");
            return;
        }
        try {
            await navigator.clipboard.writeText(inputTexto.value);
            CryptoUX.showToast("¡Copiado!", "Texto original copiado al portapapeles.", "success");
        } catch {
            inputTexto.select();
            document.execCommand("copy");
        }
    });

    btnLimpiar.addEventListener('click', () => {
        inputTexto.value = "";
        enviarDatos();
        inputTexto.focus();
    });

    btnPegarCifrado.addEventListener('click', async () => {
        try {
            const textoPortapapeles = await navigator.clipboard.readText();
            if (textoPortapapeles) {
                const radioDescifrar = document.querySelector('input[name="operacion"][value="DESCIFRAR"]');
                if (radioDescifrar) {
                    radioDescifrar.checked = true;
                }
                inputTexto.value = textoPortapapeles;
                enviarDatos();
                inputTexto.focus();
                CryptoUX.showToast("Pegado", "Texto cifrado insertado para descifrar.", "success");
            }
        } catch {
            CryptoUX.showToast("Permiso denegado", "Concede acceso al portapapeles en tu navegador.", "error");
        }
    });

    btnCopiar.addEventListener('click', async () => {
        if (!outputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto para copiar.", "info");
            return;
        }
        try {
            await navigator.clipboard.writeText(outputTexto.value);
            CryptoUX.showToast("¡Copiado!", "Resultado copiado al portapapeles.", "success");
        } catch {
            outputTexto.select();
            document.execCommand("copy");
        }
    });

    // ==========================================
    // TUTORIAL
    // ==========================================
    const tutorialData = [
        { element: '#clave',          title: 'La Clave',       text: 'Selecciona el número de caras del cilindro. Esta clave define cómo se mezclan las letras.' },
        { element: '#textoEntrada',   title: 'El Mensaje',     text: 'Escribe aquí tu texto plano. Al escribir, observa cómo interactúa con el motor 3D.' },
        { element: '#sceneContainer', title: 'El Cilindro',    text: 'Este es el bastón holográfico. Las letras se enrollan aquí provocando la transposición.' },
        { element: '#textoSalida',    title: 'El Resultado',   text: 'Tu mensaje cifrado aparece aquí listo para ser copiado. ¡Misión cumplida!' }
    ];

    let currentStep = 0;
    const overlay    = document.getElementById('tutorialOverlay');
    const bubble     = document.getElementById('tutorialBubble');
    const tutTitle   = document.getElementById('tutTitle');
    const tutText    = document.getElementById('tutText');
    const btnTutNext = document.getElementById('btnTutNext');
    const btnTutPrev = document.getElementById('btnTutPrev');
    const tutDots    = document.getElementById('tutDots');

    if (tutDots) {
        tutDots.innerHTML = "";
        tutorialData.forEach(() => {
            const span = document.createElement("span");
            span.className = "w-2 h-2 rounded-full bg-slate-700";
            tutDots.appendChild(span);
        });
    }

    function moverBurbuja(selector) {
        document.querySelectorAll('.tutorial-focus').forEach(el => el.classList.remove('tutorial-focus'));
        const target = document.querySelector(selector);
        if (!target) return;
        target.classList.add('tutorial-focus');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
            const rect       = target.getBoundingClientRect();
            bubble.classList.remove('hidden');
            const bubbleRect = bubble.getBoundingClientRect();

            let top  = rect.bottom + 15;
            let left = rect.left + (rect.width / 2) - (bubbleRect.width / 2);

            if (left < 10) left = 10;
            if (left + bubbleRect.width > window.innerWidth - 10)
                left = window.innerWidth - bubbleRect.width - 10;
            if (top + bubbleRect.height > window.innerHeight - 10)
                top = rect.top - bubbleRect.height - 15;

            bubble.style.top  = `${top}px`;
            bubble.style.left = `${left}px`;
            bubble.classList.remove('opacity-0', 'scale-95');
        }, 300);
    }

    function updateTutorial() {
        bubble.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            tutTitle.innerHTML = tutorialData[currentStep].title;
            tutText.innerHTML  = tutorialData[currentStep].text;

            Array.from(tutDots.children).forEach((dot, i) => {
                dot.className = i === currentStep
                    ? "w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] transition-all"
                    : "w-2 h-2 rounded-full bg-slate-700 transition-all";
            });

            btnTutPrev.classList.toggle('hidden', currentStep === 0);

            if (currentStep === tutorialData.length - 1) {
                btnTutNext.innerHTML = "Terminar ✓";
            } else {
                btnTutNext.innerHTML = "Siguiente →";
            }

            moverBurbuja(tutorialData[currentStep].element);
        }, 200);
    }

    document.getElementById('btnTutorial').addEventListener('click', () => {
        currentStep = 0;
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        updateTutorial();
    });

    function closeTutorial() {
        document.querySelectorAll('.tutorial-focus').forEach(el => el.classList.remove('tutorial-focus'));
        bubble.classList.add('opacity-0', 'scale-95');
        overlay.classList.add('opacity-0');
        setTimeout(() => { bubble.classList.add('hidden'); overlay.classList.add('hidden'); }, 300);
    }

    document.getElementById('btnCerrarTutorial').addEventListener('click', closeTutorial);
    btnTutNext.addEventListener('click', () => {
        if (currentStep < tutorialData.length - 1) { currentStep++; updateTutorial(); }
        else closeTutorial();
    });
    btnTutPrev.addEventListener('click', () => {
        if (currentStep > 0) { currentStep--; updateTutorial(); }
    });

    construirCilindro3D("", 4);
    actualizarEtiquetas();
});
