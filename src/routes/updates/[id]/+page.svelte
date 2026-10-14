<script lang="ts">
	import '$lib/article.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { doc, getDoc } from 'firebase/firestore';
	import DOMPurify from 'dompurify';
	import { db } from '$lib/firebase';
	import { formatDate } from '$lib/admin/db';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	type Meta = { title: string; category?: string; date: string; summary?: string; image?: string; published?: boolean };

	let meta = $state<Meta | null>(null);
	let body = $state('');
	let phase = $state<'loading' | 'ok' | 'missing'>('loading');
	let minutes = $state(1);

	onMount(async () => {
		const id = page.params.id as string;
		try {
			const snap = await getDoc(doc(db, 'updates', id));
			if (!snap.exists() || (snap.data() as Meta).published === false) {
				phase = 'missing';
				return;
			}
			meta = snap.data() as Meta;
			const art = await getDoc(doc(db, 'articles', id)).catch(() => null);
			const raw = art?.exists() ? (art.data().html as string) : '';
			// Konten ditulis admin, tetapi tetap disaring sebelum ditampilkan.
			body = DOMPurify.sanitize(raw, { ADD_ATTR: ['target'] });
			const text = raw.replace(/<[^>]+>/g, ' ');
			minutes = Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
			phase = 'ok';
		} catch {
			phase = 'missing';
		}
	});
</script>

<svelte:head>
	<title>{meta ? `${meta.title} — AgroPlus.ID` : 'Article — AgroPlus.ID'}</title>
	{#if meta?.summary}<meta name="description" content={meta.summary} />{/if}
</svelte:head>

<main class="site-shell">
	<article class="wrap">
		<a class="back" href="/updates">← All updates</a>

		{#if phase === 'loading'}
			<p class="state">Loading…</p>
		{:else if phase === 'missing' || !meta}
			<p class="state">This article could not be found.</p>
		{:else}
			<header class="head">
				<p class="meta"><span>{meta.category || 'News'}</span><i></i>{formatDate(meta.date)}<i></i>{minutes} min read</p>
				<h1>{meta.title}</h1>
				{#if meta.summary}<p class="lead">{meta.summary}</p>{/if}
			</header>

			{#if meta.image}
				<img class="cover" src={meta.image} alt="" />
			{/if}

			{#if body}
				<div class="prose-article">{@html body}</div>
			{:else}
				<p class="state">The full story is coming soon.</p>
			{/if}
		{/if}
	</article>
	<SiteFooter />
</main>

<style>
	.wrap {
		max-width: 780px;
		margin: 0 auto;
		padding: clamp(28px, 5vw, 70px) clamp(22px, 5vw, 40px) clamp(60px, 8vw, 120px);
	}

	.back {
		display: inline-block;
		margin-bottom: 28px;
		color: #849962;
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.back:hover {
		transform: translateX(-4px);
	}

	.state {
		color: #6c7a5a;
	}

	.head {
		animation: rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		margin: 0 0 14px;
		color: #849962;
		font-size: 0.82rem;
		font-weight: 600;
	}

	.meta i {
		width: 18px;
		height: 1px;
		background: currentColor;
	}

	h1 {
		margin: 0;
		color: #172010;
		font-size: clamp(2rem, 4.6vw, 3.2rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.12;
	}

	.lead {
		margin: 16px 0 0;
		color: #5f6e4e;
		font-size: 1.2rem;
		line-height: 1.55;
	}

	.cover {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		margin: 32px 0 40px;
		border-radius: 20px;
		object-fit: cover;
		animation: rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(22px);
		}
	}
</style>
