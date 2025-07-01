import { logout } from './auth.js';

const mainContent = document.getElementById('main-content');
const navLinks = document.querySelector('.sidebar-nav');

console.log("main.js cargado. El script principal está listo.");

const loadContent = async (page) => {
    console.log(`Paso 2: Se llamó a loadContent con el parámetro: '${page}'`);
    try {
        const response = await fetch(`pages/${page}.html`);
        console.log("Paso 3: Se intentó hacer fetch. Respuesta recibida:", response);

        if (!response.ok) {
            // Si la respuesta no es OK, lanzamos un error para que lo capture el catch.
            throw new Error(`Error de red: ${response.status} - ${response.statusText}`);
        }
        const html = await response.text();
        mainContent.innerHTML = html;
        console.log("Paso 4: El contenido HTML se ha inyectado en #main-content.");

        if (page === 'dashboard') {
            console.log("vista dashboard");
        }

        // --- INICIO DE LA MODIFICACIÓN ---
        // cuando se carga la página users
        if (page === 'users') {
            console.log("vista usuarios"); // Mantenemos tu log para depuración

            // Importamos dinámicamente el script que maneja la tabla ('user.js')
            import('./user.js')
                .then(module => {
                    // Una vez que el módulo se carga, llamamos a la función que exporta
                    console.log("Módulo 'user.js' cargado, ejecutando initUserTable()...");
                    module.initUserTable();
                })
                .catch(err => {
                    // Si hay un error al cargar el script (ej: no se encuentra, tiene un error de sintaxis)
                    console.error('Error al importar dinámicamente el módulo user.js:', err);
                    mainContent.innerHTML = `<h3 class="text-center text-danger p-5">Error crítico al cargar la funcionalidad de la tabla.</h3>`;
                });
        }
        // --- FIN DE LA MODIFICACIÓN ---

    } catch (error) {
        console.error("¡ERROR! Algo falló dentro de loadContent:", error);
        mainContent.innerHTML = `<h3 class="text-center text-danger p-5">No se pudo cargar el contenido. Revisa la consola (F12).</h3>`;
    }
};

navLinks.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-page]');
    
    if (link) {
        event.preventDefault();
        const pageToLoad = link.dataset.page;
        console.log(`Paso 1: Clic detectado. Se va a cargar la página: '${pageToLoad}'`);
        loadContent(pageToLoad);
    }
});

// SELECCIONAMOS EL BOTÓN DE LOGOUT POR SU ID
const logoutButton = document.getElementById('logout-button');

/**
 * Llamamos LA FUNCIÓN PARA MANEJAR EL LOGOUT
 * Limpia los datos de sesión y redirige al login.
 */
function handleLogout() {
    // Ahora esta función simplemente llama a nuestra función central.
    logout();
}

// AÑADIMOS EL EVENT LISTENER AL BOTÓN
// Nos aseguramos de que el botón exista antes de añadir el listener
if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
        // Prevenimos el comportamiento por defecto del enlace (que es navegar)
        event.preventDefault();
        handleLogout();
    });
}

// GUARDIÁN DE AUTENTICACIÓN
// Este código se ejecuta inmediatamente.
(() => {
    const token = localStorage.getItem('accessToken');
    // Si NO hay token, redirigimos al login.
    if (!token) {
        // Redirige a la página de login. La ruta debe ser correcta desde index.html
        window.location.href = 'authentication-login.html';
    }
})(); // Los paréntesis finales ( ... )() hacen que la función se auto-ejecute.

// carga el contenido inicial del dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Carga inicial
    loadContent('dashboard');
});