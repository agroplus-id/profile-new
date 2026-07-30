<script lang="ts">
	import { flavorNotes } from '$lib/data/bumikopi';
</script>

<section class="flavors-section" aria-labelledby="flavors-title">
	<div class="flavors-inner">
		<h2 id="flavors-title">This Coffee<br />Reminds Us of :</h2>

		<div class="cards-grid">
			{#each flavorNotes as flavor}
				<div class="flavor-card">
					<img src={flavor.image} alt={flavor.name} />
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.flavors-section {
		background: #f0f3f1;
		padding: clamp(24px, 3.5vw, 48px) clamp(24px, 6vw, 96px);
		color: #849962;
	}

	.flavors-inner {
		max-width: 1200px;
		margin: 0 auto;
	}

	h2 {
		margin: 0 0 clamp(28px, 4vw, 56px);
		font-size: clamp(2rem, 3.8vw, 3.8rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.04em;
		color: #849962;
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: clamp(14px, 2vw, 28px);
	}

	.flavor-card {
		transition: transform 0.25s ease;
	}

	.flavor-card:hover {
		transform: translateY(-4px);
	}

	.flavor-card img {
		display: block;
		width: 100%;
		height: auto;
	}

	@media (max-width: 840px) {
		.cards-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 480px) {
		.cards-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
