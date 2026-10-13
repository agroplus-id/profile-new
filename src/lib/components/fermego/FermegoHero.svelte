<script lang="ts">
	import header from '$lib/assets/images/desktop10/fix.svg';
	import logo from '$lib/assets/images/desktop10/fermego1.svg';
	import { fadeUp, staggerUp, slideDown, fadeScale, floatLoop, scrollZoom, scrollReveal } from '$lib/motion';
</script>

<section class="fermego-hero" aria-label="Fermego hero" use:scrollZoom>
	<div use:fadeScale class="hero-img-wrap">
		<img class="zoom-media" src={header} alt="Fermego fermentation monitor" />
	</div>
</section>

<section class="introduction" aria-labelledby="fermego-title">
	<div use:fadeUp class="intro-heading">
		<img id="fermego-title" class="wordmark" src={logo} alt="FERMEGO" />
		<p class="tagline">Modern monitoring<br />for familiar<br />fermentation.</p>
	</div>

	<i class="plus plus-left" aria-hidden="true">+</i>
	<i class="plus plus-right" aria-hidden="true">+</i>

	<p use:scrollReveal class="intro-copy">FERMEGO, launching in 2026, is a modular fermentation monitoring kit that transforms conventional fermentation into connected systems.</p>

	<i class="plus plus-bottom-left" aria-hidden="true">+</i>
	<i class="plus plus-bottom-right" aria-hidden="true">+</i>
</section>

<style>
	.fermego-hero {
		overflow: hidden;
		background: #f0f3f1;
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

	.introduction {
		position: relative;
		min-height: clamp(620px, 70vw, 900px);
		padding: clamp(28px, 3vw, 52px) clamp(32px, 7vw, 120px) clamp(72px, 7vw, 120px);
		background: #f0f3f1;
		color: #849962;
		overflow: hidden;
	}

	.intro-heading {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(180px, 0.43fr);
		align-items: start;
		gap: clamp(24px, 5vw, 92px);
	}

	.wordmark {
		display: block;
		width: 100%;
		max-width: 720px;
		height: auto;
		filter: brightness(0.4) saturate(2);
	}

	.tagline {
		margin: 0;
		padding-top: 2px;
		font-size: clamp(1.1rem, 1.85vw, 2rem);
		font-weight: 700;
		line-height: 0.88;
	}

	.plus {
		position: absolute;
		font-style: normal;
		color: #23320e;
		font-size: 1.25rem;
		line-height: 1;
		pointer-events: none;
	}

	.plus-left { top: 31%; left: clamp(32px, 7vw, 120px); }
	.plus-right { top: 31%; right: clamp(32px, 7vw, 120px); }
	.plus-bottom-left { bottom: clamp(36px, 5vw, 76px); left: clamp(32px, 7vw, 120px); }
	.plus-bottom-right { bottom: clamp(36px, 5vw, 76px); right: clamp(32px, 7vw, 120px); }

	.intro-copy {
		max-width: min(660px, 65vw);
		margin: clamp(210px, 25vw, 330px) 0 0 clamp(38px, 3.2vw, 56px);
		font-size: clamp(2rem, 4vw, 4.35rem);
		font-weight: 700;
		line-height: 0.92;
		letter-spacing: -0.055em;
	}

	@media (max-width: 760px) {
		.introduction { min-height: 640px; padding: 24px; }
		.intro-heading { grid-template-columns: 1fr; gap: 16px; }
		.wordmark { max-width: 100%; }
		.tagline { font-size: 1.1rem; }

		.plus-left { top: 30%; left: 24px; }
		.plus-right { top: 30%; right: 24px; }
		.plus-bottom-left { bottom: 28px; left: 24px; }
		.plus-bottom-right { bottom: 28px; right: 24px; }

		.intro-copy { max-width: 100%; margin: 190px 18px 0; font-size: clamp(2rem, 9.2vw, 3.25rem); }
	}
</style>
