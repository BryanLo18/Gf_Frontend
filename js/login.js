import { apiService } from './apiService.js';

document.addEventListener('DOMContentLoaded', () => {
    // Redirigir si ya hay un token (el usuario ya tiene sesión)
    if (localStorage.getItem('accessToken')) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');

    // Ocultar el mensaje de error inicialmente
    errorMessage.style.display = 'none';

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita que el formulario se envíe de la forma tradicional
        errorMessage.textContent = ''; // Limpia errores anteriores
        errorMessage.style.display = 'none'; // Oculta el mensaje de error

        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            const data = await apiService.loginUser(username, password);

            // Si el login es exitoso...
            console.log('Login exitoso:', data);

            // 1. Guardar los datos en localStorage
            // El token se guarda como string, el objeto de usuario como un string JSON
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // 2. Redirigir al dashboard (index.html)
            window.location.href = 'index.html';

        } catch (error) {
            // Si apiService.loginUser lanza un error, lo capturamos aquí
            errorMessage.textContent = error.message || 'No se pudo iniciar sesión. Revisa tus credenciales.';
            errorMessage.style.display = 'block'; // Mostrar el mensaje de error
        }
    });
});