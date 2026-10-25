// The data the app ships with, made from the YAML files by `npm run build:data` (it runs before dev, build and check).
import type { AppData } from './data/app-data.ts';
import generated from './generated/app-data.json';

export const appData = generated as unknown as AppData;
