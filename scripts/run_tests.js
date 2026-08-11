const fs = require('fs');
const path = require('path');
const vm = require('vm');

const workspacePath = 'c:/Users/diego/Documents/VSCODE/classic_ciphers';

const files = [
    'cesar.js', 'rot5.js', 'rot13.js', 'rot47.js', 'escitala.js', 'atbash.js',
    'polybios.js', 'vigenere.js', 'alberti.js', 'playfair.js', 'hill.js',
    'columnas.js', 'filas.js', 'grupos.js', 'series.js'
];

const context = {
    console: console,
    Math: Math,
    parseInt: parseInt,
    parseFloat: parseFloat,
    Number: Number,
    isNaN: isNaN,
    String: String,
    Array: Array,
    Object: Object
};
context.window = context;
context.global = context;
vm.createContext(context);

// Run each cipher script inside the VM context
files.forEach(file => {
    const fullPath = path.join(workspacePath, 'js', 'ciphers', file);
    const code = fs.readFileSync(fullPath, 'utf8');
    vm.runInContext(code, context, { filename: file });
});

// Check that namespacing worked
if (!context.CriptoSuite) {
    console.error('FAIL: window.CriptoSuite namespace was not defined.');
    process.exit(1);
}

// Extract ciphers from namespace
const {
    CesarCipher, Rot5Cipher, Rot13Cipher, Rot47Cipher, AtbashCipher, PolybiosCipher,
    VigenereCipher, AlbertiCipher, PlayfairCipher, HillCipher, EscitalaCipher,
    ColumnasCipher, FilasCipher, GruposCipher, SeriesCipher
} = context.CriptoSuite;

const testSuite = [];

function addTest(cipherName, testName, fn) {
    testSuite.push({ cipherName, testName, fn });
}

// 1. Cesar Cipher Tests
addTest("César", "Cifrar con alfabeto estándar (ES) y desplazamiento positivo", () => {
    const res = CesarCipher.procesar("HOLA", 3, "CIFRAR", "ES");
    if (res !== "KRÑD") throw new Error(`Esperado: KRÑD, Obtenido: ${res}`);
});
addTest("César", "Descifrar con alfabeto estándar (ES) y desplazamiento positivo", () => {
    const res = CesarCipher.procesar("KRÑD", 3, "DESCIFRAR", "ES");
    if (res !== "HOLA") throw new Error(`Esperado: HOLA, Obtenido: ${res}`);
});
addTest("César", "Cifrar con alfabeto personalizado", () => {
    const res = CesarCipher.procesar("HOLA", 3, "CIFRAR", "CUSTOM", "ABCDEFGH");
    if (res !== "COLD") throw new Error(`Esperado: COLD, Obtenido: ${res}`);
});

// 2. ROT-5 Tests
addTest("ROT-5", "Cifrar dígitos secuenciales", () => {
    const res = Rot5Cipher.procesar("0123456789");
    if (res !== "5678901234") throw new Error(`Esperado: 5678901234, Obtenido: ${res}`);
});
addTest("ROT-5", "Ignorar letras en ROT-5", () => {
    const res = Rot5Cipher.procesar("ABC 123");
    if (res !== "ABC 678") throw new Error(`Esperado: ABC 678, Obtenido: ${res}`);
});

// 3. ROT-13 Tests
addTest("ROT-13", "Cifrar mensaje estándar", () => {
    const res = Rot13Cipher.procesar("HELLO world");
    if (res !== "URYYB jbeyq") throw new Error(`Esperado: URYYB jbeyq, Obtenido: ${res}`);
});
addTest("ROT-13", "ROT-13 es involutivo (doble cifrado devuelve original)", () => {
    const res = Rot13Cipher.procesar(Rot13Cipher.procesar("Criptografia"));
    if (res !== "Criptografia") throw new Error(`Esperado: Criptografia, Obtenido: ${res}`);
});

// 4. ROT-47 Tests
addTest("ROT-47", "Cifrar caracteres y números", () => {
    const res = Rot47Cipher.procesar("Hello World 123!");
    if (res !== "w6==@ (@C=5 `abP") throw new Error(`Esperado: w6==@ (@C=5 \`abP, Obtenido: ${res}`);
});

// 5. Atbash Tests
addTest("Atbash", "Cifrar alfabeto estándar ES", () => {
    const res = AtbashCipher.procesar("HOLA", "ES");
    if (res !== "SLOZ") throw new Error(`Esperado: SLOZ, Obtenido: ${res}`);
});

// 6. Polybios Tests
addTest("Polybios", "Cifrar letras en coordenadas de matriz 5x5 (ES)", () => {
    const res = PolybiosCipher.procesar("HOLA", "CIFRAR", "ES");
    if (res !== "23 34 31 11") throw new Error(`Esperado: 23 34 31 11, Obtenido: ${res}`);
});
addTest("Polybios", "Descifrar coordenadas de matriz 5x5 (ES)", () => {
    const res = PolybiosCipher.procesar("23 34 31 11", "DESCIFRAR", "ES");
    if (res !== "HOLA") throw new Error(`Esperado: HOLA, Obtenido: ${res}`);
});

// 7. Vigenère Tests
addTest("Vigenère", "Cifrar con clave repetida (ES)", () => {
    const res = VigenereCipher.procesar("HOLA", "KEY", "CIFRAR", "ES");
    if (res !== "QSJK") throw new Error(`Esperado: QSJK, Obtenido: ${res}`);
});
addTest("Vigenère", "Descifrar con clave repetida (ES)", () => {
    const res = VigenereCipher.procesar("QSJK", "KEY", "DESCIFRAR", "ES");
    if (res !== "HOLA") throw new Error(`Esperado: HOLA, Obtenido: ${res}`);
});

