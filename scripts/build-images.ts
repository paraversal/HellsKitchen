// Makes the pictures the app ships with from the photos in data/images/: for every recipe with a photo, a small square copy for lists and a bigger one for the recipe page.
// The copies go to src/lib/generated/images/ (made again whenever the photo changes, never edited by hand). Any size and format of photo works.
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { splitImageName, type ImageFile } from '../src/lib/data/images.ts';

/** The two sizes, in pixels: the small one is shown up to about 64 px wide, the big one up to about 200 px, on screens that are up to three times as sharp. */
const SIZES = { s: 160, l: 640 } as const;

export async function buildImages(root: string, photos: ImageFile[], wanted: string[]): Promise<number> {
	const out = join(root, 'src/lib/generated/images');
	mkdirSync(out, { recursive: true });
	const keep = new Set<string>();
	let made = 0;
	for (const photo of photos) {
		const { id } = splitImageName(photo.name);
		if (!wanted.includes(id)) continue;
		const source = join(root, 'data/images', photo.name);
		for (const [suffix, size] of Object.entries(SIZES)) {
			const target = join(out, `${id}-${suffix}.webp`);
			keep.add(`${id}-${suffix}.webp`);
			if (existsSync(target) && statSync(target).mtimeMs > statSync(source).mtimeMs) continue;
			await sharp(source).rotate().resize(size, size, { fit: 'cover', position: 'attention' }).webp({ quality: 80 }).toFile(target);
			made++;
		}
	}
	// Copies of photos that were removed or renamed.
	for (const name of readdirSync(out)) if (name.endsWith('.webp') && !keep.has(name)) rmSync(join(out, name));
	return made;
}
