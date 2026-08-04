// js/pages/cesar-page.js
document.addEventListener("DOMContentLoaded", () => {
    let ultimoCampoEditado = "original";

    const inputTexto = document.getElementById("textoEntrada");
    const outputTexto = document.getElementById("textoSalida");
    const inputClave = document.getElementById("clave");
    const displayClave = document.getElementById("claveValueDisplay");
    const selectIdioma = document.getElementById("idioma");
    const customContainer = document.getElementById("customAlphabetContainer");
    const inputCustom = document.getElementById("alfabetoCustom");
    const alfabetoBaseDisplay = document.getElementById("alfabetoBaseDisplay");
    const alfabetoCifradoDisplay = document.getElementById("alfabetoCifradoDisplay");
    const btnCopiar = document.getElementById("btnCopiar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnPegar = document.getElementById("btnPegar");
    const btnCopiarOriginal = document.getElementById("btnCopiarOriginal");
    const btnPegarCifrado = document.getElementById("btnPegarCifrado");

    function obtenerAlfabetoActual() {
        if (selectIdioma.value === "CUSTOM") {
            return inputCustom.value.trim().toUpperCase();
        }
        return selectIdioma.value === "EN" ? CesarCipher.ALFABETO_EN : CesarCipher.ALFABETO_ES;
    }

    function actualizarAlfabetos() {
        const alfabeto = obtenerAlfabetoActual();

        if (!alfabeto) {
            alfabetoBaseDisplay.textContent = "Ingresa un alfabeto personalizado.";
            alfabetoCifradoDisplay.textContent = "Esperando alfabeto...";
            return;
        }

        const modulo = alfabeto.length;
        const desplazamiento = Number(inputClave.value) % modulo;
        const alfabetoCifrado = alfabeto.slice(desplazamiento) + alfabeto.slice(0, desplazamiento);

        alfabetoBaseDisplay.textContent = alfabeto;
        alfabetoCifradoDisplay.textContent = alfabetoCifrado;
    }

    function ejecutarAlgoritmo() {
        actualizarAlfabetos();

        const claveVal = inputClave.value;
        const idioma = selectIdioma.value;
        const alfabetoCustom = inputCustom.value;

        if (idioma === "CUSTOM" && !alfabetoCustom.trim()) {
            return;
        }

        try {
            if (ultimoCampoEditado === "original") {
                const texto = inputTexto.value;
                if (!texto) {
                    outputTexto.value = "";
                    return;
                }
                const res = CesarCipher.procesar(texto, claveVal, "CIFRAR", idioma, alfabetoCustom);
                outputTexto.value = res;
            } else {
                const texto = outputTexto.value;
                if (!texto) {
                    inputTexto.value = "";
                    return;
                }
                const res = CesarCipher.procesar(texto, claveVal, "DESCIFRAR", idioma, alfabetoCustom);
                inputTexto.value = res;
            }
        } catch (err) {
            CryptoUX.showToast("Error", err.message, "error");
        }
    }

    function cifrarDesdeOriginal() {
        ultimoCampoEditado = "original";
        ejecutarAlgoritmo();
    }

    function descifrarDesdeCifrado() {
        ultimoCampoEditado = "cifrado";
        ejecutarAlgoritmo();
    }

    // Event Listeners
    inputTexto.addEventListener("input", cifrarDesdeOriginal);
    outputTexto.addEventListener("input", descifrarDesdeCifrado);

    inputClave.addEventListener("input", (e) => {
        displayClave.innerText = e.target.value;
        actualizarAlfabetos();
        ejecutarAlgoritmo();
    });

    inputCustom.addEventListener("input", () => {
        actualizarAlfabetos();
        ejecutarAlgoritmo();
    });

    selectIdioma.addEventListener("change", (e) => {
        if (e.target.value === "CUSTOM") {
            customContainer.classList.remove("hidden");
        } else {
            customContainer.classList.add("hidden");
        }
        actualizarAlfabetos();
        ejecutarAlgoritmo();
    });

    // UX Helpers
    btnCopiar.addEventListener("click", () => {
        if (!outputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto para copiar.", "info");
            return;
        }
        navigator.clipboard.writeText(outputTexto.value).then(() => {
            CryptoUX.showToast("¡Copiado!", "Texto cifrado copiado al portapapeles.", "success");
        });
    });

    btnPegar.addEventListener("click", async () => {
        try {
            const textoPortapapeles = await navigator.clipboard.readText();
            if (textoPortapapeles) {
                inputTexto.value = textoPortapapeles;
                cifrarDesdeOriginal();
                inputTexto.focus();
                CryptoUX.showToast("Pegado", "Texto insertado correctamente.", "success");
            }
        } catch (err) {
            CryptoUX.showToast("Permiso denegado", "Concede acceso al portapapeles en tu navegador.", "error");
        }
    });

    btnCopiarOriginal.addEventListener("click", async () => {
        if (!inputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto original para copiar.", "info");
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

    btnPegarCifrado.addEventListener("click", async () => {
        try {
            const textoPortapapeles = await navigator.clipboard.readText();
            if (textoPortapapeles) {
                outputTexto.value = textoPortapapeles;
                descifrarDesdeCifrado();
                outputTexto.focus();
                CryptoUX.showToast("Pegado", "Texto cifrado insertado correctamente.", "success");
            }
        } catch {
            CryptoUX.showToast("Permiso denegado", "Concede acceso al portapapeles en tu navegador.", "error");
        }
    });

    btnLimpiar.addEventListener("click", () => {
        inputTexto.value = "";
        outputTexto.value = "";
        ultimoCampoEditado = "original";
        inputTexto.focus();
    });

    // Inicialización
    actualizarAlfabetos();
});
