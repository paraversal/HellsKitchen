<script lang="ts">
	// The name of a day, on a strip of mustard tape, with the date next to it.
	let { name, date }: { name: string; date: string } = $props();
</script>

<div class="day">
	<span class="tape">{name}</span>
	<span class="date">{date}</span>
</div>

<style>
	.day {
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
