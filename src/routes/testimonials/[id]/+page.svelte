<script lang="ts">
	import '$lib/article.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { doc, getDoc } from 'firebase/firestore';
	import DOMPurify from 'dompurify';
	import { db } from '$lib/firebase';
	import { formatDate } from '$lib/admin/db';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { defaultTestimonials, type TestimonialItem } from '$lib/data/testimonials';

	let meta = $state<TestimonialItem | null>(null);
	let body = $state('');
	let phase = $state<'loading' | 'ok' | 'missing'>('loading');
	let minutes = $state(1);

	onMount(async () => {
		const id = page.params.id as string;
		try {
			// Coba ambil dari Firestore
			const snap = await getDoc(doc(db, 'testimonials', id)).catch(() => null);
			if (snap && snap.exists() && (snap.data() as TestimonialItem).published !== false) {
				const d = snap.data() as Omit<TestimonialItem, 'id'>;
				meta = { id: snap.id, ...d };
				const artSnap = await getDoc(doc(db, 'testimonialArticles', id)).catch(() => null);
				const raw = artSnap?.exists() ? (artSnap.data().html as string) : '';
				body = DOMPurify.sanitize(raw, { ADD_ATTR: ['target'] });
			} else {
				// Cek fallback data bawaan
				const fallback = defaultTestimonials.find((t) => t.id === id);
				if (fallback) {
					meta = fallback;
					body = DOMPurify.sanitize(fallback.html || '', { ADD_ATTR: ['target'] });
				} else {
					phase = 'missing';
					return;
				}
			}

			const text = body.replace(/<[^>]+>/g, ' ');
			minutes = Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
			phase = 'ok';
		} catch {
			// Cek fallback bila Firestore error
			const fallback = defaultTestimonials.find((t) => t.id === id);
			if (fallback) {
				meta = fallback;
				body = DOMPurify.sanitize(fallback.html || '', { ADD_ATTR: ['target'] });
				phase = 'ok';
			} else {
				phase = 'missing';
			}
		}
	});
</script>

<svelte:head>
	<title>{meta ? `${meta.title} — Testimonial AgroPlus.ID` : 'Testimonial — AgroPlus.ID'}</title>
	{#if meta?.summary}<meta name="description" content={meta.summary} />{/if}
</svelte:head>

<main class="site-shell">
	<article class="wrap">
		<a class="back" href="/testimonials">← All testimonials</a>

		{#if phase === 'loading'}
			<p class="state">Memuat cerita...</p>
		{:else if phase === 'missing' || !meta}
			<p class="state">Cerita testimoni ini tidak ditemukan.</p>
		{:else}
			<header class="head">
				<p class="meta">
					<span class="cat">{meta.category || 'Client Story'}</span>
					<i class="dot"></i>
					<span>{formatDate(meta.date)}</span>
					<i class="dot"></i>
					<span>{minutes} min read</span>
				</p>
				<h1>{meta.title}</h1>

				<!-- Client Spotlight Card -->
				<div class="client-spotlight">
					<div class="client-avatar">
						{meta.clientName.slice(0, 2).toUpperCase()}
					</div>
					<div class="client-info">
						<strong class="c-name">{meta.clientName}</strong>
						<span class="c-role">{meta.clientRole}{#if meta.clientCompany} · {meta.clientCompany}{/if}</span>
					</div>
					{#if meta.rating}
						<div class="rating-stars" aria-label={`Rating: ${meta.rating} dari 5 bintang`}>
							{#each Array(meta.rating) as _}★{/each}
						</div>
					{/if}
				</div>

				{#if meta.summary}
					<div class="quote-banner">
						<p class="lead-quote">"{meta.summary}"</p>
					</div>
				{/if}
			</header>

			{#if meta.image}
				<div class="cover-wrap">
					<img class="cover" src={meta.image} alt={meta.clientName} />
					{#if meta.clientCompany}
						<p class="cover-caption">Dokumentasi kolaborasi bersama {meta.clientCompany}</p>
					{/if}
				</div>
			{/if}

			{#if body}
				<div class="prose-article">{@html body}</div>
			{:else}
				<p class="state">Cerita lengkap akan segera hadir.</p>
			{/if}
		{/if}
	</article>
	<SiteFooter />
</main>

<style>
	.wrap {
		max-width: 820px;
		margin: 0 auto;
		padding: clamp(28px, 5vw, 70px) clamp(22px, 5vw, 40px) clamp(60px, 8vw, 120px);
	}

	.back {
		display: inline-block;
		margin-bottom: 28px;
		color: #849962;
		font-size: 0.92rem;
		font-weight: 600;
		text-decoration: none;
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
	}

	.back:hover {
		transform: translateX(-4px);
		color: #25330f;
	}

	.state {
		color: #6c7a5a;
		padding: 40px 0;
		font-size: 1.1rem;
	}

	.head {
		animation: rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
	}

	.meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
		margin: 0 0 16px;
		color: #55683d;
		font-size: 0.85rem;
		font-weight: 700;
	}

	.cat {
		background: rgba(85, 104, 61, 0.12);
		color: #384620;
		padding: 4px 12px;
		border-radius: 999px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.74rem;
	}

	.dot {
		width: 5px;
		height: 5px;
		background: #945600;
		border-radius: 1px;
	}

	h1 {
		margin: 0 0 24px;
		color: #25330f;
		font-size: clamp(2rem, 4vw, 3.2rem);
		font-weight: 700;
		letter-spacing: -0.025em;
		line-height: 1.15;
	}

	.client-spotlight {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		background: #ffffff;
		border-radius: 14px;
		border: 1px solid rgba(85, 104, 61, 0.15);
		box-shadow: 0 4px 20px rgba(37, 51, 15, 0.04);
		margin-bottom: 24px;
	}

	.client-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: #25330f;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.1rem;
		flex-shrink: 0;
	}

	.client-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex-grow: 1;
	}

	.c-name {
		font-size: 1.05rem;
		color: #25330f;
		font-weight: 700;
	}

	.c-role {
		font-size: 0.85rem;
		color: #6a7b54;
	}

	.rating-stars {
		color: #f59e0b;
		font-size: 1.2rem;
		letter-spacing: 2px;
	}

	.quote-banner {
		margin: 0 0 32px;
		padding: 20px 24px;
		background: rgba(216, 228, 198, 0.4);
		border-left: 4px solid #55683d;
		border-radius: 0 12px 12px 0;
	}

	.lead-quote {
		margin: 0;
		color: #25330f;
		font-size: clamp(1.05rem, 1.3vw, 1.25rem);
		line-height: 1.6;
		font-style: italic;
		font-weight: 500;
	}

	.cover-wrap {
		margin: 0 0 clamp(32px, 5vw, 48px);
	}

	.cover {
		display: block;
		width: 100%;
		max-height: 520px;
		object-fit: cover;
		border-radius: 16px;
		box-shadow: 0 16px 40px rgba(37, 51, 15, 0.08);
	}

	.cover-caption {
		margin: 8px 0 0;
		font-size: 0.8rem;
		color: #6a7b54;
		text-align: center;
		font-style: italic;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

