export const categoryKeys: Record<string, string> = {
  "Reto Académico": "categories.academicChallenge",
  "TFG": "categories.tfg",
  "Startup Real": "categories.realStartup",
};

export const CANONICAL_CATEGORIES = [
  "Reto Académico",
  "TFG",
  "Startup Real"
] as const;

export function getCategoryLabel(category: unknown, t: (key: string) => string): string {
  if (typeof category !== "string" || !category) {
    return "";
  }
  const key = categoryKeys[category];
  return key ? t(key) : category;
}
