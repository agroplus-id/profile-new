<script lang="ts">
	import { fermegoSpecs } from '$lib/data/fermego';
	import titleBg from '$lib/assets/images/desktop10/fermego1.svg';
	import device from '$lib/assets/images/desktop10/fermego.png';
	import circle from '$lib/assets/images/desktop 9/circle.svg';
</script>

<section class="specs-stage" aria-label="Fermego product specifications">
	<div class="specs-meta">
		<p>Fermego</p>
		<strong>Launching 2026</strong>
	</div>

	<div class="specs-table" aria-label="Fermego specifications">
		{#each fermegoSpecs as [label, value]}
			<div><span>{label} :</span><strong>{value}</strong></div>
		{/each}
	</div>

	<div class="specs-title-bg" aria-hidden="true">
		<img src={titleBg} alt="" />
	</div>

	<img class="specs-circle" src={circle} alt="" aria-hidden="true" />
	<img class="specs-device" src={device} alt="Fermego fermentation monitor" />

	<p class="specs-tagline">Smarter Fermentation<br />Starts Here.</p>
</section>

<style>
	.specs-stage {
		position: relative;
		min-height: clamp(680px, 76vw, 980px);
		display: grid;
		place-items: center;
		overflow: hidden;
		background: #f0f3f1;
		padding: clamp(32px, 5vw, 70px) clamp(24px, 6vw, 96px);
	}

	.specs-meta {
		position: absolute;
		top: clamp(24px, 5vw, 70px);
		left: clamp(24px, 6vw, 96px);
		color: #849962;
		font-size: clamp(0.95rem, 1.1vw, 1.1rem);
		font-weight: 800;
		line-height: 0.95;
		z-index: 4;
	}

	.specs-meta p,
	.specs-meta strong {
		display: block;
		margin: 0;
	}

	.specs-meta strong {
		color: #945600;
	}

	.specs-table {
		position: absolute;
		top: clamp(24px, 5vw, 70px);
		right: clamp(24px, 6vw, 96px);
		display: grid;
		gap: 2px;
		width: min(420px, 42vw);
		color: #849962;
		font-size: clamp(0.88rem, 1vw, 1rem);
		font-weight: 800;
		line-height: 0.98;
		text-align: right;
		z-index: 4;
	}

	.specs-table div {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 16px;
	}

	.specs-table strong {
		min-width: 110px;
		color: #45552d;
		text-align: left;
	}

	.specs-title-bg {
		position: absolute;
		left: 50%;
		top: 50%;
		width: min(1230px, 112vw);
		transform: translate(-50%, -51%);
		z-index: 1;
		pointer-events: none;
	}

	.specs-title-bg img {
		display: block;
		width: 100%;
		height: auto;
	}

	.specs-circle {
		position: absolute;
		width: min(720px, 72vw);
		aspect-ratio: 1;
		z-index: 2;
		animation: slow-spin 42s linear infinite;
		pointer-events: none;
	}

	.specs-device {
		position: relative;
		z-index: 3;
		width: min(360px, 34vw);
		max-height: 620px;
		object-fit: contain;
		filter: drop-shadow(0 28px 28px rgba(37, 51, 15, 0.12));
	}

	.specs-tagline {
		position: absolute;
		left: clamp(24px, 6vw, 96px);
		bottom: clamp(72px, 9vw, 140px);
		max-width: 420px;
		margin: 0;
		color: #25330f;
		font-size: clamp(1.4rem, 2.4vw, 2rem);
		font-weight: 800;
		line-height: 1.16;
		z-index: 4;
	}

	@keyframes slow-spin {
		to { transform: rotate(360deg); }
	}

	@media (max-width: 980px) {
		.specs-table {
			top: auto;
			right: auto;
			left: clamp(24px, 6vw, 64px);
			bottom: 150px;
			width: min(480px, calc(100% - 48px));
			text-align: left;
		}
		.specs-tagline { bottom: 250px; }
		.specs-device { width: min(300px, 52vw); transform: translateY(-42px); }
	}

	@media (max-width: 640px) {
		.specs-stage {
			display: flex;
			min-height: auto;
			flex-direction: column;
			align-items: stretch;
			gap: 24px;
			padding: 72px 20px 48px;
		}
		.specs-meta { position: relative; top: auto; left: auto; }
		.specs-table { position: relative; top: auto; right: auto; bottom: auto; left: auto; width: 100%; font-size: 0.92rem; text-align: left; }
		.specs-table div { grid-template-columns: minmax(0, 1fr) auto; gap: 12px; padding: 2px 0; }
		.specs-table strong { min-width: 0; text-align: right; }
		.specs-title-bg { top: 39%; width: 178vw; opacity: 0.72; }
		.specs-circle { top: 38%; width: 82vw; transform: translateY(-50%); }
		.specs-device { width: min(260px, 65vw); max-height: 400px; align-self: center; transform: none; }
		.specs-tagline { position: relative; left: auto; bottom: auto; max-width: 100%; font-size: clamp(1.55rem, 8vw, 2.45rem); line-height: 1.02; }
	}
</style>
