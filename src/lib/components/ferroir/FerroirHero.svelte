<script lang="ts">
	import background from '$lib/assets/images/desktop 9/background.svg';
</script>
<section class="ferroir-hero">
	<img src={background} alt="Ferroir fermentation system" />
</section>

<section class="ferroir-introduction" aria-labelledby="ferroir-title">
	<div class="hero-copy">
		<h1 id="ferroir-title">FERROIR</h1>
		<p>Connected<br />fermentation,<br />thoughtfully<br />designed.</p>
	</div>

	<div class="intro">
		<i aria-hidden="true">+</i>
		<p>FERROIR, targeted to launch in 2027, is an integrated precision fermentation system, purpose-built for the upstream coffee industry.</p>
		<i aria-hidden="true">+</i>
	</div>
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

	.ferroir-introduction {
		background: #f0f3f1;
		color: #849962;
	}

	.hero-copy {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 32px;
		padding: clamp(18px, 2vw, 32px) clamp(24px, 5.6vw, 88px) 0;
	}

	h1 {
		margin: 0;
		font-size: clamp(4rem, 9.4vw, 10.25rem);
		font-weight: 700;
		line-height: 0.78;
		letter-spacing: -0.075em;
	}

	.hero-copy p {
		margin: 0;
		padding-top: 2px;
		font-size: clamp(1.1rem, 1.85vw, 2rem);
		font-weight: 700;
		line-height: 0.88;
	}

	.intro {
		display: grid;
		grid-template-columns: auto minmax(0, 720px) auto;
		align-items: start;
		justify-content: space-between;
		gap: 24px;
		min-height: clamp(520px, 58vw, 760px);
		padding: clamp(150px, 20vw, 310px) clamp(24px, 9.2vw, 145px) clamp(80px, 10vw, 160px);
	}

	.intro i {
		font-style: normal;
		color: #23320e;
		font-size: 1.25rem;
		line-height: 1;
	}

	.intro p {
		margin: 0;
		font-size: clamp(2rem, 4vw, 4.35rem);
		font-weight: 700;
		line-height: 0.92;
		letter-spacing: -0.055em;
	}

	@media (max-width: 640px) {
		.ferroir-hero > img {
			min-height: 250px;
			object-position: center;
		}

		.hero-copy {
			padding: 22px 24px 0;
		}

		h1 { font-size: clamp(3.7rem, 18vw, 6rem); }
		.hero-copy p { font-size: 1rem; }

		.intro {
			grid-template-columns: 1fr auto;
			min-height: 460px;
			padding: 100px 24px 72px;
		}

		.intro p { grid-column: 1 / -1; grid-row: 2; font-size: clamp(2rem, 10.5vw, 3.25rem); }
		.intro i:last-child { justify-self: end; }
	}
</style>
