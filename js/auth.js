/**
 * Cierra la sesión del usuario limpiando localStorage y redirigiendo al login.
 */
export function logout() {
  console.log('Token inválido o sesión expirada. Cerrando sesión...');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  // Asegúrate de que la ruta al login es correcta desde la raíz del proyecto
  window.location.href = '/authentication-login.html';
}