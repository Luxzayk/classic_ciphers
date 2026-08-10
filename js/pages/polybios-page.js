// js/pages/polybios-page.js
document.addEventListener("DOMContentLoaded", () => {
    const inputTexto = document.getElementById("textoEntrada");
    const outputTexto = document.getElementById("textoSalida");
    const radiosOperacion = document.querySelectorAll('input[name="operacion"]');
    const idiomaSelector = document.getElementById("idiomaSelector");
    const coordenadasSelector = document.getElementById("coordenadasSelector");

    const btnCopiar = document.getElementById("btnCopiar");
    const btnPegar = document.getElementById("btnPegar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnCopiarOriginal = document.getElementById("btnCopiarOriginal");
    const btnPegarCifrado = document.getElementById("btnPegarCifrado");

    const polibiosGridEl = document.getElementById("polibiosGrid");

    const ALFABETO_POLIBIOS = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

    function buildPolibiosSquare() {
        return ALFABETO_POLIBIOS.split("");
    }

    function initGrid() {
        const idioma = idiomaSelector.value;
        const coordType = coordenadasSelector.value;
        const sq = buildPolibiosSquare();
        polibiosGridEl.innerHTML = "";

        const emptyCell = document.createElement("div");
        emptyCell.className = "pol-cell empty";
        polibiosGridEl.appendChild(emptyCell);

        const labels = (coordType === "LETRA") ? ["A", "B", "C", "D", "E"] : ["1", "2", "3", "4", "5"];

        // Column headers
        for (let c = 0; c < 5; c++) {
            const cell = document.createElement("div");
            cell.className = "pol-cell header-row";
            cell.textContent = labels[c];
            polibiosGridEl.appendChild(cell);
        }

        // Rows
        for (let r = 0; r < 5; r++) {
            const rowHeader = document.createElement("div");
            rowHeader.className = "pol-cell header-col";
            rowHeader.textContent = labels[r];
            polibiosGridEl.appendChild(rowHeader);

            for (let c = 0; c < 5; c++) {
                const letter = sq[r * 5 + c];
                const cell = document.createElement("div");
                cell.className = "pol-cell letter";

                const coord1 = labels[r];
                const coord2 = labels[c];
                cell.dataset.coords = `${coord1}${coord2}`;
                cell.dataset.letter = letter;

                if (letter === "I") {
                    cell.textContent = "I/J";
                } else if (idioma === "ES" && letter === "N") {
                    cell.textContent = "N/Ñ";
                } else {
                    cell.textContent = letter;
                }

                polibiosGridEl.appendChild(cell);
            }
        }
    }

    function highlightCell(targetVal, isCoord = false) {
        document.querySelectorAll(".pol-cell.highlighted").forEach(el => el.classList.remove("highlighted"));
        if (!targetVal) return;

        let selector = "";
        if (isCoord) {
            selector = `.pol-cell.letter[data-coords="${targetVal}"]`;
        } else {
            const letter = targetVal.toUpperCase().replace("Ñ", "N").replace("J", "I");
            if (!/[A-Z]/.test(letter)) return;
            selector = `.pol-cell.letter[data-letter="${letter}"]`;
        }

        const cell = document.querySelector(selector);
        if (cell) cell.classList.add("highlighted");
    }

    function updateStats(texto) {
        const operacion = document.querySelector('input[name="operacion"]:checked').value;
        const coordType = coordenadasSelector.value;
        let longitud = 0;
        let pares = 0;

        if (operacion === "CIFRAR") {
            const clean = texto.replace(/[^A-Za-zÑñ]/g, "");
            longitud = clean.length;
            pares = clean.length;
        } else {
            const regex = (coordType === "LETRA") ? /[^A-Ea-e]/g : /[^1-5]/g;
            const clean = texto.replace(regex, "");
            pares = Math.floor(clean.length / 2);
            longitud = pares;
        }

        document.getElementById("statLongitud").textContent = longitud;
        document.getElementById("statPares").textContent = pares;
        document.getElementById("statRatio").textContent = longitud > 0 ? "2x" : "-";
    }

    function actualizarPlaceholders() {
        const operacion = document.querySelector('input[name="operacion"]:checked').value;
        const coordType = coordenadasSelector.value;
        const isCifrar = (operacion === "CIFRAR");

        const lblEntrada = document.getElementById("labelEntrada");
        const lblSalida = document.getElementById("labelSalida");

        if (lblEntrada) lblEntrada.textContent = isCifrar ? "Texto Original" : "Texto Cifrado";
        if (lblSalida) lblSalida.textContent = isCifrar ? "Texto Cifrado" : "Texto Original";

        if (operacion === "CIFRAR") {
            inputTexto.placeholder = "Escribe el texto claro para cifrarlo Ej: Polybios";
            if (coordType === "LETRA") {
                outputTexto.placeholder = "El texto cifrado se mostrará aquí. Ej: CE CD CA ED AB BD CD DC";
            } else {
                outputTexto.placeholder = "El texto cifrado se mostrará aquí. Ej: 35 34 31 54 12 24 34 43";
            }
        } else {
            if (coordType === "LETRA") {
                inputTexto.placeholder = "Escribe el texto cifrado para descifrarlo Ej: CE CD CA ED AB BD CD DC";
            } else {
                inputTexto.placeholder = "Escribe el texto cifrado para descifrarlo Ej: 35 34 31 54 12 24 34 43";
            }
            outputTexto.placeholder = "El texto descifrado se mostrará aquí. Ej: Polybios";
        }
    }

    function actualizarComoFunciona() {
        const operacion = document.querySelector('input[name="operacion"]:checked').value;
        const coordType = coordenadasSelector.value;
        const container = document.getElementById("comoFuncionaContent");
        if (!container) return;

        const paresText = (coordType === "LETRA") ? "letras" : "dígitos";

        if (operacion === "CIFRAR") {
            container.innerHTML = `
                <h3 class="text-cyan-700 dark:text-cyan-400 font-bold text-xs mb-2 flex items-center gap-2 transition-colors">
                    <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    ¿Cómo funciona?
                </h3>
                <ol class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed list-decimal list-inside space-y-1.5 transition-colors">
                    <li>Ingresa tu mensaje en <strong class="text-slate-800 dark:text-slate-300">Texto Original</strong>.</li>
                    <li>Cada letra se sustituye por sus coordenadas (fila, columna) en la cuadrícula 5×5.</li>
                    <li>El resultado aparecerá en <strong class="text-slate-800 dark:text-slate-300">Texto Cifrado</strong> como pares de ${paresText}.</li>
                </ol>
            `;
        } else {
            container.innerHTML = `
                <h3 class="text-cyan-700 dark:text-cyan-400 font-bold text-xs mb-2 flex items-center gap-2 transition-colors">
                    <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    ¿Cómo funciona al descifrar?
                </h3>
                <ol class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed list-decimal list-inside space-y-1.5 transition-colors">
                    <li>Ingresa las coordenadas en <strong class="text-slate-800 dark:text-slate-300">Texto Cifrado</strong> (pares de ${paresText}).</li>
                    <li>Cada par indica la posición de una letra en la cuadrícula 5×5.</li>
                    <li>El sistema reemplaza las coordenadas por las letras correspondientes.</li>
                    <li>El resultado aparecerá en <strong class="text-slate-800 dark:text-slate-300">Texto Original</strong>, reconstruyendo el mensaje.</li>
                </ol>
            `;
        }
    }

    function enviarDatos() {
        const texto = inputTexto.value;
        const operacion = document.querySelector('input[name="operacion"]:checked').value;
        const idioma = idiomaSelector.value;
        const tipoCoords = coordenadasSelector.value;

        initGrid();
        updateStats(texto);
        actualizarPlaceholders();
        actualizarComoFunciona();

        if (!texto) {
            outputTexto.value = "";
            return;
        }

        try {
            const res = PolybiosCipher.procesar(texto, operacion, idioma, tipoCoords);
            outputTexto.value = res;
        } catch (err) {
            CryptoUX.showToast("Error", err.message, "error");
        }
    }

    inputTexto.addEventListener("input", enviarDatos);
    idiomaSelector.addEventListener("change", enviarDatos);
    coordenadasSelector.addEventListener("change", enviarDatos);
    radiosOperacion.forEach(r => r.addEventListener("change", () => {
        enviarDatos();
        inputTexto.focus();
    }));

    inputTexto.addEventListener("keyup", (e) => {
        const operacion = document.querySelector('input[name="operacion"]:checked').value;
        const pos = e.target.selectionStart;
        const val = e.target.value;

        if (operacion === "CIFRAR") {
            const char = val[Math.max(0, pos - 1)];
            highlightCell(char, false);
        } else {
            const coordType = coordenadasSelector.value;
            const regex = (coordType === "LETRA") ? /[^A-Ea-e]/g : /[^1-5]/g;
            const cleanCoords = val.substring(0, pos).replace(regex, "").toUpperCase();
            if (cleanCoords.length >= 2) {
                highlightCell(cleanCoords.slice(-2), true);
            }
        }
    });

    // UX Helpers
    btnPegar.addEventListener("click", async () => {
        try {
            const texto = await navigator.clipboard.readText();
            if (texto) {
                inputTexto.value = texto;
                enviarDatos();
                inputTexto.focus();
                CryptoUX.showToast("Pegado", "Texto insertado correctamente.", "success");
            }
        } catch {
            CryptoUX.showToast("Acceso denegado", "Permiso de portapapeles denegado.", "error");
        }
    });

    btnCopiarOriginal?.addEventListener("click", async () => {
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

    btnLimpiar.addEventListener("click", () => {
        inputTexto.value = "";
        enviarDatos();
        document.querySelectorAll(".pol-cell.highlighted").forEach(el => el.classList.remove("highlighted"));
        inputTexto.focus();
    });

    btnPegarCifrado?.addEventListener("click", async () => {
        try {
            const texto = await navigator.clipboard.readText();
            if (texto) {
                const radioDescifrar = document.querySelector('input[name="operacion"][value="DESCIFRAR"]');
                if (radioDescifrar) {
                    radioDescifrar.checked = true;
                }
                inputTexto.value = texto;
                enviarDatos();
                inputTexto.focus();
                CryptoUX.showToast("Pegado", "Texto cifrado insertado para descifrar.", "success");
            }
        } catch {
            CryptoUX.showToast("Acceso denegado", "Permiso de portapapeles denegado.", "error");
        }
    });

    btnCopiar.addEventListener("click", async () => {
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
        { element: "#panelParametros", title: "Operación y alfabeto", text: "Elige si quieres cifrar texto o descifrar coordenadas. El cuadrado usa una matriz fija de 5x5." },
        { element: "#panelSimulador", title: "La cuadrícula 5x5", text: "Cada celda tiene coordenadas de fila y columna. Al escribir, se resalta la letra o par actual." },
        { element: "#panelEntrada", title: "El mensaje", text: "Escribe texto para cifrar o coordenadas para descifrar. Los espacios se ignoran al descifrar." },
        { element: "#panelSalida", title: "Las coordenadas", text: "Al cifrar, cada letra se convierte en un par separado por espacios." }
    ];

    let currentStep = 0;
    let activeTarget = null;
    let animationFrameId = null;

    const overlay = document.getElementById("tutorialOverlay");
    const bubble = document.getElementById("tutorialBubble");
    const tutTitle = document.getElementById("tutTitle");
    const tutText = document.getElementById("tutText");
    const btnTutNext = document.getElementById("btnTutNext");
    const btnTutPrev = document.getElementById("btnTutPrev");
    const tutDotsContainer = document.getElementById("tutDots");

    if (tutDotsContainer) {
        tutDotsContainer.innerHTML = "";
        tutorialData.forEach(() => {
            const span = document.createElement("span");
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
        document.querySelectorAll(".tutorial-focus").forEach(el => el.classList.remove("tutorial-focus"));
        const target = document.querySelector(selector);
        if (!target) return;
        target.classList.add("tutorial-focus");
        target.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => {
            activeTarget = target;
            bubble.classList.remove("hidden");
            updateBubblePosition();
            bubble.classList.remove("opacity-0", "scale-95");
        }, 300);
    }

    function updateTutorial() {
        bubble.classList.add("opacity-0", "scale-95");
        setTimeout(() => {
            tutTitle.innerHTML = tutorialData[currentStep].title;
            tutText.innerHTML = tutorialData[currentStep].text;

            Array.from(tutDotsContainer.children).forEach((dot, i) => {
                dot.className = i === currentStep
                    ? "w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] transition-all"
                    : "w-2 h-2 rounded-full bg-slate-700 transition-all";
            });

            btnTutPrev.classList.toggle("hidden", currentStep === 0);
            
            if (currentStep === tutorialData.length - 1) {
                btnTutNext.innerHTML = "Terminar ✓";
            } else {
                btnTutNext.innerHTML = "Siguiente →";
            }

            moverBurbuja(tutorialData[currentStep].element);
        }, 200);
    }

    document.getElementById("btnTutorial").addEventListener("click", () => {
        currentStep = 0;
        overlay.classList.remove("hidden");
        setTimeout(() => overlay.classList.remove("opacity-0"), 10);
        updateTutorial();
    });

    function closeTutorial() {
        stopTracking();
        document.querySelectorAll(".tutorial-focus").forEach(el => el.classList.remove("tutorial-focus"));
        bubble.classList.add("opacity-0", "scale-95");
        overlay.classList.add("opacity-0");
        setTimeout(() => {
            bubble.classList.add("hidden");
            overlay.classList.add("hidden");
        }, 300);
    }

    document.getElementById("btnCerrarTutorial").addEventListener("click", closeTutorial);
    btnTutNext.addEventListener("click", () => {
        currentStep < tutorialData.length - 1 ? (currentStep++, updateTutorial()) : closeTutorial();
    });
    btnTutPrev.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            updateTutorial();
        }
    });

    initGrid();
    actualizarPlaceholders();
    actualizarComoFunciona();
});
