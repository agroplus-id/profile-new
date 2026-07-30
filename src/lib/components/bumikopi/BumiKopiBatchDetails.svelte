<script lang="ts">
</script>

<section class="batch-section" aria-labelledby="batch-title">
	<div class="batch-inner">
		<div class="batch-header">
			<h2 id="batch-title">Your Coffee<br />Batch Detail</h2>
			<div class="item-number">Item Number<br /><strong>1/30</strong></div>
		</div>

		<div class="batch-rows">
			<div class="batch-row">
				<div class="stat">
					<span class="value">150</span>
					<span class="unit">Gram</span>
				</div>
				<div class="stat-label">WEIGHT/PACKAGES</div>
			</div>

			<div class="divider"></div>

			<div class="batch-row">
				<div class="stat">
					<span class="value">4500</span>
					<span class="unit">Gram</span>
				</div>
				<div class="stat-label">TOTAL PRODUCTION ON THIS BATCH</div>
			</div>
		</div>

		<div class="purchase-area">
			<h3>Purchase more on</h3>
			<a
				href="https://tokopedia.com"
				target="_blank"
				rel="noopener noreferrer"
				class="tokopedia-btn"
			>
				Bumi Kopi Tokopedia Store
			</a>
		</div>
	</div>
</section>

<style>
	.batch-section {
		background: #f0f3f1;
		padding: clamp(48px, 7vw, 96px) clamp(24px, 6vw, 96px);
		color: #849962;
	}

	.batch-inner {
		max-width: 1200px;
		margin: 0 auto;
	}

	.batch-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: clamp(32px, 5vw, 64px);
	}

	h2 {
		margin: 0;
		font-size: clamp(2rem, 3.8vw, 3.8rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.04em;
		color: #849962;
	}

	.item-number {
		text-align: right;
		font-size: clamp(1.2rem, 2vw, 2.2rem);
		font-weight: 800;
		line-height: 1;
		color: #2c3c18;
	}

	.item-number strong {
		font-size: clamp(1.6rem, 2.8vw, 3.2rem);
		display: block;
		margin-top: 4px;
	}

	.batch-rows {
		display: flex;
		flex-direction: column;
		gap: clamp(20px, 3vw, 36px);
		margin-bottom: clamp(48px, 7vw, 96px);
	}

	.batch-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 24px;
	}

	.stat {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}

	.value {
		font-size: clamp(4rem, 10vw, 11rem);
		font-weight: 800;
		line-height: 0.78;
		letter-spacing: -0.06em;
		color: #849962;
	}

	.unit {
		font-size: clamp(1.4rem, 2.4vw, 2.8rem);
		font-weight: 700;
		color: #2c3c18;
	}

	.stat-label {
		font-size: clamp(0.72rem, 0.88vw, 0.95rem);
		font-weight: 700;
		letter-spacing: 0.08em;
		color: #4a5c32;
		text-align: right;
	}

	.divider {
		height: 1.5px;
		background: #849962;
		opacity: 0.5;
		width: 100%;
	}

	.purchase-area {
		text-align: center;
		padding-top: clamp(24px, 4vw, 48px);
	}

	.purchase-area h3 {
		margin: 0 0 clamp(16px, 2.5vw, 28px);
		font-size: clamp(1.8rem, 3.2vw, 3.2rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		color: #849962;
	}

	.tokopedia-btn {
		display: inline-block;
		padding: clamp(12px, 1.4vw, 18px) clamp(32px, 4vw, 64px);
		background: #556b35;
		color: #ffffff;
		border-radius: 30px;
		font-size: clamp(0.95rem, 1.15vw, 1.25rem);
		font-weight: 700;
		text-decoration: none;
		transition: background 0.2s ease, transform 0.2s ease;
	}

	.tokopedia-btn:hover {
		background: #3e5025;
		transform: translateY(-2px);
	}

	@media (max-width: 640px) {
		.batch-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}

		.stat-label {
			text-align: left;
		}
	}
</style>
