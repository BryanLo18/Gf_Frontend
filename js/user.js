/**
 * @file user.js
 * @description Módulo que gestiona la vista de usuarios, incluyendo la tabla y el modal para agregar nuevos usuarios.
 * Es importado y ejecutado por main.js.
 */

// --- 1. IMPORTACIONES ---
import { apiService } from './apiService.js';

// --- 2. CONFIGURACIÓN ---
const CONFIG = {
    TABLE_BODY_ID: 'userTable'
};

// --- 3. FUNCIÓN DE INICIALIZACIÓN (PÚBLICA Y ÚNICA) ---
/**
 * Esta es la única función que se exporta. Es el punto de entrada que main.js llama.
 * Se encarga de inicializar tanto la tabla como la funcionalidad del modal.
 */
export function initUserTable() {
    renderUserTable();      // Prepara y muestra la tabla de usuarios.
    setupAddUserModal();    // Prepara los botones y el formulario del modal.
}

// --- 4. LÓGICA DE LA TABLA (PRIVADA) ---

/**
 * Orquesta el proceso de renderizado de la tabla.
 */
async function renderUserTable() {
    const tableBody = document.getElementById(CONFIG.TABLE_BODY_ID);
    if (!tableBody) {
        console.error(`Error crítico: No se encontró <tbody id="${CONFIG.TABLE_BODY_ID}">.`);
        return;
    }
    renderMessage(tableBody, 'Cargando usuarios...');

    try {
        const users = await apiService.getUsersByCentro();
        tableBody.innerHTML = '';
        if (!users || users.length === 0) {
            renderMessage(tableBody, 'No se encontraron usuarios en este centro.');
            return;
        }
        const fragment = document.createDocumentFragment();
        users.forEach(user => fragment.appendChild(createUserRowElement(user)));
        tableBody.appendChild(fragment);
    } catch (error) {
        console.error("Fallo en renderUserTable:", error.message);
        if (error.message !== 'Sesión expirada.') {
            renderMessage(tableBody, `Error al obtener los datos: ${error.message}`);
        }
    }
}

// --- 5. LÓGICA DEL MODAL (PRIVADA) ---

/**
 * Configura todos los eventos para el modal de "Añadir Usuario".
 */
function setupAddUserModal() {
    const modal = document.getElementById('modal-usuario');
    const openModalBtn = document.getElementById('boton-abrir-modal');
    const closeModalBtn = document.getElementById('boton-cerrar-modal');
    const cancelBtn = document.getElementById('boton-cancelar');
    const userForm = document.getElementById('form-agregar-usuario');
    const errorMessageDiv = document.getElementById('error-message');

    // Si alguno de los elementos del modal no existe, no continuamos para evitar errores.
    if (!modal || !openModalBtn || !closeModalBtn || !cancelBtn || !userForm) {
        console.warn("No se encontraron los elementos del modal en el DOM. La funcionalidad de 'Añadir Usuario' no estará disponible.");
        return;
    }

    const openModal = () => {
        userForm.reset();
        errorMessageDiv.style.display = 'none';
        modal.style.display = 'flex';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newUser = {
            nombre_completo: document.getElementById('nombre_completo').value,
            identificacion: document.getElementById('identificacion').value,
            correo: document.getElementById('correo').value,
            pass_hash: document.getElementById('password').value,
            id_rol: parseInt(document.getElementById('id_rol').value, 10),
            tipo_contrato: document.getElementById('tipo_contrato').value,
            telefono: document.getElementById('telefono').value,
            estado: document.getElementById('estado').value === 'true',
            cod_centro: JSON.parse(localStorage.getItem('user')).cod_centro
        };

        try {
            await apiService.createUser(newUser);
            alert('¡Usuario creado con éxito!');
            closeModal();
            renderUserTable(); // Actualizamos la tabla
        } catch (error) {
            errorMessageDiv.textContent = `Error: ${error.message}`;
            errorMessageDiv.style.display = 'block';
        }
    });
}


// --- 6. FUNCIONES AUXILIARES DE RENDERIZADO (PRIVADAS) ---

/**
 * Crea un elemento <tr> para un solo usuario.
 */
function createUserRowElement(user) {
    const row = document.createElement('tr');
    const status = getStatusInfo(user.estado);
    row.innerHTML = `
        <td class="px-0">${user.id_usuario || 'N/A'}</td>
        <td class="px-0">
            <div class="d-flex align-items-center">
                
                <div class="ms-3">
                    <h6 class="mb-0 fw-bolder">${user.nombre_completo || 'N/A'}</h6>
                </div>
            </div>
        </td>
        <td class="px-0">${user.correo || 'N/A'}</td>
        <td class="px-0">${user.nombre_rol || 'N/A'}</td>
        <td class="px-0">${user.identificacion || 'N/A'}</td>
        <td class="px-0">${user.tipo_contrato || 'N/A'}</td>
        <td class="px-0">${user.telefono || 'N/A'}</td>
        <td class="px-0">${user.cod_centro || 'N/A'}</td>
        <td class="px-0">
            <span class="badge ${status.cssClass}">${status.text}</span>
        </td>
    `;
    return row;
}

/**
 * Devuelve el texto y la clase CSS para el badge de estado.
 */
function getStatusInfo(isActive) {
    return isActive
        ? { text: 'Activo', cssClass: 'bg-success' }
        : { text: 'Inactivo', cssClass: 'bg-danger' };
}

/**
 * Renderiza un mensaje centralizado en la tabla.
 */
function renderMessage(tableBody, message) {
    const columnCount = 9;
    tableBody.innerHTML = `<tr><td colspan="${columnCount}" class="text-center p-4">${message}</td></tr>`;
}