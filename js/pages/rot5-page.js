// js/pages/rot5-page.js
document.addEventListener("DOMContentLoaded", () => {
    let ultimoCampoEditado = "original";

    const inputTexto = document.getElementById('textoEntrada');
    const outputTexto = document.getElementById('textoSalida');
    const btnCopiar = document.getElementById('btnCopiar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnPegar = document.getElementById('btnPegar');
    const btnCopiarOriginal = document.getElementById('btnCopiarOriginal');
    const btnPegarCifrado = document.getElementById('btnPegarCifrado');

    function ejecutarAlgoritmo() {
        try {
            if (ultimoCampoEditado === "original") {
                const texto = inputTexto.value;
                if (!texto) {
                    outputTexto.value = "";
                    return;
                }
                const res = Rot5Cipher.procesar(texto);
                outputTexto.value = res;
            } else {
                const texto = outputTexto.value;
                if (!texto) {
                    inputTexto.value = "";
                    return;
                }
                const res = Rot5Cipher.procesar(texto);
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

    inputTexto.addEventListener('input', cifrarDesdeOriginal);
    outputTexto.addEventListener('input', descifrarDesdeCifrado);

    btnCopiar.addEventListener('click', () => {
        if (!outputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto para copiar.", "info");
            return;
        }
        navigator.clipboard.writeText(outputTexto.value).then(() => {
            CryptoUX.showToast("¡Copiado!", "Texto copiado al portapapeles.", "success");
        });
    });

    btnPegar.addEventListener('click', async () => {
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

    btnCopiarOriginal?.addEventListener('click', async () => {
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

    btnPegarCifrado?.addEventListener('click', async () => {
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

    btnLimpiar.addEventListener('click', () => {
        inputTexto.value = "";
        outputTexto.value = "";
        ultimoCampoEditado = "original";
        inputTexto.focus();
    });
});
