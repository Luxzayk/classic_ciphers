// js/pages/filas-page.js
document.addEventListener("DOMContentLoaded", () => {
    let ultimoCampoEditado = "original";

    const inputTexto = document.getElementById("textoEntrada");
    const outputTexto = document.getElementById("textoSalida");

    const selectTipo = document.getElementById("tipoCifrado");
    const inputClave = document.getElementById("clave");
    const inputNumRows = document.getElementById("numRows");
    const rowsDisplay = document.getElementById("rowsValueDisplay");

    const selectAlfabeto = document.getElementById("idioma");
    const inputCustom = document.getElementById("alfabetoCustom");
    const customAlphabetContainer = document.getElementById("customAlphabetContainer");
    const displayAlfabeto = document.getElementById("displayAlfabeto");

    const simpleRowsContainer = document.getElementById("simpleRowsContainer");
    const claveKeyContainer = document.getElementById("claveKeyContainer");

    const displayNf = document.getElementById("displayNf");
    const displayLc = document.getElementById("displayLc");
    const displayNc = document.getElementById("displayNc");
    const keyStatus = document.getElementById("keyStatus");

    const matrixTable = document.getElementById("matrixTable");

    const btnCopiar = document.getElementById("btnCopiar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnPegar = document.getElementById("btnPegar");
    const btnCopiarOriginal = document.getElementById("btnCopiarOriginal");
    const btnPegarCifrado = document.getElementById("btnPegarCifrado");

    const ALFABETO_ES = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    const ALFABETO_EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function limpiarAlfabeto(valor) {
        const visto = new Set();
        let resultado = "";
        for (const char of (valor || "").toUpperCase()) {
            if (!/[A-ZÑ]/i.test(char)) continue;
            if (visto.has(char)) continue;
            visto.add(char);
            resultado += char;
        }
        return resultado;
    }

    function obtenerAlfabetoActivo() {
        if (selectAlfabeto.value === "CUSTOM") {
            const custom = limpiarAlfabeto(inputCustom.value);
            return custom.length >= 2 ? custom : ALFABETO_ES;
        }
        return selectAlfabeto.value === "EN" ? ALFABETO_EN : ALFABETO_ES;
    }

    function limpiarTexto(text, alfabeto) {
        if (!text) return "";
        let normalized = text.toUpperCase();

        normalized = normalized.replace(/Á/g, "A")
            .replace(/É/g, "E")
            .replace(/Í/g, "I")
            .replace(/Ó/g, "O")
            .replace(/Ú/g, "U")
            .replace(/Ü/g, "U");

        if (alfabeto.indexOf("Ñ") === -1 && alfabeto.indexOf("N") !== -1) {
            normalized = normalized.replace(/Ñ/g, "N");
        }

        let cleaned = "";
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized[i];
            if (alfabeto.indexOf(char) !== -1) {
                cleaned += char;
            }
        }
        return cleaned;
    }

    function tieneDuplicados(word) {
        for (let i = 0; i < word.length; i++) {
            const c = word[i];
            if (word.indexOf(c, i + 1) !== -1) {
                return true;
            }
        }
        return false;
    }

    function obtenerPrioridadesAlfabeticas(clave, alfabeto) {
        const chars = clave.split("").map((c, i) => ({
            c,
            originalIndex: i,
            alphabetIndex: alfabeto.indexOf(c)
        }));
        chars.sort((a, b) => {
            if (a.alphabetIndex !== b.alphabetIndex) return a.alphabetIndex - b.alphabetIndex;
            return a.originalIndex - b.originalIndex;
        });
        const priorities = new Array(clave.length);
        for (let p = 0; p < chars.length; p++) {
            priorities[chars[p].originalIndex] = p + 1;
        }
        return priorities;
    }

    function actualizarMatrizVisual() {
        const tipo = selectTipo.value;
        const texto = inputTexto.value;

        const alfabeto = obtenerAlfabetoActivo();
        if (displayAlfabeto) {
            displayAlfabeto.textContent = alfabeto;
        }

        const cleanedText = limpiarTexto(texto, alfabeto);

        let nf = 4;
        let claveLimpia = "";
        let priorities = [];
        let keyIsValid = true;

        if (tipo === "SIMPLE") {
            nf = parseInt(inputNumRows.value);
            displayNf.textContent = nf;
            keyStatus.textContent = "VÁLIDA";
            keyStatus.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/25";
        } else {
            const rawKey = inputClave.value.toUpperCase();
            claveLimpia = limpiarTexto(rawKey, alfabeto);
            nf = claveLimpia.length;
            displayNf.textContent = nf > 0 ? nf : "-";

            if (nf < 2) {
                marcarClaveInvalida("Clave muy corta");
                keyIsValid = false;
            } else if (tieneDuplicados(claveLimpia)) {
                marcarClaveInvalida("Letras repetidas");
                keyIsValid = false;
            } else {
                keyStatus.textContent = "VÁLIDA";
                keyStatus.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/25";
                priorities = obtenerPrioridadesAlfabeticas(claveLimpia, alfabeto);
            }
        }

        displayLc.textContent = cleanedText.length;

        if (!keyIsValid || nf <= 0) {
            displayNc.textContent = "-";
            matrixTable.innerHTML = `<tr><td class="text-slate-500 py-6">Configura una clave válida para ver la matriz</td></tr>`;
            return;
        }

        const nc = Math.max(1, Math.ceil(cleanedText.length / nf));
        displayNc.textContent = nc;

        matrixTable.innerHTML = "";

        const headerRow = document.createElement("tr");
        headerRow.className = "border-b border-slate-350 dark:border-slate-800 font-bold bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-200 text-xs";

        const firstHeader = document.createElement("th");
        firstHeader.textContent = tipo === "SIMPLE" ? "Filas" : "Clave";
        firstHeader.className = "px-3 py-2 border-r border-slate-350 dark:border-slate-800 text-slate-500 font-semibold w-24";
        headerRow.appendChild(firstHeader);

        for (let c = 0; c < nc; c++) {
            const th = document.createElement("th");
            th.textContent = `C${c + 1}`;
            th.className = "px-3 py-2 border-r border-slate-350 dark:border-slate-800 text-slate-700 dark:text-slate-200";
            headerRow.appendChild(th);
        }
        matrixTable.appendChild(headerRow);

        const paddingChar = alfabeto.includes("X") ? "X" : (alfabeto.length > 0 ? alfabeto[alfabeto.length - 1] : "X");

        const grid = Array.from({ length: nf }, () => new Array(nc).fill(paddingChar));
        let textIdx = 0;
        for (let c = 0; c < nc; c++) {
            for (let r = 0; r < nf; r++) {
                if (textIdx < cleanedText.length) {
                    grid[r][c] = cleanedText[textIdx++];
                } else {
                    grid[r][c] = paddingChar;
                }
            }
        }

        for (let r = 0; r < nf; r++) {
            const row = document.createElement("tr");
            row.className = "border-b border-slate-300 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-900/20 transition-colors";

            const rowLabel = document.createElement("td");
            rowLabel.className = "px-3 py-2 border-r border-slate-350 dark:border-slate-800 text-xs font-semibold bg-slate-50 dark:bg-slate-900/5";
            if (tipo === "SIMPLE") {
                rowLabel.textContent = `Fila ${r + 1}`;
                rowLabel.className += " text-slate-500";
            } else {
                const letter = claveLimpia[r];
                const prio = priorities[r];
                rowLabel.innerHTML = `<span class="text-fuchsia-600 dark:text-fuchsia-400 font-black">${letter}</span> <span class="text-[10px] text-slate-550 font-bold">(${prio})</span>`;
            }
            row.appendChild(rowLabel);

            for (let c = 0; c < nc; c++) {
                const td = document.createElement("td");
                td.className = "px-3 py-2 border-r border-slate-350 dark:border-slate-800 font-mono text-sm";
                td.textContent = grid[r][c];

                const originalTextPos = c * nf + r;
                if (originalTextPos >= cleanedText.length) {
                    td.className += " text-slate-500 font-bold bg-slate-100 dark:bg-slate-900/10";
                } else {
                    td.className += " text-slate-800 dark:text-slate-205";
                }

                row.appendChild(td);
            }
            matrixTable.appendChild(row);
        }
    }

    function marcarClaveInvalida(motivo) {
        keyStatus.textContent = motivo.toUpperCase();
        keyStatus.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-650 dark:text-red-405 border border-red-500/25";
    }

    function enviarDatos() {
        const texto = ultimoCampoEditado === "original" ? inputTexto.value : outputTexto.value;
        const operacion = ultimoCampoEditado === "original" ? "CIFRAR" : "DESCIFRAR";

        if (!texto) {
            if (ultimoCampoEditado === "original") {
                outputTexto.value = "";
            } else {
                inputTexto.value = "";
            }
            return;
        }

        const tipo = selectTipo.value;
        const alfabeto = obtenerAlfabetoActivo();
        let clave = "";

        if (tipo === "SIMPLE") {
            clave = inputNumRows.value;
        } else {
            clave = limpiarTexto(inputClave.value.toUpperCase(), alfabeto);
        }

        if (tipo === "CLAVE" && (clave.length < 2 || tieneDuplicados(clave))) {
            return;
        }

        try {
            const res = FilasCipher.procesar(texto, clave, operacion, tipo, selectAlfabeto.value, inputCustom.value);
            if (ultimoCampoEditado === "original") {
                outputTexto.value = res;
            } else {
                inputTexto.value = res;
            }
        } catch (err) {
            CryptoUX.showToast("Error", err.message, "error");
        }
    }

    function cifrarDesdeOriginal() { ultimoCampoEditado = "original"; enviarDatos(); actualizarMatrizVisual(); }
    function descifrarDesdeCifrado() { ultimoCampoEditado = "cifrado"; enviarDatos(); actualizarMatrizVisual(); }
    function recalcularDesdeUltimoCampo() { ultimoCampoEditado === "cifrado" ? descifrarDesdeCifrado() : cifrarDesdeOriginal(); }

    inputTexto.addEventListener("input", cifrarDesdeOriginal);
    outputTexto.addEventListener("input", descifrarDesdeCifrado);

    inputNumRows.addEventListener("input", (e) => {
        rowsDisplay.textContent = e.target.value;
        actualizarMatrizVisual();
        recalcularDesdeUltimoCampo();
    });

    inputClave.addEventListener("input", (e) => {
        const alfabeto = obtenerAlfabetoActivo();
        const val = limpiarTexto(e.target.value, alfabeto);
        e.target.value = val;
        actualizarMatrizVisual();
        recalcularDesdeUltimoCampo();
    });

    selectTipo.addEventListener("change", (e) => {
        if (e.target.value === "SIMPLE") {
            simpleRowsContainer.classList.remove("hidden");
            claveKeyContainer.classList.add("hidden");
        } else {
            simpleRowsContainer.classList.add("hidden");
            claveKeyContainer.classList.remove("hidden");
        }
        actualizarMatrizVisual();
        recalcularDesdeUltimoCampo();
    });

    selectAlfabeto.addEventListener("change", (e) => {
        if (e.target.value === "CUSTOM") {
            customAlphabetContainer.classList.remove("hidden");
        } else {
            customAlphabetContainer.classList.add("hidden");
        }
        actualizarMatrizVisual();
        recalcularDesdeUltimoCampo();
    });

    inputCustom.addEventListener("input", (e) => {
        e.target.value = limpiarAlfabeto(e.target.value);
        actualizarMatrizVisual();
        recalcularDesdeUltimoCampo();
    });

    btnCopiar.addEventListener("click", () => {
        if (!outputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto para copiar.", "info");
            return;
        }
        navigator.clipboard.writeText(outputTexto.value).then(() => {
            CryptoUX.showToast("¡Copiado!", "Texto cifrado copiado.", "success");
        }).catch(() => {
            outputTexto.select();
            document.execCommand("copy");
        });
    });

    btnPegarCifrado?.addEventListener("click", async () => {
        try {
            const texto = await navigator.clipboard.readText();
            outputTexto.value = texto;
            descifrarDesdeCifrado();
        } catch {
            CryptoUX.showToast("Error", "No se pudo acceder al portapapeles.", "error");
        }
    });

    btnPegar.addEventListener("click", async () => {
        try {
            const texto = await navigator.clipboard.readText();
            inputTexto.value = texto;
            cifrarDesdeOriginal();
            inputTexto.focus();
            CryptoUX.showToast("Pegado", "Texto insertado correctamente.", "success");
        } catch {
            CryptoUX.showToast("Error", "No se pudo acceder al portapapeles.", "error");
        }
    });

    btnCopiarOriginal?.addEventListener("click", () => {
        if (!inputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto para copiar.", "info");
            return;
        }
        navigator.clipboard.writeText(inputTexto.value).then(() => {
            CryptoUX.showToast("¡Copiado!", "Texto original copiado.", "success");
        }).catch(() => {
            inputTexto.select();
            document.execCommand("copy");
        });
    });

    btnLimpiar.addEventListener("click", () => {
        inputTexto.value = "";
        outputTexto.value = "";
        ultimoCampoEditado = "original";
        actualizarMatrizVisual();
        inputTexto.focus();
    });

    actualizarMatrizVisual();
});
