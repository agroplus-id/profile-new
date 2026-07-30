<script lang="ts">
	import phone from '$lib/assets/images/desktop 9/digital.svg';
</script>

<section class="connectivity">
	<div class="corner tl" aria-hidden="true">+</div>
	<div class="corner tr" aria-hidden="true">+</div>
	<div class="corner bl" aria-hidden="true">+</div>
	<div class="corner br" aria-hidden="true">+</div>

	<div class="connectivity-grid">
		<div class="copy-card" aria-labelledby="connectivity-title">
			<div class="copy-top">
				<h2 id="connectivity-title">Digital Connectivity</h2>
				<p class="sub">Mobile app &amp; website</p>
			</div>
			<ul>
				<li><strong>Remote Monitoring</strong></li>
				<li>Batch Logging</li>
				<li>Recipe Management</li>
				<li>Product Passport</li>
			</ul>
		</div>

		<div class="phone-card">
			<img src={phone} alt="Ferroir mobile app showing connected devices" />
		</div>
	</div>
</section>

<style>
	.connectivity {
		position: relative;
		background: #f0f3f1;
		padding: clamp(48px, 7vw, 96px) clamp(32px, 7vw, 120px);
	}

	.corner {
		position: absolute;
		color: #849962;
		font-size: 1.1rem;
		line-height: 1;
		pointer-events: none;
	}

	.tl { top: clamp(14px, 2.5vw, 36px); left: clamp(18px, 3vw, 44px); }
	.tr { top: clamp(14px, 2.5vw, 36px); right: clamp(18px, 3vw, 44px); }
	.bl { bottom: clamp(14px, 2.5vw, 36px); left: clamp(18px, 3vw, 44px); }
	.br { bottom: clamp(14px, 2.5vw, 36px); right: clamp(18px, 3vw, 44px); }

	.connectivity-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: stretch;
		gap: clamp(14px, 1.8vw, 24px);
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Use the same accent surface as the rest of the site. */
	.copy-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background: #d8e4c6;
		border-radius: clamp(12px, 1.2vw, 20px);
		padding: clamp(28px, 3.5vw, 52px) clamp(28px, 3.5vw, 52px);
		min-height: clamp(340px, 40vw, 580px);
	}

	.copy-top h2 {
		margin: 0 0 8px;
		color: #44552d;
		font-size: clamp(1.6rem, 2.8vw, 3rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.03em;
	}

	.sub {
		margin: 0;
		color: #849962;
		font-size: clamp(0.78rem, 0.95vw, 1rem);
		font-weight: 500;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 4px;
	}

	ul li {
		color: #263214;
		font-size: clamp(0.88rem, 1.1vw, 1.15rem);
		font-weight: 500;
		line-height: 1.4;
	}

	ul li strong {
		font-weight: 800;
	}

	/* Keep the visual card on the site's light surface instead of grey. */
	.phone-card {
		background: #f0f3f1;
		border-radius: clamp(12px, 1.2vw, 20px);
		overflow: hidden;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-top: clamp(24px, 4vw, 56px);
		min-height: clamp(340px, 40vw, 580px);
		height: 100%;
	}

	.phone-card img {
		display: block;
		width: 90%;
		max-width: 480px;
		object-fit: contain;
	}

	@media (max-width: 760px) {
		.connectivity-grid { grid-template-columns: 1fr; }
		.copy-card { min-height: auto; }
		.phone-card { min-height: 320px; height: auto; }
	}
</style>
