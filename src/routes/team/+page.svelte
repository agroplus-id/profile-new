<script lang="ts">
	import TeamHero from '$lib/components/team/TeamHero.svelte';
	import TeamMembers from '$lib/components/team/TeamMembers.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<svelte:head>
	<title>Team — AgroPlus.ID</title>
	<meta
		name="description"
		content="Meet the team, leadership, and advisors building humanity's coffee upstream industry at AgroPlus.ID."
	/>
</svelte:head>

<main class="site-shell">
	<TeamHero />
	<TeamMembers />
	<SiteFooter />
</main>
