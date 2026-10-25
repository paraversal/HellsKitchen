<script lang="ts">
	import '@fontsource-variable/bricolage-grotesque';
	import '../app.css';
	import { onMount } from 'svelte';

	let { children } = $props();

	// Says on the page whether the last thing the person did was with the keyboard or with a pointer, so only the keyboard gets a focus ring.
	onMount(() => {
		const set = (kind: 'keyboard' | 'pointer') => () => (document.documentElement.dataset.input = kind);
		const key = (event: KeyboardEvent) => event.key === 'Tab' || event.key.startsWith('Arrow') ? set('keyboard')() : undefined;
		const pointer = set('pointer');
		addEventListener('keydown', key, true);
		addEventListener('pointerdown', pointer, true);
		return () => {
			removeEventListener('keydown', key, true);
			removeEventListener('pointerdown', pointer, true);
		};
	});
</script>

{@render children()}
