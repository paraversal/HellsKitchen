// The photos of recipes: data/images/<recipe id>.<jpg, jpeg, png, webp or avif>. The name of the file says which recipe it shows.
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const;

/** A file in data/images/, as the validator sees it. */
export type ImageFile = { name: string; bytes: number };

/** The recipe id and the ending of a file name: `tzatziki.jpg` is `{ id: 'tzatziki', extension: 'jpg' }`. */
export function splitImageName(name: string): { id: string; extension: string } {
	const dot = name.lastIndexOf('.');
	return dot < 0 ? { id: name, extension: '' } : { id: name.slice(0, dot), extension: name.slice(dot + 1).toLowerCase() };
}

/** A photo larger than this is probably straight from a camera. It still works, because the app makes its own small copies, but it bloats the repository. */
export const BIG_IMAGE_BYTES = 3 * 1024 * 1024;
