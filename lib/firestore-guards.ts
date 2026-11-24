/**
 * Utilidades defensivas para hidratar datos procedentes de Cloud Firestore,
 * evitando excepciones de renderizado en React ante tipos inesperados o documentos heredados.
 */

export function sanitizeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function sanitizeStringArray(value: unknown, maxItems = 20): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .slice(0, maxItems);
}

export function toSafeDate(timestamp: unknown): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) {
    return Number.isNaN(timestamp.getTime()) ? null : timestamp;
  }
  if (
    typeof timestamp === "object" &&
    "toDate" in timestamp &&
    typeof (timestamp as { toDate?: unknown }).toDate === "function"
  ) {
    try {
      const d = (timestamp as { toDate: () => Date }).toDate();
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
    } catch {
      return null;
    }
  }
  if (
    typeof timestamp === "object" &&
    "seconds" in timestamp &&
    typeof (timestamp as { seconds?: unknown }).seconds === "number"
  ) {
    return new Date((timestamp as { seconds: number }).seconds * 1000);
  }
  return null;
}
