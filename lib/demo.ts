/**
 * Identificador de la cuenta oficial de proyectos demostrativos en CoFound UE.
 */
export const OFFICIAL_DEMO_UID = "demo-cofound-ue";

/**
 * Comprueba si un UID corresponde a una cuenta demostrativa (prefijo `demo-`).
 */
export function isDemoId(uid?: string | null): boolean {
  return typeof uid === "string" && uid.trim().toLowerCase().startsWith("demo-");
}

/**
 * Limpia el prefijo heredado "[Proyecto de ejemplo]" del título cuando la UI ya muestra la insignia visual.
 */
export function cleanProjectTitle(title: string): string {
  return title.replace(/^\[Proyecto de ejemplo\]\s*/i, "").trim();
}
