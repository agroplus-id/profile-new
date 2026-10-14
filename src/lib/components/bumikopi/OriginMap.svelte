<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Map as LeafletMap } from 'leaflet';

	type Photo = { src: string; caption: string; lat?: number; lng?: number };

	let {
		lat,
		lng,
		place,
		note = '',
		photos = []
	}: { lat: number; lng: number; place: string; note?: string; photos?: Photo[] } = $props();

	let mapEl = $state<HTMLElement>();
	let map: LeafletMap | undefined;
	let marker: HTMLElement | undefined;
	let zoomed = $state(false);
	let cardOpen = $state(false);
	let slide = $state(0);
	let track = $state<HTMLElement>();
	let ready = $state(false);
	let extra: [number, number][] = [];

	const hasPoint = (p: Photo) => p.lat != null && p.lng != null;
	const current = $derived(photos[slide]);
	const cardTitle = $derived(current && hasPoint(current) && current.caption ? current.caption : place);
	const cardLat = $derived(current && hasPoint(current) ? (current.lat as number) : lat);
	const cardLng = $derived(current && hasPoint(current) ? (current.lng as number) : lng);

	function openPhoto(i: number) {
		slide = i;
		cardOpen = true;
		queueMicrotask(() => track?.scrollTo({ left: i * (track?.clientWidth ?? 0), behavior: 'auto' }));
	}

	const WORLD_ZOOM = 3;
	const CLOSE_ZOOM = 9;
	const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	onMount(async () => {
		const L = (await import('leaflet')).default;
		await import('leaflet/dist/leaflet.css');
		if (!mapEl) return;

		const m = L.map(mapEl, {
			zoomControl: false,
			scrollWheelZoom: false,
			dragging: false,
			touchZoom: false,
			doubleClickZoom: false,
			boxZoom: false,
			keyboard: false,
			minZoom: 2,
			worldCopyJump: true
		}).setView([lat, lng], WORLD_ZOOM);
		map = m;

		// Peta abu-abu terang (Esri World Light Gray) yang senada dengan desain, tanpa kunci API.
		// Lapisan kedua hanya memuat nama tempat/negara.
		const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
		L.tileLayer(`${esri}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, {
			maxZoom: 16,
			attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
		}).addTo(m);
		L.tileLayer(`${esri}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16 }).addTo(m);

		// Penanda: titik hijau berdenyut + thumbnail foto yang "muncul" melingkar saat peta diperbesar
		const root = document.createElement('div');
		root.className = 'om-marker';
		root.setAttribute('role', 'button');
		root.tabIndex = 0;
		root.setAttribute('aria-label', place);
		root.innerHTML = '<span class="om-pulse"></span><span class="om-dot"></span><span class="om-label"></span>';
		(root.querySelector('.om-label') as HTMLElement).textContent = place.split(',')[0];
		// Foto tanpa koordinat mengelilingi titik utama; foto berkoordinat punya penanda sendiri di titiknya.
		const ring = photos.map((p, i) => ({ p, i })).filter((x) => !hasPoint(x.p)).slice(0, 6);
		ring.forEach(({ p, i: idx }, i, arr) => {
			const t = document.createElement('button');
			t.type = 'button';
			t.className = 'om-photo';
			t.style.setProperty('--a', `${(360 / arr.length) * i - 90}deg`);
			t.style.setProperty('--i', String(i));
			t.setAttribute('aria-label', p.caption || `Foto ${i + 1}`);
			const img = document.createElement('img');
			img.src = p.src;
			img.alt = '';
			t.appendChild(img);
			t.addEventListener('click', (e) => {
				e.stopPropagation();
				if (!zoomed) return;
				openPhoto(idx);
			});
			root.appendChild(t);
		});
		root.addEventListener('click', () => (zoomed ? (cardOpen = true) : zoomIn()));
		root.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				zoomed ? (cardOpen = true) : zoomIn();
			}
		});
		L.DomEvent.disableClickPropagation(root);
		marker = root;

		L.marker([lat, lng], {
			icon: L.divIcon({ html: root, className: 'om-icon', iconSize: [0, 0] }),
			keyboard: false
		}).addTo(m);

		photos.forEach((p, i) => {
			if (!hasPoint(p)) return;
			const pin = document.createElement('button');
			pin.type = 'button';
			pin.className = 'om-pin';
			pin.setAttribute('aria-label', p.caption || `Foto ${i + 1}`);
			const img = document.createElement('img');
			img.src = p.src;
			img.alt = '';
			pin.appendChild(img);
			pin.addEventListener('click', (e) => {
				e.stopPropagation();
				if (!zoomed) return;
				openPhoto(i);
				m.flyTo([p.lat as number, p.lng as number], Math.max(m.getZoom(), 13), { duration: reduce() ? 0 : 1 });
			});
			L.DomEvent.disableClickPropagation(pin);
			L.marker([p.lat as number, p.lng as number], {
				icon: L.divIcon({ html: pin, className: 'om-icon om-pin-icon', iconSize: [0, 0] }),
				keyboard: false
			}).addTo(m);
			extra.push([p.lat as number, p.lng as number]);
		});
		ready = true;
	});

	onDestroy(() => map?.remove());

	function fly(zoom: number, then?: () => void) {
		if (!map) return;
		const done = () => then?.();
		if (reduce()) {
			map.setView([lat, lng], zoom, { animate: false });
			done();
			return;
		}
		map.once('moveend', done);
		map.flyTo([lat, lng], zoom, { duration: 1.7, easeLinearity: 0.2 });
	}

	function zoomIn() {
		zoomed = true;
		marker?.classList.add('open');
		map?.dragging.enable();
		map?.touchZoom.enable();
		if (extra.length && map) {
			const pts: [number, number][] = [[lat, lng], ...extra];
			const done = () => (cardOpen = true);
			if (reduce()) {
				map.fitBounds(pts, { padding: [60, 60], maxZoom: 14, animate: false });
				done();
			} else {
				map.once('moveend', done);
				map.flyToBounds(pts, { padding: [60, 60], maxZoom: 14, duration: 1.7 });
			}
			return;
		}
		fly(CLOSE_ZOOM, () => (cardOpen = true));
	}

	function zoomOut() {
		cardOpen = false;
		zoomed = false;
		marker?.classList.remove('open');
		map?.dragging.disable();
		map?.touchZoom.disable();
		fly(WORLD_ZOOM);
	}

	function onScroll() {
		if (!track) return;
		slide = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
	}

	function go(i: number) {
		const n = Math.max(0, Math.min(photos.length - 1, i));
		track?.scrollTo({ left: n * (track?.clientWidth ?? 0), behavior: 'smooth' });
	}
