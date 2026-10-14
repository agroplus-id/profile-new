<script lang="ts">
	import { onMount } from 'svelte';
	import { DEFAULT_BATCH, type Batch } from '$lib/batch';
	import { featuredBatchId, loadBatch } from '$lib/batch-load';
	import BatchPage from '$lib/components/bumikopi/BatchPage.svelte';

	// Halaman Bumi Kopi menampilkan batch yang dipilih admin (menu Batch → "Jadikan halaman Bumi Kopi").
	// Bila belum ada pilihan atau Firestore tidak terjangkau, tampil isi bawaan lama.
	let batch = $state<Batch | null>(null);
	let images = $state<Record<string, string>>({});
	let legacy = $state(false);

	onMount(async () => {
		try {
			const id = await featuredBatchId();
			const loaded = id ? await loadBatch(id) : null;
			if (loaded) {
				batch = loaded.batch;
				images = loaded.images;
				return;
			}
		} catch (err) {
			console.warn('Gagal memuat batch pilihan, memakai tampilan bawaan.', err);
		}
		legacy = true;
		batch = DEFAULT_BATCH;
	});
</script>

<svelte:head>
	<title>{batch ? `${batch.productName} — AgroPlus.ID` : 'Bumi Kopi — AgroPlus.ID'}</title>
	<meta
		name="description"
		content="Meet the efforts behind your package. Long before it reaches your cup, this Liberica coffee begins in the volcanic highlands of Wonosalam, East Java."
	/>
</svelte:head>

<main class="site-shell">
	{#if batch}
		<BatchPage {batch} {images} {legacy} itemNumber={null} />
	{:else}
		<div class="wait" aria-live="polite">Memuat…</div>
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
