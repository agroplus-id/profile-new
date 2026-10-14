<script lang="ts">
	import { bumiKopiImages } from '$lib/data/bumikopi';
	import type { Batch } from '$lib/batch';
	import OriginMap from './OriginMap.svelte';
	import stampUrl from '$lib/assets/images/bumikopi/stamp.png';

	// Tanpa data batch: tampilkan grafis paspor bawaan. Dengan data batch: kartu paspor dari data admin.
	let { batch, images = {} }: { batch?: Batch; images?: Record<string, string> } = $props();

	const photos = $derived(
		(batch?.placePhotos ?? [])
			.map((p, i) => ({ src: images[`place_${i}`], caption: p.caption, lat: p.lat, lng: p.lng }))
			.filter((p) => !!p.src)
	);
	const hasMap = $derived(batch?.mapLat != null && batch?.mapLng != null);
</script>

<section class="passport-section" aria-label="Coffee Passport card">
	<div class="passport-inner">
		{#if batch}
			<article class="passport" aria-label="Coffee Passport {batch.passportNumber}">
				<header>
					<div>
						<h2>Coffee<br />Passport</h2>
						<p class="tag">Verified. Traceable. Trusted.</p>
					</div>
					{#if batch.passportNumber}
						<div class="num">
							<span>Passport number</span>
							<strong>{batch.passportNumber}</strong>
						</div>
					{/if}
				</header>

				<div class="body" class:with-photo={!!images.passport}>
					{#if images.passport}
						<div class="photo">
							<img src={images.passport} alt="{batch.productName} beans" />
							<img class="stamp" src={stampUrl} alt="" aria-hidden="true" />
						</div>
					{/if}

					<dl>
						<div>
							<dt>Species &amp; Variety</dt>
							<dd>{batch.species || '—'}</dd>
						</div>
						<div>
							<dt>Lot number</dt>
							<dd>{batch.lotNumber || '—'}</dd>
						</div>
						<div>
							<dt>Farm</dt>
							<dd>{batch.farm || '—'}<small>{batch.farmLocation}</small></dd>
						</div>
						<div>
							<dt>Altitude</dt>
							<dd>{batch.altitude || '—'}</dd>
						</div>
						<div>
							<dt>Processed by</dt>
							<dd>{batch.processor || '—'}<small>{batch.processorLocation}</small></dd>
						</div>
						<div>
							<dt>Origin</dt>
							<dd>{batch.origin || '—'}<small>{batch.originCountry}</small></dd>
						</div>
					</dl>
				</div>

				{#if hasMap}
					<div class="map-wrap">
						<OriginMap
							lat={batch.mapLat as number}
							lng={batch.mapLng as number}
							place={batch.mapPlace || batch.origin || 'Origin'}
							note={batch.mapNote}
							{photos}
						/>
					</div>
				{/if}

				<footer>
					<span>In Great Coffee We Trust.</span>
					<span>Agroplus Coffee Passport</span>
				</footer>
			</article>
		{:else}
			<img src={bumiKopiImages.passportGraphic} alt="Coffee Passport AP-26-0001867" />
		{/if}
	</div>
</section>

<style>
	.passport-section {
		background: #f0f3f1;
		padding: clamp(32px, 5vw, 72px) clamp(24px, 6vw, 96px);
		border-bottom: 1.5px solid #a3b880;
	}

	.passport-inner {
		max-width: 1200px;
		margin: 0 auto;
	}

	.passport-inner > img {
		display: block;
		width: 100%;
		height: auto;
	}

	.passport {
		padding: clamp(24px, 3.5vw, 48px);
		border: 1px solid rgba(69, 85, 45, 0.25);
		border-radius: clamp(14px, 1.6vw, 24px);
		background: #fff;
		color: #45552d;
	}

	header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 20px;
		padding-bottom: clamp(20px, 3vw, 36px);
		border-bottom: 1px solid rgba(69, 85, 45, 0.2);
	}

	h2 {
		margin: 0;
		color: #849962;
		font-size: clamp(1.8rem, 3.2vw, 3rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.03em;
	}

	.tag {
		margin: 10px 0 0;
		font-size: 0.8rem;
		font-style: italic;
		font-weight: 600;
	}

	.num {
		display: grid;
		gap: 2px;
	}

	.num span {
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.num strong {
		color: #849962;
		font-size: clamp(1rem, 1.5vw, 1.4rem);
	}

	.body {
		display: grid;
		gap: clamp(20px, 3vw, 40px);
		padding-top: clamp(8px, 1.5vw, 16px);
	}

	.body.with-photo {
		grid-template-columns: minmax(180px, 280px) 1fr;
		align-items: start;
	}

	.photo {
		position: relative;
		margin-top: clamp(12px, 2vw, 22px);
		aspect-ratio: 3 / 4;
		border: 1px solid rgba(69, 85, 45, 0.25);
		border-radius: 18px;
		padding: 10px;
	}

	.photo img:not(.stamp) {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 12px;
		object-fit: cover;
	}

	.stamp {
		position: absolute;
		left: -14%;
		bottom: -14%;
		width: 62%;
		height: auto;
		object-fit: contain;
		pointer-events: none;
		opacity: 0.92;
		transform: rotate(-12deg);
		filter: drop-shadow(0 2px 3px rgba(31, 74, 34, 0.25));
	}

	dl {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0 clamp(24px, 4vw, 56px);
		margin: 0;
	}

	dl > div {
		padding: clamp(14px, 2vw, 22px) 0;
		border-bottom: 1px solid rgba(69, 85, 45, 0.15);
	}

	dt {
		margin-bottom: 6px;
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	dd {
		margin: 0;
		color: #849962;
		font-size: clamp(1.05rem, 1.7vw, 1.6rem);
		font-weight: 800;
		line-height: 1.15;
	}

	dd small {
		display: block;
		margin-top: 3px;
		color: #25330f;
		font-size: 0.72rem;
		font-weight: 500;
	}

	.map-wrap {
		margin-top: clamp(20px, 3vw, 36px);
	}

	footer {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding-top: clamp(16px, 2vw, 24px);
		font-size: 0.7rem;
		font-style: italic;
	}

	@media (max-width: 760px) {
		.body.with-photo {
			grid-template-columns: 1fr;
		}

		.photo {
			max-width: 260px;
		}
	}

	@media (max-width: 640px) {
		dl {
			grid-template-columns: 1fr;
		}
	}
</style>
