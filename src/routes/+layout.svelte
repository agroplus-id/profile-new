<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SiteHeader />
{@render children()}
