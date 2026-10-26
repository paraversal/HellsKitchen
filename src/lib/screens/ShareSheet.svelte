<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import FileDown from '@lucide/svelte/icons/file-down';
	import FileText from '@lucide/svelte/icons/file-text';
	import FileUp from '@lucide/svelte/icons/file-up';
	import Printer from '@lucide/svelte/icons/printer';
	import Send from '@lucide/svelte/icons/send';
	import { resolve } from '$app/paths';
	import ActionRow from '#lib/components/ActionRow.svelte';
	import QrCode from '#lib/components/QrCode.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import { planStore } from '#lib/plan/browser.ts';
	import { canSend, copyLink, openFile, saveFile, sendLink, shareLink, transfer } from '#lib/plan/transfer.svelte.ts';

	// Everything that takes the plan out of this screen: a link, a code to scan, a file, paper. And the way back in: a file.
	const record = $derived(planStore.record);
	const link = $derived(record && transfer.sharing ? shareLink(record.plan, record.updatedAt) : '');
	let picker = $state<HTMLInputElement>();

	async function picked(event: Event & { currentTarget: HTMLInputElement }) {
		const file = event.currentTarget.files?.[0];
		event.currentTarget.value = '';
		if (file) await openFile(file);
	}
</script>

<Sheet bind:open={transfer.sharing} title="Share and print">
	{#if record}
		<div class="stack">
			<div class="code">{#if transfer.sharing}<QrCode text={link} label="QR code with the link to {record.plan.name}" />{/if}</div>
			<div class="actions">
				{#if canSend()}
					<ActionRow icon={Send} check label="Send the link" hint="The whole plan is inside the link" onclick={() => sendLink(link, record.plan.name)} />
				{/if}
				<ActionRow icon={Copy} check label="Copy the link" hint={canSend() ? undefined : 'The whole plan is inside the link'} onclick={() => copyLink(link)} />
				<ActionRow icon={FileDown} check label="Save the plan as a file" hint="A copy to keep, with the shopping ticks" onclick={() => saveFile(record.plan, record.updatedAt)} />
				<ActionRow icon={FileUp} label="Open a plan file" onclick={() => picker?.click()} />
				<ActionRow icon={Printer} label="Print the shopping list" href={resolve('/print/shopping')} />
				<ActionRow icon={FileText} label="Print the recipe sheets" hint="Every dish, scaled to its meal" href={resolve('/print/recipes')} />
			</div>
			<input bind:this={picker} type="file" accept=".json,application/json" hidden onchange={picked} />
		</div>
	{/if}
</Sheet>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-bottom: var(--space-2);
	}
	.code {
		display: flex;
		justify-content: center;
	}
	.code:empty {
		display: none;
	}
	.actions {
		display: flex;
		flex-direction: column;
	}
	.actions > :global(* + *) {
		border-top: 1px solid var(--color-line);
	}
</style>
