// js/pages/playfair-page.js
document.addEventListener("DOMContentLoaded", () => {
    let ultimoCampoEditado = "original";

    const inputTexto = document.getElementById("textoEntrada");
    const outputTexto = document.getElementById("textoSalida");
    const inputClave = document.getElementById("clave");
    const matrixGrid = document.getElementById("matrixGrid");
    const btnCopiar = document.getElementById("btnCopiar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnPegar = document.getElementById("btnPegar");
    const btnCopiarOriginal = document.getElementById("btnCopiarOriginal");
    const btnPegarCifrado = document.getElementById("btnPegarCifrado");
    const digrafosDisplay = document.getElementById("digrafosDisplay");
    const selectIdioma = document.getElementById("idioma");
    const customContainer = document.getElementById("customAlphabetContainer");
    const inputCustom = document.getElementById("alfabetoCustom");
    const checkEliminarRelleno = document.getElementById("eliminarRelleno");

    const ALFABETO = PlayfairCipher.DEFAULT_ALPHABET; // The 'J' joins 'I'

    function obtenerAlfabetoBase() {
        const idioma = selectIdioma.value;
        if (idioma === "CUSTOM") {
            let customVal = inputCustom.value.toUpperCase().replace(/J/g, "I");
            let cleaned = "";
            for (let i = 0; i < customVal.length; i++) {
                const char = customVal[i];
                if (char >= 'A' && char <= 'Z' && cleaned.indexOf(char) === -1) {
                    cleaned += char;
                }
            }
            for (let i = 0; i < ALFABETO.length; i++) {
                const char = ALFABETO[i];
                if (cleaned.length >= 25) break;
                if (cleaned.indexOf(char) === -1) {
                    cleaned += char;
                }
            }
            return cleaned;
        }
        return ALFABETO;
    }

    function actualizarMatrizVisual() {
        const claveOriginal = inputClave.value.toUpperCase();
        const idioma = selectIdioma.value;
        const alfabetoBase = obtenerAlfabetoBase();

        let claveProcesada = claveOriginal.replace(/J/g, "I");
        if (idioma === "ES") {
            claveProcesada = claveProcesada.replace(/Ñ/g, "N");
        }

        let claveLimpia = "";
        for (let i = 0; i < claveProcesada.length; i++) {
            const char = claveProcesada[i];
            if (alfabetoBase.indexOf(char) !== -1 && claveLimpia.indexOf(char) === -1) {
                claveLimpia += char;
            }
        }

        let combinacion = claveLimpia;
        for (let i = 0; i < alfabetoBase.length; i++) {
            const char = alfabetoBase[i];
            if (combinacion.indexOf(char) === -1) {
                combinacion += char;
            }
        }

        matrixGrid.innerHTML = "";
        for (let i = 0; i < combinacion.length; i++) {
            const char = combinacion[i];
            const isFromKey = claveLimpia.indexOf(char) !== -1;
            const cell = document.createElement("div");

            if (char === 'I') {
                cell.textContent = 'I/J';
            } else if (char === 'N' && idioma === "ES") {
                cell.textContent = 'N/Ñ';
            } else {
                cell.textContent = char;
            }

            cell.className = `h-10 flex items-center justify-center rounded-lg text-sm transition-all border font-mono ` +
                (isFromKey
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-sm shadow-orange-500/5"
                    : "bg-slate-900 text-slate-400 border-slate-800");

            matrixGrid.appendChild(cell);
        }
    }

    function enviarDatos() {
        const texto = ultimoCampoEditado === "original" ? inputTexto.value : outputTexto.value;
        const operacion = ultimoCampoEditado === "original" ? "CIFRAR" : "DESCIFRAR";

        if (!texto) {
            if (ultimoCampoEditado === "original") {
                outputTexto.value = "";
            } else {
                inputTexto.value = "";
            }
            return;
        }

        try {
            const res = PlayfairCipher.procesar(texto, inputClave.value, operacion, selectIdioma.value, inputCustom.value, checkEliminarRelleno.checked);
            if (ultimoCampoEditado === "original") {
                outputTexto.value = res;
            } else {
                inputTexto.value = res;
            }
        } catch (err) {
            CryptoUX.showToast("Error", err.message, "error");
        }
    }

    function mostrarDigrafos(texto) {
        if (!texto) {
            digrafosDisplay.textContent = "Esperando texto...";
            return;
        }

        const idioma = selectIdioma.value;
        const alfabetoBase = obtenerAlfabetoBase();

        let cleaned = texto.toUpperCase().replace(/J/g, "I");
        if (idioma === "ES") {
            cleaned = cleaned.replace(/Ñ/g, "N");
        }

        let filtered = "";
        for (let i = 0; i < cleaned.length; i++) {
            const char = cleaned[i];
            if (alfabetoBase.indexOf(char) !== -1) {
                filtered += char;
            }
        }

        if (!filtered) {
            digrafosDisplay.textContent = "Esperando letras válidas...";
            return;
        }

        let pairs = [];
        for (let i = 0; i < filtered.length; i += 2) {
            if (i === filtered.length - 1) {
                pairs.push(filtered[i] + "X");
            } else if (filtered[i] === filtered[i + 1]) {
                const fillChar = (filtered[i] === 'X') ? 'Q' : 'X';
                pairs.push(filtered[i] + fillChar);
                i--;
            } else {
                pairs.push(filtered[i] + filtered[i + 1]);
            }
        }

        digrafosDisplay.textContent = pairs.join(" | ");
    }

    function cifrarDesdeOriginal() {
        ultimoCampoEditado = "original";
        enviarDatos();
        mostrarDigrafos(inputTexto.value);
    }

    function descifrarDesdeCifrado() {
        ultimoCampoEditado = "cifrado";
        enviarDatos();
    }

    function recalcularDesdeUltimoCampo() {
        if (ultimoCampoEditado === "cifrado") {
            descifrarDesdeCifrado();
        } else {
            cifrarDesdeOriginal();
        }
    }

    inputTexto.addEventListener("input", cifrarDesdeOriginal);
    outputTexto.addEventListener("input", descifrarDesdeCifrado);

    inputClave.addEventListener("input", (e) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
        e.target.value = val;
        actualizarMatrizVisual();
        recalcularDesdeUltimoCampo();
    });

    selectIdioma.addEventListener("change", (e) => {
        customContainer.classList.toggle("hidden", e.target.value !== "CUSTOM");
        actualizarMatrizVisual();
        recalcularDesdeUltimoCampo();
    });

    inputCustom.addEventListener("input", (e) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
        e.target.value = val;
        actualizarMatrizVisual();
        recalcularDesdeUltimoCampo();
    });

    checkEliminarRelleno.addEventListener("change", () => {
        recalcularDesdeUltimoCampo();
    });

    btnCopiar.addEventListener("click", () => {
        if (!outputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto para copiar.", "info");
            return;
        }
        navigator.clipboard.writeText(outputTexto.value).then(() => {
            CryptoUX.showToast("¡Copiado!", "Texto cifrado copiado al portapapeles.", "success");
        }).catch(() => {
            outputTexto.select();
            document.execCommand("copy");
        });
    });

    btnPegarCifrado.addEventListener("click", async () => {
        try {
            const textoPortapapeles = await navigator.clipboard.readText();
            if (textoPortapapeles) {
                outputTexto.value = textoPortapapeles;
                descifrarDesdeCifrado();
                outputTexto.focus();
                CryptoUX.showToast("Pegado", "Texto insertado correctamente.", "success");
            }
        } catch (err) {
            CryptoUX.showToast("Permiso denegado", "Concede acceso al portapapeles en tu navegador.", "error");
        }
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

    btnCopiarOriginal.addEventListener("click", () => {
        if (!inputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto para copiar.", "info");
            return;
        }
        navigator.clipboard.writeText(inputTexto.value).then(() => {
            CryptoUX.showToast("¡Copiado!", "Texto original copiado al portapapeles.", "success");
        }).catch(() => {
            inputTexto.select();
            document.execCommand("copy");
        });
    });

    btnLimpiar.addEventListener("click", () => {
        inputTexto.value = "";
        outputTexto.value = "";
        ultimoCampoEditado = "original";
        mostrarDigrafos("");
        inputTexto.focus();
    });

    actualizarMatrizVisual();
});
