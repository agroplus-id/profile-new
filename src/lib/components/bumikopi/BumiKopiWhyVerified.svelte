<script lang="ts">
	import { bumiKopiImages } from '$lib/data/bumikopi';
</script>

<section class="why-verified" aria-labelledby="why-title">
	<i class="plus plus-top-left" aria-hidden="true">+</i>
	<i class="plus plus-top-right" aria-hidden="true">+</i>

	<div class="why-inner">
		<div class="text-grid">
			<div class="title-col">
				<span class="label">The Reasons</span>
				<h2 id="why-title">Why we choose this coffee to be verified ?</h2>
			</div>
			<div class="desc-col">
				<p>
					We chose to verify this Liberica because its value extends far beyond the cup. Its history, origin, and the generations of growers who have preserved it deserve more than recognition, they deserve a permanent record. Verification helps ensure that every bottle carries the authentic identity of Wonosalam Liberica.
				</p>
			</div>
		</div>

		<div class="photo-wrap">
			<img src={bumiKopiImages.coffeePhoto} alt="Coffee cherries being hand-picked in Wonosalam farm" />
		</div>
	</div>

	<i class="plus plus-bottom-left" aria-hidden="true">+</i>
	<i class="plus plus-bottom-right" aria-hidden="true">+</i>
</section>

<style>
	.why-verified {
		position: relative;
		background: #f0f3f1;
		padding: clamp(60px, 8vw, 100px) clamp(24px, 6vw, 96px) clamp(48px, 6vw, 80px);
		color: #23320e;
		border-bottom: 1.5px solid #a3b880;
	}

	.plus {
		position: absolute;
		font-style: normal;
		color: #23320e;
		font-size: 1.25rem;
		line-height: 1;
		pointer-events: none;
	}

	.plus-top-left { top: 24px; left: clamp(24px, 6vw, 96px); }
	.plus-top-right { top: 24px; right: clamp(24px, 6vw, 96px); }
	.plus-bottom-left { bottom: 24px; left: clamp(24px, 6vw, 96px); }
	.plus-bottom-right { bottom: 24px; right: clamp(24px, 6vw, 96px); }

	.why-inner {
		max-width: 1200px;
		margin: 0 auto;
	}

	.text-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(280px, 0.9fr);
		gap: clamp(24px, 5vw, 88px);
		align-items: start;
		margin-bottom: clamp(40px, 6vw, 72px);
	}

	.label {
		display: block;
		font-size: clamp(0.9rem, 1.1vw, 1.25rem);
		font-weight: 700;
		color: #4a5c32;
		margin-bottom: 8px;
	}

	h2 {
		margin: 0;
		font-size: clamp(2.2rem, 4.2vw, 4.5rem);
		font-weight: 800;
		line-height: 0.94;
		letter-spacing: -0.045em;
		color: #849962;
	}

	.desc-col p {
		margin: 0;
		font-size: clamp(0.82rem, 1vw, 1.1rem);
		font-weight: 500;
		line-height: 1.45;
		color: #33441a;
	}

	.photo-wrap {
		width: 100%;
		overflow: hidden;
	}

	.photo-wrap img {
		display: block;
		width: 100%;
		height: auto;
		transform: scale(1.05);
		transform-origin: center;
	}

	@media (max-width: 760px) {
		.text-grid {
			grid-template-columns: 1fr;
			gap: 20px;
		}
	}
</style>
