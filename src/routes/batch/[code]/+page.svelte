<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { Batch } from '$lib/batch';
	import { loadBatch } from '$lib/batch-load';
	import BatchPage from '$lib/components/bumikopi/BatchPage.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let batch = $state<Batch | null>(null);
	let images = $state<Record<string, string>>({});
	let phase = $state<'loading' | 'ok' | 'missing'>('loading');

	onMount(async () => {
		try {
			const loaded = await loadBatch(page.params.code as string);
			if (!loaded) {
				phase = 'missing';
				return;
			}
			batch = loaded.batch;
			images = loaded.images;
			phase = 'ok';
		} catch {
			phase = 'missing';
		}
	});
</script>

<svelte:head>
	<title>{batch ? `${batch.productName} — AgroPlus.ID` : 'Batch — AgroPlus.ID'}</title>
</svelte:head>

<main class="site-shell">
	{#if phase === 'ok' && batch}
		<!-- Pratinjau publik batch: tanpa nomor kemasan karena tidak ada pesanan tertentu -->
		<BatchPage {batch} {images} itemNumber={null} />
	{:else if phase === 'missing'}
		<div class="wait">Batch tidak ditemukan.</div>
		<SiteFooter />
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
