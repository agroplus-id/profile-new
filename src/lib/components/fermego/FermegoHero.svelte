<script lang="ts">
	import header from '$lib/assets/images/desktop10/fix.svg';
	import logo from '$lib/assets/images/desktop10/fermego1.svg';
</script>

<section class="fermego-hero" aria-label="Fermego hero">
	<div class="hero-img-wrap">
		<img src={header} alt="Fermego fermentation monitor" />
	</div>
</section>

<section class="intro">
	<img class="wordmark" src={logo} alt="FERMEGO" />
	<p class="tagline">Modern monitoring<br />for familiar fermentation.</p>
</section>

<style>
	.fermego-hero {
		background: #f0f3f1;
		overflow: hidden;
	}

	.hero-img-wrap {
		display: block;
		width: 100%;
	}

	.hero-img-wrap img {
		display: block;
		width: 100%;
		height: auto;
	}

	.intro {
		background: #f0f3f1;
		padding: clamp(20px, 2.5vw, 36px) clamp(32px, 7vw, 120px) clamp(28px, 3.5vw, 52px);
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(180px, 0.43fr);
		align-items: center;
		gap: clamp(24px, 4vw, 72px);
		max-width: 1200px;
		margin: 0 auto;
	}

	.wordmark {
		display: block;
		width: min(100%, 720px);
		height: auto;
		filter: brightness(0.68) saturate(1.1);
	}

	.tagline {
		margin: 0;
		color: #849962;
		font-size: clamp(1.2rem, 2.1vw, 2.25rem);
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	@media (max-width: 760px) {
		.intro { grid-template-columns: 1fr; gap: 16px; padding: 24px; }
		.wordmark { width: min(100%, 520px); }
	}
</style>