</script>

<div class="origin-map" class:zoomed>
	<div class="map" bind:this={mapEl} aria-label="Peta lokasi asal: {place}"></div>

	{#if !ready}<div class="loading">Memuat peta…</div>{/if}

	{#if ready && !zoomed}
		<p class="hint-chip">Klik titik hijau untuk melihat lokasi</p>
	{/if}

	{#if zoomed}
		<button type="button" class="back" onclick={zoomOut}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
			Peta dunia
		</button>
	{/if}

	{#if cardOpen}
		<div class="card" role="dialog" aria-label={cardTitle}>
			<button type="button" class="x" onclick={() => (cardOpen = false)} aria-label="Tutup kartu">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
			</button>

			{#if photos.length}
				<div class="gallery">
					<div class="track" bind:this={track} onscroll={onScroll}>
						{#each photos as p}
							<figure>
								<img src={p.src} alt={p.caption} />
								{#if p.caption}<figcaption>{p.caption}</figcaption>{/if}
							</figure>
						{/each}
					</div>
					{#if photos.length > 1}
						<button type="button" class="nav prev" onclick={() => go(slide - 1)} disabled={slide === 0} aria-label="Foto sebelumnya">‹</button>
						<button type="button" class="nav next" onclick={() => go(slide + 1)} disabled={slide === photos.length - 1} aria-label="Foto berikutnya">›</button>
						<div class="dots">
							{#each photos as _, i}<i class:on={i === slide}></i>{/each}
						</div>
					{/if}
				</div>
			{:else}
				<div class="gallery empty">
					<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
				</div>
			{/if}

			<div class="info">
				<h4>{cardTitle}</h4>
				{#if note}<p>{note}</p>{/if}
				<a href="https://www.google.com/maps?q={cardLat},{cardLng}" target="_blank" rel="noopener noreferrer">
					Buka di Google Maps
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9" /></svg>
				</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.origin-map {
		position: relative;
		overflow: hidden;
		border: 1px solid rgba(37, 51, 15, 0.12);
		border-radius: 20px;
		background: #e9eeea;
		isolation: isolate;
	}

	.map {
		width: 100%;
		height: clamp(300px, 34vw, 420px);
		background: #e9eeea;
	}

	.loading {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: #6c7a5a;
		font-size: 0.85rem;
	}

	.hint-chip {
		position: absolute;
		left: 50%;
		bottom: 16px;
		z-index: 500;
		margin: 0;
		padding: 8px 16px;
		translate: -50% 0;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.92);
		box-shadow: 0 8px 24px rgba(20, 28, 12, 0.18);
		color: #45552d;
		font-size: 0.78rem;
		font-weight: 600;
		white-space: nowrap;
		animation: chip-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
		pointer-events: none;
	}

	.back {
		position: absolute;
		top: 14px;
		left: 14px;
		z-index: 600;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 8px 14px 8px 10px;
		border: 0;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 8px 24px rgba(20, 28, 12, 0.2);
		color: #45552d;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		animation: chip-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	/* Kartu tempat bergaya Google Maps */
	.card {
		position: absolute;
		left: 14px;
		bottom: 14px;
		z-index: 600;
		width: min(340px, calc(100% - 28px));
		overflow: hidden;
		border-radius: 18px;
		background: #fff;
		box-shadow: 0 24px 60px rgba(20, 28, 12, 0.35);
		animation: card-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	.x {
		position: absolute;
		top: 10px;
		right: 10px;
		z-index: 3;
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.92);
		color: #25330f;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.gallery {
		position: relative;
		background: #dfe6da;
	}

	.gallery.empty {
		display: grid;
		place-items: center;
		height: 120px;
		color: #849962;
		background: linear-gradient(145deg, #e8efe0, #d3deca);
	}

	.track {
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
	}

	.track::-webkit-scrollbar {
		display: none;
	}

	figure {
		position: relative;
		flex: 0 0 100%;
		margin: 0;
		scroll-snap-align: start;
	}

	figure img {
		display: block;
		width: 100%;
		height: 190px;
		object-fit: cover;
	}

	figcaption {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 22px 14px 10px;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
		color: #fff;
		font-size: 0.78rem;
		font-weight: 500;
	}

	.nav {
		position: absolute;
		top: 50%;
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		padding: 0;
		translate: 0 -50%;
		border: 0;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.92);
		color: #25330f;
		font-size: 1.3rem;
		line-height: 1;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: opacity 0.3s ease;
	}

	.nav:disabled {
		opacity: 0;
		pointer-events: none;
	}

	.prev {
		left: 8px;
	}

	.next {
		right: 8px;
	}

	.dots {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 8px;
		display: flex;
		justify-content: center;
		gap: 5px;
		pointer-events: none;
	}

	.dots i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.55);
		transition:
			width 0.3s ease,
			background-color 0.3s ease;
	}

	.dots i.on {
		width: 16px;
		border-radius: 3px;
		background: #fff;
	}

	.info {
		display: grid;
		gap: 6px;
		padding: 14px 16px 16px;
	}

	.info h4 {
		margin: 0;
		color: #25330f;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.25;
	}

	.info p {
		margin: 0;
		color: #5f6e4e;
		font-size: 0.84rem;
		line-height: 1.45;
	}

	.info a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		justify-self: start;
		margin-top: 4px;
		color: #55683d;
		font-size: 0.82rem;
		font-weight: 600;
		text-decoration: none;
	}

	.info a:hover {
		text-decoration: underline;
	}

	@keyframes card-in {
		from {
			opacity: 0;
			transform: translateY(26px) scale(0.96);
		}
	}

	@keyframes chip-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
	}

	/* ───── Elemen yang dibuat Leaflet (di luar scope Svelte) ───── */
	.origin-map :global(.leaflet-container) {
		background: #e9eeea;
		font-family: inherit;
	}

	.origin-map :global(.om-icon) {
		overflow: visible;
		background: none;
		border: 0;
	}

	.origin-map :global(.om-marker) {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;
		cursor: pointer;
	}

	.origin-map :global(.om-dot) {
		position: absolute;
		left: -9px;
		top: -9px;
		width: 18px;
		height: 18px;
		border: 3px solid #fff;
		border-radius: 50%;
		background: #0f5a2c;
		box-shadow: 0 4px 14px rgba(15, 90, 44, 0.55);
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* Foto yang punya koordinat sendiri: bulatan foto di titiknya, hanya tampil saat peta diperbesar */
	.origin-map :global(.om-pin) {
		position: absolute;
		left: -23px;
		top: -23px;
		width: 46px;
		height: 46px;
		padding: 0;
		overflow: hidden;
		border: 3px solid #fff;
		border-radius: 50%;
		background: #cfd9c6;
		box-shadow: 0 8px 20px rgba(20, 28, 12, 0.4);
		cursor: pointer;
		opacity: 0;
		pointer-events: none;
		transform: scale(0.2);
		transition:
			transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1s,
			opacity 0.5s ease 1s;
	}

	.origin-map.zoomed :global(.om-pin) {
		opacity: 1;
		pointer-events: auto;
		transform: scale(1);
	}

	.origin-map.zoomed :global(.om-pin:hover) {
		transform: scale(1.15);
		transition-delay: 0s;
	}

	.origin-map :global(.om-pin img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.origin-map :global(.om-marker:hover .om-dot) {
		transform: scale(1.2);
	}

	.origin-map :global(.om-pulse) {
		position: absolute;
		left: -22px;
		top: -22px;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: rgba(15, 90, 44, 0.35);
		animation: om-pulse 2.2s cubic-bezier(0.62, 0.05, 0.01, 0.99) infinite;
	}

	.origin-map :global(.om-label) {
		position: absolute;
		left: 16px;
		top: -12px;
		padding: 3px 10px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 4px 14px rgba(20, 28, 12, 0.2);
		color: #25330f;
		font-size: 0.74rem;
		font-weight: 700;
		white-space: nowrap;
	}

	/* Thumbnail foto muncul melingkar di sekitar titik saat peta sudah diperbesar */
	.origin-map :global(.om-photo) {
		position: absolute;
		left: -23px;
		top: -23px;
		width: 46px;
		height: 46px;
		padding: 0;
		overflow: hidden;
		border: 3px solid #fff;
		border-radius: 50%;
		background: #cfd9c6;
		box-shadow: 0 8px 20px rgba(20, 28, 12, 0.4);
		cursor: pointer;
		opacity: 0;
		pointer-events: none;
		transform: translate(0, 0) scale(0.2);
		transition:
			transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
			opacity 0.5s ease;
		transition-delay: calc(var(--i) * 0.08s);
	}

	.origin-map :global(.om-photo img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.origin-map :global(.om-marker.open .om-photo) {
		opacity: 1;
		pointer-events: auto;
		transform: rotate(var(--a)) translate(78px) rotate(calc(var(--a) * -1)) scale(1);
		transition-delay: calc(1.1s + var(--i) * 0.09s);
	}

	.origin-map :global(.om-marker.open .om-photo:hover) {
		transform: rotate(var(--a)) translate(78px) rotate(calc(var(--a) * -1)) scale(1.15);
		transition-delay: 0s;
	}

	.origin-map :global(.leaflet-control-attribution) {
		font-size: 10px;
		background: rgba(255, 255, 255, 0.7);
	}

	@keyframes om-pulse {
		0% {
			transform: scale(0.4);
			opacity: 0.9;
		}
		100% {
			transform: scale(1.5);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origin-map :global(.om-pulse),
		.card,
		.back,
		.hint-chip {
			animation: none;
		}
	}
</style>
