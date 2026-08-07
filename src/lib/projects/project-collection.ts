export const PROJECT_COLLECTION_IDS = ["primary", "labs", "secondary"] as const;

export type ProjectCollectionId = (typeof PROJECT_COLLECTION_IDS)[number];

export function normalizeProjectCollection(
  value: unknown,
  featured = false,
): ProjectCollectionId {
  if (value === "primary" || value === "labs" || value === "secondary") {
    return value;
  }

  return featured ? "primary" : "secondary";
}
