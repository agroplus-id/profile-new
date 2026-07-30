<script lang="ts">
	import AgroCaptureHero from '$lib/components/agrocapture/AgroCaptureHero.svelte';
	import AgroCaptureFeatures from '$lib/components/agrocapture/AgroCaptureFeatures.svelte';
	import AgroCaptureSpecs from '$lib/components/agrocapture/AgroCaptureSpecs.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<svelte:head>
	<title>AgroCapture — AgroPlus.ID</title>
	<meta name="description" content="AgroCapture, launching in 2026, is a digital coffee intelligence platform built for farm mapping, crop analysis, and harvest records." />
</svelte:head>

<main class="site-shell">
	<AgroCaptureHero />
	<AgroCaptureFeatures />
	<AgroCaptureSpecs />
	<SiteFooter />
</main>
