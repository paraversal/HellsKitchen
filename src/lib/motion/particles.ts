// Confetti, crumbs and rain: one canvas over the whole screen that exists only while something is falling. Written here, about a hundred lines, so the app needs no library for it.
import { allows } from './mode.svelte.ts';

type Particle = { x: number; y: number; vx: number; vy: number; rot: number; vrot: number; size: number; color: string; kind: 'confetti' | 'crumb' | 'ring'; age: number; life: number; gravity: number };

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim() || '#c24a2c';
export const PALETTE = () => ['tomato', 'mustard', 'leaf', 'sky', 'plum'].map(token);

let canvas: HTMLCanvasElement | undefined;
let particles: Particle[] = [];
let frame = 0;
let last = 0;

function loop(now: number) {
	const context = canvas?.getContext('2d');
	if (!canvas || !context) return;
	const dt = Math.min(0.04, (now - last) / 1000);
	last = now;
	context.clearRect(0, 0, canvas.width, canvas.height);
	const scale = canvas.width / innerWidth;
	particles = particles.filter((p) => p.age < p.life && p.y < innerHeight + 40);
	for (const p of particles) {
		p.age += dt;
		p.vy += p.gravity * dt;
		p.vx *= 1 - 0.8 * dt;
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		p.rot += p.vrot * dt;
		const fade = Math.min(1, (p.life - p.age) * 3);
		context.save();
		context.globalAlpha = Math.max(0, fade);
		context.translate(p.x * scale, p.y * scale);
		context.rotate(p.rot);
		context.fillStyle = p.color;
		context.strokeStyle = p.color;
		if (p.kind === 'confetti') context.fillRect((-p.size / 2) * scale, (-p.size / 4) * scale, p.size * scale, (p.size / 2) * scale);
		else if (p.kind === 'crumb') {
			context.beginPath();
			context.arc(0, 0, (p.size / 2) * scale, 0, Math.PI * 2);
			context.fill();
		} else {
			context.lineWidth = 3 * scale;
			context.beginPath();
			context.arc(0, 0, (p.size * (0.4 + p.age / p.life)) * scale, 0, Math.PI * 2);
			context.stroke();
		}
		context.restore();
	}
	if (particles.length) frame = requestAnimationFrame(loop);
	else stop();
}

function stop() {
	cancelAnimationFrame(frame);
	frame = 0;
	canvas?.remove();
	canvas = undefined;
}

function add(more: Particle[]) {
	if (!allows.particles()) return;
	if (!canvas) {
		canvas = document.createElement('canvas');
		const ratio = Math.min(2, devicePixelRatio || 1);
		canvas.width = innerWidth * ratio;
		canvas.height = innerHeight * ratio;
		canvas.setAttribute('aria-hidden', 'true');
		canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100000';
		document.body.append(canvas);
	}
	particles.push(...more);
	if (!frame) {
		last = performance.now();
		frame = requestAnimationFrame(loop);
	}
}

const between = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export type BurstOptions = { x: number; y: number; count?: number; angle?: number; spread?: number; speed?: number; kind?: 'confetti' | 'crumb'; colors?: string[]; gravity?: number; life?: number; size?: number };

/** A burst of particles from a point. `angle` is in degrees, 0 to the right, -90 straight up. */
export function burst({ x, y, count = 30, angle = -90, spread = 360, speed = 420, kind = 'confetti', colors = PALETTE(), gravity = 900, life = 1.6, size = 10 }: BurstOptions): void {
	const list: Particle[] = [];
	for (let i = 0; i < count; i++) {
		const a = ((angle + between(-spread / 2, spread / 2)) * Math.PI) / 180;
		const v = between(speed * 0.4, speed);
		list.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: between(0, 6), vrot: between(-10, 10), size: between(size * 0.6, size * 1.2), color: pick(colors), kind, age: 0, life: between(life * 0.7, life), gravity });
	}
	add(list);
}

/** A ring that grows and fades, from a point. */
export function ring(x: number, y: number, color = token('tomato')): void {
	add([{ x, y, vx: 0, vy: 0, rot: 0, vrot: 0, size: 26, color, kind: 'ring', age: 0, life: 0.5, gravity: 0 }]);
}

/** Confetti falling from above the top edge across the whole width, for `seconds`. */
export function shower(seconds = 2.5): void {
	const end = performance.now() + seconds * 1000;
	const drop = () => {
		if (performance.now() > end) return;
		burst({ x: between(0, innerWidth), y: -10, count: 6, angle: 90, spread: 40, speed: 160, gravity: 260, life: 5 });
		setTimeout(drop, 90);
	};
	drop();
}
