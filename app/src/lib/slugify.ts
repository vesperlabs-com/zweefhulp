/**
 * Convert a search query to a URL-safe slug
 * Examples:
 *   "Israël" → "israel"
 *   "climate change" → "climate-change"
 *   "normen en waarden" → "normen-en-waarden"
 */
export function slugify(query: string): string {
  return query
    .toLowerCase()
    .trim()
    // Normalize unicode characters (ë → e, ñ → n, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove any non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
}

/**
 * Best-effort conversion of a slug back to a readable query
 * This is a fallback for when the original query is not in the database
 * Examples:
 *   "israel" → "Israel"
 *   "climate-change" → "Climate change"
 */
export function deslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

