<script lang="ts">
	import { bumiKopiImages } from '$lib/data/bumikopi';
</script>

<section class="bumikopi-hero" aria-label="Bumi Kopi package preview">
	<div class="hero-img-wrap">
		<img src={bumiKopiImages.header} alt="Bumi Kopi Liberica package" />
	</div>
</section>

<section class="introduction" aria-labelledby="bumikopi-title">
	<div class="intro-heading">
		<h1 id="bumikopi-title">Bumi Kopi</h1>
		<div class="tagline">
			<h2>Meet the<br />Efforts Behind<br />Your Package.</h2>
			<p>Every great coffee deserves a story that can be trusted.</p>
		</div>
	</div>

	<i class="plus plus-left" aria-hidden="true">+</i>
	<i class="plus plus-right" aria-hidden="true">+</i>

	<div class="intro-copy-wrap">
		<p class="intro-copy">
			Long before it reaches your cup, this Liberica coffee begins in the volcanic highlands of Wonosalam, East Java. Since the Dutch colonial era, generations of local growers have preserved its legacy. Today, through curiosity and innovation, they continue uncovering new expressions of Liberica while honoring the character that has defined it for generations.
		</p>
		<p class="intro-sub">
			Verified through the AgroPlus Coffee Passport, preserving every step of its journey, from origin and harvest to fermentation and roasting.
		</p>
	</div>

	<i class="plus plus-bottom-left" aria-hidden="true">+</i>
	<i class="plus plus-bottom-right" aria-hidden="true">+</i>
</section>

<style>
	.bumikopi-hero {
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
		color: #849962;
	}

	.tagline {
		text-align: right;
	}

	.tagline h2 {
		margin: 0;
		font-size: clamp(1.4rem, 2.5vw, 2.8rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.04em;
		color: #23320e;
	}

	.tagline p {
		margin: 8px 0 0;
		font-size: clamp(0.85rem, 1vw, 1.1rem);
		font-weight: 500;
		color: #4a5c32;
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

	.intro-copy-wrap {
		max-width: min(720px, 70vw);
		margin: clamp(210px, 25vw, 330px) 0 0 clamp(38px, 3.2vw, 56px);
	}

	.intro-copy {
		margin: 0 0 24px;
		font-size: clamp(1.8rem, 3.8vw, 3.8rem);
		font-weight: 700;
		line-height: 0.95;
		letter-spacing: -0.045em;
		color: #849962;
	}

	.intro-sub {
		margin: 0;
		font-size: clamp(0.85rem, 1.05vw, 1.15rem);
		font-weight: 600;
		line-height: 1.35;
		color: #4a5c32;
	}

	@media (max-width: 760px) {
		.introduction { min-height: 640px; padding: 24px; }
		.intro-heading { flex-direction: column; gap: 16px; }
		h1 { font-size: clamp(3.7rem, 18vw, 6rem); }
		.tagline { text-align: left; }

		.plus-left { top: 30%; left: 24px; }
		.plus-right { top: 30%; right: 24px; }
		.plus-bottom-left { bottom: 28px; left: 24px; }
		.plus-bottom-right { bottom: 28px; right: 24px; }

		.intro-copy-wrap { max-width: 100%; margin: 190px 18px 0; }
		.intro-copy { font-size: clamp(1.8rem, 8.5vw, 3rem); }
	}
</style>
