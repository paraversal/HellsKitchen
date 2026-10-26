<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import FileDown from '@lucide/svelte/icons/file-down';
	import Mail from '@lucide/svelte/icons/mail';
	import MailOpen from '@lucide/svelte/icons/mail-open';
	import Printer from '@lucide/svelte/icons/printer';
	import Save from '@lucide/svelte/icons/save';
	import Send from '@lucide/svelte/icons/send';
	import QRCode from 'qrcode';
	import { tick } from 'svelte';
	import Button from '#lib/components/Button.svelte';
	import { easing, wait } from '#lib/motion/easing.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import { ring } from '#lib/motion/particles.ts';
	import Demo, { type Level } from './Demo.svelte';

	// ---- E1. The QR code ----
	const qr = QRCode.create('https://example.org/plan/#plan=dVBLbsMgEL1KxKYbE2FnUdW7bnqCrFpF0RiPYyQMCIZUkeW7d3BatWkbiQXwPvPmzeIs2roSOfRA2D-TaEWjmkep', { errorCorrectionLevel: 'L' });
	const side = qr.modules.size;
	const modules: { x: number; y: number; finder: boolean; dx: number; dy: number; turn: number; wait: number }[] = [];
	for (let y = 0; y < side; y++)
		for (let x = 0; x < side; x++)
			if (qr.modules.get(x, y)) {
				const finder = (x < 8 && y < 8) || (x >= side - 8 && y < 8) || (x < 8 && y >= side - 8);
				modules.push({ x, y, finder, dx: (Math.random() - 0.5) * 900, dy: (Math.random() - 0.5) * 900, turn: (Math.random() - 0.5) * 720, wait: Math.random() * 300 });
			}
	let e1Level = $state<Level>('regular');
	let e1Key = $state(0);

	// ---- E2. Copy, send, save ----
	let e2Level = $state<Level>('regular');
	let copied = $state(false);
	let sent = $state(false);
	let saved = $state(false);
	let copyIcon = $state<HTMLElement>();
	let sendIcon = $state<HTMLElement>();
	let saveIcon = $state<HTMLElement>();
	let tray = $state<HTMLElement>();
	let trail = $state<SVGPathElement>();
	let saveRow = $state<HTMLElement>();

	async function doCopy(level: Level = e2Level) {
		copied = true;
		await tick();
		if (allows.flights() && level !== 'regular') {
			copyIcon?.animate([{ transform: 'scale(2.2) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1) rotate(0)', opacity: 1 }], { duration: 420, easing: easing('spring-bouncy') });
			const box = copyIcon?.getBoundingClientRect();
			if (box && level === 'crazy') ring(box.left + box.width / 2, box.top + box.height / 2, 'rgba(60,140,80,0.9)');
		}
		await wait(1500);
		copied = false;
	}
	async function doSend(level: Level = e2Level) {
		if (allows.flights() && level !== 'regular' && sendIcon) {
			if (level === 'playful') await sendIcon.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(46px,-46px) scale(0.2)', opacity: 0 }], { duration: 520, easing: easing('ease-in') }).finished.catch(() => {});
			else {
				trail?.animate([{ strokeDashoffset: 120, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 1100, easing: 'ease-out' });
				await sendIcon.animate(
					[
						{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
						{ transform: 'translate(18px,-26px) rotate(-120deg)', offset: 0.2 },
						{ transform: 'translate(38px,-6px) rotate(-250deg)', offset: 0.4 },
						{ transform: 'translate(14px,-12px) rotate(-340deg)', offset: 0.55 },
						{ transform: 'translate(70px,-70px) rotate(-360deg) scale(0.3)', opacity: 0 }
					],
					{ duration: 1000, easing: 'ease-in-out' }
				).finished.catch(() => {});
			}
		}
		sent = true;
		await tick();
		await wait(1500);
		sent = false;
	}
	async function doSave(level: Level = e2Level) {
		if (allows.flights() && level !== 'regular' && saveIcon) {
			tray?.animate([{ transform: 'translateY(10px) scaleX(0.4)', opacity: 0 }, { transform: 'translateY(0) scaleX(1)', opacity: 1 }], { duration: 240, fill: 'forwards' });
			await saveIcon.animate([{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(22px) scale(0.55)', opacity: 0.9 }], { duration: 420, delay: 120, easing: easing('ease-in'), fill: 'forwards' }).finished.catch(() => {});
			if (level === 'crazy') {
				saveRow?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(3px)', offset: 0.3 }, { transform: 'translateY(-2px)', offset: 0.6 }, { transform: 'translateY(0)' }], { duration: 300 });
				await wait(250);
				await tray?.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(120px)', opacity: 0 }], { duration: 360, easing: easing('ease-in'), fill: 'forwards' }).finished.catch(() => {});
			}
		}
		saved = true;
		await tick();
		await wait(1500);
		saved = false;
		saveIcon?.getAnimations().forEach((a) => a.cancel());
		tray?.getAnimations().forEach((a) => a.cancel());
	}
	function playShare(level: Level) {
		e2Level = level;
		void doCopy(level);
		setTimeout(() => void doSend(level), 350);
		setTimeout(() => void doSave(level), 700);
	}

	// ---- E3. A plan arrives ----
	let e3Level = $state<Level>('regular');
	let arrived = $state(false);
	let envelope = $state<'closed' | 'open' | null>(null);
	let incoming = $state<HTMLElement>();
	let mine = $state<HTMLElement>();
	let outcome = $state<'' | 'both' | 'replace'>('');

	async function arrive(level: Level) {
		e3Level = level;
		arrived = false;
		outcome = '';
		envelope = null;
		await tick();
		if (level === 'crazy') {
			envelope = 'closed';
			await wait(500);
			envelope = 'open';
			await wait(450);
		}
		arrived = true;
		await tick();
		if (!incoming || !allows.flights()) return;
		if (level === 'regular') incoming.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240 });
		if (level === 'playful') incoming.animate([{ transform: 'translateX(120px) rotate(8deg)', opacity: 0 }, { transform: 'translateX(0) rotate(0)', opacity: 1 }], { duration: 560, easing: easing('spring-soft') });
		if (level === 'crazy') incoming.animate([{ transform: 'translate(-30px, 70px) scale(0.3)', opacity: 0 }, { transform: 'translate(0, -20px) scale(1.06)', opacity: 1, offset: 0.6 }, { transform: 'translate(0,0) scale(1)' }], { duration: 700, easing: 'ease-out' });
	}
	async function decide(what: 'both' | 'replace') {
		outcome = what;
		await tick();
		if (!allows.flights()) return;
		if (what === 'replace' && e3Level !== 'regular') mine?.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(-60px) rotate(-6deg)', opacity: 0 }], { duration: 420, easing: easing('ease-in'), fill: 'forwards' });
		if (what === 'both' && e3Level !== 'regular') {
			mine?.animate([{ transform: 'translateX(0)' }, { transform: 'translate(14px, 6px) rotate(3deg)' }], { duration: 420, easing: easing('spring-soft'), fill: 'forwards' });
			incoming?.animate([{ transform: 'translateX(0)' }, { transform: 'translate(-14px, -4px) rotate(-3deg)' }], { duration: 420, easing: easing('spring-soft'), fill: 'forwards' });
		}
	}

	// ---- E4. The reminder banner ----
	let banner = $state(false);
	let saving = $state(false);
	let e4Level = $state<Level>('regular');
	let bannerEl = $state<HTMLElement>();
	let disk = $state<HTMLElement>();

	async function showBanner(level: Level) {
		e4Level = level;
		saving = false;
		banner = false;
		await tick();
		banner = true;
		await tick();
		if (!allows.flights()) return;
		const full = `${bannerEl?.scrollHeight ?? 90}px`;
		bannerEl?.animate([{ transform: 'translateY(-30px)', opacity: 0, maxHeight: '0px' }, { transform: 'translateY(0)', opacity: 1, maxHeight: full }], { duration: 360, easing: easing('spring-soft') });
		if (level === 'playful') disk?.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(0)' }], { duration: 600, delay: 380 });
	}
	async function hideBanner(save: boolean) {
		if (save) {
			saving = true;
			await wait(1000);
		}
		if (bannerEl && allows.flights()) await bannerEl.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-60px)', opacity: 0 }], { duration: 260, easing: easing('ease-in'), fill: 'forwards' }).finished.catch(() => {});
		banner = false;
		saving = false;
	}

	// ---- E5. Printing ----
	let e5Level = $state<Level>('regular');
	let paper = $state<HTMLElement>();
	async function print(level: Level) {
		e5Level = level;
		await tick();
		if (level === 'playful' && allows.flights()) paper?.animate([{ transform: 'translateY(-14px)', opacity: 0 }, { transform: 'translateY(-14px)', opacity: 1, offset: 0.1 }, { transform: 'translateY(26px)', opacity: 1, offset: 0.7 }, { transform: 'translateY(26px)', opacity: 0 }], { duration: 1200, easing: 'ease-out' });
	}
</script>

<Demo id="E1" title="The QR code" tall onplay={(l) => { e1Level = l; e1Key++; }}>
	{#snippet stage()}
		{#key e1Key}
			<svg class="qr" viewBox="-2 -2 {side + 4} {side + 4}" width="220" height="220" role="img" aria-label="A QR code" shape-rendering="crispEdges">
				<rect x="-2" y="-2" width={side + 4} height={side + 4} fill="var(--color-paper)" />
				{#each modules as m, i (i)}
					<rect
						class="m {e1Level}"
						class:finder={m.finder}
						x={m.x}
						y={m.y}
						width="1"
						height="1"
						style:--dx="{m.dx}px"
						style:--dy="{m.dy}px"
						style:--turn="{m.turn}deg"
						style:--d="{e1Level === 'crazy' ? m.wait : m.finder ? 0 : 80 + m.y * 7}ms"
					/>
				{/each}
			</svg>
		{/key}
	{/snippet}
</Demo>

<Demo id="E2" title="Copy, send and save" hint="Press a strength to play all three. Or tap a row." tall onplay={playShare}>
	{#snippet stage()}
		<div class="actions">
			<button class="act" onclick={() => doCopy()}>
				<span class="ic" bind:this={copyIcon}>{#if copied}<Check size={22} />{:else}<Copy size={22} />{/if}</span> Copy the link
			</button>
			<button class="act" onclick={() => doSend()}>
				<span class="ic">
					<svg class="trail" width="90" height="90" viewBox="0 0 90 90" aria-hidden="true"><path bind:this={trail} d="M12 80 C 20 40, 60 70, 40 50 S 60 20, 82 8" stroke-dasharray="4 6" fill="none" stroke="var(--color-mustard)" stroke-width="3" stroke-linecap="round" opacity="0" /></svg>
					<span class="plane" bind:this={sendIcon}>{#if sent}<Check size={22} />{:else}<Send size={22} />{/if}</span>
				</span> Send the link
			</button>
			<button class="act" bind:this={saveRow} onclick={() => doSave()}>
				<span class="ic">
					<span class="tray" bind:this={tray}></span>
					<span class="file" bind:this={saveIcon}>{#if saved}<Check size={22} />{:else}<FileDown size={22} />{/if}</span>
				</span> Save as a file
			</button>
		</div>
	{/snippet}
</Demo>

<Demo id="E3" title="A plan arrives" hint="Then choose Keep both or Replace. Crazy comes in an envelope." tall onplay={(l) => void arrive(l)}>
	{#snippet stage()}
		<div class="arrive">
			<div class="plans">
				<div class="plan-card" bind:this={mine}><strong>Mine</strong><span class="soft">Changed Oct 26</span><i></i><i></i></div>
				{#if envelope}
					<span class="envelope">{#if envelope === 'closed'}<Mail size={54} />{:else}<MailOpen size={54} />{/if}</span>
				{/if}
				{#if arrived}
					<div class="plan-card incoming" bind:this={incoming}><strong>Arrived</strong><span class="soft">Changed Jul 9</span><i></i><i></i></div>
				{/if}
			</div>
			<div class="decide">
				<Button variant="secondary" disabled={!arrived} onclick={() => decide('both')}>Keep both</Button>
				<Button variant="secondary" disabled={!arrived} onclick={() => decide('replace')}>Replace</Button>
			</div>
		</div>
	{/snippet}
</Demo>

<Demo id="E4" title="The reminder banner" levels={['regular', 'playful']} tall onplay={(l) => void showBanner(l)}>
	{#snippet stage()}
		<div class="page-mock">
			{#if banner}
				<div class="banner" bind:this={bannerEl}>
					{#if saving}
						<span class="saved"><Check size={20} /> Saved</span>
					{:else}
						<span class="banner-text"><span class="disk" bind:this={disk}><Save size={20} /></span> Your plan only lives on this device. Keep a copy?</span>
						<span class="banner-buttons"><Button variant="secondary" onclick={() => hideBanner(true)}>Save a file</Button><Button variant="secondary" onclick={() => hideBanner(false)}>Later</Button></span>
					{/if}
				</div>
			{/if}
			<strong class="mock-title">New event</strong>
			<span class="soft">100 people</span>
		</div>
	{/snippet}
</Demo>

<Demo id="E5" title="Printing" levels={['regular', 'playful']} onplay={(l) => void print(l)}>
	{#snippet stage()}
		<div class="printer">
			<span class="paper" bind:this={paper}></span>
			<span class="printer-icon" class:bounce={e5Level === 'playful'}><Printer size={46} /></span>
		</div>
	{/snippet}
</Demo>

<style>
	.qr {
		display: block;
		overflow: visible;
		border-radius: var(--radius-s);
	}
	.m {
		fill: var(--color-ink);
		transform-box: fill-box;
		transform-origin: center;
		animation-fill-mode: backwards;
	}
	.m.regular {
		animation: qr-fade 0.25s ease-out;
	}
	.m.playful {
		animation: qr-in 0.3s ease-out;
		animation-delay: var(--d);
	}
	.m.crazy {
		animation: qr-fly 0.9s cubic-bezier(0.2, 0.9, 0.25, 1);
		animation-delay: var(--d);
	}
	@keyframes qr-fade {
		from {
			opacity: 0;
		}
	}
	@keyframes qr-in {
		from {
			opacity: 0;
			transform: scale(0.2);
		}
	}
	@keyframes qr-fly {
		from {
			opacity: 0;
			transform: translate(var(--dx), var(--dy)) rotate(var(--turn)) scale(2);
		}
	}
	.actions {
		display: flex;
		flex-direction: column;
		width: min(280px, 100%);
	}
	.act {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) 0;
		border: 0;
		border-bottom: 1px solid var(--color-line);
		background: none;
		font: inherit;
		font-weight: var(--weight-bold);
		text-align: left;
		cursor: pointer;
	}
	.ic {
		position: relative;
		display: grid;
		place-items: center;
		flex: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--color-mustard-tint);
	}
	.plane,
	.file {
		position: relative;
		display: inline-flex;
		z-index: 1;
	}
	.trail {
		position: absolute;
		left: -10px;
		top: -50px;
		overflow: visible;
		pointer-events: none;
	}
	.tray {
		position: absolute;
		left: 8px;
		right: 8px;
		bottom: 3px;
		height: 8px;
		border: 3px solid var(--color-ink);
		border-top: 0;
		border-radius: 0 0 6px 6px;
		opacity: 0;
	}
	.arrive {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}
	.plans {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		min-height: 120px;
	}
	.plan-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 118px;
		padding: var(--space-3);
		border-radius: var(--radius-m);
		background: var(--color-paper);
		border: var(--border);
		font-size: var(--text-small);
	}
	.plan-card i {
		height: 7px;
		border-radius: 4px;
		background: var(--color-line);
	}
	.plan-card.incoming {
		border-color: var(--color-mustard);
	}
	.envelope {
		position: absolute;
		left: 50%;
		top: 20px;
		margin-left: -27px;
		color: var(--color-tomato);
		animation: m-pop 0.35s var(--spring-bouncy);
	}
	.decide {
		display: flex;
		gap: var(--space-2);
	}
	.page-mock {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: min(300px, 100%);
		min-height: 220px;
		overflow: hidden;
		padding: 0 var(--space-4) var(--space-4);
		border-radius: var(--radius-l);
		background: var(--color-paper);
	}
	.banner {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: 0 calc(-1 * var(--space-4)) var(--space-3);
		padding: 10px var(--space-4);
		background: var(--color-mustard-tint);
		font-size: var(--text-small);
	}
	.banner-text {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
	}
	.disk {
		display: inline-flex;
		flex: none;
	}
	.banner-buttons {
		display: flex;
		gap: var(--space-2);
	}
	.saved {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: 18px 0;
		color: var(--color-leaf);
		font-weight: var(--weight-bold);
	}
	.mock-title {
		font-size: var(--text-title);
		padding-top: var(--space-3);
	}
	.printer {
		position: relative;
		display: grid;
		place-items: center;
		width: 90px;
		height: 110px;
	}
	.printer-icon {
		position: relative;
		z-index: 1;
		display: inline-flex;
		color: var(--color-ink);
	}
	.paper {
		position: absolute;
		top: 40px;
		width: 30px;
		height: 38px;
		border-radius: 3px;
		border: 1.5px solid var(--color-line);
		background: #fff;
		opacity: 0;
	}
</style>
