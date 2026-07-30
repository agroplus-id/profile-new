<script lang="ts">
	import { bumiKopiImages } from '$lib/data/bumikopi';
</script>

<section class="brewing-section" aria-labelledby="brewing-title">
	<div class="brewing-inner">
		<h2 id="brewing-title">Brewing Recomendation</h2>

		<div class="brewing-grid">
			<div class="equipment-card">
				<img src={bumiKopiImages.brewing} alt="Coffee brewing equipment" />
			</div>

			<div class="quote-card">
				<h3>All<br />You<br />Can<br />Brew</h3>
				<p>
					Anything How<br />
					You Brew Doesnt<br />
					Matter, The<br />
					Coffee Is Perfect<br />
					Anyway
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.brewing-section {
		background: #f0f3f1;
		padding: clamp(48px, 7vw, 96px) 0 clamp(48px, 7vw, 96px) clamp(24px, 6vw, 96px);
		overflow: hidden;
		color: #849962;
	}

	.brewing-inner {
		max-width: 1200px;
		margin: 0 0 0 auto;
	}

	h2 {
		margin: 0 0 clamp(28px, 4vw, 56px);
		font-size: clamp(2rem, 3.8vw, 3.8rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.04em;
		color: #849962;
		padding-right: clamp(24px, 6vw, 96px);
	}

	.brewing-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.9fr);
		gap: clamp(20px, 3vw, 40px);
		align-items: stretch;
	}

	.equipment-card {
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-right: 12px;
	}

	.equipment-card img {
		display: block;
		width: 100%;
		height: auto;
		object-fit: contain;
	}

	.quote-card {
		background: #c5d8a4;
		border-radius: clamp(32px, 4vw, 52px) 0 0 clamp(32px, 4vw, 52px);
		padding: clamp(36px, 4.5vw, 64px) clamp(28px, 3.5vw, 48px);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
	}

	.quote-card h3 {
		margin: 0;
		font-size: clamp(2.4rem, 4.8vw, 5rem);
		font-weight: 800;
		line-height: 0.88;
		letter-spacing: -0.05em;
		color: #3b501f;
	}

	.quote-card p {
		margin: clamp(40px, 6vw, 80px) 0 0;
		font-size: clamp(0.78rem, 0.92vw, 1.05rem);
		font-weight: 700;
		line-height: 1.25;
		color: #2c3c18;
	}

	@media (max-width: 760px) {
		.brewing-section {
			padding: clamp(32px, 5vw, 64px) 0 clamp(32px, 5vw, 64px) 20px;
		}

		.brewing-grid {
			grid-template-columns: 1fr;
		}

		.equipment-card {
			padding-right: 20px;
		}
	}
</style>
