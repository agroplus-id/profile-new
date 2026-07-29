<script lang="ts">
	import '../app.css';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import IntroSection from '$lib/components/IntroSection.svelte';
	import MissionSection from '$lib/components/MissionSection.svelte';
	import NewsSections from '$lib/components/NewsSections.svelte';
	import ProductShowcase from '$lib/components/ProductShowcase.svelte';
	import ProofSection from '$lib/components/ProofSection.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
</script>

<svelte:head>
	<title>AgroPlus.ID</title>
	<meta name="description" content="AgroPlus.ID landing page for upstream coffee technology products." />
</svelte:head>

<main class="site-shell">
	<SiteHeader />
	<HeroSection />
	<IntroSection />
	<ProofSection />
	<ProductShowcase />
	<MissionSection />
	<NewsSections />
	<SiteFooter />
</main>
