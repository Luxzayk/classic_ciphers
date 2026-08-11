// js/pages/grupos-page.js
document.addEventListener("DOMContentLoaded", () => {
    const GruposCipher = window.CriptoSuite.GruposCipher;
    // Referencias DOM - Entradas
    const inputTexto   = document.getElementById('textoEntrada');
    const outputTexto  = document.getElementById('textoSalida');
    const inputClave   = document.getElementById('clave');
    const radiosOperacion = document.querySelectorAll('input[name="operacion"]');
    const selectIdioma = document.getElementById('idioma');
    const inputAlfabetoCustom = document.getElementById('alfabetoCustom');
    const customAlphabetContainer = document.getElementById('customAlphabetContainer');

    // Simulador
    const filaOrigen      = document.getElementById('filaOrigen');
    const filaDestino     = document.getElementById('filaDestino');
    const svgConectores   = document.getElementById('svgConectores');
    const periodDisplay   = document.getElementById('periodDisplay');

    // Botones de acción
    const btnCopiar  = document.getElementById('btnCopiar');
    const btnPegar   = document.getElementById('btnPegar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnAnimar  = document.getElementById('btnAnimar');

    let isAnimating = false;
    let animationInterval = null;
    let activeTarget = null;
    let animationFrameId = null;

    const ALFABETO_ES = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    const ALFABETO_EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function normalizarConAlfabeto(text, alf) {
        if (!text) return "";
        let upper = text.toUpperCase()
            .replace(/[ÁÄÂÀ]/g, "A")
            .replace(/[ÉËÊÈ]/g, "E")
            .replace(/[ÍÏÎÌ]/g, "I")
            .replace(/[ÓÖÔÒ]/g, "O")
            .replace(/[ÚÜÛÙ]/g, "U");
        if (!alf.includes('Ñ') && alf.includes('N')) {
            upper = upper.replaceAll('Ñ', 'N');
        }
        let res = "";
        for (let c of upper) {
            if (alf.includes(c)) res += c;
        }
        return res;
    }

    function parseKey(keyStr) {
        if (!keyStr) return null;
        let trimmed = keyStr.trim();
        let tokens;
        if (trimmed.includes(" ") || trimmed.includes("\t")) {
            tokens = trimmed.split(/\s+/);
        } else {
            tokens = trimmed.split("");
        }
        const p = [];
        for (let t of tokens) {
            const val = parseInt(t);
            if (isNaN(val)) return null;
            p.push(val);
        }
        if (p.length === 0) return null;
        
        const seen = new Set();
        for (let val of p) {
            if (val < 1 || val > p.length) return null;
            if (seen.has(val)) return null;
            seen.add(val);
            p.length; // dummy
        }
        return p;
    }

    function dibujarConectores() {
        const p = parseKey(inputClave.value);
        if (!p) {
            svgConectores.innerHTML = '';
            filaOrigen.innerHTML = '';
            filaDestino.innerHTML = '';
            periodDisplay.innerText = "0";
            return;
        }

        const P = p.length;
        periodDisplay.innerText = P;

        filaOrigen.innerHTML = '';
        filaDestino.innerHTML = '';
        svgConectores.innerHTML = '';

        for (let i = 0; i < P; i++) {
            const boxO = document.createElement('div');
            boxO.className = 'cell-box font-mono font-bold text-slate-400 text-sm';
            boxO.innerHTML = `<span class="text-[9px] text-slate-655 absolute top-0.5">${i + 1}</span><span class="char-val mt-2">-</span>`;
            boxO.setAttribute('data-pos', i + 1);
            filaOrigen.appendChild(boxO);

            const boxD = document.createElement('div');
            boxD.className = 'cell-box font-mono font-bold text-cyan-400 text-sm';
            boxD.innerHTML = `<span class="text-[9px] text-cyan-600/60 absolute top-0.5">${i + 1}</span><span class="char-val mt-2">-</span>`;
            boxD.setAttribute('data-pos', i + 1);
            filaDestino.appendChild(boxD);
        }

        setTimeout(() => {
            const svgRect = svgConectores.getBoundingClientRect();
            const origBoxes = filaOrigen.querySelectorAll('.cell-box');
            const destBoxes = filaDestino.querySelectorAll('.cell-box');

            for (let i = 0; i < P; i++) {
                const destBox = destBoxes[i];
                const sourceIndex = p[i] - 1;
                const sourceBox = origBoxes[sourceIndex];

                if (!sourceBox || !destBox) continue;

                const sRect = sourceBox.getBoundingClientRect();
                const dRect = destBox.getBoundingClientRect();

                const x1 = sRect.left + sRect.width / 2 - svgRect.left;
                const y1 = 0;
                const x2 = dRect.left + dRect.width / 2 - svgRect.left;
                const y2 = svgRect.height;

                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                const controlY = (y1 + y2) / 2;
                const d = `M ${x1} ${y1} C ${x1} ${controlY}, ${x2} ${controlY}, ${x2} ${y2}`;
                
                path.setAttribute('d', d);
                path.setAttribute('stroke', 'rgba(6, 182, 212, 0.25)');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('fill', 'none');
                path.setAttribute('class', 'connection-path transition-all duration-300');
                path.setAttribute('data-source', sourceIndex + 1);
                path.setAttribute('data-dest', i + 1);
                svgConectores.appendChild(path);
            }
        }, 80);
    }

    window.addEventListener('resize', dibujarConectores);
    inputClave.addEventListener('input', dibujarConectores);

    function enviarDatos() {
        const texto = inputTexto.value;
        if (!texto) {
            outputTexto.value = "";
            return;
        }

        const operacion = document.querySelector('input[name="operacion"]:checked').value;
        try {
            const res = GruposCipher.procesar(texto, inputClave.value, operacion, selectIdioma.value, inputAlfabetoCustom.value);
            outputTexto.value = res;
        } catch (err) {
            CryptoUX.showToast("Error", err.message, "error");
        }
    }

    function actualizarEtiquetas() {
        const operacionChecked = document.querySelector('input[name="operacion"]:checked');
        if (!operacionChecked) return;
        const operacion = operacionChecked.value;
        const isCifrar = (operacion === 'CIFRAR');

        const lblEntrada = document.getElementById("labelEntrada");
        const descEntrada = document.getElementById("descEntrada");
        const lblSalida = document.getElementById("labelSalida");
        const descSalida = document.getElementById("descSalida");

        if (lblEntrada) lblEntrada.textContent = isCifrar ? "Texto Original" : "Texto Cifrado";
        if (descEntrada) descEntrada.textContent = isCifrar ? "Mensaje plano a permutar por bloques" : "Criptograma a descifrar por bloques";
        if (lblSalida) lblSalida.textContent = isCifrar ? "Texto Cifrado" : "Texto Original";
        if (descSalida) descSalida.textContent = isCifrar ? "Resultado del proceso de transposición por bloques" : "Mensaje original obtenido";

        if (inputTexto) inputTexto.placeholder = isCifrar ? "Escribe la frase a cifrar..." : "Escribe el criptograma a descifrar...";
        if (outputTexto) outputTexto.placeholder = isCifrar ? "El criptograma permutado se mostrará aquí..." : "El texto original descifrado se mostrará aquí...";
    }

    inputTexto.addEventListener('input', enviarDatos);
    radiosOperacion.forEach(r => r.addEventListener('change', () => {
        actualizarEtiquetas();
        enviarDatos();
    }));
    inputClave.addEventListener('input', enviarDatos);

    selectIdioma.addEventListener('change', () => {
        if (selectIdioma.value === 'CUSTOM') {
            customAlphabetContainer.classList.remove('hidden');
        } else {
            customAlphabetContainer.classList.add('hidden');
        }
        dibujarConectores();
        enviarDatos();
    });

    inputAlfabetoCustom.addEventListener('input', () => {
        dibujarConectores();
        enviarDatos();
    });

    function stopAnimation() {
        if (animationInterval) clearTimeout(animationInterval);
        isAnimating = false;
        btnAnimar.innerHTML = "⚡ Animar";
        btnAnimar.classList.remove('text-red-500', 'dark:text-red-405');
        btnAnimar.classList.add('text-amber-600', 'dark:text-amber-300');
        
        document.querySelectorAll('.cell-box').forEach(el => el.classList.remove('active'));
        svgConectores.querySelectorAll('path').forEach(p => {
            p.setAttribute('stroke', 'rgba(6, 182, 212, 0.25)');
            p.setAttribute('stroke-width', '2');
        });
    }

    function animarGrupos() {
        if (isAnimating) {
            stopAnimation();
            return;
        }

        const texto = inputTexto.value;
        if (!texto) {
            CryptoUX.showToast("Error", "Ingrese texto a animar.", "error");
            return;
        }

        const p = parseKey(inputClave.value);
        if (!p) {
            CryptoUX.showToast("Error", "Permutación inválida.", "error");
            return;
        }

        const P = p.length;
        const operacion = document.querySelector('input[name="operacion"]:checked').value;
        const isCifrar = (operacion === "CIFRAR");

        const idioma = selectIdioma.value;
        const alfabetoCustom = inputAlfabetoCustom.value;
        let alfabeto = ALFABETO_ES;
        if (idioma === "EN") {
            alfabeto = ALFABETO_EN;
        } else if (idioma === "CUSTOM") {
            let sb = "";
            for (let c of alfabetoCustom.toUpperCase()) {
                if (!sb.includes(c)) sb += c;
            }
            alfabeto = sb;
            if (alfabeto.length < 2) {
                CryptoUX.showToast("Error", "El alfabeto personalizado debe tener al menos 2 caracteres.", "error");
                return;
            }
        }

        let txt = normalizarConAlfabeto(texto, alfabeto);
        if (isCifrar) {
            let rem = txt.length % P;
            if (rem !== 0) {
                let padLen = P - rem;
                let padChar = alfabeto.includes('X') ? 'X' : alfabeto.charAt(alfabeto.length - 1);
                for (let i = 0; i < padLen; i++) {
                    txt += padChar;
                }
            }
        } else {
            if (txt.length % P !== 0) {
                CryptoUX.showToast("Error", "La longitud del criptograma (filtrado por el alfabeto) debe ser múltiplo del período P.", "error");
                return;
            }
        }

        isAnimating = true;
        btnAnimar.innerHTML = "⏹ Detener";
        btnAnimar.classList.remove('text-amber-600', 'dark:text-amber-300');
        btnAnimar.classList.add('text-red-500', 'dark:text-red-400');
        
        outputTexto.value = "";
        let finalResult = "";
        let blockIndex = 0;
        let charIndexInBlock = 0;

        const invArr = [];
        for (let i = 0; i < P; i++) {
            invArr[p[i] - 1] = i + 1;
        }

        function animarSiguienteCaracter() {
            const textIdx = blockIndex * P + charIndexInBlock;
            if (textIdx >= txt.length) {
                stopAnimation();
                CryptoUX.showToast("Éxito", "Animación finalizada.", "success");
                enviarDatos();
                return;
            }

            if (charIndexInBlock === 0) {
                const blockText = txt.substring(blockIndex * P, blockIndex * P + P);
                const origBoxes = filaOrigen.querySelectorAll('.cell-box');
                const destBoxes = filaDestino.querySelectorAll('.cell-box');

                destBoxes.forEach(b => {
                    b.querySelector('.char-val').innerText = '-';
                    b.classList.remove('active');
                });
                for (let i = 0; i < P; i++) {
                    origBoxes[i].querySelector('.char-val').innerText = blockText[i] || 'X';
                }
                
                CryptoUX.showToast("Información", `Procesando bloque ${blockIndex + 1}: "${blockText}"`, "info");
            }

            const origBoxes = filaOrigen.querySelectorAll('.cell-box');
            const destBoxes = filaDestino.querySelectorAll('.cell-box');

            svgConectores.querySelectorAll('path').forEach(path => {
                path.setAttribute('stroke', 'rgba(6, 182, 212, 0.25)');
                path.setAttribute('stroke-width', '2');
            });
            origBoxes.forEach(b => b.classList.remove('active'));

            let charValue = '';
            let srcIndex = 0;
            let destIndex = 0;

            if (isCifrar) {
                destIndex = charIndexInBlock;
                srcIndex = p[destIndex] - 1;
                charValue = origBoxes[srcIndex].querySelector('.char-val').innerText;
            } else {
                destIndex = charIndexInBlock;
                srcIndex = invArr[destIndex] - 1;
                charValue = origBoxes[srcIndex].querySelector('.char-val').innerText;
            }

            origBoxes[srcIndex].classList.add('active');
            const path = svgConectores.querySelector(`path[data-source="${srcIndex + 1}"][data-dest="${destIndex + 1}"]`);
            if (path) {
                path.setAttribute('stroke', '#fbbf24');
                path.setAttribute('stroke-width', '4');
            }

            setTimeout(() => {
                destBoxes[destIndex].querySelector('.char-val').innerText = charValue;
                destBoxes[destIndex].classList.add('active');

                let nextResultPart = charValue;
                if (isCifrar && charIndexInBlock === P - 1) {
                    nextResultPart += " ";
                }
                finalResult += nextResultPart;
                outputTexto.value = finalResult.trim();

                inputTexto.focus({ preventScroll: true });
                inputTexto.setSelectionRange(textIdx, textIdx + 1);
                outputTexto.focus({ preventScroll: true });
                outputTexto.setSelectionRange(finalResult.length - 1, finalResult.length);

                charIndexInBlock++;
                if (charIndexInBlock === P) {
                    charIndexInBlock = 0;
                    blockIndex++;
                }

                animationInterval = setTimeout(animarSiguienteCaracter, 600);
            }, 300);
        }

        animarSiguienteCaracter();
    }

    btnAnimar.addEventListener('click', animarGrupos);

    btnPegar.addEventListener('click', async () => {
        try {
            const texto = await navigator.clipboard.readText();
            if (texto) { inputTexto.value = texto; enviarDatos(); inputTexto.focus(); }
        } catch { CryptoUX.showToast("Error", "Permiso de portapapeles denegado.", "error"); }
    });

    btnLimpiar.addEventListener('click', () => {
        inputTexto.value = "";
        if (isAnimating) stopAnimation();
        enviarDatos();
        inputTexto.focus();
    });

    btnCopiar.addEventListener('click', async () => {
        if (!outputTexto.value) return;
        try {
            await navigator.clipboard.writeText(outputTexto.value);
            CryptoUX.showToast("¡Copiado!", "Resultado copiado al portapapeles", "success");
        } catch {
            outputTexto.select();
            document.execCommand("copy");
        }
    });

    const tutorialData = [
        { element: '#panelParametros', title: 'Configurar Bloque',   text: 'Ingresa los números de permutación separados por espacios. El período se deduce automáticamente por la cantidad de números.' },
        { element: '#panelSimulador',  title: 'Ruta de Transposición', text: 'Visualiza la correspondencia original contra la mezclada a través de las flechas curvas.' },
        { element: '#panelEntrada',    title: 'Texto del Mensaje',      text: 'Inserta el texto plano. El sistema completará automáticamente con "X" las posiciones faltantes al final.' },
        { element: '#panelSalida',     title: 'Resultado Permutado',   text: 'Copia el texto cifrado final. Puedes ejecutar "Animar" para ver el viaje de cada carácter.' }
    ];

    let currentStep = 0;
    const overlay    = document.getElementById('tutorialOverlay');
    const bubble     = document.getElementById('tutorialBubble');
    const tutTitle   = document.getElementById('tutTitle');
    const tutText    = document.getElementById('tutText');
    const btnTutNext = document.getElementById('btnTutNext');
    const btnTutPrev = document.getElementById('btnTutPrev');
    const tutDotsContainer = document.getElementById('tutDots');

    if (tutDotsContainer) {
        tutDotsContainer.innerHTML = "";
        tutorialData.forEach(() => {
            const span = document.createElement('span');
            span.className = "w-2 h-2 rounded-full bg-slate-700";
            tutDotsContainer.appendChild(span);
        });
    }

    function stopTracking() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        activeTarget = null;
    }

    function updateBubblePosition() {
        if (!activeTarget) return;
        const rect = activeTarget.getBoundingClientRect();
        const bubbleRect = bubble.getBoundingClientRect();

        let top = rect.bottom + 15;
        let left = rect.left + (rect.width / 2) - (bubbleRect.width / 2);

        const padding = 15;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        if (left < padding) left = padding;
        if (left + bubbleRect.width > screenWidth - padding) {
            left = screenWidth - bubbleRect.width - padding;
        }

        if (top + bubbleRect.height > screenHeight - padding) {
            top = rect.top - bubbleRect.height - 15;
        }
        if (top < padding) {
            top = padding;
        }

        bubble.style.top = `${top}px`;
        bubble.style.left = `${left}px`;

        animationFrameId = requestAnimationFrame(updateBubblePosition);
    }

    function moverBurbuja(selector) {
        stopTracking();
        document.querySelectorAll('.tutorial-focus').forEach(el => el.classList.remove('tutorial-focus'));
        const target = document.querySelector(selector);
        if (!target) return;
        target.classList.add('tutorial-focus');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
            activeTarget = target;
            bubble.classList.remove('hidden');
            updateBubblePosition();
            bubble.classList.remove('opacity-0', 'scale-95');
        }, 300);
    }

    function updateTutorial() {
        bubble.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            tutTitle.innerHTML = tutorialData[currentStep].title;
            tutText.innerHTML  = tutorialData[currentStep].text;

            Array.from(tutDotsContainer.children).forEach((dot, i) => {
                dot.className = i === currentStep
                    ? "w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] transition-all"
                    : "w-2 h-2 rounded-full bg-slate-700 transition-all";
            });

            btnTutPrev.classList.toggle('hidden', currentStep === 0);

            if (currentStep === tutorialData.length - 1) {
                btnTutNext.innerHTML = "Terminar ✓";
                btnTutNext.classList.remove("bg-cyan-600", "hover:bg-cyan-500");
                btnTutNext.classList.add("bg-emerald-600", "hover:bg-emerald-500");
            } else {
                btnTutNext.innerHTML = "Siguiente →";
                btnTutNext.classList.remove("bg-emerald-600", "hover:bg-emerald-500");
                btnTutNext.classList.add("bg-cyan-600", "hover:bg-cyan-500");
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
        stopTracking();
        document.querySelectorAll('.tutorial-focus').forEach(el => el.classList.remove('tutorial-focus'));
        bubble.classList.add('opacity-0', 'scale-95');
        overlay.classList.add('opacity-0');
        setTimeout(() => { bubble.classList.add('hidden'); overlay.classList.add('hidden'); }, 300);
    }

    document.getElementById('btnCerrarTutorial').addEventListener('click', closeTutorial);
    btnTutNext.addEventListener('click', () => {
        currentStep < tutorialData.length - 1 ? (currentStep++, updateTutorial()) : closeTutorial();
    });
    btnTutPrev.addEventListener('click', () => {
        if (currentStep > 0) { currentStep--; updateTutorial(); }
    });

    dibujarConectores();
    actualizarEtiquetas();
});
