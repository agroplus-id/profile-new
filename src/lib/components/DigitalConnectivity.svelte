<script lang="ts">
	import { fadeUp, fadeScale } from '$lib/motion';

	type Item = { key: string; label: string };

	let {
		product,
		fallback,
		items
	}: { product: 'ferroir' | 'fermego'; fallback: string; items: Item[] } = $props();

	// Gambar opsional per fitur: assets/images/connectivity/<produk>/<key>.<ext>
	// (daftar file dibaca saat build/dev server mulai; restart dev server bila menambah file baru)
	const found = import.meta.glob('../assets/images/connectivity/**/*.{png,jpg,jpeg,webp,svg}', {
		eager: true,
		query: '?url',
		import: 'default'
	}) as Record<string, string>;

	function imageFor(key: string): string {
		const hit = Object.entries(found).find(([path]) =>
			new RegExp(`/${product}/${key}\.[a-z]+$`).test(path)
		);
		return hit ? hit[1] : fallback;
	}

	const slides = $derived(items.map((it) => ({ ...it, src: imageFor(it.key) })));

	// null = belum ada pilihan: tampilkan Remote Monitoring (atau item pertama)
	let picked = $state<string | null>(null);
	const active = $derived(
		picked ?? (items.find((i) => i.key === 'remote-monitoring') ?? items[0]).key
	);
</script>

<section class="connectivity" aria-labelledby="connectivity-title">
	<div class="corner tl" aria-hidden="true">+</div>
	<div class="corner tr" aria-hidden="true">+</div>
	<div class="corner bl" aria-hidden="true">+</div>
	<div class="corner br" aria-hidden="true">+</div>

	<div class="connectivity-grid">
		<div use:fadeUp class="copy-card">
			<div class="copy-top">
				<h2 id="connectivity-title">Digital Connectivity</h2>
				<p class="sub">Mobile app &amp; website</p>
			</div>
			<ul role="tablist" aria-label="Digital connectivity features">
				{#each slides as it}
					<li>
						<button
							type="button"
							role="tab"
							class:is-active={active === it.key}
							aria-selected={active === it.key}
							onclick={() => (picked = it.key)}
						>
							{it.label}
						</button>
					</li>
				{/each}
			</ul>
		</div>

		<div use:fadeScale class="visual-card" role="tabpanel">
			{#each slides as it (it.key)}
				<img
					class:is-active={active === it.key}
					src={it.src}
					alt={active === it.key ? `${product} — ${it.label}` : ''}
					aria-hidden={active !== it.key}
				/>
			{/each}
		</div>
	</div>
</section>

<style>
	.connectivity {
		--ease: cubic-bezier(0.62, 0.05, 0.01, 0.99);
		position: relative;
		background: #f0f3f1;
		padding: clamp(48px, 7vw, 96px) clamp(32px, 7vw, 120px);
	}

	.corner {
		position: absolute;
		color: #849962;
		font-size: 1.1rem;
		line-height: 1;
		pointer-events: none;
	}

	.tl { top: clamp(14px, 2.5vw, 36px); left: clamp(18px, 3vw, 44px); }
	.tr { top: clamp(14px, 2.5vw, 36px); right: clamp(18px, 3vw, 44px); }
	.bl { bottom: clamp(14px, 2.5vw, 36px); left: clamp(18px, 3vw, 44px); }
	.br { bottom: clamp(14px, 2.5vw, 36px); right: clamp(18px, 3vw, 44px); }

	.connectivity-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: stretch;
		gap: clamp(14px, 1.8vw, 24px);
		max-width: 1200px;
		margin: 0 auto;
	}

	.copy-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 32px;
		background: #d8e4c6;
		border-radius: clamp(12px, 1.2vw, 20px);
		padding: clamp(28px, 3.5vw, 52px);
		min-height: clamp(340px, 40vw, 580px);
	}

	.copy-top h2 {
		margin: 0 0 8px;
		color: #849962;
		font-size: clamp(1.6rem, 2.8vw, 3rem);
		font-weight: 700;
		line-height: 0.95;
		letter-spacing: -0.03em;
	}

	.sub {
		margin: 0;
		color: #263214;
		font-size: clamp(0.7rem, 0.8vw, 0.85rem);
		font-weight: 600;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 6px;
	}

	ul button {
		padding: 0;
		border: 0;
		background: none;
		color: #849962;
		font: inherit;
		font-size: clamp(0.88rem, 1.1vw, 1.15rem);
		font-weight: 500;
		line-height: 1.4;
		text-align: left;
		cursor: pointer;
		transition: color 0.45s var(--ease);
	}

	ul button:hover,
	ul button.is-active {
		color: #1d2810;
	}

	ul button:focus-visible {
		outline: 2px solid #55683d;
		outline-offset: 4px;
	}

	/* Kartu gambar: semua gambar bertumpuk, yang aktif memudar masuk */
	.visual-card {
		position: relative;
		overflow: hidden;
		min-height: clamp(340px, 40vw, 580px);
		border-radius: clamp(12px, 1.2vw, 20px);
		background: #e4e6e4;
	}

	.visual-card img {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		scale: 1.06;
		filter: blur(8px);
		transition:
			opacity 0.7s var(--ease),
			scale 0.9s var(--ease),
			filter 0.7s var(--ease);
		pointer-events: none;
	}

	.visual-card img.is-active {
		opacity: 1;
		scale: 1;
		filter: blur(0);
	}

	@media (max-width: 760px) {
		.connectivity-grid { grid-template-columns: 1fr; }
		.copy-card { min-height: auto; }
		.visual-card { min-height: 360px; }
	}

	@media (prefers-reduced-motion: reduce) {
		.visual-card img,
		ul button { transition: none; }
	}
</style>
