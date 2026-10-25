import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

// The start of the app. Until the plan screen exists, that is the recipes.
export function load() {
	redirect(307, resolve('recipes/'));
}
