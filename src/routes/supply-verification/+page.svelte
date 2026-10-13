<script lang="ts">
	import SignupCoffeeID from '$lib/components/signup/SignupCoffeeID.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<svelte:head>
	<title>Supply Verification — AgroPlus.ID</title>
	<meta
		name="description"
		content="Track your coffee with CoffeeID: verify your order and see the full journey of your beans, from origin to roasting."
	/>
</svelte:head>

<main class="site-shell">
	<SignupCoffeeID />
	<SiteFooter />
</main>
