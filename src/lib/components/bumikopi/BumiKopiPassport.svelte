<script lang="ts">
	import { bumiKopiImages } from '$lib/data/bumikopi';
</script>

<section class="passport-section" aria-label="Coffee Passport card">
	<div class="passport-inner">
		<img src={bumiKopiImages.passportGraphic} alt="Coffee Passport AP-26-0001867" />
	</div>
</section>

<style>
	.passport-section {
		background: #f0f3f1;
		padding: clamp(32px, 5vw, 72px) clamp(24px, 6vw, 96px);
		border-bottom: 1.5px solid #a3b880;
	}

	.passport-inner {
		max-width: 1200px;
		margin: 0 auto;
	}

	.passport-inner img {
		display: block;
		width: 100%;
		height: auto;
	}
</style>