// 8. Alberti Tests
addTest("Alberti", "Cifrar con periodo fijo", () => {
    const res = AlbertiCipher.procesar("SIFUERAPRECISODECIRSIDILOCONVALOR", "K(Mb,4,3d)", "LA", "CIFRAR");
    if (res !== "zclx cxhz tmkp etgp fu/vlh sysk itia faik") throw new Error(`Esperado: zclx cxhz tmkp etgp fu/vlh sysk itia faik, Obtenido: ${res}`);
});

// 9. Playfair Tests
addTest("Playfair", "Cifrar texto y formatear dígrafos", () => {
    const res = PlayfairCipher.procesar("HOLA", "CLAVE", "CIFRAR", "ES");
    if (!res) throw new Error("No se obtuvo resultado de Playfair.");
});

// 10. Hill Tests
addTest("Hill", "Cifrar con matriz 3x3 invertible", () => {
    const res = HillCipher.procesar("HIL", "FORTALEZA", "CIFRAR", "ES");
    if (!res) throw new Error("No se obtuvo resultado de Hill.");
});
addTest("Hill", "Descifrar con matriz 3x3 invertible", () => {
    const cifrado = HillCipher.procesar("HIL", "FORTALEZA", "CIFRAR", "ES");
    const res = HillCipher.procesar(cifrado, "FORTALEZA", "DESCIFRAR", "ES");
    if (res !== "HIL") throw new Error(`Esperado: HIL, Obtenido: ${res}`);
});

// 11. Escítala Tests
addTest("Escítala", "Cifrar con 4 caras", () => {
    const res = EscitalaCipher.procesar("ESCITALA", 4, "CIFRAR");
    if (res !== "ECTLSIAA") throw new Error(`Esperado: ECTLSIAA, Obtenido: ${res}`);
});
addTest("Escítala", "Descifrar con 4 caras", () => {
    const res = EscitalaCipher.procesar("ECTLSIAA", 4, "DESCIFRAR");
    if (res !== "ESCITALA") throw new Error(`Esperado: ESCITALA, Obtenido: ${res}`);
});

// 12. Columnas Tests
addTest("Columnas", "Cifrar simple con 3 columnas", () => {
    const res = ColumnasCipher.procesar("CRIPTO", "3", "CIFRAR", "SIMPLE", "ES");
    if (res !== "CPRTIO") throw new Error(`Esperado: CPRTIO, Obtenido: ${res}`);
});
addTest("Columnas", "Descifrar simple con 3 columnas", () => {
    const res = ColumnasCipher.procesar("CPRTIO", "3", "DESCIFRAR", "SIMPLE", "ES");
    if (res !== "CRIPTO") throw new Error(`Esperado: CRIPTO, Obtenido: ${res}`);
});

// 13. Filas Tests
addTest("Filas", "Cifrar simple con 3 filas", () => {
    const res = FilasCipher.procesar("FILAS", "3", "CIFRAR", "SIMPLE", "ES");
    if (res !== "FAISLX") throw new Error(`Esperado: FAISLX, Obtenido: ${res}`);
});
addTest("Filas", "Descifrar simple con 3 filas", () => {
    const res = FilasCipher.procesar("FAISLX", "3", "DESCIFRAR", "SIMPLE", "ES");
    if (!res.startsWith("FILAS")) throw new Error(`Esperado: FILAS..., Obtenido: ${res}`);
});

// 14. Grupos Tests
addTest("Grupos", "Cifrar con permutación de bloques 1 3 5 4 2", () => {
    const res = GruposCipher.procesar("GRUPO", "1 3 5 4 2", "CIFRAR", "ES");
    if (res !== "GUOPR") throw new Error(`Esperado: GUOPR, Obtenido: ${res}`);
});
addTest("Grupos", "Descifrar con permutación de bloques 1 3 5 4 2", () => {
    const res = GruposCipher.procesar("GUOPR", "1 3 5 4 2", "DESCIFRAR", "ES");
    if (res !== "GRUPO") throw new Error(`Esperado: GRUPO, Obtenido: ${res}`);
});

// 15. Series Tests
addTest("Series", "Cifrar con series Pares, Impares, Naturales", () => {
    const res = SeriesCipher.procesar("CIFRADO", "PARES, IMPARES", "CIFRAR");
    if (res !== "IRD CFAO") throw new Error(`Esperado: IRD CFAO, Obtenido: ${res}`);
});
addTest("Series", "Descifrar con series Pares, Impares, Naturales", () => {
    const res = SeriesCipher.procesar("IRD CFAO", "PARES, IMPARES", "DESCIFRAR");
    if (res !== "CIFRADO") throw new Error(`Esperado: CIFRADO, Obtenido: ${res}`);
});

console.log(`Running ${testSuite.length} tests...`);
let passed = 0;
let failed = 0;

testSuite.forEach((t, i) => {
    try {
        t.fn();
        passed++;
        console.log(`[PASS] ${t.cipherName} - ${t.testName}`);
    } catch (e) {
        failed++;
        console.error(`[FAIL] ${t.cipherName} - ${t.testName}`);
        console.error(`       Error: ${e.message}`);
    }
});

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
