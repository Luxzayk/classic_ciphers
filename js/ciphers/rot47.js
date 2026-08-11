(function() {
const Rot47Cipher = {
    procesar: function(texto) {
        if (!texto) return "";

        let resultado = "";
        for (let i = 0; i < texto.length; i++) {
            const code = texto.charCodeAt(i);
            if (code >= 33 && code <= 126) {
                const nuevoCode = ((code - 33 + 47) % 94) + 33;
                resultado += String.fromCharCode(nuevoCode);
            } else {
                resultado += texto.charAt(i);
            }
        }
        return resultado;
    }
};

window.CriptoSuite = window.CriptoSuite || {};
window.CriptoSuite.Rot47Cipher = Rot47Cipher;
})();
