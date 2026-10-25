// The plan store of the browser: IndexedDB for the plans, and a mark in localStorage that this device has saved before.
import { get, set } from 'idb-keyval';
import { PlanStore, type Mark } from './store.svelte.ts';

const MARK = 'hk-has-saved-plans';

const mark: Mark = {
	has() {
		try {
			return localStorage.getItem(MARK) === '1';
		} catch {
			return false;
		}
	},
	set() {
		try {
			localStorage.setItem(MARK, '1');
		} catch {
			// private windows can refuse this. The plans are still saved.
		}
	}
};

export const planStore = new PlanStore({ get, set }, mark);
