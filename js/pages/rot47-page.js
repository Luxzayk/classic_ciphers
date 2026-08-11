// js/pages/rot47-page.js
document.addEventListener("DOMContentLoaded", () => {
    const Rot47Cipher = window.CriptoSuite.Rot47Cipher;
    let ultimoCampoEditado = "original";

    const inputTexto = document.getElementById("textoEntrada");
    const outputTexto = document.getElementById("textoSalida");
    const alfabetoBaseDisplay = document.getElementById("alfabetoBaseDisplay");
    const alfabetoCifradoDisplay = document.getElementById("alfabetoCifradoDisplay");

    const btnCopiar = document.getElementById("btnCopiar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnPegar = document.getElementById("btnPegar");
    const btnCopiarOriginal = document.getElementById("btnCopiarOriginal");
    const btnPegarCifrado = document.getElementById("btnPegarCifrado");

    const SAMPLE_ORIGINAL = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHI";
    const SAMPLE_CIFRADO = "PQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}";

    function renderizarSpans(elemento, texto) {
        elemento.innerHTML = "";
        for (let i = 0; i < texto.length; i++) {
            const span = document.createElement("span");
            span.textContent = texto[i];
            span.dataset.char = texto[i];
            elemento.appendChild(span);
        }
    }

    function inicializarDisplays() {
        renderizarSpans(alfabetoBaseDisplay, SAMPLE_ORIGINAL);
        renderizarSpans(alfabetoCifradoDisplay, SAMPLE_CIFRADO);
    }

    function resaltarCaracter(char) {
        alfabetoBaseDisplay.querySelectorAll("span").forEach(el => el.className = "");
        alfabetoCifradoDisplay.querySelectorAll("span").forEach(el => el.className = "");

        if (!char) return;

        let index = SAMPLE_ORIGINAL.indexOf(char);
        if (index === -1) {
            index = SAMPLE_CIFRADO.indexOf(char);
        }

        if (index === -1) return;

        const baseSpans = alfabetoBaseDisplay.querySelectorAll("span");
        if (baseSpans[index]) {
            baseSpans[index].className = "active-char-base";
        }

        const cipherSpans = alfabetoCifradoDisplay.querySelectorAll("span");
        if (cipherSpans[index]) {
            cipherSpans[index].className = "active-char-cipher";
        }
    }

    function ejecutarAlgoritmo() {
        try {
            let ultimoChar = "";
            if (ultimoCampoEditado === "original") {
                const texto = inputTexto.value;
                if (!texto) {
                    outputTexto.value = "";
                    resaltarCaracter("");
                    return;
                }
                const res = Rot47Cipher.procesar(texto);
                outputTexto.value = res;
                ultimoChar = texto.charAt(texto.length - 1);
            } else {
                const texto = outputTexto.value;
                if (!texto) {
                    inputTexto.value = "";
                    resaltarCaracter("");
                    return;
                }
                const res = Rot47Cipher.procesar(texto);
                inputTexto.value = res;
                ultimoChar = inputTexto.value.charAt(inputTexto.value.length - 1);
            }
            resaltarCaracter(ultimoChar);
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

    inputTexto.addEventListener("input", cifrarDesdeOriginal);
    outputTexto.addEventListener("input", descifrarDesdeCifrado);

    btnCopiar.addEventListener("click", () => {
        if (!outputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto para copiar.", "info");
            return;
        }
        navigator.clipboard.writeText(outputTexto.value).then(() => {
            CryptoUX.showToast("¡Copiado!", "Texto copiado al portapapeles.", "success");
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

    btnCopiarOriginal?.addEventListener("click", async () => {
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

    btnPegarCifrado?.addEventListener("click", async () => {
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
        resaltarCaracter("");
        inputTexto.focus();
    });

    // Inicializar displays de símbolos troceados en spans
    inicializarDisplays();
});
