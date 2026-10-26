<script lang="ts">
	import '@fontsource-variable/bricolage-grotesque';
	import '../app.css';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { startGlide } from '#lib/glide.ts';
	import { recipeNavigate } from '#lib/motion/recipeopen.svelte.ts';
	import { startFun } from '#lib/motion/fun.svelte.ts';
	import { motion, setMotion, startMotion } from '#lib/motion/mode.svelte.ts';

	let { children } = $props();

	onNavigate(recipeNavigate);

	// Says on the page whether the last thing the person did was with the keyboard or with a pointer, so only the keyboard gets a focus ring.
	onMount(() => {
		startFun();
		const stopGlide = startGlide();
		const stopMotion = startMotion();
		setMotion(motion.mode);
		const set = (kind: 'keyboard' | 'pointer') => () => (document.documentElement.dataset.input = kind);
		const key = (event: KeyboardEvent) => event.key === 'Tab' || event.key.startsWith('Arrow') ? set('keyboard')() : undefined;
		const pointer = set('pointer');
		addEventListener('keydown', key, true);
		addEventListener('pointerdown', pointer, true);
		return () => {
			stopMotion();
			stopGlide();
			removeEventListener('keydown', key, true);
			removeEventListener('pointerdown', pointer, true);
		};
	});
</script>

{@render children()}
