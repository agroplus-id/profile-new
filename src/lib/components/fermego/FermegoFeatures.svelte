<script lang="ts">
	import { fermegoFeatures } from '$lib/data/fermego';
	import logo from '$lib/assets/images/desktop10/fermego_logo.png';
</script>

<section class="features" aria-labelledby="meet-fermego-title">
	<div class="features-inner">
		<h2 id="meet-fermego-title">
			<em>Meet</em>
			<img src={logo} alt="FERMEGO" />
		</h2>

		<div class="feature-grid">
			{#each fermegoFeatures as feature, index}
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
		width: clamp(180px, 24vw, 360px);
		height: auto;
	}

	.feature-grid {
		display: grid;
		gap: clamp(24px, 3vw, 40px);
	}

	article {
		display: grid;
		grid-template-columns: 1fr 1.6fr;
		align-items: stretch;
		gap: clamp(16px, 2vw, 28px);
	}

	article.reverse {
		grid-template-columns: 1.6fr 1fr;
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
		justify-content: space-between;
		padding: clamp(28px, 3.5vw, 48px);
		background: #d8e4c6;
		border-radius: clamp(16px, 1.8vw, 24px);
		height: 100%;
	}

	.label {
		display: inline-block;
		padding: 6px 14px;
		border-radius: 20px;
		background: #ffffff;
		color: #2c3c18;
		font-size: clamp(0.75rem, 0.88vw, 0.95rem);
		font-weight: 600;
		line-height: 1;
	}

	h3 {
		margin: clamp(16px, 2vw, 28px) 0 clamp(10px, 1.2vw, 16px);
		color: #849962;
		font-size: clamp(1.4rem, 2.5vw, 2.8rem);
		font-weight: 800;
		line-height: 0.94;
		letter-spacing: -0.04em;
	}

	.feature-copy p {
		max-width: 32rem;
		margin: 0;
		color: #263214;
		font-size: clamp(0.78rem, 0.95vw, 1.05rem);
		font-weight: 500;
		line-height: 1.42;
	}

	.feature-img {
		position: relative;
		overflow: hidden;
		border-radius: clamp(16px, 1.8vw, 24px);
		height: 100%;
	}

	.feature-img img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		border-radius: clamp(16px, 1.8vw, 24px);
	}

	@media (max-width: 760px) {
		.features-inner {
			padding-inline: 20px;
		}
		article,
		article.reverse {
			grid-template-columns: 1fr;
			min-height: auto;
		}
		article.reverse .feature-img {
			grid-column: 1;
			grid-row: 2;
		}
		article.reverse .feature-copy {
			grid-column: 1;
			grid-row: 1;
		}
		.feature-copy {
			min-height: 260px;
		}
		.feature-img {
			min-height: 260px;
		}
	}
</style>
