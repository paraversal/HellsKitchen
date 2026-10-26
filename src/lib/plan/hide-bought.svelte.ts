// Whether the shopping list moves ticked items under "Bought", out of the way. It is the choice of whoever holds the phone in the store,
// so it is kept on this device and not in the plan. On until someone turns it off.
const KEY = 'hk-hide-bought';

export const hideBought = $state({ on: true });

try {
	hideBought.on = localStorage.getItem(KEY) !== '0';
} catch {
	// no storage (a private window, or the page being built): the items are hidden for this visit
}

export function setHideBought(on: boolean): void {
	hideBought.on = on;
	try {
		localStorage.setItem(KEY, on ? '1' : '0');
	} catch {
		// the choice then lasts until the page is closed
	}
}
