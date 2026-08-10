// js/pages/vigenere-page.js
document.addEventListener("DOMContentLoaded", () => {
    let ultimoCampoEditado = "entrada";
    let ultimoToastClave = 0;

    const inputTexto = document.getElementById("textoEntrada");
    const outputTexto = document.getElementById("textoSalida");
    const inputClave = document.getElementById("clave");
    const selectIdioma = document.getElementById("idioma");
    const customContainer = document.getElementById("customAlphabetContainer");
    const inputCustom = document.getElementById("alfabetoCustom");

    const tabla = document.getElementById("vigenereTable");
    const tableInfo = document.getElementById("tableInfo");
    const charTexto = document.getElementById("charTexto");
    const charClave = document.getElementById("charClave");
    const charResultado = document.getElementById("charResultado");

    const btnCopiar = document.getElementById("btnCopiar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnPegar = document.getElementById("btnPegar");
    const btnCopiarOriginal = document.getElementById("btnCopiarOriginal");
    const btnPegarCifrado = document.getElementById("btnPegarCifrado");

    function limpiarLetrasUnicas(valor) {
        const visto = new Set();
        let resultado = "";
        for (const char of (valor || "").toUpperCase()) {
            if (!/[A-ZÑ]/i.test(char)) continue;
            if (visto.has(char)) continue;
            visto.add(char);
            resultado += char;
        }
        return resultado;
    }

    function obtenerAlfabeto() {
        if (selectIdioma.value === "CUSTOM") {
            const custom = limpiarLetrasUnicas(inputCustom.value);
            return custom.length >= 2 ? custom : "";
        }
        return selectIdioma.value === "EN" ? VigenereCipher.ALFABETO_EN : VigenereCipher.ALFABETO_ES;
    }

    function limpiarClave(valor) {
        const alfabeto = obtenerAlfabeto();
        let resultado = "";
        for (const char of (valor || "").toUpperCase()) {
            if (alfabeto.includes(char)) resultado += char;
        }
        return resultado;
    }

    function construirTabla() {
        const alfabeto = obtenerAlfabeto();
        tabla.innerHTML = "";

        if (!alfabeto) {
            tabla.innerHTML = '<tr><td class="text-slate-500 px-3 py-2">Ingresa un alfabeto personalizado válido.</td></tr>';
            tableInfo.textContent = "";
            return;
        }

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const corner = document.createElement("th");
        corner.className = "corner top-head";
        corner.textContent = "K/T";
        headerRow.appendChild(corner);

        for (let i = 0; i < alfabeto.length; i++) {
            const th = document.createElement("th");
            th.className = "top-head";
            th.textContent = alfabeto[i];
            th.dataset.col = alfabeto[i];
            headerRow.appendChild(th);
        }

        thead.appendChild(headerRow);
        tabla.appendChild(thead);

        const tbody = document.createElement("tbody");
        for (let fila = 0; fila < alfabeto.length; fila++) {
            const tr = document.createElement("tr");
            const rowHead = document.createElement("th");
            rowHead.className = "side-head";
            rowHead.textContent = alfabeto[fila];
            rowHead.dataset.row = alfabeto[fila];
            tr.appendChild(rowHead);

            for (let col = 0; col < alfabeto.length; col++) {
                const td = document.createElement("td");
                td.textContent = alfabeto[(fila + col) % alfabeto.length];
                td.dataset.rowIndex = String(fila);
                td.dataset.colIndex = String(col);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }

        tabla.appendChild(tbody);
        tableInfo.textContent = `${alfabeto.length} x ${alfabeto.length}`;
    }

    function obtenerInfoUltimoCaracter(texto, operacion) {
        const alfabeto = obtenerAlfabeto();
        const clave = limpiarClave(inputClave.value);

        if (!alfabeto || !clave || !texto) return null;

        let letrasValidas = 0;
        let ultima = null;

        for (let i = 0; i < texto.length; i++) {
            const char = texto.charAt(i);
            const upper = char.toUpperCase();
            const indexTexto = alfabeto.indexOf(upper);
            if (indexTexto === -1) continue;

            const keyChar = clave.charAt(letrasValidas % clave.length);
            const indexClave = alfabeto.indexOf(keyChar);
            let indexCol = indexTexto;
            let indexSalida = (indexTexto + indexClave) % alfabeto.length;

            if (operacion === "DESCIFRAR") {
                indexSalida = (indexTexto - indexClave + alfabeto.length) % alfabeto.length;
                indexCol = indexSalida;
            }

            // We subtract indexTexto minus indexClave in decrypt to find col index where intersection of row indexClave gives ciphertext indexTexto.
            // i.e. colIndex + rowIndex = outputIndex
            // colIndex = outputIndex - rowIndex

            ultima = {
                texto: upper,
                clave: keyChar,
                salida: alfabeto.charAt(indexSalida),
                rowIndex: indexClave,
                colIndex: indexCol
            };

            letrasValidas++;
        }

        return ultima;
    }

    function resaltarTabla() {
        document.querySelectorAll(".active-row, .active-col, .active-cell").forEach(el => {
            el.classList.remove("active-row", "active-col", "active-cell");
        });

        const texto = ultimoCampoEditado === "entrada" ? inputTexto.value : outputTexto.value;
        const operacion = ultimoCampoEditado === "entrada" ? "CIFRAR" : "DESCIFRAR";
        const info = obtenerInfoUltimoCaracter(texto, operacion);

        if (!info) {
            charTexto.textContent = "-";
            charClave.textContent = "-";
            charResultado.textContent = "-";
            return;
        }

        charTexto.textContent = info.texto;
        charClave.textContent = info.clave;
        charResultado.textContent = info.salida;

        const rowCells = tabla.querySelectorAll(`td[data-row-index="${info.rowIndex}"]`);
        const colCells = tabla.querySelectorAll(`td[data-col-index="${info.colIndex}"]`);
        rowCells.forEach(cell => cell.classList.add("active-row"));
        colCells.forEach(cell => cell.classList.add("active-col"));

        const activeCell = tabla.querySelector(`td[data-row-index="${info.rowIndex}"][data-col-index="${info.colIndex}"]`);
        if (activeCell) {
            activeCell.classList.add("active-cell");
            activeCell.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
    }

    function enviarDatos(origen) {
        ultimoCampoEditado = origen;
        const texto = origen === "entrada" ? inputTexto.value : outputTexto.value;
        const operacion = origen === "entrada" ? "CIFRAR" : "DESCIFRAR";
        const clave = inputClave.value;
        const alfabetoCustom = inputCustom.value;

        resaltarTabla();

        if (!texto) {
            if (origen === "entrada") outputTexto.value = "";
            else inputTexto.value = "";
            return;
        }

        if (selectIdioma.value === "CUSTOM" && !obtenerAlfabeto()) {
            return;
        }

        if (!limpiarClave(clave)) {
            avisarClave();
            return;
        }

        try {
            if (origen === "entrada") {
                const res = VigenereCipher.procesar(texto, clave, "CIFRAR", selectIdioma.value, alfabetoCustom);
                outputTexto.value = res;
            } else {
                const res = VigenereCipher.procesar(texto, clave, "DESCIFRAR", selectIdioma.value, alfabetoCustom);
                inputTexto.value = res;
            }
            resaltarTabla();
        } catch (err) {
            CryptoUX.showToast("Error", err.message, "error");
        }
    }

    function avisarClave() {
        const ahora = Date.now();
        if (ahora - ultimoToastClave > 1800) {
            CryptoUX.showToast("Clave Requerida", "La clave necesita al menos una letra del alfabeto seleccionado.", "error");
            ultimoToastClave = ahora;
        }
    }

    inputTexto.addEventListener("input", () => enviarDatos("entrada"));
    outputTexto.addEventListener("input", () => enviarDatos("salida"));

    inputClave.addEventListener("input", () => {
        inputClave.value = inputClave.value.toUpperCase();
        resaltarTabla();
        enviarDatos(ultimoCampoEditado);
    });

    inputCustom.addEventListener("input", () => {
        inputCustom.value = limpiarLetrasUnicas(inputCustom.value);
        construirTabla();
        enviarDatos(ultimoCampoEditado);
    });

    selectIdioma.addEventListener("change", () => {
        customContainer.classList.toggle("hidden", selectIdioma.value !== "CUSTOM");
        construirTabla();
        enviarDatos(ultimoCampoEditado);
    });

    // UX Helpers
    btnPegar.addEventListener("click", async () => {
        try {
            const textoPortapapeles = await navigator.clipboard.readText();
            if (textoPortapapeles) {
                inputTexto.value = textoPortapapeles;
                enviarDatos("entrada");
                inputTexto.focus();
                CryptoUX.showToast("Pegado", "Texto insertado correctamente.", "success");
            }
        } catch {
            CryptoUX.showToast("Acceso denegado", "Permiso denegado.", "error");
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
        outputTexto.value = "";
        ultimoCampoEditado = "entrada";
        resaltarTabla();
        inputTexto.focus();
    });

    btnCopiar.addEventListener("click", async () => {
        if (!outputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto para copiar.", "info");
            return;
        }
        try {
            await navigator.clipboard.writeText(outputTexto.value);
            CryptoUX.showToast("¡Copiado!", "Texto copiado al portapapeles.", "success");
        } catch {
            outputTexto.select();
            document.execCommand("copy");
        }
    });

    btnPegarCifrado?.addEventListener("click", async () => {
        try {
            const textoPortapapeles = await navigator.clipboard.readText();
            if (textoPortapapeles) {
                outputTexto.value = textoPortapapeles;
                enviarDatos("salida");
                outputTexto.focus();
                CryptoUX.showToast("Pegado", "Texto insertado correctamente.", "success");
            }
        } catch {
            CryptoUX.showToast("Acceso denegado", "Permiso denegado.", "error");
        }
    });

    // ==========================================
    // TUTORIAL INTERACTIVO
    // ==========================================
    const tutorialData = [
        { element: "#panelParametros", title: "Configuración y Palabra Clave", text: "Selecciona el alfabeto que deseas usar (Español, Inglés o Personalizado) e ingresa una palabra clave. El cifrado utilizará esta palabra de manera repetida para desplazar el texto." },
        { element: "#panelSimulador", title: "Tabla de Vigenère", text: "Esta cuadrícula ilustra la intersección de desplazamientos: la columna (letra del mensaje) y la fila (letra de la clave) definen la celda resultante. El simulador resalta esta celda en amarillo en tiempo real." },
        { element: "#panelEntrada", title: "Texto Original", text: "Introduce el texto plano a cifrar aquí. La clave solo avanzará de posición para letras que pertenezcan al alfabeto activo." },
        { element: "#panelSalida", title: "Texto Cifrado", text: "Aquí se muestra el texto cifrado resultante. Si deseas descifrar, escribe o pega el criptograma en esta casilla junto con la clave correspondiente." }
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
        if (!activeTarget || !bubble) return;
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
            if (bubble) {
                bubble.classList.remove("hidden");
                updateBubblePosition();
                bubble.classList.remove("opacity-0", "scale-95");
            }
        }, 300);
    }

    function updateTutorial() {
        if (!bubble) return;
        bubble.classList.add("opacity-0", "scale-95");
        setTimeout(() => {
            if (tutTitle) tutTitle.innerHTML = tutorialData[currentStep].title;
            if (tutText) tutText.innerHTML = tutorialData[currentStep].text;

            if (tutDotsContainer) {
                Array.from(tutDotsContainer.children).forEach((dot, i) => {
                    dot.className = i === currentStep
                        ? "w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] transition-all"
                        : "w-2 h-2 rounded-full bg-slate-700 transition-all";
                });
            }

            if (btnTutPrev) btnTutPrev.classList.toggle("hidden", currentStep === 0);
            
            if (btnTutNext) {
                if (currentStep === tutorialData.length - 1) {
                    btnTutNext.innerHTML = "Terminar ✓";
                } else {
                    btnTutNext.innerHTML = "Siguiente →";
                }
            }

            moverBurbuja(tutorialData[currentStep].element);
        }, 200);
    }

    const btnTutorial = document.getElementById("btnTutorial");
    if (btnTutorial) {
        btnTutorial.addEventListener("click", () => {
            currentStep = 0;
            if (overlay) {
                overlay.classList.remove("hidden");
                setTimeout(() => overlay.classList.remove("opacity-0"), 10);
            }
            updateTutorial();
        });
    }

    function closeTutorial() {
        stopTracking();
        document.querySelectorAll(".tutorial-focus").forEach(el => el.classList.remove("tutorial-focus"));
        if (bubble) bubble.classList.add("opacity-0", "scale-95");
        if (overlay) overlay.classList.add("opacity-0");
        setTimeout(() => {
            if (bubble) bubble.classList.add("hidden");
            if (overlay) overlay.classList.add("hidden");
        }, 300);
    }

    const btnCerrarTutorial = document.getElementById("btnCerrarTutorial");
    if (btnCerrarTutorial) btnCerrarTutorial.addEventListener("click", closeTutorial);
    
    if (btnTutNext) {
        btnTutNext.addEventListener("click", () => {
            currentStep < tutorialData.length - 1 ? (currentStep++, updateTutorial()) : closeTutorial();
        });
    }
    
    if (btnTutPrev) {
        btnTutPrev.addEventListener("click", () => {
            if (currentStep > 0) {
                currentStep--;
                updateTutorial();
            }
        });
    }

    // Inicialización
    construirTabla();
    resaltarTabla();
});
