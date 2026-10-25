/// <reference types="@sveltejs/kit" />
import { self } from '$app/service-worker';
import { version } from '$app/env';
import { immutable, assets, prerendered } from '$app/manifest';

// The offline cache. Everything the app is made of is stored on the first visit, so the app opens without a network.
// The cache is named after the build, so every deploy starts a fresh one and the old one is deleted.
const CACHE = `hk-${version}`;
// The paths are relative to this file, so they follow the base path. The home page's path is empty, which would mean this file itself.
const PRECACHE = [...immutable, ...assets, ...prerendered].map((entry) => entry.path || './');

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(PRECACHE))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const request = event.request;
	if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			// Pages: the network first, so a new deploy shows up as soon as there is a connection.
			// Without one, the stored copy is used.
			if (request.mode === 'navigate') {
				try {
					const fresh = await fetch(request);
					if (fresh.ok) cache.put(request, fresh.clone());
					return fresh;
				} catch {
					const stored =
						(await cache.match(request, { ignoreSearch: true })) ??
						// A page is stored with a slash at the end, but someone may have typed the address without one.
						(await cache.match(new URL(`${new URL(request.url).pathname.replace(/\/$/, '')}/`, request.url), { ignoreSearch: true }));
					if (stored) return stored;
					throw new Error('offline and not stored');
				}
			}
			// Everything else: the stored copy first. Files are named by their content, so they never go stale.
			const stored = await cache.match(request);
			if (stored) return stored;
			const fresh = await fetch(request);
			if (fresh.ok) cache.put(request, fresh.clone());
			return fresh;
		})()
	);
});
