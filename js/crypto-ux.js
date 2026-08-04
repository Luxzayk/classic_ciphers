/**
 * js/crypto-ux.js
 * Utilidades Globales para ClassicCiphers: Notificaciones UI (Toasts) y Helpers
 */

const CryptoUX = (function() {

    // Crear el contenedor de toasts si no existe para evitar que las páginas tengan que declararlo a mano
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-20 right-5 z-50 flex flex-col gap-2 max-w-xs w-full';
        document.body.appendChild(toastContainer);
    }

    /**
     * Muestra una notificación flotante (Toast) en pantalla.
     * @param {string} title Título de la alerta (ej: "Error", "Éxito")
     * @param {string} message Mensaje detallado
     * @param {string} type Tipo de alerta: 'error' (rojo), 'success' (verde), 'info' (azul)
     */
    function showToast(title, message, type = 'info') {
        if (!toastContainer) return;

        // Configurar colores según el tipo
        let bgColors, iconSvg;
        if (type === 'error') {
            bgColors = 'bg-red-100 dark:bg-red-900/80 border-red-300 dark:border-red-500 text-red-800 dark:text-red-100';
            iconSvg = `<svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        } else if (type === 'success') {
            bgColors = 'bg-emerald-100 dark:bg-emerald-900/80 border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-100';
            iconSvg = `<svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        } else {
            bgColors = 'bg-blue-100 dark:bg-blue-900/80 border-blue-300 dark:border-blue-500 text-blue-800 dark:text-blue-100';
            iconSvg = `<svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        }

        // Crear el elemento HTML del Toast
        const toast = document.createElement('div');
        toast.className = `flex items-start gap-3 p-4 border rounded-xl shadow-lg transform transition-all duration-300 translate-x-full opacity-0 ${bgColors}`;
        toast.innerHTML = `
            <div class="flex-shrink-0 mt-0.5">${iconSvg}</div>
            <div class="flex-1">
                <h4 class="text-sm font-bold">${title}</h4>
                <p class="text-xs mt-1 opacity-90">${message}</p>
            </div>
            <button class="flex-shrink-0 opacity-70 hover:opacity-100 focus:outline-none close-toast-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Animar entrada (Slide In)
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 10);

        // Lógica para cerrar el Toast
        const closeBtn = toast.querySelector('.close-toast-btn');
        const removeToast = () => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => { if(toast.parentNode) toast.remove(); }, 300);
        };

        closeBtn.addEventListener('click', removeToast);

        // Auto-eliminar después de 5 segundos
        setTimeout(removeToast, 5000);
    }

    // Exponer las funciones globalmente
    return {
        showToast
    };
})();
