// js/pages/rot47-page.js
document.addEventListener("DOMContentLoaded", () => {
    const inputTexto = document.getElementById("textoEntrada");
    const outputTexto = document.getElementById("textoSalida");
    const btnCopiar = document.getElementById("btnCopiar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnPegar = document.getElementById("btnPegar");

    function ejecutarAlgoritmo() {
        const texto = inputTexto.value;
        if (!texto) {
            outputTexto.value = "";
            return;
        }

        try {
            const res = Rot47Cipher.procesar(texto);
            outputTexto.value = res;
        } catch (err) {
            CryptoUX.showToast("Error", err.message, "error");
        }
    }

    inputTexto.addEventListener("input", ejecutarAlgoritmo);

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
                ejecutarAlgoritmo();
                inputTexto.focus();
                CryptoUX.showToast("Pegado", "Texto insertado correctamente.", "success");
            }
        } catch (err) {
            CryptoUX.showToast("Permiso denegado", "Concede acceso al portapapeles en tu navegador.", "error");
        }
    });

    btnLimpiar.addEventListener("click", () => {
        inputTexto.value = "";
        outputTexto.value = "";
        inputTexto.focus();
    });
});
