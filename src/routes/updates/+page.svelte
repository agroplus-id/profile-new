<script lang="ts">
	import { onMount } from 'svelte';
	import { collection, getDocs } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { formatDate } from '$lib/admin/db';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	type Item = { id: string; title: string; category?: string; date: string; summary?: string; image?: string; published?: boolean };

	let items = $state<Item[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const snap = await getDocs(collection(db, 'updates'));
			items = snap.docs
				.map((d) => ({ id: d.id, ...(d.data() as Omit<Item, 'id'>) }))
				.filter((r) => r.published !== false)
				.sort((a, b) => String(b.date).localeCompare(String(a.date)));
		} catch (err) {
			console.warn('Gagal memuat berita', err);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Updates — AgroPlus.ID</title>
	<meta name="description" content="Latest news, press releases, and updates from AgroPlus.ID." />
</svelte:head>

<main class="site-shell">
	<section class="wrap">
		<p class="eyebrow">Updates</p>
		<h1>News &amp; stories</h1>

		{#if loading}
			<p class="state">Loading…</p>
		{:else if !items.length}
			<p class="state">No articles yet.</p>
		{:else}
			<div class="grid">
				{#each items as it, i (it.id)}
					<a class="card" href="/updates/{it.id}" style="--i:{Math.min(i, 8)}">
						<div class="thumb">{#if it.image}<img src={it.image} alt="" loading="lazy" />{/if}</div>
						<p class="meta"><span>{it.category || 'News'}</span><i></i>{formatDate(it.date)}</p>
						<h2>{it.title}</h2>
						{#if it.summary}<p class="sum">{it.summary}</p>{/if}
					</a>
				{/each}
			</div>
		{/if}
	</section>
	<SiteFooter />
</main>

<style>
	.wrap {
		max-width: 1180px;
		margin: 0 auto;
		padding: clamp(40px, 6vw, 90px) clamp(24px, 6vw, 80px) clamp(60px, 8vw, 120px);
	}

	.eyebrow {
		margin: 0 0 8px;
		color: #849962;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.22em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0 0 clamp(28px, 4vw, 56px);
		color: #849962;
		font-size: clamp(2.4rem, 5vw, 4.4rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1;
	}

	.state {
		color: #6c7a5a;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: clamp(24px, 3vw, 40px);
	}

	.card {
		display: grid;
		align-content: start;
		gap: 10px;
		color: inherit;
		text-decoration: none;
		animation: rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) backwards;
		animation-delay: calc(var(--i) * 70ms);
	}

	.thumb {
		aspect-ratio: 16 / 10;
		overflow: hidden;
		border-radius: 18px;
		background: #d8e4c6;
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.card:hover .thumb img {
		transform: scale(1.06);
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 6px 0 0;
		color: #849962;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.meta i {
		width: 20px;
		height: 1px;
		background: currentColor;
	}

	h2 {
		margin: 0;
		color: #25330f;
		font-size: 1.3rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.25;
	}

	.sum {
		margin: 0;
		color: #5f6e4e;
		font-size: 0.92rem;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
	}
</style>
