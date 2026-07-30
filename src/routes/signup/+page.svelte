<script lang="ts">
	import SignupCoffeeID from '$lib/components/signup/SignupCoffeeID.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<svelte:head>
	<title>CoffeeID — AgroPlus.ID</title>
	<meta name="description" content="Track your coffee order status with CoffeeID by AgroPlus.ID." />
</svelte:head>

<main class="site-shell">
	<SignupCoffeeID />
	<SiteFooter />
</main>
