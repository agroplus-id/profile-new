<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import '../app.css';
	import { page } from '$app/state';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import IntroSplash from '$lib/components/IntroSplash.svelte';
	import { initSmoothScroll, destroySmoothScroll } from '$lib/smooth-scroll';
	import { startSession } from '$lib/account/session.svelte';

	let { children } = $props();

	// Dashboard admin punya layout sendiri: tanpa navbar publik dan tanpa smooth scroll.
	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));

	$effect(() => {
		if (isAdmin) return;
		startSession();
		initSmoothScroll();
		return destroySmoothScroll;
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={favicon} />
</svelte:head>

{#if !isAdmin}
	<IntroSplash />
	<SiteHeader />
{/if}
{@render children()}
