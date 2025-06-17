// ... (código existente: BASE_URL, _fetchAPI)

import { logout } from './auth.js'; // <-- Importa la función logout 

// Vamos a exportar el objeto entero para poder añadirle más funciones
export const apiService = {
    // ... (funciones existentes: getUserById, etc.)
    // getSalesData: () => {
    //     return _fetchAPI('/charts/sales', 'GET');
    // },

    /**
     * Realiza la autenticación del usuario.
     * @param {string} username - El correo del usuario.
     * @param {string} password - La contraseña.
     * @returns {Promise<object>} - La respuesta de la API con los datos del usuario y el token.
     */
    loginUser: async (username, password) => {
        const url = 'https://gestionformacion-prueba.up.railway.app/access/token';

        // El cuerpo debe ser formateado como x-www-form-urlencoded
        const body = new URLSearchParams();

        body.append('username', username);
        body.append('password', password);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'accept': 'application/json'
                },
                body: body
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Usuario o contraseña incorrectos.' }));
                throw new Error(errorData.detail);
            }

            return await response.json();

        } catch (error) {
            console.error('Error en el login:', error);
            throw error; // Relanzamos el error para que login.js lo capture.
        }
    },

    /**
     * Obtiene los usuarios por código de centro, enviando el token de autorización.
     * Esta función también es autocontenida.
     * @returns {Promise<Array>} - Un array de objetos de usuario.
     */
    getUsersByCentro: async () => {
        const token = localStorage.getItem('accessToken');
        const userString = localStorage.getItem('user');

        if (!token || !userString) {
            const errorMessage = 'No se encontró token o información de usuario para la petición.';
            console.error(errorMessage);
            return Promise.reject(new Error(errorMessage));
        }

        const user = JSON.parse(userString);
        const cod_centro = user.cod_centro;

        const url = `https://gestionformacion-prueba.up.railway.app/users/get-by-centro?cod_centro=${cod_centro}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // si la petición no tiene permisos 
            if (response.status === 401) {
                // Si el token es inválido, cerramos la sesión.
                alert('No tienes permiso para usar este servicio')
                logout();
                // Lanzamos un error para detener la ejecución.
                throw new Error('Sesión expirada.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Error al obtener los usuarios.' }));
                throw new Error(errorData.detail);
            }

            return await response.json();

        } catch (error) {
            // No es necesario relanzar el error si ya estamos redirigiendo.
            console.error('Error obteniendo usuarios:', error.message);
            return Promise.reject(error);
        }
    }
};