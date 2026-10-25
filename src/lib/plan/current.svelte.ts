// The open plan as the screens need it: the engine's result and the shopping view. Worked out once, and again when the plan changes.
import { appData } from '../app-data.ts';
import { planStore } from './browser.ts';
import { calculatePlan, shoppingView } from './shopping.ts';

class CurrentPlan {
	calc = $derived.by(() => {
		const plan = planStore.plan;
		return plan ? calculatePlan(plan, appData) : undefined;
	});

	shopping = $derived.by(() => (this.calc ? shoppingView(this.calc.result, planStore.plan?.shopping?.checked ?? []) : undefined));
}

export const current = new CurrentPlan();

/** The recipe that is being put in a plan right now, if any. The sheet for choosing the meal opens when it is set. */
export const adding = $state<{ recipe: string | null }>({ recipe: null });
