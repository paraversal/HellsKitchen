<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Plate from './Plate.svelte';
	import IconButton from './IconButton.svelte';

	// One recipe in the list: plate, name, and what kind it is. The plus adds it to the plan.
	type Props = { id: string; name: string; meta: string; href: string; selected?: boolean; canAdd?: boolean; onadd?: () => void };
	let { id, name, meta, href, selected = false, canAdd = true, onadd }: Props = $props();
</script>

<div class="row" class:selected>
	<a {href} aria-current={selected ? 'page' : undefined}>
		<Plate seed={id} size={48} />
		<span class="text">
			<span class="name">{name}</span>
			<span class="meta">{meta}</span>
		</span>
	</a>
	<IconButton icon={Plus} label="Add {name} to the plan" size={34} disabled={!canAdd} onclick={onadd} />
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 10px var(--space-3);
		border-radius: var(--radius-m);
	}
	@media (hover: hover) {
		.row:not(.selected):hover {
			background: var(--color-sheet);
		}
	}
	.row:active {
		background: var(--color-mustard-tint);
	}
	.selected {
		background: var(--color-mustard-tint);
	}
	a {
		display: flex;
		align-items: center;
		gap: 14px;
		flex: 1;
		min-width: 0;
		color: inherit;
		text-decoration: none;
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.name {
		font-size: var(--text-strong);
		font-weight: var(--weight-bold);
	}
	.meta {
		color: var(--color-ink-soft);
		font-size: var(--text-note);
	}
</style>
