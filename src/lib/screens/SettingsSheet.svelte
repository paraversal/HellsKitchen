<script lang="ts">
	import { version } from '$app/env';
	import { resolve } from '$app/paths';
	import Sheet from '#lib/components/Sheet.svelte';
	import Switch from '#lib/components/Switch.svelte';
	import { appData } from '#lib/app-data.ts';
	import { RULES_VERSION } from '#lib/kitchen-engine/config.ts';
	import { fun, setFun } from '#lib/motion/fun.svelte.ts';
	import { motion } from '#lib/motion/mode.svelte.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { slash } from '#lib/paths.ts';

	// How the app is set on this device, and what it is made of. Opened from the gear of the Pantry.
	let { open = $bindable() }: { open: boolean } = $props();

	const plans = $derived(planStore.library ? Object.keys(planStore.library.plans).length : undefined);
</script>

<Sheet bind:open title="Settings">
	<div class="settings">
		<section>
			<Switch bind:checked={() => fun.on, setFun}>Fun: playful animations and little surprises</Switch>
			{#if motion.mode !== 'full'}
				<p class="soft note">Your device asks for less motion, so the app keeps it calm whatever this says.</p>
			{/if}
		</section>

		<section>
			<h3>This app</h3>
			<dl>
				<div><dt>Version</dt><dd>{version}</dd></div>
				<div><dt>Data</dt><dd>{appData.version}</dd></div>
				<div><dt>Kitchen rules</dt><dd>{RULES_VERSION}</dd></div>
				{#if plans !== undefined}<div><dt>Plans on this device</dt><dd>{plans}</dd></div>{/if}
			</dl>
			<p class="links">
				<a href={slash(resolve('/styleguide'))}>Style sheet</a>
				<a href={slash(resolve('/styleguide/motion'))}>Motion trial page</a>
				<a href={slash(resolve('/status'))}>Offline check</a>
			</p>
		</section>
	</div>
</Sheet>

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	h3 {
		margin: 0;
		font-size: var(--text-strong);
		font-weight: var(--weight-heavy);
	}
	.note {
		margin: 0;
		font-size: var(--text-small);
	}
	dl {
		margin: 0;
	}
	dl div {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) 0;
		border-top: 1px solid var(--color-line);
	}
	dt {
		flex: 1;
	}
	dd {
		margin: 0;
		font-weight: var(--weight-bold);
		font-variant-numeric: tabular-nums;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin: 0;
		padding-top: var(--space-2);
		font-weight: var(--weight-bold);
	}
</style>
