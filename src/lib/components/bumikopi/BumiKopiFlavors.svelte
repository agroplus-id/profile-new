<script lang="ts">
	import { onMount } from 'svelte';
	import { DEFAULT_BATCH, FLAVOR_OPTIONS, type Batch } from '$lib/batch';
	import { scrollReveal } from '$lib/motion';

	let { batch = DEFAULT_BATCH }: { batch?: Batch } = $props();
	const flavorNotes = $derived(FLAVOR_OPTIONS.filter((f) => batch.flavors.includes(f.key)));

	let section = $state<HTMLElement>();
	let progress = $state(0);

	// Progres 0..1: dari saat bagian ini mulai masuk layar sampai kartu sampai di posisi akhirnya.
	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			progress = 1;
			return;
		}
		const update = () => {
			if (!section) return;
			const top = section.getBoundingClientRect().top;
			progress = Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight * 0.9)));
		};
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

<section
	class="flavors-section"
	aria-labelledby="flavors-title"
	bind:this={section}
	style="--p: {progress}; --c: {(flavorNotes.length - 1) / 2}"
>
	<div class="flavors-inner">
		<h2 id="flavors-title" use:scrollReveal>This Coffee Reminds Us of :</h2>

		<div class="cards-grid">
			{#each flavorNotes as flavor, i (flavor.key)}
				<!-- Kartu "dibagikan": mulai bertumpuk di tengah, lalu menyebar ke posisinya mengikuti scroll -->
				<div class="deal" style="--i:{i}; --dir:{i % 2 ? 1 : -1}">
					<div class="flavor-card">
						<img src={flavor.image} alt={flavor.name} />
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.flavors-section {
		--p: 0;
		background: #f0f3f1;
		padding: clamp(24px, 3.5vw, 48px) clamp(24px, 6vw, 96px) clamp(48px, 6vw, 96px);
		color: #849962;
	}

	.flavors-inner {
		max-width: 1200px;
		margin: 0 auto;
	}

	h2 {
		margin: 0 0 clamp(28px, 4vw, 56px);
		max-width: 12ch;
		font-size: clamp(2rem, 3.8vw, 3.8rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.04em;
		color: #849962;
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: clamp(14px, 2vw, 28px);
		perspective: 1200px;
	}

	/* q = progres khusus kartu ini (0..1), kartu berikutnya sedikit tertunda */
	.deal {
		--q: clamp(0, calc(var(--p) * 1.75 - var(--i) * 0.16), 1);
		--inv: calc(1 - var(--q));
		transform: translate3d(
				calc(var(--inv) * (var(--c) - var(--i)) * 104%),
				calc(var(--inv) * 130px),
				0
			)
			rotate(calc(var(--inv) * var(--dir) * 9deg)) rotateX(calc(var(--inv) * 18deg))
			scale(calc(0.86 + var(--q) * 0.14));
		opacity: calc(0.15 + var(--q) * 0.85);
		z-index: calc(10 - var(--i));
		will-change: transform, opacity;
	}

	/* Kartu di dalam: efek hover terpisah dari animasi scroll */
	.flavor-card {
		border-radius: 0 0 32px 0;
		transition:
			transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
			filter 0.7s cubic-bezier(0.16, 1, 0.3, 1);
		filter: drop-shadow(0 14px 22px rgba(37, 51, 15, 0.12));
	}

	.flavor-card:hover {
		transform: translateY(-12px) rotate(-1.2deg) scale(1.02);
		filter: drop-shadow(0 28px 34px rgba(37, 51, 15, 0.25));
	}

	.flavor-card img {
		display: block;
		width: 100%;
		height: auto;
	}

	@media (max-width: 840px) {
		.cards-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		/* Layout 2 kolom: tanpa menyebar dari tengah, cukup naik dan sedikit berputar */
		.deal {
			--q: clamp(0, calc(var(--p) * 2 - var(--i) * 0.2), 1);
			transform: translate3d(0, calc(var(--inv) * 90px), 0) rotate(calc(var(--inv) * var(--dir) * 5deg))
				scale(calc(0.92 + var(--q) * 0.08));
		}
	}

	@media (max-width: 480px) {
		.cards-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.deal {
			transform: none;
			opacity: 1;
		}
	}
</style>
