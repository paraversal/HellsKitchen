/**
 * The address of a page with the slash at the end. Every page is saved as a folder with an index.html (trailingSlash 'always'),
 * so a link without the slash goes through a redirect, which GitHub Pages answers but the offline cache does not.
 * Use it around resolve(): href={slash(resolve('/(app)/plan'))}.
 */
export function slash(path: string): string {
	return path.replace(/^([^?#]*?)\/?(?=[?#]|$)/, '$1/');
}
