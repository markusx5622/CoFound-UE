/**
 * Obtiene la clave de traducción del error de Firebase Auth.
 */
export function getAuthErrorKey(code: string): string {
  switch (code) {
    case "auth/operation-not-allowed":
      return "auth.errors.operationNotAllowed";
    case "auth/email-already-in-use":
      return "auth.errors.emailAlreadyInUse";
    case "auth/invalid-email":
      return "auth.errors.invalidEmail";
    case "auth/weak-password":
      return "auth.errors.weakPassword";
    case "auth/wrong-password":
      return "auth.errors.wrongPassword";
    case "auth/user-not-found":
      return "auth.errors.userNotFound";
    case "auth/user-disabled":
      return "auth.errors.userDisabled";
    case "auth/too-many-requests":
      return "auth.errors.tooManyRequests";
    case "auth/network-request-failed":
      return "auth.errors.networkError";
    case "auth/invalid-credential":
      return "auth.errors.invalidCredential";
    default:
      return "auth.errors.defaultError";
  }
}
