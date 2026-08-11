(function() {
const PlayfairCipher = {
    DEFAULT_ALPHABET: "ABCDEFGHIKLMNOPQRSTUVWXYZ",

    determinarBaseAlphabet: function(idioma, alfabetoCustom) {
        if (idioma === "CUSTOM" && alfabetoCustom) {
            let sb = "";
            const upperCustom = alfabetoCustom.toUpperCase().replace(/J/g, "I");
            for (let i = 0; i < upperCustom.length; i++) {
                const c = upperCustom.charAt(i);
                if (c >= 'A' && c <= 'Z' && sb.indexOf(c) === -1) {
                    sb += c;
                }
            }
            for (let i = 0; i < this.DEFAULT_ALPHABET.length; i++) {
                if (sb.length >= 25) break;
                const c = this.DEFAULT_ALPHABET.charAt(i);
                if (sb.indexOf(c) === -1) {
                    sb += c;
                }
            }
            return sb;
        }
        return this.DEFAULT_ALPHABET;
    },

    normalizeString: function(text, idioma, baseAlphabet) {
        if (!text) return "";
        let normalized = text.toUpperCase().replace(/J/g, "I");
        if (idioma === "ES") {
            normalized = normalized.replace(/Ñ/g, "N");
        }
        let cleaned = "";
        for (let i = 0; i < normalized.length; i++) {
            const c = normalized.charAt(i);
            if (baseAlphabet.indexOf(c) !== -1) {
                cleaned += c;
            }
        }
        return cleaned;
    },

    generateMatrix: function(key, baseAlphabet, idioma) {
        const matrix = [];
        for (let i = 0; i < 5; i++) {
            matrix.push(new Array(5));
        }

        const normalizedKey = this.normalizeString(key, idioma, baseAlphabet);
        const combined = normalizedKey + baseAlphabet;
        let uniqueChars = "";

        for (let i = 0; i < combined.length; i++) {
            const c = combined.charAt(i);
            if (uniqueChars.indexOf(c) === -1) {
                uniqueChars += c;
            }
        }

        let index = 0;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                matrix[row][col] = uniqueChars.charAt(index++);
            }
        }
        return matrix;
    },

    prepareTextPairs: function(text, baseAlphabet, idioma) {
        const cleaned = this.normalizeString(text, idioma, baseAlphabet);
        let paired = "";

        for (let i = 0; i < cleaned.length; i += 2) {
            if (i === cleaned.length - 1) {
                paired += cleaned.charAt(i) + 'X';
            } else if (cleaned.charAt(i) === cleaned.charAt(i + 1)) {
                const fillChar = (cleaned.charAt(i) === 'X') ? 'Q' : 'X';
                paired += cleaned.charAt(i) + fillChar;
                i--;
            } else {
                paired += cleaned.charAt(i) + cleaned.charAt(i + 1);
            }
        }
        return paired;
    },

    encrypt: function(text, matrix, baseAlphabet, idioma) {
        const pairedText = this.prepareTextPairs(text, baseAlphabet, idioma);
        const ciphered = this.cipherProcess(pairedText, matrix, 1);
        let formatted = "";
        for (let i = 0; i < ciphered.length; i += 2) {
            if (i > 0) formatted += " ";
            formatted += ciphered.substring(i, Math.min(i + 2, ciphered.length));
        }
        return formatted;
    },

    decrypt: function(text, matrix, baseAlphabet, idioma, eliminarRelleno) {
        let preparedText = this.normalizeString(text, idioma, baseAlphabet);
        if (preparedText.length % 2 !== 0) preparedText += "X";
        let decrypted = this.cipherProcess(preparedText, matrix, 4);
        if (eliminarRelleno) {
            decrypted = this.removePadding(decrypted);
        }
        return decrypted.toLowerCase();
    },

    removePadding: function(text) {
        if (!text) return "";
        
        let result = text;
        
        // Solo eliminar 'X' o 'Q' del final si fueron agregadas como relleno
        if (result.length > 0 && result.charAt(result.length - 1) === 'X') {
            result = result.substring(0, result.length - 1);
        }
        
        return result;
    },

    cipherProcess: function(text, matrix, shift) {
        let result = "";

        for (let i = 0; i < text.length; i += 2) {
            const a = text.charAt(i);
            const b = text.charAt(i + 1);

            const posA = this.findPosition(a, matrix);
            const posB = this.findPosition(b, matrix);

            const rowA = posA[0], colA = posA[1];
            const rowB = posB[0], colB = posB[1];

            if (rowA === rowB) {
                result += matrix[rowA][(colA + shift) % 5];
                result += matrix[rowB][(colB + shift) % 5];
            } else if (colA === colB) {
                result += matrix[(rowA + shift) % 5][colA];
                result += matrix[(rowB + shift) % 5][colB];
            } else {
                result += matrix[rowA][colB];
                result += matrix[rowB][colA];
            }
        }
        return result;
    },

    findPosition: function(c, matrix) {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (matrix[row][col] === c) {
                    return [row, col];
                }
            }
        }
        return [0, 0];
    },

    procesar: function(texto, clave, operacion, idioma, alfabetoCustom, eliminarRelleno) {
        if (!texto || texto.trim().length === 0) {
            throw new Error("El texto a procesar no puede estar vacío.");
        }
        if (!clave) clave = "";
        if (!idioma) idioma = "ES";
        if (eliminarRelleno === undefined || eliminarRelleno === null) eliminarRelleno = false;

        const baseAlphabet = this.determinarBaseAlphabet(idioma, alfabetoCustom);
        const matrix = this.generateMatrix(clave, baseAlphabet, idioma);
        const cifrar = operacion !== "DESCIFRAR";

        if (cifrar) {
            return this.encrypt(texto, matrix, baseAlphabet, idioma);
        } else {
            return this.decrypt(texto, matrix, baseAlphabet, idioma, eliminarRelleno);
        }
    }
};

window.CriptoSuite = window.CriptoSuite || {};
window.CriptoSuite.PlayfairCipher = PlayfairCipher;
})();
