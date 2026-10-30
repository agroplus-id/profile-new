<script lang="ts">
	import type { Snippet } from 'svelte';
	import '$lib/components/account/account.css';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let { title, updated, children }: { title: string; updated: string; children: Snippet } = $props();
</script>

<main class="site-shell">
	<div class="ac-page">
		<article class="ac-narrow doc ac-rise" style="--d:0">
			<h1 class="ac-title">{title}</h1>
			<p class="ac-muted">Last updated {updated}</p>
			<div class="body">{@render children()}</div>
		</article>
	</div>
	<SiteFooter />
</main>

<style>
	.doc {
		width: min(100%, 760px);
	}

	.body {
		margin-top: 28px;
		color: #3a4a26;
		font-size: 0.98rem;
		line-height: 1.75;
	}

	.body :global(h2) {
		margin: 32px 0 8px;
		color: #25330f;
		font-size: 1.2rem;
	}

	.body :global(p),
	.body :global(ul) {
		margin: 0 0 12px;
	}

	.body :global(li) {
		margin-bottom: 6px;
	}

	.body :global(a) {
		color: #55683d;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
