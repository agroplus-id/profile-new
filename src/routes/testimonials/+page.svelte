<script lang="ts">
	import { onMount } from 'svelte';
	import { collection, getDocs } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { formatDate } from '$lib/admin/db';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { defaultTestimonials, TESTIMONIAL_CATEGORIES, type TestimonialItem } from '$lib/data/testimonials';

	let items = $state<TestimonialItem[]>([]);
	let loading = $state(true);
	let activeCategory = $state('All');

	onMount(async () => {
		try {
			const snap = await getDocs(collection(db, 'testimonials'));
			const rows = snap.docs
				.map((d) => ({ id: d.id, ...(d.data() as Omit<TestimonialItem, 'id'>) }))
				.filter((r) => r.published !== false)
				.sort((a, b) => String(b.date).localeCompare(String(a.date)));
			items = rows.length ? rows : defaultTestimonials;
		} catch (err) {
			console.warn('Gagal memuat testimoni, memakai cadangan.', err);
			items = defaultTestimonials;
		} finally {
			loading = false;
		}
	});

	const categories = ['All', ...TESTIMONIAL_CATEGORIES];

	const filtered = $derived(
		activeCategory === 'All' ? items : items.filter((it) => it.category === activeCategory)
	);
</script>

<svelte:head>
	<title>Testimonials &amp; Client Stories — AgroPlus.ID</title>
	<meta
		name="description"
		content="Discover how coffee processors, estates, and roasteries innovate and succeed with AgroPlus technologies."
	/>
</svelte:head>

<main class="site-shell">
	<section class="wrap">
		<p class="eyebrow">Client Impact</p>
		<h1>Testimonials &amp; Stories</h1>
		<p class="intro">
			Real experiences from coffee processors, farm estates, and roastery partners who elevate coffee quality, traceability, and operational consistency using AgroPlus solutions.
		</p>

		<!-- Category Filter Pills -->
		<div class="filters">
			{#each categories as cat}
				<button
					type="button"
					class="pill-btn"
					class:active={activeCategory === cat}
					onclick={() => (activeCategory = cat)}
				>
					{cat}
				</button>
			{/each}
		</div>

		{#if loading}
			<p class="state">Memuat cerita klien…</p>
		{:else if !filtered.length}
			<p class="state">Belum ada testimoni untuk kategori ini.</p>
		{:else}
			<div class="grid">
				{#each filtered as it, i (it.id)}
					<a class="card" href="/testimonials/{it.id}" style="--i:{Math.min(i, 8)}">
						<div class="thumb">
							{#if it.image}
								<img src={it.image} alt={it.clientName} loading="lazy" />
							{:else}
								<div class="thumb-alt" aria-hidden="true">
									<span class="quote-sign">“</span>
									<span class="alt-co">{it.clientCompany || 'AgroPlus Partner'}</span>
								</div>
							{/if}
						</div>

						<div class="meta">
							<span class="cat-badge">{it.category || 'Client Story'}</span>
							<i class="dot"></i>
							<span>{formatDate(it.date)}</span>
						</div>

						<h2>{it.title}</h2>

						{#if it.summary}
							<p class="quote">"{it.summary}"</p>
						{/if}

						<div class="author-block">
							<strong class="author-name">{it.clientName}</strong>
							<span class="author-details">{it.clientRole}{#if it.clientCompany} · {it.clientCompany}{/if}</span>
						</div>
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
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.22em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0 0 16px;
		color: #25330f;
		font-size: clamp(2.4rem, 5vw, 4.4rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.05;
	}

	.intro {
		max-width: 720px;
		margin: 0 0 clamp(32px, 4vw, 48px);
		color: #45552d;
		font-size: clamp(1rem, 1.2vw, 1.15rem);
		line-height: 1.6;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: clamp(36px, 5vw, 56px);
	}

	.pill-btn {
		cursor: pointer;
		padding: 8px 18px;
		border-radius: 999px;
		border: 1px solid rgba(85, 104, 61, 0.25);
		background: #ffffff;
		color: #45552d;
		font-size: 0.88rem;
		font-weight: 600;
		transition: all 0.25s ease;
	}

	.pill-btn:hover {
		border-color: #25330f;
		background: rgba(226, 232, 220, 0.4);
	}

	.pill-btn.active {
		background: #25330f;
		color: #ffffff;
		border-color: #25330f;
		box-shadow: 0 4px 14px rgba(37, 51, 15, 0.18);
	}

	.state {
		color: #6c7a5a;
		font-size: 1.1rem;
		padding: 40px 0;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: clamp(28px, 4vw, 44px);
	}

	.card {
		display: flex;
		flex-direction: column;
		background: #ffffff;
		border-radius: 16px;
		padding: 24px;
		color: inherit;
		text-decoration: none;
		border: 1px solid rgba(85, 104, 61, 0.12);
		box-shadow: 0 10px 30px rgba(37, 51, 15, 0.04);
		transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease;
		animation: rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) backwards;
		animation-delay: calc(var(--i) * 80ms);
	}

	.card:hover {
		transform: translateY(-6px);
		box-shadow: 0 20px 48px rgba(37, 51, 15, 0.09);
		border-color: rgba(85, 104, 61, 0.3);
	}

	.thumb {
		aspect-ratio: 1.35 / 1;
		border-radius: 12px;
		overflow: hidden;
		background: #e2e8dc;
		margin-bottom: 20px;
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.5s ease;
	}

	.card:hover .thumb img {
		transform: scale(1.04);
	}

	.thumb-alt {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #d8e4c6 0%, #c4d7ab 100%);
		padding: 20px;
		text-align: center;
	}

	.quote-sign {
		font-family: Georgia, serif;
		font-size: 3.5rem;
		line-height: 1;
		color: #55683d;
		opacity: 0.6;
	}

	.alt-co {
		font-size: 0.85rem;
		font-weight: 700;
		color: #25330f;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0 0 14px;
		font-size: 0.78rem;
		font-weight: 700;
		color: #55683d;
	}

	.cat-badge {
		background: rgba(85, 104, 61, 0.12);
		color: #384620;
		padding: 4px 10px;
		border-radius: 999px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.72rem;
	}

	.dot {
		width: 5px;
		height: 5px;
		background: #945600;
		border-radius: 1px;
	}

	h2 {
		margin: 0 0 12px;
		color: #25330f;
		font-size: clamp(1.15rem, 1.35vw, 1.45rem);
		line-height: 1.28;
		font-weight: 700;
	}

	.quote {
		margin: 0 0 20px;
		color: #45552d;
		font-size: 0.92rem;
		line-height: 1.6;
		font-style: italic;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.author-block {
		margin-top: auto;
		padding-top: 16px;
		border-top: 1px solid rgba(85, 104, 61, 0.15);
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.author-name {
		font-size: 0.95rem;
		font-weight: 700;
		color: #25330f;
	}

	.author-details {
		font-size: 0.8rem;
		color: #6a7b54;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

