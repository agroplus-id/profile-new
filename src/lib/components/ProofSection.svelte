<script lang="ts">
	import { fadeUp, tiltHover, magneticHover } from '$lib/motion';
	import playIcon from '$lib/assets/images/chevron-right0.png';
</script>

<section class="proof-section" id="projects" aria-labelledby="proof-title">
	<div class="proof-card" use:fadeUp={{ duration: 0.8 }}>
		<div class="proof-copy">
			<h2 id="proof-title" use:fadeUp={{ delay: 0.1 }}>Agroplus Proving: Coffee land origin visit for Agroplus technologies product</h2>
			<div use:fadeUp={{ delay: 0.2 }}>
				<p>In Desember 2025, Agroplus Demo achieved a review success after market validation from the Wandhe Estate Family Ecosystem. The result is Ferroir, the fermentation tools for newborn coffee processor, and the ferment-tank will launch at August 2026.</p>
				<a class="text-link" href="#tools">Learn more</a>
			</div>
		</div>
		<div class="proof-video" use:tiltHover={{ maxTilt: 6, scale: 1.01 }} aria-label="Video placeholder">
			<a use:magneticHover class="video-link proof-video-link" href="#home">
				<span></span><img src={playIcon} alt="" aria-hidden="true" />Watch full video
			</a>
		</div>
	</div>
</section>
