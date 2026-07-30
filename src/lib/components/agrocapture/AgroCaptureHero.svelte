<script lang="ts">
	import header from '$lib/assets/images/desktop 11/header.svg';
	import wordmark from '$lib/assets/images/desktop 11/agro-capture1.svg';
	import plus from '$lib/assets/images/desktop 11/plus.svg';
</script>

<section class="agrocapture-hero" aria-label="AgroCapture app preview">
	<img src={header} alt="AgroCapture app interface" />
</section>

<section class="introduction" aria-labelledby="agrocapture-title">
	<div class="intro-heading">
		<img id="agrocapture-title" class="wordmark" src={wordmark} alt="AgroCapture" />
		<p>Seeing every coffee<br />field differently.</p>
	</div>

	<img class="plus plus-left" src={plus} alt="" aria-hidden="true" />
	<img class="plus plus-right" src={plus} alt="" aria-hidden="true" />

	<p class="intro-copy">AgroCapture, launching in 2026, is a digital coffee intelligence platform built for farm mapping, crop analysis, and harvest records.</p>

	<img class="plus plus-bottom-left" src={plus} alt="" aria-hidden="true" />
	<img class="plus plus-bottom-right" src={plus} alt="" aria-hidden="true" />
</section>

<style>
	.agrocapture-hero {
		background: #1a1f14;
		overflow: hidden;
	}

	.agrocapture-hero > img {
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
		grid-template-columns: minmax(0, 1fr) minmax(190px, 0.36fr);
		align-items: start;
		gap: clamp(24px, 5vw, 92px);
	}

	.wordmark {
		display: block;
		width: 100%;
		max-width: 720px;
		height: auto;
	}

	.intro-heading p {
		margin: clamp(6px, 0.8vw, 14px) 0 0;
		font-size: clamp(1.35rem, 2.1vw, 2.25rem);
		font-weight: 700;
		line-height: 0.9;
		letter-spacing: -0.04em;
	}

	.plus {
		position: absolute;
		width: clamp(14px, 1.2vw, 20px);
		height: auto;
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
		.intro-heading p { font-size: 1.35rem; }
		.plus-left { top: 30%; left: 24px; }
		.plus-right { top: 30%; right: 24px; }
		.plus-bottom-left { bottom: 28px; left: 24px; }
		.plus-bottom-right { bottom: 28px; right: 24px; }
		.intro-copy { max-width: 100%; margin: 190px 18px 0; font-size: clamp(2rem, 9.2vw, 3.25rem); }
	}
</style>
