import { authService } from './api/auth.service.js';

// GUARDIÁN DE AUTENTICACIÓN
(() => {
  const token = localStorage.getItem('accessToken');
  // Si NO hay token, usamos el metodo logout de authService
  if (!token) {
    authService.logout(); // Usamos la función central
  }
})();  // Los paréntesis finales ( ... )() hacen que la función se auto-ejecute.

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
      // Importamos dinámicamente el módulo del dashboard...
      import('./pages/dashboard.js')
        .then(dashboardModule => {
          // ...y una vez cargado, llamamos a su función 'init'.
          dashboardModule.init();
        })
        .catch(err => {
          console.error("No se pudo cargar el módulo del dashboard:", err);
        });
    }

    // cuando se carga la página users
    if (page === 'users') {
      import('./pages/users.js')
        .then(usersModule => usersModule.init());  // llama la función modulo en user.js
    }
    // Podrías añadir más 'else if' para otras páginas con JS específico
    // else if (page === 'users-table') { import('./users.js').then(...) }

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
if (logoutButton) {
  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    authService.logout(); // Usamos la función central
  });
}

document.addEventListener('DOMContentLoaded', () => {
    // Carga inicial
    loadContent('dashboard');
});