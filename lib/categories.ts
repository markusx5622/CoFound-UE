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

export function getCategoryLabel(category: string, t: (key: string) => any): string {
  const key = categoryKeys[category];
  return key ? t(key) : category;
}
