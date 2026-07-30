<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeUp, fadeScale, magneticHover } from '$lib/motion';
	import poster from '$lib/assets/images/image-940.png';
	import playIcon from '$lib/assets/images/chevron-right0.png';
	import videoSource from '$lib/assets/videos/comprof-landscape.mp4';

	let video = $state<HTMLVideoElement>();
	let muted = $state(true);
	onMount(() => video?.play().catch(() => {}));
	function playWithSound() { if (video) { muted = false; video.muted = false; video.play().catch(() => {}); } }
</script>

<section class="hero" id="home" aria-labelledby="hero-title">
	<video use:fadeScale bind:this={video} class="hero-video" autoplay loop muted={muted} playsinline controls poster={poster}>
		<source src={videoSource} type="video/mp4" />
	</video>
	<div class="hero-overlay"></div>
	<div class="hero-content" use:fadeUp={{ delay: 0.2, y: 36 }}>
		<h1 id="hero-title">Building next-generation upstream coffee tech industry</h1>
		<button use:magneticHover class="video-link" type="button" onclick={playWithSound}>
			<span></span><img src={playIcon} alt="" aria-hidden="true" />Watch full video
		</button>
	</div>
</section>
