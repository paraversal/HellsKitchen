import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

// The start of the app. The plan.
export function load() {
	redirect(307, resolve('plan/'));
}
