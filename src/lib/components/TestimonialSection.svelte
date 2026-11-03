<script lang="ts">
	import { fadeUp, staggerUp, tiltHover, magneticHover } from '$lib/motion';
	import { onMount } from 'svelte';
	import { collection, getDocs } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { formatDate } from '$lib/admin/db';
	import { defaultTestimonials, type TestimonialItem } from '$lib/data/testimonials';

	let testimonials = $state<TestimonialItem[]>(defaultTestimonials.slice(0, 3));

	onMount(async () => {
		try {
			const snap = await getDocs(collection(db, 'testimonials'));
			const rows = snap.docs
				.map((d) => ({ id: d.id, ...(d.data() as Omit<TestimonialItem, 'id'>) }))
				.filter((r) => r.published !== false)
				.sort((a, b) => String(b.date).localeCompare(String(a.date)))
				.slice(0, 3);
			if (rows.length) {
				testimonials = rows;
			}
		} catch (err) {
			console.warn('Gagal memuat testimoni dari Firestore, memakai data bawaan.', err);
		}
	});
</script>

<section class="testimonials-section" id="testimonials" aria-labelledby="testimonials-title">
	<div class="section-heading" use:fadeUp>
		<div>
			<p class="section-eyebrow">Client Impact</p>
			<h2 id="testimonials-title">Testimonials</h2>
		</div>
		<a use:magneticHover class="btn-more" href="/testimonials">More Stories</a>
	</div>

	<div class="testimonials-grid" use:staggerUp={{ staggerDelay: 0.12, y: 36 }}>
		{#each testimonials as item}
			<article class="testi-card" use:tiltHover={{ maxTilt: 6, scale: 1.02 }}>
				<div class="testi-thumb">
					{#if item.image}
						<img src={item.image} alt={item.clientName} loading="lazy" />
					{:else}
						<div class="thumb-placeholder" aria-hidden="true">
							<span class="quote-symbol">“</span>
							<p class="placeholder-company">{item.clientCompany || 'AgroPlus Partner'}</p>
						</div>
					{/if}
				</div>

				<div class="testi-meta">
					<div class="meta-tags">
						<span class="category-tag">{item.category || 'Client Story'}</span>
						<i class="meta-dot"></i>
						<span class="meta-date">{formatDate(item.date)}</span>
					</div>
					{#if item.rating}
						<div class="rating-stars" aria-label={`Rating ${item.rating} dari 5 bintang`} title={`Rating: ${item.rating} dari 5 bintang`}>
							{#each Array(Math.min(5, Math.max(1, Number(item.rating) || 5))) as _}★{/each}
						</div>
					{/if}
				</div>

				<h3 class="testi-title">{item.title}</h3>

				{#if item.summary}
					<blockquote class="testi-quote">"{item.summary}"</blockquote>
				{/if}

				<div class="testi-author">
					<strong class="author-name">{item.clientName}</strong>
					{#if item.clientRole || item.clientCompany}
						<span class="author-role">{item.clientRole}{#if item.clientCompany} · {item.clientCompany}{/if}</span>
					{/if}
				</div>
			</article>
		{/each}
	</div>
</section>

<style>
	.testimonials-section {
		position: relative;
		padding: clamp(70px, 8vw, 100px) clamp(28px, 9vw, 140px);
		background: #f0f3f1;
		border-top: 1px solid rgba(85, 104, 61, 0.12);
	}

	.section-eyebrow {
		margin: 0 0 6px;
		color: #849962;
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.section-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: clamp(48px, 6vw, 76px);
	}

	.section-heading h2 {
		margin: 0;
		color: #25330f;
		font-size: clamp(2.5rem, 4.5vw, 4.2rem);
		line-height: 1;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.btn-more {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 14px 28px;
		background: #25330f;
		color: #ffffff;
		font-size: 0.95rem;
		font-weight: 600;
		border-radius: 999px;
		text-decoration: none;
		transition: background 0.3s ease, transform 0.2s ease;
		box-shadow: 0 8px 24px rgba(37, 51, 15, 0.14);
		white-space: nowrap;
	}

	.btn-more:hover {
		background: #3c4f1c;
		transform: translateY(-2px);
	}

	.testimonials-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: clamp(34px, 4.5vw, 56px);
	}

	.testi-card {
		position: relative;
		display: flex;
		flex-direction: column;
		min-width: 0;
		height: 100%;
		border-radius: 16px;
		background: #ffffff;
		padding: 24px;
		box-shadow: 0 12px 36px rgba(37, 51, 15, 0.05);
		border: 1px solid rgba(85, 104, 61, 0.1);
		transition: box-shadow 0.35s ease, border-color 0.35s ease;
	}

	.testi-card:hover {
		box-shadow: 0 18px 48px rgba(37, 51, 15, 0.1);
		border-color: rgba(85, 104, 61, 0.25);
	}

	.testi-thumb {
		position: relative;
		aspect-ratio: 1.35 / 1;
		margin-bottom: 20px;
		border-radius: 12px;
		overflow: hidden;
		background: #e2e8dc;
	}

	.testi-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.testi-card:hover .testi-thumb img {
		transform: scale(1.05);
	}

	.thumb-placeholder {
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

	.quote-symbol {
		font-family: Georgia, serif;
		font-size: 3.5rem;
		line-height: 1;
		color: #55683d;
		opacity: 0.6;
		margin-bottom: 4px;
	}

	.placeholder-company {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 700;
		color: #25330f;
		letter-spacing: 0.05em;
	}

	.testi-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 12px;
		flex-wrap: wrap;
	}

	.meta-tags {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.78rem;
		font-weight: 700;
		color: #55683d;
	}

	.rating-stars {
		color: #f59e0b;
		font-size: 0.95rem;
		letter-spacing: 1.5px;
		display: inline-flex;
		align-items: center;
		line-height: 1;
	}

	.category-tag {
		background: rgba(85, 104, 61, 0.12);
		color: #384620;
		padding: 3px 10px;
		border-radius: 999px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.72rem;
	}

	.meta-dot {
		width: 5px;
		height: 5px;
		background: #945600;
		border-radius: 1px;
	}

	.meta-date {
		color: #6a7b54;
	}

	.testi-title {
		margin: 0 0 10px;
		color: #25330f;
		font-size: clamp(1.1rem, 1.25vw, 1.35rem);
		line-height: 1.28;
		font-weight: 700;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
	}

	.testi-quote {
		margin: 0 0 18px;
		font-size: 0.92rem;
		line-height: 1.55;
		color: #45552d;
		font-style: italic;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
	}

	.testi-author {
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

	.author-role {
		font-size: 0.8rem;
		color: #6a7b54;
		line-height: 1.35;
	}

	@media (max-width: 1024px) {
		.testimonials-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.testimonials-grid {
			grid-template-columns: 1fr;
		}

		.section-heading {
			flex-direction: column;
			align-items: flex-start;
			gap: 16px;
		}
	}
</style>

