<script lang="ts">
	import { onMount } from 'svelte';
	import { get, set } from 'idb-keyval';
	import { asset, resolve } from '$app/paths';
	import { version } from '$app/env';

	// A page of checks for the walking skeleton (roadmap step 5). It is replaced by the real app later.
	type Check = { label: string; ok: boolean | null; detail: string };

	let online = $state(true);
	let worker = $state<Check>({ label: 'Works offline', ok: null, detail: 'checking' });
	let storage = $state<Check>({ label: 'Browser keeps the data', ok: null, detail: 'checking' });
	let data = $state<Check>({ label: 'Data file loaded', ok: null, detail: 'checking' });
	let installed = $state(false);
	let note = $state('');
	let saved = $state<string | null>(null);

	onMount(async () => {
		online = navigator.onLine;
		addEventListener('online', () => (online = true));
		addEventListener('offline', () => (online = false));
		installed = matchMedia('(display-mode: standalone)').matches;

		if ('serviceWorker' in navigator) {
			const reg = await navigator.serviceWorker.ready;
			worker = { label: worker.label, ok: !!reg.active, detail: reg.active ? 'service worker active' : 'not active yet' };
		} else {
			worker = { label: worker.label, ok: false, detail: 'service workers not supported' };
		}

		const persisted = (await navigator.storage?.persist?.()) ?? false;
		storage = {
			label: storage.label,
			ok: persisted,
			detail: persisted ? 'persistent storage granted' : 'persistent storage not granted'
		};

		try {
			const res = await fetch(asset('hello.json'));
			data = { label: data.label, ok: res.ok, detail: (await res.json()).message };
		} catch {
			data = { label: data.label, ok: false, detail: 'could not load' };
		}

		saved = (await get<string>('note')) ?? null;
		note = saved ?? '';
	});

	async function save() {
		await set('note', note);
		saved = note;
	}
</script>

<main>
	<h1>Hell's Kitchen</h1>
	<p class="soft">Walking skeleton. Version <code>{version}</code>{installed ? ', opened from the home screen' : ''}.</p>

	<ul class="checks">
		<li class={online ? 'ok' : 'warn'}>
			<span class="mark">{online ? '✓' : '○'}</span>
			<div><strong>{online ? 'Online' : 'Offline'}</strong></div>
		</li>
		{#each [worker, storage, data] as c (c.label)}
			<li class={c.ok === null ? '' : c.ok ? 'ok' : 'warn'}>
				<span class="mark">{c.ok === null ? '…' : c.ok ? '✓' : '○'}</span>
				<div><strong>{c.label}</strong><br /><span class="soft">{c.detail}</span></div>
			</li>
		{/each}
	</ul>

	<h2>Does a saved plan survive a restart?</h2>
	<p class="soft">Type something, save it, close the app, restart the phone, open the app again.</p>
	<form onsubmit={(e) => { e.preventDefault(); save(); }}>
		<input bind:value={note} placeholder="A note" aria-label="A note" />
		<button type="submit">Save</button>
	</form>
	<p>{saved === null ? 'Nothing saved yet.' : `Saved on this device: "${saved}"`}</p>

	<p><a href={resolve('/about')}>Open another page</a> · <a href={resolve('/styleguide')}>Style sheet</a></p>
</main>

<style>
	main {
		max-width: 36rem;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
	}
	h1 {
		margin: 0 0 0.25rem;
		font-size: 2rem;
		font-weight: 800;
	}
	h2 {
		margin: 2rem 0 0.25rem;
		font-size: 1.25rem;
		font-weight: 800;
	}
	.soft {
		color: var(--color-ink-soft);
		margin: 0.25rem 0 1rem;
	}
	.checks {
		list-style: none;
		margin: 1.5rem 0;
		padding: 0;
	}
	.checks li {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-line);
	}
	.mark {
		width: 1.5rem;
		text-align: center;
		font-weight: 800;
	}
	.ok .mark {
		color: var(--color-leaf);
	}
	.warn .mark {
		color: var(--color-tomato);
	}
	form {
		display: flex;
		gap: 0.5rem;
	}
	input {
		flex: 1;
		font: inherit;
		padding: 0.6rem 0.75rem;
		border: 1.5px solid var(--color-line);
		border-radius: 0.75rem;
		background: var(--color-sheet);
	}
	button {
		font: inherit;
		font-weight: 700;
		padding: 0.6rem 1.1rem;
		border: 0;
		border-radius: 0.75rem;
		background: var(--color-tomato);
		color: var(--color-sheet);
	}
</style>
