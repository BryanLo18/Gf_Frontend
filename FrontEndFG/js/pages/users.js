import { userService } from '../api/user.service.js';

let modalInstance = null; // Guardará la instancia del modal de Bootstrap
let createModalInstance = null; // Instancia para el modal de creación
let originalMail = null;

// --- FUNCIONES DE VISTA (Generación de HTML) ---

function createUserRow(user) {
  const statusBadge = user.estado 
    ? `<span class="badge bg-success">Activo</span>`
    : `<span class="badge bg-danger">Inactivo</span>`;

  const userId = user.id_usuario;

  return `
    <tr>
      <td class="px-0">
        <div class="d-flex align-items-center">
          <img src="./assets/images/profile/user-3.jpg" class="rounded-circle" width="40" alt="flexy" />
          <div class="ms-3">
            <h6 class="mb-0 fw-bolder">${user.nombre_completo}</h6>
            <span class="text-muted">${user.identificacion}</span>
          </div>
        </div>
      </td>
      <td class="px-0">${user.correo}</td>
      <td class="px-0">${user.telefono}</td>
      <td class="px-0"><div class="form-check form-switch ms-2 d-inline-block">
            <input class="form-check-input user-status-switch" type="checkbox" role="switch" 
                   id="switch-${userId}" data-user-id="${userId}" 
                   ${user.estado ? 'checked' : ''}>
            <label class="form-check-label" for="switch-${userId}">
              ${user.estado ? 'Activo' : 'Inactivo'}
            </label>
          </div></td>
      <td class="px-0 text-dark fw-medium text-end">${user.nombre_rol}</td>
      <td class="px-0 text-end">
          <button class="btn btn-sm btn-info btn-edit-user" data-user-id="${userId}">Editar</button>
          
      </td>
    </tr>
  `;
}

// --- LÓGICA DE MODAL ---

async function openEditModal(userId) {
  const modalElement = document.getElementById('edit-user-modal');
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalElement);
  }

  try {
    const user = await userService.getUserById(userId);
    originalMail = user.correo;
    document.getElementById('edit-user-id').value = user.id_usuario;
    document.getElementById('edit-nombre_completo').value = user.nombre_completo;
    document.getElementById('edit-correo').value = user.correo;
    document.getElementById('edit-telefono').value = user.telefono;
    document.getElementById('edit-tipo_contrato').value = user.tipo_contrato;
    modalInstance.show();
  } catch (error) {
    console.error(`Error al obtener datos del usuario ${userId}:`, error);
    alert('No se pudieron cargar los datos del usuario.');
  }
}

// --- MANEJADORES DE EVENTOS ---

async function handleUpdateSubmit(event) {
  event.preventDefault();
  const userId = document.getElementById('edit-user-id').value;
  const updatedData = {
    nombre_completo: document.getElementById('edit-nombre_completo').value,
    telefono: document.getElementById('edit-telefono').value,
    tipo_contrato: document.getElementById('edit-tipo_contrato').value,
  };
  let newMail = document.getElementById('edit-correo').value;
  if (newMail !== originalMail) {
    updatedData.correo = newMail;
  }

  try {
    await userService.updateUser(userId, updatedData);
    modalInstance.hide();
    init(); // Recargamos la tabla para ver los cambios
  } catch (error) {
    console.error(`Error al actualizar el usuario ${userId}:`, error);
    alert('No se pudo actualizar el usuario.');
  }
}

async function handleCreateSubmit(event) {
  event.preventDefault();

  if (!createModalInstance) {
    const createModalElement = document.getElementById('exampleModal');
    createModalInstance = new bootstrap.Modal(createModalElement);
  }

  const newUserData = {
    nombre_completo: document.getElementById('create-nombre_completo').value,
    identificacion: document.getElementById('create-identificacion').value,
    correo: document.getElementById('create-correo').value,
    password: document.getElementById('create-password').value,
    telefono: document.getElementById('create-telefono').value,
    tipo_contrato: document.getElementById('create-tipo_contrato').value,
    id_rol: parseInt(document.getElementById('create-id_rol').value, 10)
  };

  try {
    await userService.createUser(newUserData);
    alert('Usuario creado exitosamente.');
    document.getElementById('create-user-form').reset();
    createModalInstance.hide();
    init();
  } catch (error) {
    alert('No se pudo crear el usuario.');
    console.error('Error al crear el usuario:', error);
  }
}

async function handleTableClick(event) {
  // Manejador para el botón de editar
  const editButton = event.target.closest('.btn-edit-user');
  if (editButton) {
    const userId = editButton.dataset.userId;
    openEditModal(userId);
    return;
  }
}

async function handleStatusSwitch(event) {
  const switchElement = event.target;
  if (!switchElement.classList.contains('user-status-switch')) return;

  const userId = switchElement.dataset.userId;
  const newStatus = switchElement.checked;
  const actionText = newStatus ? 'activar' : 'desactivar';
  
  if (confirm(`¿Estás seguro de que deseas ${actionText} este usuario?`)) {
    try {
      await userService.deleteUser(userId); // Esta función maneja el cambio de estado
      alert(`El usuario ha sido ${newStatus ? 'activado' : 'desactivado'} exitosamente.`);
      init(); // Recargamos la tabla para ver los cambios
    } catch (error) {
      console.error(`Error al ${actionText} el usuario ${userId}:`, error);
      alert(`No se pudo ${actionText} el usuario.`);
      // Revertir el switch si hay error
      switchElement.checked = !newStatus;
    }
  } else {
    // Revertir el switch si el usuario cancela
    switchElement.checked = !newStatus;
  }
}

// --- FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ---

async function init() {
  const tableBody = document.getElementById('users-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando usuarios...</td></tr>'; // ✅ CORRECCIÓN: colspan="6"

  try {
    const users = await userService.getUsersByCentro();
    if (users && users.length > 0) {
      tableBody.innerHTML = users.map(createUserRow).join('');
    } else {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron usuarios.</td></tr>'; // ✅ CORRECCIÓN: colspan="6"
    }
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar los datos.</td></tr>`; // ✅ CORRECCIÓN: colspan="6"
  }

  // Aplicamos el patrón remove/add para evitar listeners duplicados
  const editForm = document.getElementById('edit-user-form');
  const createForm = document.getElementById('create-user-form');
  tableBody.removeEventListener('click', handleTableClick);
  tableBody.addEventListener('click', handleTableClick);
  tableBody.removeEventListener('change', handleStatusSwitch);
  tableBody.addEventListener('change', handleStatusSwitch);
  editForm.removeEventListener('submit', handleUpdateSubmit);
  editForm.addEventListener('submit', handleUpdateSubmit);
  if (createForm) {
    createForm.removeEventListener('submit', handleCreateSubmit);
    createForm.addEventListener('submit', handleCreateSubmit);
  }
}

export { init };