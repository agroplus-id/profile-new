<script lang="ts">
	import background from '$lib/assets/images/desktop 9/background.svg';
</script>

<section class="ferroir-hero">
	<img src={background} alt="Ferroir fermentation system" />
</section>

<section class="introduction" aria-labelledby="ferroir-title">
	<div class="intro-heading">
		<h1 id="ferroir-title">FERROIR</h1>
		<p class="tagline">Connected<br />fermentation,<br />thoughtfully<br />designed.</p>
	</div>

	<i class="plus plus-left" aria-hidden="true">+</i>
	<i class="plus plus-right" aria-hidden="true">+</i>

	<p class="intro-copy">FERROIR, targeted to launch in 2027, is an integrated precision fermentation system, purpose-built for the upstream coffee industry.</p>

	<i class="plus plus-bottom-left" aria-hidden="true">+</i>
	<i class="plus plus-bottom-right" aria-hidden="true">+</i>
</section>

<style>
	.ferroir-hero {
		overflow: hidden;
		background: #202520;
	}

	.ferroir-hero > img {
		display: block;
		width: 100%;
		height: auto;
		min-height: 0;
		object-fit: cover;
		object-position: center;
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
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: clamp(24px, 5vw, 92px);
	}

	h1 {
		margin: 0;
		font-size: clamp(4rem, 9.4vw, 10.25rem);
		font-weight: 700;
		line-height: 0.78;
		letter-spacing: -0.075em;
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
		.ferroir-hero > img {
			min-height: 250px;
			object-position: center;
		}

		.introduction { min-height: 640px; padding: 24px; }
		.intro-heading { flex-direction: column; gap: 16px; }
		h1 { font-size: clamp(3.7rem, 18vw, 6rem); }
		.tagline { font-size: 1rem; }

		.plus-left { top: 30%; left: 24px; }
		.plus-right { top: 30%; right: 24px; }
		.plus-bottom-left { bottom: 28px; left: 24px; }
		.plus-bottom-right { bottom: 28px; right: 24px; }

		.intro-copy { max-width: 100%; margin: 190px 18px 0; font-size: clamp(2rem, 9.2vw, 3.25rem); }
	}
</style>
