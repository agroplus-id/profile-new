<script lang="ts">
	import BumiKopiHero from '$lib/components/bumikopi/BumiKopiHero.svelte';
	import BumiKopiWhyVerified from '$lib/components/bumikopi/BumiKopiWhyVerified.svelte';
	import BumiKopiPassport from '$lib/components/bumikopi/BumiKopiPassport.svelte';
	import BumiKopiProductionChain from '$lib/components/bumikopi/BumiKopiProductionChain.svelte';
	import BumiKopiFlavors from '$lib/components/bumikopi/BumiKopiFlavors.svelte';
	import BumiKopiBrewing from '$lib/components/bumikopi/BumiKopiBrewing.svelte';
	import BumiKopiBatchDetails from '$lib/components/bumikopi/BumiKopiBatchDetails.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<svelte:head>
	<title>Bumi Kopi — AgroPlus.ID</title>
	<meta
		name="description"
		content="Meet the efforts behind your package. Long before it reaches your cup, this Liberica coffee begins in the volcanic highlands of Wonosalam, East Java."
	/>
</svelte:head>

<main class="site-shell">
	<BumiKopiHero />
	<BumiKopiWhyVerified />
	<BumiKopiPassport />
	<BumiKopiProductionChain />
	<BumiKopiFlavors />
	<BumiKopiBrewing />
	<BumiKopiBatchDetails />
	<SiteFooter />
</main>
