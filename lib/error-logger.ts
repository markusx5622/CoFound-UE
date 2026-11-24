import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const reportedInSession = new Set<string>();
const MAX_REPORTS_PER_SESSION = 20;
const ERROR_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días para política TTL RGPD
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function sanitizeText(input: string, maxLength: number): string {
  const redacted = input.replace(EMAIL_REGEX, "[email-redacted]").trim();
  if (!redacted) return "unknown";
  return redacted.slice(0, maxLength);
}

/**
 * Registra errores inesperados de cliente en la colección privada `client_errors`
 * de Firestore para diagnóstico técnico con fecha de expiración (`expiresAt`, 30 días).
 */
export async function reportClientError(context: string, error: unknown): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[CoFound UE Error · ${context}]:`, error);
  }

  try {
    if (typeof window === "undefined") return;

    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.emailVerified) return;

    if (reportedInSession.size >= MAX_REPORTS_PER_SESSION) return;

    const rawMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : JSON.stringify(error || "Unknown error");

    const rawCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? String((error as { code: string }).code)
        : "unknown";

    const safeContext = sanitizeText(context, 100);
    const safeMessage = sanitizeText(rawMessage, 500);
    const safeCode = sanitizeText(rawCode, 100);
    const dedupeKey = `${safeContext}:${safeCode}:${safeMessage}`;

    if (reportedInSession.has(dedupeKey)) return;
    reportedInSession.add(dedupeKey);

    const safePath = (window.location?.pathname || "/").slice(0, 200);
    const safeUserAgent = (window.navigator?.userAgent || "unknown").slice(0, 300);

    await addDoc(collection(db, "client_errors"), {
      uid: currentUser.uid,
      context: safeContext,
      message: safeMessage,
      code: safeCode,
      path: safePath,
      userAgent: safeUserAgent,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + ERROR_RETENTION_MS),
    });
  } catch {
    // Nunca propagar errores secundarios desde el logger de telemetría
  }
}
