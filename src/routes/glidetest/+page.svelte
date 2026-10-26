<script lang="ts">
	import { onMount } from 'svelte';
	import { holdStill } from '#lib/glide.ts';
	// A throwaway page to find out how to stop a glide on iOS. Delete it afterwards.
	let log = $state('');
	onMount(() => {
		const strategy = new URLSearchParams(location.search).get('s') ?? 'A';
		let last = 0;
		let glidingUntil = 0;
		addEventListener('scroll', () => { last = performance.now(); }, { passive: true, capture: true });
		const sample = (label: string) => {
			const t0 = performance.now();
			const out: string[] = [];
			const tick = () => {
				out.push(`${Math.round(performance.now() - t0)}:${Math.round(scrollY)}`);
				if (performance.now() - t0 < 900) setTimeout(tick, 150);
				else log = `${strategy} ${label} ${out.join(' ')}`;
			};
			tick();
		};
		const kill = () => {
			const h = document.documentElement;
			if (strategy === 'A') { h.style.overflow = 'hidden'; setTimeout(() => (h.style.overflow = ''), 80); }
			if (strategy === 'B') scrollTo(0, scrollY);
			if (strategy === 'C') { h.style.overflow = 'hidden'; scrollTo(0, scrollY); setTimeout(() => (h.style.overflow = ''), 250); }
			if (strategy === 'D') { h.style.overflow = 'hidden'; setTimeout(() => (h.style.overflow = ''), 600); }
			if (strategy === 'F') holdStill(document);
			if (strategy === 'E') { document.body.style.position = 'fixed'; document.body.style.top = `-${scrollY}px`; const y = scrollY; setTimeout(() => { document.body.style.position = ''; document.body.style.top = ''; scrollTo(0, y); }, 100); }
			sample('killed');
		};
		addEventListener('touchstart', () => { if (performance.now() - last < 100) { glidingUntil = 1; kill(); } }, { passive: true, capture: true });
		addEventListener('touchend', () => { if (!glidingUntil && performance.now() - last < 100) kill(); glidingUntil = 0; }, { passive: true, capture: true });
	});
</script>

<pre>{log}</pre>
{#each Array(400) as _, i (i)}<p>Line {i}</p>{/each}

<style>
	pre {
		position: fixed;
		top: 50px;
		left: 0;
		right: 0;
		z-index: 9;
		margin: 0;
		padding: 6px;
		background: #000c;
		color: #0f0;
		font-size: 11px;
		white-space: pre-wrap;
	}
	p {
		margin: 0;
		padding: 12px;
		font-size: 22px;
	}
</style>
