import { toSafeDate } from "@/lib/firestore-guards";

/**
 * Formatea una fecha de publicación en formato relativo amigable (ES/EN).
 */
export function formatRelativeDate(raw: unknown, language: "es" | "en"): string {
  const date = toSafeDate(raw);
  if (!date) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 2) {
    return language === "en" ? "Just now" : "Ahora mismo";
  }
  if (diffHours < 1) {
    return language === "en" ? `${diffMinutes}m ago` : `Hace ${diffMinutes} min`;
  }
  if (diffHours < 24) {
    return language === "en"
      ? `${diffHours}h ago`
      : `Hace ${diffHours} h`;
  }
  if (diffDays === 1) {
    return language === "en" ? "Yesterday" : "Ayer";
  }
  if (diffDays < 7) {
    return language === "en" ? `${diffDays} days ago` : `Hace ${diffDays} días`;
  }

  return date.toLocaleDateString(language === "en" ? "en-US" : "es-ES", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Formatea la hora (HH:mm) de un mensaje de chat de forma segura.
 */
export function formatMessageTime(raw: unknown, language: "es" | "en"): string {
  const date = toSafeDate(raw);
  if (!date) return "";
  return date.toLocaleTimeString(language === "en" ? "en-US" : "es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
