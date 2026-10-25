import { appData } from '#lib/app-data.ts';

// Every recipe becomes its own page when the site is built, so each one opens offline.
export const entries = () => Object.keys(appData.recipes).map((id) => ({ id }));
