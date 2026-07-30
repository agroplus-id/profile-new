<script lang="ts">
	import FermegoHero from '$lib/components/fermego/FermegoHero.svelte';
	import FermegoFeatures from '$lib/components/fermego/FermegoFeatures.svelte';
	import FermegoSpecs from '$lib/components/fermego/FermegoSpecs.svelte';
	import FermegoConnectivity from '$lib/components/fermego/FermegoConnectivity.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<svelte:head>
	<title>Fermego — AgroPlus.ID</title>
	<meta name="description" content="FERMEGO, launching in 2026, is a modular fermentation monitoring kit that transforms conventional fermentation into connected systems." />
</svelte:head>

<main class="site-shell">
	<FermegoHero />
	<FermegoFeatures />
	<FermegoSpecs />
	<FermegoConnectivity />
	<SiteFooter />
</main>
