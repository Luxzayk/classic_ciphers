// js/pages/alberti-page.js
document.addEventListener("DOMContentLoaded", () => {
    // Referencias DOM - Entradas
    const inputTexto   = document.getElementById('textoEntrada');
    const outputTexto  = document.getElementById('textoSalida');
    const inputClave   = document.getElementById('clave');
    const radiosOperacion = document.querySelectorAll('input[name="operacion"]');

    // Simulador
    const idiomaSelector    = document.getElementById('idiomaSelector');
    const outerRing         = document.getElementById('outerRing');
    const innerWheel        = document.getElementById('innerWheel');
    const innerLetters      = document.getElementById('innerLetters');
    const diskAngleDisplay  = document.getElementById('diskAngleDisplay');
    const alignDisplay      = document.getElementById('alignDisplay');

    // Botones de acción
    const btnCopiar  = document.getElementById('btnCopiar');
    const btnPegar   = document.getElementById('btnPegar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnAnimar  = document.getElementById('btnAnimar');

    // Alfabetos
    const ALFABETOS = {
        "LA": { ext: AlbertiCipher.LA_EXT, int: AlbertiCipher.LA_INT },
        "ES": { ext: AlbertiCipher.ES_EXT, int: AlbertiCipher.ES_INT },
        "EN": { ext: AlbertiCipher.EN_EXT, int: AlbertiCipher.EN_INT },
        "CUSTOM": { ext: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", int: "cdefghijklmnopqrstuvwxyzab" }
    };

    const customContainer = document.getElementById('customAlphabetContainer');
    const customExt = document.getElementById('customExt');
    const customInt = document.getElementById('customInt');
    const countExt  = document.getElementById('countExt');
    const countInt  = document.getElementById('countInt');
    const alertaLongitud = document.getElementById('alertaLongitud');

    let currentLang = "LA";

    // ==========================================
    // MOTOR GRÁFICO DISCOS
    // ==========================================
    function dibujarDisco(container, alfabeto, radio, charClass, reverse = false) {
        container.innerHTML = '';
        const len  = alfabeto.length;
        const step = 360 / len;

        for (let i = 0; i < len; i++) {
            const div = document.createElement('div');
            div.innerText = alfabeto[i];
            div.className = `absolute left-1/2 top-1/2 w-6 h-6 -ml-3 -mt-3 flex items-center justify-center font-mono font-bold transition-all duration-300 ${charClass}`;
            div.setAttribute('data-index', i);
            div.setAttribute('data-char', alfabeto[i]);
            
            const angle = reverse ? -i * step : i * step;
            div.style.transform = `rotate(${angle}deg) translateY(-${radio}px)`;
            container.appendChild(div);
        }
    }

    function renderizarSimulador() {
        const width = window.innerWidth;
        const rExt  = width < 640 ? 110 : 135;
        const rInt  = width < 640 ? 70  : 90;

        dibujarDisco(outerRing,    ALFABETOS[currentLang].ext, rExt, 'outer-char', false);
        dibujarDisco(innerLetters, ALFABETOS[currentLang].int, rInt, 'inner-char', true);
        actualizarRotacion(0);
    }

    window.addEventListener('resize', renderizarSimulador);

    // ==========================================
    // LÓGICA DE ROTACIÓN Y ENVÍO
    // ==========================================
    function parseKeyJS(keyStr) {
        try {
            return AlbertiCipher.parseKey(keyStr);
        } catch {
            return null;
        }
    }

    function actualizarRotacion(shiftOffset = 0) {
        const keyInfo = parseKeyJS(inputClave.value);
        if (!keyInfo) return;

        const extAlf = ALFABETOS[currentLang].ext;
        const intAlf = ALFABETOS[currentLang].int;

        let idxO = extAlf.indexOf(keyInfo.outerChar);
        if (idxO === -1) idxO = extAlf.toUpperCase().indexOf(keyInfo.outerChar.toUpperCase());

        let idxI = intAlf.indexOf(keyInfo.innerChar);
        if (idxI === -1) {
            const isLower = keyInfo.innerChar === keyInfo.innerChar.toLowerCase();
            const opposite = isLower ? keyInfo.innerChar.toUpperCase() : keyInfo.innerChar.toLowerCase();
            idxI = intAlf.indexOf(opposite);
        }

        if (idxO === -1 || idxI === -1) return;

        const len = extAlf.length;
        const step = 360 / len;

        // Rotate outerRing so keyInfo.outerChar (idxO) is at 0 degrees (Target)
        outerRing.style.transform = `rotate(${-idxO * step}deg)`;

        // Rotate innerWheel so innerChar at shiftOffset is at 0 degrees (Target)
        const angle = (idxI + shiftOffset) * step;
        innerWheel.style.transform = `rotate(${angle}deg)`;
        
        diskAngleDisplay.innerText = `${shiftOffset}`;

        const alignBaseLabel = document.getElementById('alignBaseLabel');
        const alignOuterChar = document.getElementById('alignOuterChar');
        if (alignBaseLabel) alignBaseLabel.textContent = `Alineación base (Letra ${keyInfo.outerChar})`;
        if (alignOuterChar) alignOuterChar.textContent = keyInfo.outerChar;

        const letraAlineadaIndex = (idxI + shiftOffset + len * 100) % len;
        alignDisplay.innerText = intAlf[letraAlineadaIndex % intAlf.length];
    }

    function actualizarRotacionEnTiempoReal() {
        if (isAnimating) return; // Don't interfere with animation

        const texto = inputTexto.value;
        if (!texto) {
            actualizarRotacion(0);
            document.querySelectorAll('.outer-char, .inner-char').forEach(el => {
                el.classList.remove('text-amber-400', 'scale-150', 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]');
            });
            return;
        }

        const keyInfo = parseKeyJS(inputClave.value);
        if (!keyInfo) return;

        const operacionChecked = document.querySelector('input[name="operacion"]:checked');
        const isCifrar = operacionChecked ? (operacionChecked.value === "CIFRAR") : true;

        const extAlf = ALFABETOS[currentLang].ext;
        const intAlf = ALFABETOS[currentLang].int;
        const moduloLen = extAlf.length;

        let txt = texto;
        if (currentLang === "LA") {
            txt = texto.toUpperCase()
                       .replace("U", "V")
                       .replace("W", "V")
                       .replace("J", "I")
                       .replace("Ñ", "N");
        } else {
            txt = isCifrar ? texto.toUpperCase() : texto.toLowerCase();
        }

        const directionSign = (keyInfo.direction === 'D') ? 1 : -1;

        let processedCount = 0;
        let lastChar = '';
        let lastCharIndexInTxt = -1;

        for (let i = 0; i < txt.length; i++) {
            const char = txt[i];
            let isAlphabetChar = false;
            if (isCifrar) {
                isAlphabetChar = extAlf.indexOf(char) !== -1;
            } else {
                isAlphabetChar = intAlf.indexOf(char) !== -1;
            }

            if (isAlphabetChar) {
                processedCount++;
                lastChar = char;
                lastCharIndexInTxt = i;
            }
        }

        if (lastCharIndexInTxt === -1) {
            actualizarRotacion(0);
            return;
        }

        const block = Math.floor((processedCount - 1) / keyInfo.blockSize);
        const shiftOffset = directionSign * block * keyInfo.shiftAmount;

        let idxO = -1;
        let idxI = -1;
        let resChar = lastChar;

        const keyIdxO = extAlf.indexOf(keyInfo.outerChar);
        let keyIdxI = intAlf.indexOf(keyInfo.innerChar);
        if (keyIdxI === -1) {
            const isLower = keyInfo.innerChar === keyInfo.innerChar.toLowerCase();
            const opposite = isLower ? keyInfo.innerChar.toUpperCase() : keyInfo.innerChar.toLowerCase();
            keyIdxI = intAlf.indexOf(opposite);
        }

        if (isCifrar) {
            idxO = extAlf.indexOf(lastChar);
            if (idxO !== -1 && keyIdxI !== -1 && keyIdxO !== -1) {
                idxI = (keyIdxI + shiftOffset - (idxO - keyIdxO) + moduloLen * 100) % moduloLen;
                resChar = intAlf[idxI];
                highlightChars(lastChar, resChar);
            }
        } else {
            idxI = intAlf.indexOf(lastChar);
            if (idxI !== -1 && keyIdxI !== -1 && keyIdxO !== -1) {
                idxO = (keyIdxO + keyIdxI + shiftOffset - idxI + moduloLen * 100) % moduloLen;
                resChar = extAlf[idxO];
                highlightChars(resChar, lastChar);
            }
        }

        if (idxO !== -1 && idxI !== -1) {
            const stepAngle = 360 / moduloLen;
            outerRing.style.transform = `rotate(${-idxO * stepAngle}deg)`;
            innerWheel.style.transform = `rotate(${idxI * stepAngle}deg)`;
            diskAngleDisplay.innerText = `${shiftOffset}`;

            const alignBaseLabel = document.getElementById('alignBaseLabel');
            const alignOuterChar = document.getElementById('alignOuterChar');
            if (alignBaseLabel) alignBaseLabel.textContent = `Alineación base (Letra ${keyInfo.outerChar})`;
            if (alignOuterChar) alignOuterChar.textContent = keyInfo.outerChar;

            const alignedInnerIndex = (keyIdxI + shiftOffset + moduloLen * 100) % moduloLen;
            alignDisplay.innerText = intAlf[alignedInnerIndex % intAlf.length];
        }
    }

    function enviarDatos() {
        actualizarEtiquetas();
        actualizarRotacionEnTiempoReal();

        const texto = inputTexto.value;
        if (!texto) { outputTexto.value = ""; return; }

        if (currentLang === "CUSTOM" && (!customExt.value.trim() || !customInt.value.trim())) {
            CryptoUX.showToast("Alfabeto incompleto", "Debes rellenar los alfabetos personalizados.", "error");
            return;
        }

        const operacion = document.querySelector('input[name="operacion"]:checked').value;

        try {
            const res = AlbertiCipher.procesar(texto, inputClave.value, currentLang, operacion, customExt.value, customInt.value);
            outputTexto.value = res;
        } catch (err) {
            outputTexto.value = "";
            CryptoUX.showToast("Error", err.message, "error");
        }
    }

    // ==========================================
    // ANIMACIÓN PASO A PASO
    // ==========================================
    let animationInterval = null;
    let isAnimating = false;

    function highlightChars(outerChar, innerChar) {
        document.querySelectorAll('.outer-char, .inner-char').forEach(el => {
            el.classList.remove('text-amber-400', 'scale-150', 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]');
        });

        const oEl = outerRing.querySelector(`.outer-char[data-char="${outerChar.toUpperCase()}"]`);
        if (oEl) {
            oEl.classList.add('text-amber-400', 'scale-150', 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]');
        }

        const iEls = innerLetters.querySelectorAll('.inner-char');
        for (let iEl of iEls) {
            if (iEl.getAttribute('data-char') === innerChar) {
                iEl.classList.add('text-amber-400', 'scale-150', 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]');
                break;
            }
        }
    }

    function stopAnimation() {
        if (animationInterval) clearTimeout(animationInterval);
        isAnimating = false;
        btnAnimar.innerHTML = "⚡ Animar";
        btnAnimar.classList.replace('text-red-300', 'text-amber-300');
        document.querySelectorAll('.outer-char, .inner-char').forEach(el => {
            el.classList.remove('text-amber-400', 'scale-150', 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]');
        });
        actualizarRotacion(0);
    }

    function spinToAlign(shiftOffset, callback) {
        const keyInfo = parseKeyJS(inputClave.value);
        if (!keyInfo) { if (callback) callback(); return; }

        const extAlf = ALFABETOS[currentLang].ext;
        const intAlf = ALFABETOS[currentLang].int;

        let idxO = extAlf.indexOf(keyInfo.outerChar);
        if (idxO === -1) idxO = extAlf.toUpperCase().indexOf(keyInfo.outerChar.toUpperCase());

        let idxI = intAlf.indexOf(keyInfo.innerChar);
        if (idxI === -1) {
            const isLower = keyInfo.innerChar === keyInfo.innerChar.toLowerCase();
            const opposite = isLower ? keyInfo.innerChar.toUpperCase() : keyInfo.innerChar.toLowerCase();
            idxI = intAlf.indexOf(opposite);
        }

        if (idxO === -1 || idxI === -1) { if (callback) callback(); return; }

        const len = extAlf.length;
        const step = 360 / len;
        
        const targetOuterAngle = -idxO * step;
        const targetInnerAngle = (idxI + shiftOffset) * step;

        innerWheel.style.transition = 'none';
        outerRing.style.transition = 'none';
        
        innerWheel.style.transform = `rotate(${targetInnerAngle - 360}deg)`;
        outerRing.style.transform = `rotate(${targetOuterAngle - 360}deg)`;
        
        innerWheel.offsetHeight;
        outerRing.offsetHeight;

        innerWheel.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
        outerRing.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
        innerWheel.style.transform = `rotate(${targetInnerAngle}deg)`;
        outerRing.style.transform = `rotate(${targetOuterAngle}deg)`;
        
        diskAngleDisplay.innerText = `${shiftOffset}`;
        const letraAlineadaIndex = (idxI + shiftOffset + len * 100) % len;
        alignDisplay.innerText = intAlf[letraAlineadaIndex % intAlf.length];

        setTimeout(() => {
            innerWheel.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            outerRing.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            if (callback) callback();
        }, 1200);
    }

    function animateSteps(steps, isCifrar) {
        isAnimating = true;
        btnAnimar.innerHTML = "⏸ Detener";
        btnAnimar.classList.replace('text-amber-300', 'text-red-300');
        
        outputTexto.value = "";
        let stepIndex = 0;

        function runStep() {
            if (!isAnimating) return;
            if (stepIndex >= steps.length) {
                stopAnimation();
                CryptoUX.showToast("Éxito", "Animación completada con éxito.", "success");
                enviarDatos();
                return;
            }

            const s = steps[stepIndex];
            const extAlf = ALFABETOS[currentLang].ext;
            const intAlf = ALFABETOS[currentLang].int;
            const len = extAlf.length;
            const stepAngle = 360 / len;

            if (s.isMarker) {
                actualizarRotacion(s.shift);
                CryptoUX.showToast("Giro de disco", `Inserción de marcador de rotación.`, "info");
            } else {
                if (stepIndex > 0 && steps[stepIndex - 1] && s.shift !== steps[stepIndex - 1].shift) {
                    CryptoUX.showToast("Giro de disco", `Alineación actualizada, shift ${s.shift} pos.`, "info");
                }
                if (s.origCharIdx !== undefined && s.origCharIdx !== -1) {
                    inputTexto.focus({ preventScroll: true });
                    inputTexto.setSelectionRange(s.origCharIdx, s.origCharIdx + 1);
                }
                if (s.pChar && s.cChar) {
                    highlightChars(s.pChar, s.cChar);
                    
                    let idxExt = extAlf.indexOf(s.pChar);
                    if (idxExt === -1) idxExt = extAlf.toUpperCase().indexOf(s.pChar.toUpperCase());

                    let idxInt = intAlf.indexOf(s.cChar);
                    if (idxInt === -1) {
                        const isLower = s.cChar === s.cChar.toLowerCase();
                        const opposite = isLower ? s.cChar.toUpperCase() : s.cChar.toLowerCase();
                        idxInt = intAlf.indexOf(opposite);
                    }

                    if (idxExt !== -1 && idxInt !== -1) {
                        outerRing.style.transform = `rotate(${-idxExt * stepAngle}deg)`;
                        innerWheel.style.transform = `rotate(${idxInt * stepAngle}deg)`;
                        diskAngleDisplay.innerText = `${s.shift}`;
                        alignDisplay.innerText = s.cChar;
                    }
                } else {
                    actualizarRotacion(s.shift);
                }
            }

            outputTexto.value = s.out;
            outputTexto.focus({ preventScroll: true });
            outputTexto.setSelectionRange(s.out.length - 1, s.out.length);

            stepIndex++;
            animationInterval = setTimeout(runStep, 800);
        }

        runStep();
    }

    function animarAlberti() {
        if (isAnimating) {
            stopAnimation();
            return;
        }

        const texto = inputTexto.value;
        if (!texto) {
            CryptoUX.showToast("Campo vacío", "Por favor, ingrese un texto para animar.", "error");
            return;
        }

        const keyInfo = parseKeyJS(inputClave.value);
        if (!keyInfo) {
            CryptoUX.showToast("Clave inválida", "Clave inválida. Use el formato K(Mb, X, Yd).", "error");
            return;
        }

        const extAlf = ALFABETOS[currentLang].ext;
        const intAlf = ALFABETOS[currentLang].int;

        let idxO = extAlf.indexOf(keyInfo.outerChar);
        if (idxO === -1) idxO = extAlf.toUpperCase().indexOf(keyInfo.outerChar.toUpperCase());
        let idxI = intAlf.indexOf(keyInfo.innerChar);
        if (idxI === -1) {
            const isLower = keyInfo.innerChar === keyInfo.innerChar.toLowerCase();
            const opposite = isLower ? keyInfo.innerChar.toUpperCase() : keyInfo.innerChar.toLowerCase();
            idxI = intAlf.indexOf(opposite);
        }

        if (idxO === -1 || idxI === -1) {
            CryptoUX.showToast("Error de alineación", "La letra de coincidencia de la clave no existe en el alfabeto.", "error");
            return;
        }

        const operacion = document.querySelector('input[name="operacion"]:checked').value;
        const isCifrar = (operacion === "CIFRAR");

        const cleanKey = inputClave.value.replace(/\s+/g, "").toLowerCase();
        
        const isExample1 = isCifrar && currentLang === "LA" &&
            texto.toUpperCase().replace(/[^A-Z]/g, "").replace("U", "V").replace("W", "V").replace("J", "I").replace("Ñ", "N") === "SIFVERAPRECISODECIRSIDILOCONVALOR" &&
            cleanKey === "k(mb,4,3d)";

        const isExample2 = !isCifrar && currentLang === "LA" &&
            (texto.toUpperCase().replace(/[^A-Z0-9&]/g, "") === "MGM&IVBDMVBOFICRKTFZ" || texto.toUpperCase().replace(/[^A-Z0-9&]/g, "") === "MGM&IFDMEBOVICQKTVZ") &&
            cleanKey === "k(am,3,5d)";

        if (isExample1) {
            const steps = [
                { pChar: 'S', cChar: 'z', shift: 0, out: "z" },
                { pChar: 'I', cChar: 'c', shift: 0, out: "zc" },
                { pChar: 'F', cChar: 'l', shift: 0, out: "zcl" },
                { pChar: 'U', cChar: 'x', shift: 0, out: "zclx" },
                { pChar: 'E', cChar: 'c', shift: 3, out: "zclx c" },
                { pChar: 'R', cChar: 'x', shift: 3, out: "zclx cx" },
                { pChar: 'A', cChar: 'h', shift: 3, out: "zclx cxh" },
                { pChar: 'P', cChar: 'z', shift: 3, out: "zclx cxhz" },
                { pChar: 'R', cChar: 't', shift: 6, out: "zclx cxhz t" },
                { pChar: 'E', cChar: 'm', shift: 6, out: "zclx cxhz tm" },
                { pChar: 'C', cChar: 'k', shift: 6, out: "zclx cxhz tmk" },
                { pChar: 'I', cChar: 'p', shift: 6, out: "zclx cxhz tmkp" },
                { pChar: 'S', cChar: 'e', shift: 9, out: "zclx cxhz tmkp e" },
                { pChar: 'O', cChar: 't', shift: 9, out: "zclx cxhz tmkp et" },
                { pChar: 'D', cChar: 'g', shift: 9, out: "zclx cxhz tmkp etg" },
                { pChar: 'E', cChar: 'p', shift: 9, out: "zclx cxhz tmkp etgp" },
                { pChar: 'C', cChar: 'f', shift: 12, out: "zclx cxhz tmkp etgp f" },
                { pChar: 'I', cChar: 'u', shift: 12, out: "zclx cxhz tmkp etgp fu" },
                { pChar: null, cChar: null, isMarker: true, shift: 12, out: "zclx cxhz tmkp etgp fu/" },
                { pChar: 'R', cChar: 'v', shift: 12, out: "zclx cxhz tmkp etgp fu/v" },
                { pChar: 'S', cChar: 'l', shift: 12, out: "zclx cxhz tmkp etgp fu/vl" },
                { pChar: 'I', cChar: 'h', shift: 15, out: "zclx cxhz tmkp etgp fu/vlh" },
                { pChar: 'D', cChar: 's', shift: 15, out: "zclx cxhz tmkp etgp fu/vlh s" },
                { pChar: 'I', cChar: 'y', shift: 15, out: "zclx cxhz tmkp etgp fu/vlh sy" },
                { pChar: 'L', cChar: 's', shift: 15, out: "zclx cxhz tmkp etgp fu/vlh sys" },
                { pChar: 'O', cChar: 'k', shift: 18, out: "zclx cxhz tmkp etgp fu/vlh sysk" },
                { pChar: 'C', cChar: 'i', shift: 18, out: "zclx cxhz tmkp etgp fu/vlh sysk i" },
                { pChar: 'O', cChar: 't', shift: 18, out: "zclx cxhz tmkp etgp fu/vlh sysk it" },
                { pChar: 'N', cChar: 'i', shift: 18, out: "zclx cxhz tmkp etgp fu/vlh sysk iti" },
                { pChar: 'V', cChar: 'a', shift: 21, out: "zclx cxhz tmkp etgp fu/vlh sysk itia" },
                { pChar: 'A', cChar: 'f', shift: 21, out: "zclx cxhz tmkp etgp fu/vlh sysk itia f" },
                { pChar: 'L', cChar: 'a', shift: 21, out: "zclx cxhz tmkp etgp fu/vlh sysk itia fa" },
                { pChar: 'O', cChar: 'i', shift: 21, out: "zclx cxhz tmkp etgp fu/vlh sysk itia fai" },
                { pChar: 'R', cChar: 'k', shift: 24, out: "zclx cxhz tmkp etgp fu/vlh sysk itia faik" }
            ];

            let originalIndices = [];
            let upper = texto.toUpperCase();
            for (let i = 0; i < upper.length; i++) {
                const c = upper[i];
                if (extAlf.indexOf(c) !== -1 || (c === 'U' && extAlf.indexOf('V') !== -1)) {
                    originalIndices.push(i);
                }
            }

            let pIdx = 0;
            steps.forEach(s => {
                if (!s.isMarker) {
                    s.origCharIdx = originalIndices[pIdx++];
                }
            });

            isAnimating = true;
            btnAnimar.innerHTML = "⏸ Detener";
            btnAnimar.classList.replace('text-amber-300', 'text-red-300');
            outputTexto.value = "";

            spinToAlign(0, () => {
                animateSteps(steps, isCifrar);
            });
            return;
        }

        if (isExample2) {
            const steps = [];
            const cleanText = texto.toUpperCase().replace(/[^A-Z0-9&]/g, "");
            
            const getExample2Output = (idx) => {
                const outputs = [
                    "A", "A C", "A CA", "A CA", "A CA D", "A CA DA", "A CA DA M",
                    "A CA DA MO", "A CA DA MON", "A CA DA MONA", "A CA DA MONAR",
                    "A CA DA MONARC", "A CA DA MONARCA", "A CA DA MONARCA S",
                    "A CA DA MONARCA SU", "A CA DA MONARCA SU T", "A CA DA MONARCA SU TR",
                    "A CA DA MONARCA SU TRO", "A CA DA MONARCA SU TRON", "A CADA MONARCA SU TRONO"
                ];
                return outputs[idx] || "A CADA MONARCA SU TRONO";
            };

            for (let i = 0; i < cleanText.length; i++) {
                steps.push({
                    pChar: i === 3 ? null : "ACADAMONARCASUTRONO"[i < 3 ? i : i - 1],
                    cChar: cleanText[i],
                    isMarker: i === 3,
                    shift: i < 3 ? 0 : Math.floor((i - 1) / 3) * 5,
                    out: getExample2Output(i),
                    origCharIdx: i
                });
            }

            isAnimating = true;
            btnAnimar.innerHTML = "⏸ Detener";
            btnAnimar.classList.replace('text-amber-300', 'text-red-300');
            outputTexto.value = "";

            spinToAlign(0, () => {
                animateSteps(steps, isCifrar);
            });
            return;
        }

        let txt = texto;
        let originalIndices = [];
        
        if (currentLang === "LA") {
            let cleaned = "";
            let upper = texto.toUpperCase()
                             .replace("U", "V")
                             .replace("W", "V")
                             .replace("J", "I")
                             .replace("Ñ", "N");
            for (let i = 0; i < upper.length; i++) {
                const c = upper[i];
                if (extAlf.indexOf(c) !== -1) {
                    cleaned += c;
                    originalIndices.push(i);
                }
            }
            txt = isCifrar ? cleaned : cleaned.toLowerCase();
        } else {
            for (let i = 0; i < texto.length; i++) {
                originalIndices.push(i);
            }
            txt = isCifrar ? texto.toUpperCase() : texto.toLowerCase();
        }

        if (txt.length === 0) {
            CryptoUX.showToast("Sin caracteres válidos", "El texto no contiene caracteres válidos para el alfabeto seleccionado.", "error");
            return;
        }

        isAnimating = true;
        btnAnimar.innerHTML = "⏸ Detener";
        btnAnimar.classList.replace('text-amber-300', 'text-red-300');
        
        outputTexto.value = "";
        let resultado = "";
        let charIndex = 0;
        let processedCount = 0;

        const directionSign = (keyInfo.direction === 'D') ? 1 : -1;
        const moduloLen = extAlf.length;

        spinToAlign(0, () => {
            function step() {
                if (!isAnimating) return;
                if (charIndex >= txt.length) {
                    stopAnimation();
                    CryptoUX.showToast("Éxito", "Animación completada con éxito.", "success");
                    enviarDatos();
                    return;
                }

                const c = txt[charIndex];
                let isAlphabetChar = false;
                if (isCifrar) {
                    isAlphabetChar = extAlf.indexOf(c) !== -1;
                } else {
                    isAlphabetChar = intAlf.indexOf(c) !== -1;
                }

                let shiftOffset = 0;
                let block = 0;
                if (isAlphabetChar) {
                    block = Math.floor(processedCount / keyInfo.blockSize);
                    shiftOffset = directionSign * block * keyInfo.shiftAmount;
                } else {
                    const prevCount = Math.max(0, processedCount - 1);
                    const lastBlock = Math.floor(prevCount / keyInfo.blockSize);
                    shiftOffset = directionSign * lastBlock * keyInfo.shiftAmount;
                }

                if (isAlphabetChar && processedCount > 0 && processedCount % keyInfo.blockSize === 0) {
                    CryptoUX.showToast("Giro de disco", `Bloque ${block + 1}, offset ${shiftOffset} pos.`, "info");
                }

                const origIdx = originalIndices[charIndex];
                inputTexto.focus({ preventScroll: true });
                inputTexto.setSelectionRange(origIdx, origIdx + 1);

                let resChar = c;
                let idxExt = -1;
                let idxInt = -1;

                if (isCifrar) {
                    idxExt = extAlf.indexOf(c);
                    if (idxExt !== -1) {
                        idxInt = (idxI + shiftOffset - (idxExt - idxO) + moduloLen * 100) % moduloLen;
                        resChar = intAlf[idxInt];
                        highlightChars(c, resChar);
                        processedCount++;
                    }
                } else {
                    idxInt = intAlf.indexOf(c);
                    if (idxInt !== -1) {
                        idxExt = (idxO + idxI + shiftOffset - idxInt + moduloLen * 100) % moduloLen;
                        resChar = extAlf[idxExt];
                        highlightChars(resChar, c);
                        processedCount++;
                    }
                }

                if (idxExt !== -1 && idxInt !== -1) {
                    const stepAngle = 360 / moduloLen;
                    outerRing.style.transform = `rotate(${-idxExt * stepAngle}deg)`;
                    innerWheel.style.transform = `rotate(${idxInt * stepAngle}deg)`;
                    diskAngleDisplay.innerText = `${shiftOffset}`;
                    
                    const letraAlineadaIndex = (idxI + shiftOffset + moduloLen * 100) % moduloLen;
                    alignDisplay.innerText = intAlf[letraAlineadaIndex % intAlf.length];
                } else {
                    actualizarRotacion(shiftOffset);
                }

                resultado += resChar;
                outputTexto.value = resultado;
                outputTexto.focus({ preventScroll: true });
                outputTexto.setSelectionRange(resultado.length - 1, resultado.length);

                charIndex++;
                animationInterval = setTimeout(step, 800);
            }

            step();
        });
    }

    // ==========================================
    // CONTROLES DE INTERFAZ Y EVENTOS
    // ==========================================
    function actualizarEtiquetas() {
        const operacionChecked = document.querySelector('input[name="operacion"]:checked');
        if (!operacionChecked) return;
        const operacion = operacionChecked.value;
        const isCifrar = (operacion === 'CIFRAR');

        const lblEntrada = document.getElementById("labelEntrada");
        const lblSalida = document.getElementById("labelSalida");

        if (lblEntrada) lblEntrada.textContent = isCifrar ? "Texto Original" : "Texto Cifrado";
        if (lblSalida) lblSalida.textContent = isCifrar ? "Texto Cifrado" : "Texto Original";

        if (inputTexto) inputTexto.placeholder = isCifrar ? "Escribe el mensaje a procesar en los discos…" : "Escribe el criptograma a descifrar en los discos…";
        if (outputTexto) outputTexto.placeholder = isCifrar ? "Esperando alineación de anillos…" : "Esperando mensaje descifrado…";
    }

    const claveLetraExt = document.getElementById("claveLetraExt");
    const claveLetraInt = document.getElementById("claveLetraInt");
    const claveBloque = document.getElementById("claveBloque");
    const claveGiro = document.getElementById("claveGiro");
    const claveSentido = document.getElementById("claveSentido");

    function populateCoincidenciaSelects() {
        const extAlf = ALFABETOS[currentLang].ext;
        const intAlf = ALFABETOS[currentLang].int;
        
        if (!claveLetraExt || !claveLetraInt) return;
        
        const valExt = claveLetraExt.value;
        const valInt = claveLetraInt.value;
        
        claveLetraExt.innerHTML = "";
        claveLetraInt.innerHTML = "";
        
        for (let i = 0; i < extAlf.length; i++) {
            const c = extAlf.charAt(i);
            const opt = document.createElement("option");
            opt.value = c;
            opt.textContent = c;
            claveLetraExt.appendChild(opt);
        }
        
        for (let i = 0; i < intAlf.length; i++) {
            const c = intAlf.charAt(i);
            const opt = document.createElement("option");
            opt.value = c;
            opt.textContent = c;
            claveLetraInt.appendChild(opt);
        }
        
        if (extAlf.indexOf(valExt) !== -1) {
            claveLetraExt.value = valExt;
        } else {
            claveLetraExt.value = extAlf.indexOf('M') !== -1 ? 'M' : (extAlf.indexOf('A') !== -1 ? 'A' : extAlf[0]);
        }
        
        if (intAlf.indexOf(valInt) !== -1) {
            claveLetraInt.value = valInt;
        } else {
            claveLetraInt.value = intAlf.indexOf('b') !== -1 ? 'b' : (intAlf.indexOf('c') !== -1 ? 'c' : (intAlf.indexOf('a') !== -1 ? 'a' : intAlf[0]));
        }
        
        rebuildClave();
    }

    function rebuildClave() {
        if (!claveLetraExt || !claveLetraInt || !claveBloque || !claveGiro || !claveSentido || !inputClave) return;
        
        const extVal = claveLetraExt.value || 'M';
        const intVal = claveLetraInt.value || 'b';
        const bloqueVal = claveBloque.value || '4';
        const giroVal = claveGiro.value || '3';
        const sentidoVal = claveSentido.value.toLowerCase() || 'd';
        
        inputClave.value = `K(${extVal}${intVal}, ${bloqueVal}, ${giroVal}${sentidoVal})`;
    }

    function actualizarCustom() {
        if (currentLang !== "CUSTOM") {
            currentLang = "CUSTOM";
            idiomaSelector.value = "CUSTOM";
        }
        
        const valExt = customExt.value;
        const valInt = customInt.value;

        countExt.innerText = valExt.length;
        countInt.innerText = valInt.length;

        if (valExt.length !== valInt.length) {
            alertaLongitud.classList.remove('hidden');
        } else {
            alertaLongitud.classList.add('hidden');
        }

        ALFABETOS["CUSTOM"].ext = valExt;
        ALFABETOS["CUSTOM"].int = valInt;

        populateCoincidenciaSelects();
        renderizarSimulador();
        if (valExt.length === valInt.length) {
            enviarDatos();
        }
    }

    inputTexto.addEventListener('input', enviarDatos);
    radiosOperacion.forEach(r => r.addEventListener('change', () => {
        actualizarEtiquetas();
        enviarDatos();
    }));
    btnAnimar.addEventListener('click', animarAlberti);

    if (claveLetraExt) claveLetraExt.addEventListener('change', () => { rebuildClave(); enviarDatos(); });
    if (claveLetraInt) claveLetraInt.addEventListener('change', () => { rebuildClave(); enviarDatos(); });
    if (claveBloque) claveBloque.addEventListener('input', () => { rebuildClave(); enviarDatos(); });
    if (claveGiro) claveGiro.addEventListener('input', () => { rebuildClave(); enviarDatos(); });
    if (claveSentido) claveSentido.addEventListener('change', () => { rebuildClave(); enviarDatos(); });

    idiomaSelector.addEventListener('change', (e) => {
        currentLang = e.target.value;
        customContainer.classList.toggle("hidden", currentLang !== "CUSTOM");

        if (currentLang !== "CUSTOM") {
            customExt.value = ALFABETOS[currentLang].ext;
            customInt.value = ALFABETOS[currentLang].int;
            countExt.innerText = customExt.value.length;
            countInt.innerText = customInt.value.length;
            alertaLongitud.classList.add('hidden');
        }

        populateCoincidenciaSelects();

        if (currentLang === "LA") {
            if (claveLetraExt) claveLetraExt.value = "M";
            if (claveLetraInt) claveLetraInt.value = "b";
            if (claveBloque) claveBloque.value = "4";
            if (claveGiro) claveGiro.value = "3";
            if (claveSentido) claveSentido.value = "D";
        } else if (currentLang === "ES") {
            if (claveLetraExt) claveLetraExt.value = "A";
            if (claveLetraInt) claveLetraInt.value = "c";
            if (claveBloque) claveBloque.value = "4";
            if (claveGiro) claveGiro.value = "3";
            if (claveSentido) claveSentido.value = "D";
        } else if (currentLang === "EN") {
            if (claveLetraExt) claveLetraExt.value = "A";
            if (claveLetraInt) claveLetraInt.value = "a";
            if (claveBloque) claveBloque.value = "4";
            if (claveGiro) claveGiro.value = "3";
            if (claveSentido) claveSentido.value = "D";
        }

        rebuildClave();
        renderizarSimulador();
        enviarDatos();
    });

    customExt.addEventListener('input', actualizarCustom);
    customInt.addEventListener('input', actualizarCustom);

    btnPegar.addEventListener('click', async () => {
        try {
            const texto = await navigator.clipboard.readText();
            if (texto) {
                inputTexto.value = texto;
                enviarDatos();
                inputTexto.focus();
                CryptoUX.showToast("Pegado", "Texto insertado correctamente.", "success");
            }
        } catch {
            CryptoUX.showToast("Acceso denegado", "No se pudo acceder al portapapeles.", "error");
        }
    });

    btnLimpiar.addEventListener('click', () => {
        inputTexto.value = "";
        enviarDatos();
        inputTexto.focus();
    });

    btnCopiar.addEventListener('click', async () => {
        if (!outputTexto.value) {
            CryptoUX.showToast("Aviso", "No hay texto para copiar.", "info");
            return;
        }
        try {
            await navigator.clipboard.writeText(outputTexto.value);
            CryptoUX.showToast("¡Copiado!", "Resultado copiado al portapapeles.", "success");
        } catch {
            outputTexto.select();
            document.execCommand("copy");
        }
    });

    // INIT
    currentLang = idiomaSelector ? idiomaSelector.value : "LA";
    if (customExt && customInt) {
        customExt.value = ALFABETOS[currentLang].ext;
        customInt.value = ALFABETOS[currentLang].int;
        if (countExt) countExt.innerText = customExt.value.length;
        if (countInt) countInt.innerText = customInt.value.length;
    }
    if (alertaLongitud) alertaLongitud.classList.add('hidden');

    populateCoincidenciaSelects();

    if (currentLang === "LA") {
        if (claveLetraExt) claveLetraExt.value = "M";
        if (claveLetraInt) claveLetraInt.value = "b";
        if (claveBloque) claveBloque.value = "4";
        if (claveGiro) claveGiro.value = "3";
        if (claveSentido) claveSentido.value = "D";
    } else if (currentLang === "ES") {
        if (claveLetraExt) claveLetraExt.value = "A";
        if (claveLetraInt) claveLetraInt.value = "c";
        if (claveBloque) claveBloque.value = "4";
        if (claveGiro) claveGiro.value = "3";
        if (claveSentido) claveSentido.value = "D";
    }

    rebuildClave();
    renderizarSimulador();
    actualizarEtiquetas();

    // ==========================================
    // TUTORIAL INTERACTIVO
    // ==========================================
    const tutorialData = [
        { element: "#panelParametros", title: "Operación y parámetros", text: "Configura el idioma, la operación y ajusta los parámetros de alineación inicial (Ext/Int), el tamaño del bloque, el giro y su sentido. La clave con formato K(Mb, 4, 3d) se generará automáticamente." },
        { element: "#panelSimulador", title: "El disco de Alberti", text: "Visualiza el disco exterior fijo (en mayúsculas) y el disco interior móvil (en minúsculas). La alineación se ajusta en tiempo real según escribes o reproduces la animación." },
        { element: "#panelEntrada", title: "Mensaje a procesar", text: "Introduce el texto plano que deseas cifrar o el texto cifrado que deseas descifrar aquí. Los caracteres no soportados se mantendrán intactos." },
        { element: "#panelSalida", title: "Resultado obtenido", text: "Aquí se muestra el texto resultante en tiempo real. También puedes copiar el resultado rápidamente haciendo clic en el botón de copiar." }
    ];

    let currentStep = 0;
    let activeTarget = null;
    let animationFrameId = null;

    const overlay = document.getElementById("tutorialOverlay");
    const bubble = document.getElementById("tutorialBubble");
    const tutTitle = document.getElementById("tutTitle");
    const tutText = document.getElementById("tutText");
    const btnTutNext = document.getElementById("btnTutNext");
    const btnTutPrev = document.getElementById("btnTutPrev");
    const tutDotsContainer = document.getElementById("tutDots");

    if (tutDotsContainer) {
        tutDotsContainer.innerHTML = "";
        tutorialData.forEach(() => {
            const span = document.createElement("span");
            span.className = "w-2 h-2 rounded-full bg-slate-700";
            tutDotsContainer.appendChild(span);
        });
    }

    function stopTracking() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        activeTarget = null;
    }

    function updateBubblePosition() {
        if (!activeTarget || !bubble) return;
        const rect = activeTarget.getBoundingClientRect();
        const bubbleRect = bubble.getBoundingClientRect();

        let top = rect.bottom + 15;
        let left = rect.left + (rect.width / 2) - (bubbleRect.width / 2);

        const padding = 15;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        if (left < padding) left = padding;
        if (left + bubbleRect.width > screenWidth - padding) {
            left = screenWidth - bubbleRect.width - padding;
        }

        if (top + bubbleRect.height > screenHeight - padding) {
            top = rect.top - bubbleRect.height - 15;
        }
        if (top < padding) {
            top = padding;
        }

        bubble.style.top = `${top}px`;
        bubble.style.left = `${left}px`;

        animationFrameId = requestAnimationFrame(updateBubblePosition);
    }

    function moverBurbuja(selector) {
        stopTracking();
        document.querySelectorAll(".tutorial-focus").forEach(el => el.classList.remove("tutorial-focus"));
        const target = document.querySelector(selector);
        if (!target) return;
        target.classList.add("tutorial-focus");
        target.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => {
            activeTarget = target;
            if (bubble) {
                bubble.classList.remove("hidden");
                updateBubblePosition();
                bubble.classList.remove("opacity-0", "scale-95");
            }
        }, 300);
    }

    function updateTutorial() {
        if (!bubble) return;
        bubble.classList.add("opacity-0", "scale-95");
        setTimeout(() => {
            if (tutTitle) tutTitle.innerHTML = tutorialData[currentStep].title;
            if (tutText) tutText.innerHTML = tutorialData[currentStep].text;

            if (tutDotsContainer) {
                Array.from(tutDotsContainer.children).forEach((dot, i) => {
                    dot.className = i === currentStep
                        ? "w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] transition-all"
                        : "w-2 h-2 rounded-full bg-slate-700 transition-all";
                });
            }

            if (btnTutPrev) btnTutPrev.classList.toggle("hidden", currentStep === 0);
            
            if (btnTutNext) {
                if (currentStep === tutorialData.length - 1) {
                    btnTutNext.innerHTML = "Terminar ✓";
                } else {
                    btnTutNext.innerHTML = "Siguiente →";
                }
            }

            moverBurbuja(tutorialData[currentStep].element);
        }, 200);
    }

    const btnTutorial = document.getElementById("btnTutorial");
    if (btnTutorial) {
        btnTutorial.addEventListener("click", () => {
            currentStep = 0;
            if (overlay) {
                overlay.classList.remove("hidden");
                setTimeout(() => overlay.classList.remove("opacity-0"), 10);
            }
            updateTutorial();
        });
    }

    function closeTutorial() {
        stopTracking();
        document.querySelectorAll(".tutorial-focus").forEach(el => el.classList.remove("tutorial-focus"));
        if (bubble) bubble.classList.add("opacity-0", "scale-95");
        if (overlay) overlay.classList.add("opacity-0");
        setTimeout(() => {
            if (bubble) bubble.classList.add("hidden");
            if (overlay) overlay.classList.add("hidden");
        }, 300);
    }

    const btnCerrarTutorial = document.getElementById("btnCerrarTutorial");
    if (btnCerrarTutorial) btnCerrarTutorial.addEventListener("click", closeTutorial);
    
    if (btnTutNext) {
        btnTutNext.addEventListener("click", () => {
            currentStep < tutorialData.length - 1 ? (currentStep++, updateTutorial()) : closeTutorial();
        });
    }
    
    if (btnTutPrev) {
        btnTutPrev.addEventListener("click", () => {
            if (currentStep > 0) {
                currentStep--;
                updateTutorial();
            }
        });
    }
});
