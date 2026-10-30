<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Map as LeafletMap, Marker } from 'leaflet';

	// Peta untuk menjatuhkan pin lokasi pengiriman: klik peta atau pakai lokasi saat ini.
	let { lat = $bindable<number | null>(null), lng = $bindable<number | null>(null) }: { lat?: number | null; lng?: number | null } = $props();

	let el = $state<HTMLElement>();
	let busy = $state(false);
	let note = $state('');
	let map: LeafletMap | undefined;
	let marker: Marker | undefined;
	let L: typeof import('leaflet') | undefined;

	onMount(async () => {
		L = (await import('leaflet')).default as unknown as typeof import('leaflet');
		await import('leaflet/dist/leaflet.css');
		if (!el) return;
		const has = lat != null && lng != null;
		map = L.map(el, { zoomControl: true, scrollWheelZoom: false, attributionControl: false }).setView(has ? [lat as number, lng as number] : [-2.5, 118], has ? 16 : 4);
		const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
		L.tileLayer(`${esri}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16 }).addTo(map);
		L.tileLayer(`${esri}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16 }).addTo(map);
		map.on('click', (e) => place(e.latlng.lat, e.latlng.lng));
		if (has) drop(lat as number, lng as number);
		// Modal baru selesai beranimasi: ukur ulang agar petanya tidak terpotong.
		setTimeout(() => map?.invalidateSize(), 400);
	});

	onDestroy(() => map?.remove());

	function drop(la: number, ln: number) {
		if (!map || !L) return;
		const icon = L.divIcon({ className: 'pin-icon', html: '<span></span>', iconSize: [28, 28], iconAnchor: [14, 14] });
		if (marker) marker.setLatLng([la, ln]);
		else {
			marker = L.marker([la, ln], { icon, draggable: true }).addTo(map);
			marker.on('dragend', () => {
				const p = marker!.getLatLng();
				lat = Number(p.lat.toFixed(6));
				lng = Number(p.lng.toFixed(6));
			});
		}
	}

	function place(la: number, ln: number) {
		lat = Number(la.toFixed(6));
		lng = Number(ln.toFixed(6));
		drop(lat, lng);
	}

	function locate() {
		note = '';
		if (!navigator.geolocation) {
			note = 'Your browser cannot share its location.';
			return;
		}
		busy = true;
		navigator.geolocation.getCurrentPosition(
			(p) => {
				busy = false;
				place(p.coords.latitude, p.coords.longitude);
				map?.setView([p.coords.latitude, p.coords.longitude], 17);
			},
			() => {
				busy = false;
				note = 'We could not get your location. Tap the map to drop a pin instead.';
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}

	function clear() {
		lat = null;
		lng = null;
		marker?.remove();
		marker = undefined;
	}
</script>

<div class="pick">
	<div class="bar">
		<strong>Drop a pin on the map</strong>
		<span>
			<button type="button" class="ac-btn ghost sm" onclick={locate} disabled={busy}>{busy ? 'Locating…' : 'Use my location'}</button>
			{#if lat != null}<button type="button" class="ac-btn ghost sm" onclick={clear}>Clear</button>{/if}
		</span>
	</div>
	<div class="map" bind:this={el} data-lenis-prevent></div>
	<p class="ac-muted foot">
		{#if lat != null}Pin set at {lat}, {lng}. Drag it to fine-tune.{:else}Tap the map to place a pin (optional).{/if}
		{#if note}<br /><span class="warn">{note}</span>{/if}
	</p>
</div>

<style>
	.pick {
		display: grid;
		gap: 10px;
	}

	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		font-size: 0.9rem;
	}

	.bar span {
		display: inline-flex;
		gap: 8px;
	}

	.map {
		height: 240px;
		overflow: hidden;
		border: 1px solid rgba(37, 51, 15, 0.14);
		border-radius: 16px;
		background: #e9eeea;
	}

	.foot {
		margin: 0;
		font-size: 0.8rem;
	}

	.warn {
		color: #8e2a20;
	}

	.pick :global(.pin-icon span) {
		display: block;
		width: 28px;
		height: 28px;
		border: 4px solid #fff;
		border-radius: 50%;
		background: #0f5a2c;
		box-shadow: 0 6px 16px rgba(15, 90, 44, 0.5);
	}
</style>
