const VigenereCipher = {
    ALFABETO_ES: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
    ALFABETO_EN: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    determinarAlfabeto: function(idioma, alfabetoCustom) {
        if (idioma === "CUSTOM" && alfabetoCustom && alfabetoCustom.trim().length > 0) {
            const limpio = this.limpiarLetrasUnicas(alfabetoCustom);
            return limpio.length >= 2 ? limpio : this.ALFABETO_ES;
        }
        if (idioma === "EN") {
            return this.ALFABETO_EN;
        }
        return this.ALFABETO_ES;
    },

    limpiarLetrasUnicas: function(valor) {
        let limpio = "";
        for (let i = 0; i < valor.length; i++) {
            const c = valor.charAt(i).toUpperCase();
            if (/[a-zA-ZÑñ]/.test(c)) {
                if (limpio.indexOf(c) === -1) {
                    limpio += c;
                }
            }
        }
        return limpio;
    },

    limpiarClave: function(clave, alfabeto) {
        let limpia = "";
        for (let i = 0; i < clave.length; i++) {
            const c = clave.charAt(i).toUpperCase();
            if (alfabeto.indexOf(c) !== -1) {
                limpia += c;
            }
        }
        return limpia;
    },

    procesar: function(texto, clave, operacion, idioma, alfabetoCustom) {
        if (!texto) return "";
        if (!clave || clave.trim().length === 0) {
            throw new Error("La palabra clave no puede estar vacía.");
        }

        const alfabetoActual = this.determinarAlfabeto(idioma, alfabetoCustom);
        const claveLimpia = this.limpiarClave(clave, alfabetoActual);

        if (claveLimpia.length === 0) {
            throw new Error("La clave no contiene caracteres válidos del alfabeto seleccionado.");
        }

        const modulo = alfabetoActual.length;
        let resultado = "";
        let j = 0;

        for (let i = 0; i < texto.length; i++) {
            const c = texto.charAt(i);
            const cUpper = c.toUpperCase();
            const indexTexto = alfabetoActual.indexOf(cUpper);

            if (indexTexto !== -1) {
                const charClave = claveLimpia.charAt(j % claveLimpia.length);
                const indexClave = alfabetoActual.indexOf(charClave);

                let nuevoIndex;
                if (operacion === "DESCIFRAR") {
                    nuevoIndex = (indexTexto - indexClave + modulo) % modulo;
                } else {
                    nuevoIndex = (indexTexto + indexClave) % modulo;
                }

                const cifrado = alfabetoActual.charAt(nuevoIndex);
                const isLowerCase = (c === c.toLowerCase() && c !== c.toUpperCase());
                resultado += isLowerCase ? cifrado.toLowerCase() : cifrado;
                j++;
            } else {
                resultado += c;
            }
        }
        return resultado;
    }
};
