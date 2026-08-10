// js/pages/columnas-page.js
document.addEventListener("DOMContentLoaded", () => {
    let ultimoCampoEditado = "original";

    const inputTexto = document.getElementById("textoEntrada");
    const outputTexto = document.getElementById("textoSalida");

    const selectTipo = document.getElementById("tipoCifrado");
    const inputClave = document.getElementById("clave");
    const inputNumCols = document.getElementById("numCols");
    const colsDisplay = document.getElementById("colsValueDisplay");

    const selectAlfabeto = document.getElementById("idioma");
    const inputCustom = document.getElementById("alfabetoCustom");
    const customAlphabetContainer = document.getElementById("customAlphabetContainer");
    const displayAlfabeto = document.getElementById("displayAlfabeto");

    const simpleColsContainer = document.getElementById("simpleColsContainer");
    const claveKeyContainer = document.getElementById("claveKeyContainer");

    const displayNc = document.getElementById("displayNc");
    const displayLc = document.getElementById("displayLc");
    const displayNf = document.getElementById("displayNf");
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
        let normalized = text.toUpperCase().replace(/[ÁÉÍÓÚÜ]/g, (match) => {
            const map = {'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U','Ü':'U'};
            return map[match];
        });
        if (alfabeto.indexOf("Ñ") === -1 && alfabeto.indexOf("N") !== -1) {
            normalized = normalized.replace(/Ñ/g, "N");
        }
        return normalized.split('').filter(char => alfabeto.indexOf(char) !== -1).join('');
    }

    function tieneDuplicados(word) {
        return new Set(word).size !== word.length;
    }

    function obtenerPrioridadesAlfabeticas(clave, alfabeto) {
        const chars = clave.split("").map((c, i) => ({
            c, originalIndex: i, alphabetIndex: alfabeto.indexOf(c)
        }));
        chars.sort((a, b) => a.alphabetIndex !== b.alphabetIndex ? a.alphabetIndex - b.alphabetIndex : a.originalIndex - b.originalIndex);
        const priorities = new Array(clave.length);
        chars.forEach((item, p) => priorities[item.originalIndex] = p + 1);
        return priorities;
    }

    function actualizarMatrizVisual() {
        const tipo = selectTipo.value;
        const texto = inputTexto.value;
        const alfabeto = obtenerAlfabetoActivo();
        if (displayAlfabeto) displayAlfabeto.textContent = alfabeto;

        const cleanedText = limpiarTexto(texto, alfabeto);
        let nc = 7;
        let claveLimpia = "";
        let priorities = [];
        let keyIsValid = true;

        if (tipo === "SIMPLE") {
            nc = parseInt(inputNumCols.value);
            displayNc.textContent = nc;
            keyStatus.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/25";
            keyStatus.textContent = "VÁLIDA";
        } else {
            claveLimpia = limpiarTexto(inputClave.value.toUpperCase(), alfabeto);
            nc = claveLimpia.length;
            displayNc.textContent = nc > 0 ? nc : "-";
            if (nc < 2 || tieneDuplicados(claveLimpia)) {
                keyStatus.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-650 dark:text-red-400 border border-red-300 dark:border-red-500/25";
                keyStatus.textContent = "CLAVE INVÁLIDA";
                keyIsValid = false;
            } else {
                keyStatus.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/25";
                keyStatus.textContent = "VÁLIDA";
                priorities = obtenerPrioridadesAlfabeticas(claveLimpia, alfabeto);
            }
        }

        displayLc.textContent = cleanedText.length;
        if (!keyIsValid || nc <= 0) {
            displayNf.textContent = "-";
            matrixTable.innerHTML = `<tr><td class="text-slate-500 py-6">Configura una clave válida</td></tr>`;
            return;
        }

        const nf = Math.max(1, Math.ceil(cleanedText.length / nc));
        displayNf.textContent = nf;
        matrixTable.innerHTML = "";

        const headerRow = document.createElement("tr");
        headerRow.className = "border-b border-slate-350 dark:border-slate-800 font-bold bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-200 text-xs";

        const firstHeader = document.createElement("th");
        firstHeader.textContent = tipo === "SIMPLE" ? "Cols" : "Clave";
        firstHeader.className = "px-3 py-2 border-r border-slate-350 dark:border-slate-800";
        headerRow.appendChild(firstHeader);

        for (let c = 0; c < nc; c++) {
            const th = document.createElement("th");
            if (tipo === "SIMPLE") {
                th.textContent = `C${c + 1}`;
            } else {
                th.innerHTML = `<div class="text-amber-600 dark:text-amber-400 text-sm">${claveLimpia[c]}</div><div class="text-[10px] text-slate-500 mt-0.5">${priorities[c]}</div>`;
            }
            headerRow.appendChild(th);
        }
        matrixTable.appendChild(headerRow);

        let textIdx = 0;
        const paddingChar = alfabeto.length > 0 ? alfabeto[alfabeto.length - 1] : "X";
        for (let r = 0; r < nf; r++) {
            const row = document.createElement("tr");
            const rowLabel = document.createElement("td");
            rowLabel.textContent = `Fila ${r + 1}`;
            rowLabel.className = "px-3 py-2 border-r border-slate-350 dark:border-slate-800 text-xs text-slate-550 font-semibold";
            row.appendChild(rowLabel);

            for (let c = 0; c < nc; c++) {
                const td = document.createElement("td");
                td.textContent = textIdx < cleanedText.length ? cleanedText[textIdx++] : paddingChar;
                td.className = "px-3 py-2 border border-slate-350 dark:border-slate-800 font-mono text-sm";
                row.appendChild(td);
            }
            matrixTable.appendChild(row);
        }
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
        const clave = tipo === "SIMPLE" ? inputNumCols.value : limpiarTexto(inputClave.value.toUpperCase(), alfabeto);

        if (tipo === "CLAVE" && (clave.length < 2 || tieneDuplicados(clave))) {
            return; // Don't process invalid key
        }

        try {
            const res = ColumnasCipher.procesar(texto, clave, operacion, tipo, selectAlfabeto.value, inputCustom.value);
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
    inputNumCols.addEventListener("input", (e) => { colsDisplay.textContent = e.target.value; actualizarMatrizVisual(); recalcularDesdeUltimoCampo(); });
    inputClave.addEventListener("input", (e) => { e.target.value = limpiarTexto(e.target.value, obtenerAlfabetoActivo()); actualizarMatrizVisual(); recalcularDesdeUltimoCampo(); });
    
    selectTipo.addEventListener("change", (e) => {
        simpleColsContainer.classList.toggle("hidden", e.target.value !== "SIMPLE");
        claveKeyContainer.classList.toggle("hidden", e.target.value === "SIMPLE");
        actualizarMatrizVisual();
        recalcularDesdeUltimoCampo();
    });
    
    selectAlfabeto.addEventListener("change", (e) => {
        customAlphabetContainer.classList.toggle("hidden", e.target.value !== "CUSTOM");
        actualizarMatrizVisual();
        recalcularDesdeUltimoCampo();
    });
    
    inputCustom.addEventListener("input", () => {
        actualizarMatrizVisual();
        recalcularDesdeUltimoCampo();
    });

    btnCopiar.addEventListener("click", () => {
        if (!outputTexto.value) return;
        navigator.clipboard.writeText(outputTexto.value).then(() => CryptoUX.showToast("¡Copiado!", "Texto cifrado copiado.", "success"));
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
        } catch {
            CryptoUX.showToast("Error", "No se pudo acceder al portapapeles.", "error");
        }
    });
    
    btnCopiarOriginal?.addEventListener("click", () => {
        if (!inputTexto.value) return;
        navigator.clipboard.writeText(inputTexto.value).then(() => CryptoUX.showToast("¡Copiado!", "Texto original copiado.", "success"));
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
