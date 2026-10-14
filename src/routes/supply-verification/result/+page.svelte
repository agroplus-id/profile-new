<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { doc, getDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { VERIFIED_KEY, withDefaults, type Batch } from '$lib/batch';
	import { loadBatch } from '$lib/batch-load';
	import type { Order } from '$lib/admin/orders';
	import BatchPage from '$lib/components/bumikopi/BatchPage.svelte';

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
			const loaded = order?.batch ? await loadBatch(order.batch) : null;
			batch = loaded?.batch ?? withDefaults(null);
			images = loaded?.images ?? {};
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
		<BatchPage {batch} {images} {itemNumber} />
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
