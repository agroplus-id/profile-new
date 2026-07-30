<script lang="ts">
	import FerroirHero from '$lib/components/ferroir/FerroirHero.svelte';
	import FerroirFeatures from '$lib/components/ferroir/FerroirFeatures.svelte';
	import FerroirSpecs from '$lib/components/ferroir/FerroirSpecs.svelte';
	import FerroirConnectivity from '$lib/components/ferroir/FerroirConnectivity.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<svelte:head>
	<title>AgroPlus.ID</title>
	<meta name="description" content="FERROIR is an integrated precision fermentation system, purpose-built for the upstream coffee industry. Launching 2027." />
</svelte:head>

<main class="site-shell">
	<FerroirHero />
	<FerroirFeatures />
	<FerroirSpecs />
	<FerroirConnectivity />
	<SiteFooter />
</main>
