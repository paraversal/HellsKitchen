// The pictures of recipes made from the photos in data/images/ (see scripts/build-images.ts): a small one for lists and a bigger one for the recipe page.
const urls = import.meta.glob('./generated/images/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const byName = new Map(Object.entries(urls).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1), url]));

/** The picture of a recipe, or undefined when nobody has made a photo of it yet. */
export const recipeImage = (id: string, size: 's' | 'l'): string | undefined => byName.get(`${id}-${size}.webp`);

/** Whether a recipe has a photo. */
export const hasPhoto = (id: string): boolean => byName.has(`${id}-s.webp`);
