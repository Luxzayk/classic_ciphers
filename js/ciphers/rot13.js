const Rot13Cipher = {
    ALFABETO_ES: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
    ALFABETO_EN: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    determinarAlfabeto: function(idioma, alfabetoCustom) {
        if (idioma === "CUSTOM" && alfabetoCustom) {
            return alfabetoCustom.toUpperCase();
        } else if (idioma === "EN") {
            return this.ALFABETO_EN;
        }
        return this.ALFABETO_ES;
    },

    procesar: function(texto, operacion, idioma, alfabetoCustom) {
        if (!texto) return "";

        const alfabetoActual = this.determinarAlfabeto(idioma, alfabetoCustom);
        const modulo = alfabetoActual.length;
        if (modulo === 0) {
            throw new Error("El alfabeto personalizado no puede estar vacío.");
        }

        let desp = 13 % modulo;
        if (operacion === "DESCIFRAR") {
            desp = modulo - desp;
        }

        let resultado = "";
        for (let i = 0; i < texto.length; i++) {
            const c = texto.charAt(i);
            const cUpper = c.toUpperCase();
            const index = alfabetoActual.indexOf(cUpper);

            if (index !== -1) {
                const nuevoIndex = (index + desp) % modulo;
                const cifrado = alfabetoActual.charAt(nuevoIndex);
                const isLowerCase = (c === c.toLowerCase() && c !== c.toUpperCase());
                resultado += isLowerCase ? cifrado.toLowerCase() : cifrado;
            } else {
                resultado += c;
            }
        }
        return resultado;
    }
};
