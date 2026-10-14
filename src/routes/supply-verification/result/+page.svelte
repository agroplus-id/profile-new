<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { doc, getDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { VERIFIED_KEY, withDefaults, type Batch } from '$lib/batch';
	import { fetchImages, imageKeys } from '$lib/batch-images';
	import type { Order } from '$lib/admin/orders';
	import BumiKopiHero from '$lib/components/bumikopi/BumiKopiHero.svelte';
	import BumiKopiWhyVerified from '$lib/components/bumikopi/BumiKopiWhyVerified.svelte';
	import BumiKopiPassport from '$lib/components/bumikopi/BumiKopiPassport.svelte';
	import BumiKopiProductionChain from '$lib/components/bumikopi/BumiKopiProductionChain.svelte';
	import BumiKopiFlavors from '$lib/components/bumikopi/BumiKopiFlavors.svelte';
	import BumiKopiBatchDetails from '$lib/components/bumikopi/BumiKopiBatchDetails.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let batch = $state<Batch | null>(null);
	let itemNumber = $state(1);
	let images = $state<Record<string, string>>({});

	onMount(async () => {
		// Halaman ini hanya dibuka setelah form CoffeeID berhasil diverifikasi di tab yang sama.
		let code = '';
		try {
			code = sessionStorage.getItem(VERIFIED_KEY) ?? '';
		} catch {
			/* storage tidak tersedia */
		}
		if (!code) {
			goto('/supply-verification', { replaceState: true });
			return;
		}
		try {
			const orderSnap = await getDoc(doc(db, 'orders', code));
			const order = orderSnap.exists() ? (orderSnap.data() as Order & { itemNumber?: number }) : null;
			itemNumber = order?.itemNumber ?? 1;
			const batchSnap = order?.batch ? await getDoc(doc(db, 'batches', order.batch)) : null;
			const loaded = withDefaults(batchSnap?.exists() ? (batchSnap.data() as Partial<Batch>) : null);
			batch = loaded;
			// Gambar disimpan terpisah; dimuat setelah teks tampil agar halaman tidak menunggu.
			if (order?.batch && batchSnap?.exists()) {
				images = await fetchImages(order.batch, imageKeys(loaded.placePhotos?.length ?? 0, loaded.steps.length));
			}
		} catch (err) {
			console.warn('Gagal memuat data batch, memakai tampilan bawaan.', err);
			batch = withDefaults(null);
		}
	});
</script>

<svelte:head>
	<title>{batch ? `${batch.productName} — Supply Verification` : 'Supply Verification'} — AgroPlus.ID</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="site-shell">
	{#if batch}
		<BumiKopiHero {batch} {images} />
		<BumiKopiWhyVerified {batch} {images} />
		<!-- Kartu paspor baru tampil setelah datanya terisi (nomor paspor atau nomor lot). -->
		{#if batch.passportNumber || batch.lotNumber}
			<BumiKopiPassport {batch} {images} />
		{/if}
		<BumiKopiProductionChain {batch} {images} />
		<BumiKopiFlavors {batch} />
		<BumiKopiBatchDetails {batch} {itemNumber} />
		<SiteFooter />
	{:else}
		<div class="wait" aria-live="polite">Memuat data kopi Anda…</div>
	{/if}
</main>

<style>
	.wait {
		display: grid;
		place-items: center;
		min-height: 60vh;
		color: #849962;
		font-weight: 600;
	}
</style>
