(function() {
const HillCipher = {
    ALFABETO_ES: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
    ALFABETO_EN: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    obtenerAlfabeto: function(idioma, alfabetoCustom) {
        if (idioma === "CUSTOM" && alfabetoCustom && alfabetoCustom.trim().length > 0) {
            let sb = "";
            for (let i = 0; i < alfabetoCustom.length; i++) {
                const c = alfabetoCustom.charAt(i).toUpperCase();
                if (sb.indexOf(c) === -1) {
                    sb += c;
                }
            }
            if (sb.length < 2) {
                throw new Error("El alfabeto personalizado debe tener al menos 2 caracteres únicos.");
            }
            return sb;
        } else if (idioma === "EN") {
            return this.ALFABETO_EN;
        }
        return this.ALFABETO_ES;
    },

    cleanAndNormalize: function(text, alfabeto) {
        if (!text) return "";
        let sb = "";
        for (let i = 0; i < text.length; i++) {
            const c = text.charAt(i).toUpperCase();
            if (alfabeto.indexOf(c) !== -1) {
                sb += c;
            }
        }
        return sb;
    },

    generateKeyMatrix: function(clave, dim, alfabeto) {
        const matrix = [];
        for (let i = 0; i < dim; i++) {
            matrix.push(new Array(dim));
        }

        let cleanedKey = this.cleanAndNormalize(clave, alfabeto);
        if (cleanedKey.length < dim * dim) {
            while (cleanedKey.length < dim * dim) {
                cleanedKey += alfabeto.charAt(0);
            }
        }

        let index = 0;
        for (let r = 0; r < dim; r++) {
            for (let c = 0; c < dim; c++) {
                const ch = cleanedKey.charAt(index++);
                matrix[r][c] = alfabeto.indexOf(ch);
            }
        }
        return matrix;
    },

    determinant: function(matrix, n) {
        if (n === 1) return matrix[0][0];
        if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

        let det = 0;
        let sign = 1;

        for (let f = 0; f < n; f++) {
            const temp = this.createEmptyMatrix(n - 1);
            this.getCofactor(matrix, temp, 0, f, n);
            det += sign * matrix[0][f] * this.determinant(temp, n - 1);
            sign = -sign;
        }
        return det;
    },

    createEmptyMatrix: function(n) {
        const matrix = [];
        for (let i = 0; i < n; i++) {
            matrix.push(new Array(n));
        }
        return matrix;
    },

    getCofactor: function(matrix, temp, p, q, n) {
        let i = 0, j = 0;
        for (let row = 0; row < n; row++) {
            for (let col = 0; col < n; col++) {
                if (row !== p && col !== q) {
                    temp[i][j++] = matrix[row][col];
                    if (j === n - 1) {
                        j = 0;
                        i++;
                    }
                }
            }
        }
    },

    modInverse: function(a, m) {
        a = (a % m + m) % m;
        for (let x = 1; x < m; x++) {
            if ((a * x) % m === 1) {
                return x;
            }
        }
        return -1;
    },

    adjugate: function(matrix, n, m) {
        const adj = this.createEmptyMatrix(n);
        if (n === 1) {
            adj[0][0] = 1;
            return adj;
        }
        let sign;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const temp = this.createEmptyMatrix(n - 1);
                this.getCofactor(matrix, temp, i, j, n);
                sign = ((i + j) % 2 === 0) ? 1 : -1;
                const cofactor = (sign * this.determinant(temp, n - 1)) % m;
                adj[j][i] = (cofactor + m) % m;
            }
        }
        return adj;
    },

    invertMatrix: function(matrix, n, m) {
        const det = this.determinant(matrix, n);
        const detMod = (det % m + m) % m;
        const invDet = this.modInverse(detMod, m);
        if (invDet === -1) return null;

        const adj = this.adjugate(matrix, n, m);
        const inv = this.createEmptyMatrix(n);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                inv[i][j] = (adj[i][j] * invDet) % m;
                if (inv[i][j] < 0) {
                    inv[i][j] += m;
                }
            }
        }
        return inv;
    },

    multiplyMatrixVector: function(matrix, vector, dim, m) {
        const result = new Array(dim);
        for (let i = 0; i < dim; i++) {
            let sum = 0;
            for (let j = 0; j < dim; j++) {
                sum += matrix[i][j] * vector[j];
            }
            result[i] = (sum % m + m) % m;
        }
        return result;
    },

    procesar: function(texto, clave, operacion, idioma, alfabetoCustom) {
        if (!texto || texto.trim().length === 0) {
            throw new Error("El texto a procesar no puede estar vacío.");
        }
        if (!clave || clave.trim().length === 0) clave = "FORTALEZA";
        if (!idioma) idioma = "ES";

        const alfabeto = this.obtenerAlfabeto(idioma, alfabetoCustom);
        const m = alfabeto.length;

        const claveLimpia = this.cleanAndNormalize(clave, alfabeto);
        if (claveLimpia.length === 0) {
            throw new Error("La clave debe contener caracteres válidos para el alfabeto seleccionado.");
        }

        const keyLen = claveLimpia.length;
        const dim = Math.floor(Math.sqrt(keyLen));
        if (dim * dim !== keyLen) {
            throw new Error("La longitud de la clave (excluyendo caracteres inválidos) debe ser un cuadrado perfecto (4, 9, 16, 25...).");
        }

        const keyMatrix = this.generateKeyMatrix(claveLimpia, dim, alfabeto);

        const det = this.determinant(keyMatrix, dim);
        const detMod = (det % m + m) % m;
        const invDet = this.modInverse(detMod, m);
        if (invDet === -1) {
            throw new Error("La matriz de la clave no es invertible en módulo " + m + " (determinante: " + detMod + "). Intente con otra clave.");
        }

        const RestorationSign = operacion !== "DESCIFRAR";

        if (RestorationSign) {
            const cleaned = this.cleanAndNormalize(texto, alfabeto);
            if (cleaned.length === 0) return "";

            let padded = cleaned;
            const fillChar = alfabeto.indexOf("X") !== -1 ? 'X' : alfabeto.charAt(alfabeto.length - 1);
            while (padded.length % dim !== 0) {
                padded += fillChar;
            }

            let result = "";
            for (let i = 0; i < padded.length; i += dim) {
                const vector = new Array(dim);
                for (let j = 0; j < dim; j++) {
                    vector[j] = alfabeto.indexOf(padded.charAt(i + j));
                }

                const cipheredVector = this.multiplyMatrixVector(keyMatrix, vector, dim, m);
                
                if (i > 0) result += " ";
                for (let j = 0; j < dim; j++) {
                    result += alfabeto.charAt(cipheredVector[j]);
                }
            }
            return result;
        } else {
            const cleaned = this.cleanAndNormalize(texto, alfabeto);
            if (cleaned.length === 0) return "";

            let padded = cleaned;
            const fillChar = alfabeto.indexOf("X") !== -1 ? 'X' : alfabeto.charAt(alfabeto.length - 1);
            while (padded.length % dim !== 0) {
                padded += fillChar;
            }

            const invMatrix = this.invertMatrix(keyMatrix, dim, m);
            if (!invMatrix) {
                throw new Error("La matriz clave no es invertible. No se puede descifrar.");
            }

            let result = "";
            for (let i = 0; i < padded.length; i += dim) {
                const vector = new Array(dim);
                for (let j = 0; j < dim; j++) {
                    vector[j] = alfabeto.indexOf(padded.charAt(i + j));
                }

                const plainVector = this.multiplyMatrixVector(invMatrix, vector, dim, m);
                if (i > 0) result += " ";
                for (let j = 0; j < dim; j++) {
                    result += alfabeto.charAt(plainVector[j]);
                }
            }
            return result;
        }
    }
};

window.CriptoSuite = window.CriptoSuite || {};
window.CriptoSuite.HillCipher = HillCipher;
})();
