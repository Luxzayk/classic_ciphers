(function() {
const EscitalaCipher = {
    procesar: function(texto, columnas, operacion) {
        if (!texto || texto.trim().length === 0) {
            throw new Error("El texto a procesar no puede estar vacío.");
        }
        const cols = parseInt(columnas, 10);
        if (isNaN(cols) || cols <= 1) {
            throw new Error("El diámetro (número de caras) debe ser mayor a 1.");
        }

        let txtLimpio = texto.replace(/\s+/g, "").toUpperCase();
        if (txtLimpio.length === 0) {
            throw new Error("El texto no contiene caracteres válidos.");
        }

        if (operacion === "CIFRAR") {
            const resto = txtLimpio.length % cols;
            if (resto !== 0) {
                const relleno = cols - resto;
                txtLimpio = txtLimpio + "X".repeat(relleno);
            }

            const longitud = txtLimpio.length;
            const filas = longitud / cols;
            let resultado = "";

            for (let f = 0; f < filas; f++) {
                for (let c = 0; c < cols; c++) {
                    const index = c * filas + f;
                    if (index < longitud) {
                        resultado += txtLimpio.charAt(index);
                    }
                }
            }
            return resultado;
        } else {
            const longitud = txtLimpio.length;
            const filas = Math.ceil(longitud / cols);
            let resultado = "";

            const celdasVacias = (filas * cols) - longitud;
            const columnasCompletas = cols - celdasVacias;

            const matriz = [];
            for (let i = 0; i < filas; i++) {
                matriz.push(new Array(cols).fill('\u0000'));
            }

            let index = 0;
            for (let f = 0; f < filas; f++) {
                const limiteColumnas = (f === filas - 1) ? columnasCompletas : cols;
                for (let c = 0; c < limiteColumnas; c++) {
                    if (index < longitud) {
                        matriz[f][c] = txtLimpio.charAt(index++);
                    }
                }
            }

            for (let c = 0; c < cols; c++) {
                for (let f = 0; f < filas; f++) {
                    if (matriz[f][c] !== '\u0000') {
                        resultado += matriz[f][c];
                    }
                }
            }
            return resultado;
        }
    }
};

window.CriptoSuite = window.CriptoSuite || {};
window.CriptoSuite.EscitalaCipher = EscitalaCipher;
})();
