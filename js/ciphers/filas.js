(function() {
const FilasCipher = {
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
        let upper = text.toUpperCase();
        upper = upper.replace(/Á/g, 'A')
                     .replace(/É/g, 'E')
                     .replace(/Í/g, 'I')
                     .replace(/Ó/g, 'O')
                     .replace(/Ú/g, 'U')
                     .replace(/Ü/g, 'U');
        if (alfabeto.indexOf('Ñ') === -1 && alfabeto.indexOf('N') !== -1) {
            upper = upper.replace(/Ñ/g, 'N');
        }
        let sb = "";
        for (let i = 0; i < upper.length; i++) {
            const c = upper.charAt(i);
            if (alfabeto.indexOf(c) !== -1) {
                sb += c;
            }
        }
        return sb;
    },

    hasDuplicates: function(word) {
        for (let i = 0; i < word.length; i++) {
            const c = word.charAt(i);
            if (word.indexOf(c, i + 1) !== -1) {
                return true;
            }
        }
        return false;
    },

    obtenerOrdenFilas: function(clave, tipo, numRows, alfabeto) {
        if (tipo === "SIMPLE") {
            const order = new Array(numRows);
            for (let i = 0; i < numRows; i++) {
                order[i] = i;
            }
            return order;
        }

        const n = clave.length;
        const list = [];
        for (let i = 0; i < n; i++) {
            list.push({
                c: clave.charAt(i),
                originalIndex: i,
                alphabetIndex: alfabeto.indexOf(clave.charAt(i))
            });
        }

        list.sort((a, b) => {
            if (a.alphabetIndex !== b.alphabetIndex) {
                return a.alphabetIndex - b.alphabetIndex;
            }
            return a.originalIndex - b.originalIndex;
        });

        const order = new Array(n);
        for (let i = 0; i < n; i++) {
            order[i] = list[i].originalIndex;
        }
        return order;
    },

    procesar: function(texto, clave, operacion, tipo, idioma, alfabetoCustom) {
        if (!texto || texto.trim().length === 0) {
            throw new Error("El texto a procesar no puede estar vacío.");
        }
        if (!tipo) tipo = "SIMPLE";

        const alfabeto = this.obtenerAlfabeto(idioma, alfabetoCustom);

        let numRows;
        let claveLimpia = "";

        if (tipo === "SIMPLE") {
            if (!clave || clave.trim() === "") clave = "4";
            numRows = parseInt(clave.trim(), 10);
            if (isNaN(numRows) || numRows < 2 || numRows > 30) {
                throw new Error("El número de filas debe estar entre 2 y 30.");
            }
        } else {
            if (!clave || clave.trim() === "") clave = "SALUDO";
            claveLimpia = this.cleanAndNormalize(clave, alfabeto);
            if (claveLimpia.length === 0) {
                throw new Error("La palabra clave debe contener caracteres alfabéticos válidos para el alfabeto seleccionado.");
            }
            if (this.hasDuplicates(claveLimpia)) {
                throw new Error("La palabra clave no debe contener letras repetidas.");
            }
            numRows = claveLimpia.length;
        }

        const cifrar = operacion !== "DESCIFRAR";

        if (cifrar) {
            const cleaned = this.cleanAndNormalize(texto, alfabeto);
            if (cleaned.length === 0) return "";

            const numCols = Math.floor((cleaned.length + numRows - 1) / numRows);
            const grid = [];
            for (let i = 0; i < numRows; i++) {
                grid.push(new Array(numCols));
            }

            const paddingChar = alfabeto.indexOf("X") !== -1 ? 'X' : (alfabeto.length === 0 ? 'X' : alfabeto.charAt(alfabeto.length - 1));

            let textIndex = 0;
            for (let c = 0; c < numCols; c++) {
                for (let r = 0; r < numRows; r++) {
                    if (textIndex < cleaned.length) {
                        grid[r][c] = cleaned.charAt(textIndex++);
                    } else {
                        grid[r][c] = paddingChar;
                    }
                }
            }

            const order = this.obtenerOrdenFilas(claveLimpia, tipo, numRows, alfabeto);

            let cripto = "";
            for (let i = 0; i < order.length; i++) {
                const rowIndex = order[i];
                for (let c = 0; c < numCols; c++) {
                    cripto += grid[rowIndex][c];
                }
            }
            return cripto;
        } else {
            const cleaned = this.cleanAndNormalize(texto, alfabeto);
            if (cleaned.length === 0) return "";

            if (cleaned.length % numRows !== 0) {
                throw new Error("La longitud del texto cifrado (" + cleaned.length + ") debe ser un múltiplo de las filas (" + numRows + ").");
            }

            const numCols = cleaned.length / numRows;
            const grid = [];
            for (let i = 0; i < numRows; i++) {
                grid.push(new Array(numCols));
            }

            const order = this.obtenerOrdenFilas(claveLimpia, tipo, numRows, alfabeto);

            let textIndex = 0;
            for (let i = 0; i < order.length; i++) {
                const rowIndex = order[i];
                for (let c = 0; c < numCols; c++) {
                    grid[rowIndex][c] = cleaned.charAt(textIndex++);
                }
            }

            let plain = "";
            for (let c = 0; c < numCols; c++) {
                for (let r = 0; r < numRows; r++) {
                    plain += grid[r][c];
                }
            }
            return plain;
        }
    }
};

window.CriptoSuite = window.CriptoSuite || {};
window.CriptoSuite.FilasCipher = FilasCipher;
})();
