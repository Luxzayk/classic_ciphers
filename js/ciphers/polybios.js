const PolybiosCipher = {
    ALFABETO_BASE: "ABCDEFGHIKLMNOPQRSTUVWXYZ",

    normalizarTexto: function(valor) {
        return valor.toUpperCase()
            .replace(/J/g, 'I')
            .replace(/Ñ/g, 'N');
    },

    procesar: function(texto, operacion, idioma, tipoCoordenadas) {
        if (!texto) return "";

        const matrizPolybios = this.ALFABETO_BASE;
        let resultado = [];
        const coordType = tipoCoordenadas ? tipoCoordenadas.toUpperCase() : "NUM";

        if (operacion === "CIFRAR") {
            const textoLimpio = this.normalizarTexto(texto).replace(/[^A-Z]/g, "");

            for (let i = 0; i < textoLimpio.length; i++) {
                const caracter = textoLimpio.charAt(i);
                const index = matrizPolybios.indexOf(caracter);

                if (index !== -1) {
                    const fila = Math.floor(index / 5) + 1;
                    const columna = (index % 5) + 1;

                    if (coordType === "LETRA") {
                        const filaChar = String.fromCharCode('A'.charCodeAt(0) + fila - 1);
                        const colChar = String.fromCharCode('A'.charCodeAt(0) + columna - 1);
                        resultado.push(filaChar + colChar);
                    } else {
                        resultado.push("" + fila + columna);
                    }
                }
            }
            return resultado.join(" ");
        } else {
            let resStr = "";
            let coordenadasLimpias = "";
            if (coordType === "LETRA") {
                coordenadasLimpias = texto.toUpperCase().replace(/[^A-E]/g, "");
                for (let i = 0; i < coordenadasLimpias.length - 1; i += 2) {
                    const fila = (coordenadasLimpias.charCodeAt(i) - 'A'.charCodeAt(0)) + 1;
                    const columna = (coordenadasLimpias.charCodeAt(i + 1) - 'A'.charCodeAt(0)) + 1;
                    const index = ((fila - 1) * 5) + (columna - 1);

                    if (index >= 0 && index < matrizPolybios.length) {
                        resStr += matrizPolybios.charAt(index);
                    }
                }
            } else {
                coordenadasLimpias = texto.replace(/[^1-5]/g, "");
                for (let i = 0; i < coordenadasLimpias.length - 1; i += 2) {
                    const fila = parseInt(coordenadasLimpias.charAt(i), 10);
                    const columna = parseInt(coordenadasLimpias.charAt(i + 1), 10);
                    const index = ((fila - 1) * 5) + (columna - 1);

                    if (index >= 0 && index < matrizPolybios.length) {
                        resStr += matrizPolybios.charAt(index);
                    }
                }
            }
            return resStr;
        }
    }
};
