/**
 * Traduce los códigos de error de Firebase Auth a mensajes legibles en español.
 */
export function getFriendlyErrorMessage(code: string): string {
  switch (code) {
    case "auth/operation-not-allowed":
      return "El método de inicio de sesión con Correo y Contraseña está desactivado en Firebase. Actívalo en la consola de Firebase (Authentication > Sign-in method).";
    case "auth/email-already-in-use":
      return "Este correo electrónico ya está registrado. Por favor, inicia sesión.";
    case "auth/invalid-email":
      return "El formato del correo electrónico no es válido.";
    case "auth/weak-password":
      return "La contraseña es demasiado corta. Debe tener al menos 6 caracteres.";
    case "auth/wrong-password":
      return "La contraseña es incorrecta. Por favor, inténtalo de nuevo.";
    case "auth/user-not-found":
      return "No existe ninguna cuenta registrada con este correo electrónico.";
    case "auth/user-disabled":
      return "Esta cuenta de usuario ha sido deshabilitada por un administrador.";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Se ha bloqueado el acceso temporalmente. Inténtalo de nuevo más tarde.";
    case "auth/network-request-failed":
      return "Error de conexión de red. Comprueba tu conexión a internet.";
    case "auth/invalid-credential":
      return "Credenciales incorrectas o caducadas. Comprueba tu correo y contraseña.";
    default:
      return "Ha ocurrido un error inesperado al procesar la solicitud. Por favor, inténtalo de nuevo.";
  }
}
