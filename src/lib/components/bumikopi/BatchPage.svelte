<script lang="ts">
	import type { Batch } from '$lib/batch';
	import BumiKopiHero from './BumiKopiHero.svelte';
	import BumiKopiWhyVerified from './BumiKopiWhyVerified.svelte';
	import BumiKopiPassport from './BumiKopiPassport.svelte';
	import BumiKopiProductionChain from './BumiKopiProductionChain.svelte';
	import BumiKopiFlavors from './BumiKopiFlavors.svelte';
	import BumiKopiBatchDetails from './BumiKopiBatchDetails.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	// Satu halaman batch lengkap. Dipakai oleh hasil verifikasi, halaman /batch/<kode>, dan /bumi-kopi.
	// legacy = tampilan statis lama (tanpa data batch): kartu paspor memakai grafis bawaan.
	let {
		batch,
		images = {},
		itemNumber = null,
		legacy = false
	}: { batch: Batch; images?: Record<string, string>; itemNumber?: number | null; legacy?: boolean } = $props();
</script>

<BumiKopiHero {batch} {images} />
<BumiKopiWhyVerified {batch} {images} />
{#if legacy}
	<BumiKopiPassport />
{:else if batch.passportNumber || batch.lotNumber}
	<BumiKopiPassport {batch} {images} />
{/if}
<BumiKopiProductionChain {batch} {images} />
<BumiKopiFlavors {batch} />
<BumiKopiBatchDetails {batch} {itemNumber} />
<SiteFooter />
