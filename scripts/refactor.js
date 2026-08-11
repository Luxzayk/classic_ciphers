const fs = require('fs');
const path = require('path');

const workspacePath = 'c:/Users/diego/Documents/VSCODE/classic_ciphers';

const fileMap = {
    'cesar.js': 'CesarCipher',
    'rot5.js': 'Rot5Cipher',
    'rot13.js': 'Rot13Cipher',
    'rot47.js': 'Rot47Cipher',
    'escitala.js': 'EscitalaCipher',
    'atbash.js': 'AtbashCipher',
    'polybios.js': 'PolybiosCipher',
    'vigenere.js': 'VigenereCipher',
    'alberti.js': 'AlbertiCipher',
    'playfair.js': 'PlayfairCipher',
    'hill.js': 'HillCipher',
    'columnas.js': 'ColumnasCipher',
    'filas.js': 'FilasCipher',
    'grupos.js': 'GruposCipher',
    'series.js': 'SeriesCipher'
};

// 1. Refactor ciphers
Object.entries(fileMap).forEach(([file, varName]) => {
    const cipherPath = path.join(workspacePath, 'js', 'ciphers', file);
    if (!fs.existsSync(cipherPath)) {
        console.error(`Cipher file not found: ${cipherPath}`);
        return;
    }
    
    let code = fs.readFileSync(cipherPath, 'utf8').trim();
    
    if (code.startsWith('(function(')) {
        console.log(`[SKIP] ${file} is already wrapped in an IIFE.`);
    } else {
        const wrappedCode = `(function() {
${code}

window.CriptoSuite = window.CriptoSuite || {};
window.CriptoSuite.${varName} = ${varName};
})();
`;
        fs.writeFileSync(cipherPath, wrappedCode, 'utf8');
        console.log(`[OK] Wrapped ${file} in an IIFE and exposed to CriptoSuite.${varName}.`);
    }
});

// 2. Refactor pages
Object.entries(fileMap).forEach(([file, varName]) => {
    const pageName = file.replace('.js', '-page.js');
    const pagePath = path.join(workspacePath, 'js', 'pages', pageName);
    
    if (!fs.existsSync(pagePath)) {
        console.error(`Page file not found: ${pagePath}`);
        return;
    }
    
    let code = fs.readFileSync(pagePath, 'utf8');
    
    if (code.includes(`window.CriptoSuite.${varName}`)) {
        console.log(`[SKIP] ${pageName} already has CriptoSuite reference.`);
    } else {
        const target = 'document.addEventListener("DOMContentLoaded", () => {';
        const targetIndex = code.indexOf(target);
        
        if (targetIndex === -1) {
            console.error(`[ERROR] Could not find DOMContentLoaded in ${pageName}`);
            return;
        }
        
        const insertPosition = targetIndex + target.length;
        const before = code.slice(0, insertPosition);
        const after = code.slice(insertPosition);
        
        const refLine = `\n    const ${varName} = window.CriptoSuite.${varName};`;
        const updatedCode = before + refLine + after;
        
        fs.writeFileSync(pagePath, updatedCode, 'utf8');
        console.log(`[OK] Injected CriptoSuite.${varName} reference into ${pageName}.`);
    }
});

console.log('Refactoring complete.');
