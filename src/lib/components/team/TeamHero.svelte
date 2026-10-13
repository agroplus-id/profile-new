<script lang="ts">
	import { onMount } from 'svelte';
	import poster from '$lib/assets/images/image-940.png';
	import videoSource from '$lib/assets/videos/comprof-landscape.mp4';
	import { fadeUp, staggerUp, slideDown, fadeScale, floatLoop, scrollZoom, scrollReveal } from '$lib/motion';

	let video = $state<HTMLVideoElement>();
	let muted = $state(true);

	onMount(() => {
		video?.play().catch(() => {});
	});

	function playWithSound() {
		if (video) {
			muted = false;
			video.muted = false;
			video.play().catch(() => {});
		}
	}
</script>

<section class="team-hero hero" aria-label="The team building AgroPlus" use:scrollZoom>
	<video
		bind:this={video}
		class="hero-video zoom-media"
		autoplay
		loop
		muted={muted}
		playsinline
		controls
		poster={poster}
	>
		<source src={videoSource} type="video/mp4" />
	</video>
	<div class="hero-overlay"></div>

	<div class="hero-content zoom-fade">
		<h1 use:fadeUp>The team<br />building humanity's<br />coffee upstream<br />industry</h1>

		<button class="video-btn" type="button" onclick={playWithSound} aria-label="Watch full video">
			<span class="btn-icon">
				<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M1 1L9 6L1 11V1Z" fill="#5d6e46" stroke="#5d6e46" stroke-width="1.2" stroke-linejoin="round"/>
				</svg>
			</span>
			<span class="btn-text">Watch full video</span>
		</button>
	</div>
</section>

<section class="statement-section">
	<div class="corner tl" aria-hidden="true">+</div>
	<div class="corner tr" aria-hidden="true">+</div>
	<div class="corner bl" aria-hidden="true">+</div>
	<div class="corner br" aria-hidden="true">+</div>

	<div class="statement-container">
		<p use:scrollReveal class="statement-text">
			AgroPlus is building an integrated ecosystem for the upstream coffee industry with combining
			computer vision, precision fermentation, and digital verification to help every coffee origin
			become more measurable, traceable, and trusted.
		</p>
	</div>
</section>

<style>
	.team-hero {
		position: relative;
		min-height: min(882px, calc(100svh - 100px));
		background: #030403;
		color: #ffffff;
		overflow: hidden;
	}

	.hero-video,
	.hero-overlay {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.hero-video {
		object-fit: cover;
		opacity: 0.62;
	}

	.hero-overlay {
		background:
			linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.88)),
			radial-gradient(circle at 78% 22%, rgba(132, 153, 98, 0.18), transparent 26%);
		pointer-events: none;
	}

	.hero-content {
		position: absolute;
		z-index: 3;
		left: clamp(28px, 7vw, 120px);
		bottom: clamp(48px, 8vw, 98px);
		width: min(720px, 78vw);
	}

	.hero-content h1 {
		margin: 0 0 clamp(24px, 4vw, 36px);
		color: #849962;
		font-size: clamp(3rem, 4.9vw, 5rem);
		font-weight: 800;
		letter-spacing: 0;
		line-height: 0.88;
	}

	.video-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.btn-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: rgba(240, 243, 241, 0.45);
		backdrop-filter: blur(12px);
	}

	.btn-text {
		display: flex;
		align-items: center;
		height: 36px;
		padding: 0 16px;
		background: rgba(240, 243, 241, 0.45);
		color: #5d6e46;
		font-size: 0.88rem;
		font-weight: 700;
		backdrop-filter: blur(12px);
		transition: background-color 0.2s ease;
	}

	.video-btn:hover .btn-icon,
	.video-btn:hover .btn-text {
		background: rgba(240, 243, 241, 0.72);
	}

	/* Statement section with plus corners */
	.statement-section {
		position: relative;
		background: #f0f3f1;
		padding: clamp(70px, 10vw, 130px) clamp(28px, 9vw, 140px);
	}

	.corner {
		position: absolute;
		color: #849962;
		font-size: 1.25rem;
		line-height: 1;
		font-weight: 600;
		pointer-events: none;
	}

	.tl {
		top: clamp(20px, 3vw, 44px);
		left: clamp(20px, 3vw, 44px);
	}
	.tr {
		top: clamp(20px, 3vw, 44px);
		right: clamp(20px, 3vw, 44px);
	}
	.bl {
		bottom: clamp(20px, 3vw, 44px);
		left: clamp(20px, 3vw, 44px);
	}
	.br {
		bottom: clamp(20px, 3vw, 44px);
		right: clamp(20px, 3vw, 44px);
	}

	.statement-container {
		max-width: 1060px;
		margin: 0 auto;
	}

	.statement-text {
		margin: 0;
		color: #849962;
		font-size: clamp(1.8rem, 3.4vw, 3.4rem);
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.015em;
	}
</style>
