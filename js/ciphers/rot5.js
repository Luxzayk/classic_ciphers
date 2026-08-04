const Rot5Cipher = {
    DESPLAZAMIENTO: 5,

    procesar: function(texto) {
        if (!texto) return "";

        let resultado = "";
        for (let i = 0; i < texto.length; i++) {
            const c = texto.charAt(i);
            if (c >= '0' && c <= '9') {
                const num = parseInt(c, 10);
                const nuevoNum = (num + this.DESPLAZAMIENTO) % 10;
                resultado += nuevoNum;
            } else {
                resultado += c;
            }
        }
        return resultado;
    }
};
