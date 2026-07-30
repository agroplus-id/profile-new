<script lang="ts">
	import { ferroirFeatures } from "$lib/data/ferroir";
	import ferroirWordmark from "$lib/assets/images/desktop 9/ferroir.svg";
</script>

<section class="features" aria-labelledby="meet-title">
	<div class="features-inner">
		<h2 id="meet-title">
			<em>Meet</em>
			<img src={ferroirWordmark} alt="FERROIR" />
		</h2>

		<div class="feature-grid">
			{#each ferroirFeatures as feature, index}
				<article class:reverse={index % 2 === 1}>
					<div class="feature-copy">
						<span class="label">{feature.label}</span>
						<h3>{feature.title}</h3>
						<p>{feature.text}</p>
					</div>
					<div class="feature-img">
						<img src={feature.image} alt={feature.title} />
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.features {
		background: #f0f3f1;
		padding: clamp(48px, 7vw, 108px) 0 clamp(64px, 8vw, 120px);
	}

	.features-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 clamp(24px, 6vw, 96px);
	}

	h2 {
		display: flex;
		align-items: center;
		gap: clamp(14px, 1.6vw, 26px);
		margin: 0 0 clamp(28px, 3.5vw, 52px);
		line-height: 1;
	}

	h2 em {
		color: #849962;
		font-size: clamp(3.4rem, 6.7vw, 6rem);
		font-style: italic;
		font-weight: 400;
		letter-spacing: -0.04em;
	}

	h2 img {
		display: block;
		width: clamp(160px, 21vw, 330px);
		height: auto;
	}

	.feature-grid {
		display: grid;
		gap: clamp(22px, 2.5vw, 36px);
	}

	/* Each mockup row is one-third copy and two-thirds visual. */
	article {
		display: grid;
		grid-template-columns: 1fr 2fr;
		align-items: stretch;
		gap: clamp(12px, 1.4vw, 20px);
		min-height: clamp(280px, 34vw, 440px);
	}

	article.reverse {
		grid-template-columns: 2fr 1fr;
	}

	article.reverse .feature-img {
		grid-column: 1;
		grid-row: 1;
	}
	article.reverse .feature-copy {
		grid-column: 2;
	}

	.feature-copy {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0;
		padding: clamp(20px, 2.8vw, 44px) clamp(22px, 2.8vw, 44px);
		background: #d8e4c6;
		border-radius: clamp(10px, 1vw, 16px);
	}

	.label {
		display: inline-block;
		padding: 5px 12px;
		border-radius: 20px;
		background: #ffffff;
		color: #2c3c18;
		font-size: clamp(0.72rem, 0.85vw, 0.92rem);
		font-weight: 500;
		line-height: 1;
	}

	h3 {
		margin: clamp(18px, 2.2vw, 32px) 0 clamp(10px, 1.2vw, 18px);
		color: #849962;
		font-size: clamp(1.3rem, 2.4vw, 2.8rem);
		font-weight: 700;
		line-height: 0.92;
		letter-spacing: -0.04em;
	}

	.feature-copy p {
		max-width: 30rem;
		margin: 0;
		color: #263214;
		font-size: clamp(0.74rem, 0.9vw, 1rem);
		font-weight: 500;
		line-height: 1.45;
	}

	.feature-img {
		overflow: hidden;
		border-radius: clamp(10px, 1vw, 16px);
		min-height: 0;
	}

	.feature-img img {
		display: block;
		width: 100%;
		height: 100%;
		min-height: clamp(280px, 34vw, 440px);
		object-fit: cover;
	}

	@media (max-width: 760px) {
		.features-inner {
			padding-inline: 16px;
		}
		article,
		article.reverse {
			grid-template-columns: 1fr 1.5fr;
			min-height: 200px;
		}
		article.reverse .feature-img {
			grid-column: 2;
			grid-row: 1;
		}
		article.reverse .feature-copy {
			grid-column: 1;
		}
		h3 {
			font-size: clamp(1.05rem, 5.2vw, 1.6rem);
		}
	}

	@media (max-width: 520px) {
		article,
		article.reverse {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto;
		}
		article.reverse .feature-img {
			grid-column: 1;
			grid-row: 2;
		}
		article.reverse .feature-copy {
			grid-column: 1;
			grid-row: 1;
		}
		.feature-img {
			min-height: 200px;
		}
	}
</style>
