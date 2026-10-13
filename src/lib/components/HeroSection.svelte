<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeScale, magneticHover } from '$lib/motion';
	import poster from '$lib/assets/images/image-940.png';
	import videoSource from '$lib/assets/videos/comprof-landscape.mp4';

	let video = $state<HTMLVideoElement>();
	let hero = $state<HTMLElement>();
	let muted = $state(true);

	onMount(() => {
		video?.play().catch(() => {});

		// Progres scroll 0..1 selama hero melewati layar: teks memudar + blur, latar zoom-in.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let frame = 0;
		const update = () => {
			frame = 0;
			if (!hero) return;
			const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.85)));
			hero.style.setProperty('--p', p.toFixed(4));
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
		};
	});

	function playWithSound() {
		if (video) {
			muted = false;
			video.muted = false;
			video.play().catch(() => {});
		}
	}
</script>

<section class="hero" id="home" aria-labelledby="hero-title" bind:this={hero}>
	<div class="hero-media">
		<video
			use:fadeScale
			bind:this={video}
			class="hero-video"
			autoplay
			loop
			muted={muted}
			playsinline
			controls
			poster={poster}
		>
			<source src={videoSource} type="video/mp4" />
		</video>
	</div>
	<div class="hero-overlay"></div>

	<div class="hero-content">
		<p class="eyebrow" style="--d:0.15s"><i aria-hidden="true"></i>Upstream coffee technology</p>
		<h1 id="hero-title">
			<span class="line" style="--d:0.3s"><b>Building next-generation</b></span>
			<span class="line" style="--d:0.42s"><em>upstream coffee tech industry</em></span>
		</h1>
		<div class="cta" style="--d:0.6s">
			<button use:magneticHover class="video-link" type="button" onclick={playWithSound}>
				Watch full video <span aria-hidden="true">→</span>
			</button>
		</div>
	</div>
</section>

<style>
	.hero {
		--p: 0;
		--ease: cubic-bezier(0.62, 0.05, 0.01, 0.99);
	}

	/* Latar zoom-in halus saat di-scroll */
	.hero-media {
		position: absolute;
		inset: 0;
		transform: scale(calc(1 + var(--p) * 0.22));
		transform-origin: 50% 40%;
		will-change: transform;
	}

	/* Overlay menggelap seiring scroll */
	.hero-overlay::after {
		content: '';
		position: absolute;
		inset: 0;
		background: #030403;
		opacity: calc(var(--p) * 0.55);
	}

	.hero-content {
		transform: translate3d(0, calc(var(--p) * -70px), 0);
		opacity: calc(1 - var(--p) * 1.35);
		filter: blur(calc(var(--p) * 12px));
		will-change: transform, opacity, filter;
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 16px;
		margin: 0 0 22px;
		color: rgba(255, 255, 255, 0.82);
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.28em;
		text-transform: uppercase;
	}

	.eyebrow i {
		display: block;
		width: 40px;
		height: 1px;
		background: rgba(255, 255, 255, 0.6);
	}

	.hero-content :global(h1) {
		margin: 0 0 34px;
		color: #fff;
		font-size: clamp(2.6rem, 5.4vw, 5.4rem);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.04;
	}

	.line {
		display: block;
	}

	.line b {
		font-weight: 600;
	}

	.line em {
		color: #a9c27f;
		font-style: italic;
		font-weight: 300;
	}

	.cta :global(.video-link) {
		min-height: 56px;
		padding: 0 30px;
		border-radius: 999px;
		background: #849962;
		color: #fff;
		font-size: 1rem;
		font-weight: 600;
		gap: 14px;
		backdrop-filter: none;
		box-shadow: 0 10px 30px rgba(132, 153, 98, 0.35);
		transition:
			background-color 0.4s var(--ease),
			box-shadow 0.4s var(--ease);
	}

	.cta :global(.video-link span) {
		width: auto;
		height: auto;
		background: none;
		font-size: 1.15em;
		transition: transform 0.4s var(--ease);
	}

	.cta :global(.video-link:hover span) {
		transform: translateX(4px);
	}

	.cta :global(.video-link:hover) {
		background: #93a972;
		box-shadow: 0 14px 38px rgba(132, 153, 98, 0.5);
	}

	/* Masuk: naik + blur → tajam, per baris */
	.eyebrow,
	.line,
	.cta {
		animation: rise 1.1s var(--ease) var(--d, 0s) backwards;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(34px);
			filter: blur(10px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.eyebrow,
		.line,
		.cta {
			animation: none;
		}
	}
</style>
