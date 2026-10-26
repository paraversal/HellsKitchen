<script lang="ts">
	// The name of a day, on a strip of mustard tape, with the date next to it. `heading` makes it a heading of that level, so the days can be found by people who listen to the page.
	let { name, date, heading }: { name: string; date: string; heading?: 'h2' | 'h3' } = $props();
</script>

<svelte:element this={heading ?? 'div'} class="day">
	<span class="tape">{name}</span>
	<span class="date">{date}</span>
</svelte:element>

<style>
	.day {
		margin: 0;
		font-size: inherit;
		font-weight: inherit;
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.tape {
		padding: 3px var(--space-3);
		border-radius: var(--radius-s);
		background: var(--color-mustard);
		font-size: var(--text-heading);
		font-weight: var(--weight-heavy);
		line-height: 1.3;
		transform: rotate(-1.5deg);
	}
	.date {
		color: var(--color-ink-soft);
		font-size: var(--text-compact);
	}
</style>
