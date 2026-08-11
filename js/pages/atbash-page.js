// js/pages/atbash-page.js
document.addEventListener("DOMContentLoaded", () => {
    const AtbashCipher = window.CriptoSuite.AtbashCipher;
    let ultimoCampoEditado = "entrada";

    const inputTexto = document.getElementById("textoEntrada");
    const outputTexto = document.getElementById("textoSalida");
    const idiomaSelect = document.getElementById("idioma");
    const customContainer = document.getElementById("customAlphabetContainer");
    const inputCustom = document.getElementById("alfabetoCustom");

    const alfabetoBaseDisplay = document.getElementById("alfabetoBaseDisplay");
    const alfabetoCifradoDisplay = document.getElementById("alfabetoCifradoDisplay");
    const charIn = document.getElementById("charIn");
    const charOut = document.getElementById("charOut");

    const btnCopiar = document.getElementById("btnCopiar");
    const btnPegar = document.getElementById("btnPegar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnCopiarOriginal = document.getElementById("btnCopiarOriginal");
    const btnPegarCifrado = document.getElementById("btnPegarCifrado");

    function limpiarAlfabeto(valor) {
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
        if (idiomaSelect.value === "CUSTOM") {
            const custom = limpiarAlfabeto(inputCustom.value);
            return custom.length >= 2 ? custom : "";
        }
        return idiomaSelect.value === "EN" ? AtbashCipher.ALFABETO_EN : AtbashCipher.ALFABETO_ES;
    }

    function obtenerReflejo(alfabeto) {
        return alfabeto.split("").reverse().join("");
    }

    function actualizarMapa() {
        const alfabeto = obtenerAlfabeto();
        const reflejo = obtenerReflejo(alfabeto);

        const metricN = document.getElementById("metricN");
        if (metricN) {
            metricN.textContent = alfabeto ? alfabeto.length : "0";
        }

        if (!alfabeto) {
            alfabetoBaseDisplay.textContent = "Ingresa un alfabeto personalizado válido (mínimo 2 letras únicas).";
            alfabetoCifradoDisplay.textContent = "Esperando alfabeto...";
            charIn.textContent = "-";
            charOut.textContent = "-";
            return;
        }

        alfabetoBaseDisplay.textContent = alfabeto;
        alfabetoCifradoDisplay.textContent = reflejo;
    }

    function resaltarCaracter(char) {
        if (!char) {
            charIn.textContent = "-";
            charOut.textContent = "-";
            return;
        }

        const alfabeto = obtenerAlfabeto();
        if (!alfabeto) return;

        const upper = char.toUpperCase();
        const index = alfabeto.indexOf(upper);

        if (index === -1) {
            charIn.textContent = char === " " ? "ESP" : char;
            charOut.textContent = char === " " ? "ESP" : char;
            return;
        }

        const reflejo = obtenerReflejo(alfabeto);
        const salida = reflejo[index];

        charIn.textContent = upper;
        charOut.textContent = salida;
    }

    function enviarDatos(origen) {
        ultimoCampoEditado = origen;
        const texto = origen === "entrada" ? inputTexto.value : outputTexto.value;

        actualizarMapa();
        if (texto.length > 0) {
            resaltarCaracter(texto.charAt(texto.length - 1));
        } else {
            resaltarCaracter("");
        }

        if (!texto) {
            if (origen === "entrada") {
                outputTexto.value = "";
            } else {
                inputTexto.value = "";
            }
            return;
        }

        const alfabeto = obtenerAlfabeto();
        if (idiomaSelect.value === "CUSTOM" && !alfabeto) {
            return;
        }

        try {
            if (origen === "entrada") {
                const res = AtbashCipher.procesar(texto, idiomaSelect.value, alfabeto);
                outputTexto.value = res;
            } else {
                const res = AtbashCipher.procesar(texto, idiomaSelect.value, alfabeto);
                inputTexto.value = res;
            }
        } catch (err) {
            CryptoUX.showToast("Error", err.message, "error");
        }
    }

    inputTexto.addEventListener("input", () => enviarDatos("entrada"));
    outputTexto.addEventListener("input", () => enviarDatos("salida"));

    idiomaSelect.addEventListener("change", () => {
        customContainer.classList.toggle("hidden", idiomaSelect.value !== "CUSTOM");
        actualizarMapa();
        enviarDatos(ultimoCampoEditado);
    });

    inputCustom.addEventListener("input", () => {
        inputCustom.value = limpiarAlfabeto(inputCustom.value);
        actualizarMapa();
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
            CryptoUX.showToast("¡Copiado!", "Texto copiado al portapapeles.", "success");
        } catch {
            inputTexto.select();
            document.execCommand("copy");
        }
    });

    btnLimpiar.addEventListener("click", () => {
        inputTexto.value = "";
        outputTexto.value = "";
        ultimoCampoEditado = "entrada";
        resaltarCaracter("");
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
            CryptoUX.showToast("Acceso denegado", "Permiso de portapapeles denegado.", "error");
        }
    });

    // ==========================================
    // TUTORIAL INTERACTIVO
    // ==========================================
    const tutorialData = [
        { element: "#panelParametros", title: "Configuración del Alfabeto", text: "Selecciona el alfabeto base (Español o Inglés) para realizar el cifrado espejo. También puedes ingresar uno personalizado si eliges la opción 'Personalizado'." },
        { element: "#panelSimulador", title: "Mapeo Espejo", text: "Aquí puedes visualizar la correspondencia directa de las letras: la fila azul superior muestra el alfabeto base y la fila naranja inferior muestra las letras invertidas (de atrás hacia adelante)." },
        { element: "#panelEntrada", title: "Texto Original", text: "Ingresa el texto que deseas cifrar. Cada carácter se mapeará a su opuesto en tiempo real." },
        { element: "#panelSalida", title: "Texto Cifrado", text: "Aquí se muestra el texto cifrado resultante. Si deseas descifrar un texto, simplemente escríbelo o pégalo en esta casilla y se procesará automáticamente." }
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
    actualizarMapa();
});
