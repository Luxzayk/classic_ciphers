(function() {
const AtbashCipher = {
    ALFABETO_ES: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
    ALFABETO_EN: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    obtenerAlfabeto: function(idioma, alfabetoCustom) {
        if (idioma === "CUSTOM" && alfabetoCustom && alfabetoCustom.trim().length > 0) {
            return this.limpiarAlfabetoPersonalizado(alfabetoCustom);
        }
        if (idioma === "EN") {
            return this.ALFABETO_EN;
        }
        return this.ALFABETO_ES;
    },

    limpiarAlfabetoPersonalizado: function(valor) {
        let limpio = "";
        for (let i = 0; i < valor.length; i++) {
            const c = valor.charAt(i).toUpperCase();
            // Verificar si es una letra (incluye Ñ y acentos básicos en la regex)
            if (/[a-zA-ZÑñ]/.test(c)) {
                if (limpio.indexOf(c) === -1) {
                    limpio += c;
                }
            }
        }
        return limpio.length >= 2 ? limpio : this.ALFABETO_ES;
    },

    procesar: function(texto, idioma, alfabetoCustom) {
        if (!texto) return "";

        const alfabeto = this.obtenerAlfabeto(idioma, alfabetoCustom);
        if (alfabeto.length < 2) {
            throw new Error("El alfabeto debe tener al menos 2 caracteres válidos.");
        }

        let resultado = "";
        for (let i = 0; i < texto.length; i++) {
            const c = texto.charAt(i);
            const upper = c.toUpperCase();
            const index = alfabeto.indexOf(upper);

            if (index !== -1) {
                const inverso = alfabeto.length - 1 - index;
                const nuevo = alfabeto.charAt(inverso);
                const isLowerCase = (c === c.toLowerCase() && c !== c.toUpperCase());
                resultado += isLowerCase ? nuevo.toLowerCase() : nuevo;
            } else {
                resultado += c;
            }
        }
        return resultado;
    }
};

window.CriptoSuite = window.CriptoSuite || {};
window.CriptoSuite.AtbashCipher = AtbashCipher;
})();
