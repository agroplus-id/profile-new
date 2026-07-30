<script lang="ts">
	import { ferroirSpecs } from '$lib/data/ferroir';
	import titleBg from '$lib/assets/images/desktop 9/ferroir-v-21.svg';
	import device from '$lib/assets/images/desktop 9/feroir2.svg';
	import circle from '$lib/assets/images/desktop 9/circle.svg';
	import dotSvg from '$lib/assets/images/desktop 9/dot.svg';

	import imgLcd from '$lib/assets/images/desktop 9/2.svg';
	import imgBlueLight from '$lib/assets/images/desktop 9/3.svg';
	import imgMisting from '$lib/assets/images/desktop 9/4.svg';
	import imgSensor from '$lib/assets/images/desktop 9/gambar5.svg';
	import imgReactor from '$lib/assets/images/desktop 9/gambar2.svg';
	import imgAeration from '$lib/assets/images/desktop 9/6.svg';

	type Hotspot = {
		id: string;
		title: string;
		description: string;
		image: string;
		top: string;
		left: string;
	};

	const hotspots: Hotspot[] = [
		{
			id: 'lcd',
			title: 'LCD Control Panel',
			description:
				'Stay connected to every stage of fermentation with a live dashboard that refreshes automatically every five minutes, so you\'re always informed without interruption.',
			image: imgLcd,
			top: '25%',
			left: '55%'
		},
		{
			id: 'blue-light',
			title: 'Blue Light Spectrum',
			description:
				'A precisely selected blue light wavelength supports microbial activity, helping create a healthier and more efficient fermentation environment.',
			image: imgBlueLight,
			top: '32%',
			left: '48%'
		},
		{
			id: 'misting',
			title: 'Automatic Misting System',
			description:
				'Activates only when needed to restore optimal humidity levels, keeping fermentation conditions consistent without manual adjustment.',
			image: imgMisting,
			top: '40%',
			left: '45%'
		},
		{
			id: 'sensor',
			title: 'Multi-parameter Sensor',
			description:
				'Continuously monitors critical fermentation parameters—including nitrogen, carbon, humidity, pressure, and alcohol—to maintain accuracy throughout the entire process.',
			image: imgSensor,
			top: '52%',
			left: '52%'
		},
		{
			id: 'temperature',
			title: 'Integrated Temperature Reactor',
			description:
				'Maintains the ideal fermentation temperature automatically, creating stable conditions that allow microorganisms to perform at their best.',
			image: imgReactor,
			top: '46%',
			left: '42%'
		},
		{
			id: 'aeration',
			title: 'Integrated Aeration',
			description:
				'Provides uniform airflow throughout the reactor, ensuring microorganisms receive the oxygen they need for stable and efficient fermentation.',
			image: imgAeration,
			top: '58%',
			left: '50%'
		}
	];

	let activeHotspotId = $state<string | null>(null);

	function toggleHotspot(id: string) {
		activeHotspotId = activeHotspotId === id ? null : id;
	}

	function closePopup() {
		activeHotspotId = null;
	}
</script>

<section class="specs-stage" aria-label="Ferroir product specifications">
	<div class="specs-meta">
		<p>Ferroir-V2</p>
		<strong>Launching 2027</strong>
	</div>

	<div class="specs-table" aria-label="Ferroir specifications">
		{#each ferroirSpecs as [label, value]}
			<div><span>{label} :</span><strong>{value}</strong></div>
		{/each}
	</div>

	<div class="specs-title-bg" aria-hidden="true">
		<img src={titleBg} alt="" />
	</div>

	<img class="specs-circle" src={circle} alt="" aria-hidden="true" />

	<div class="device-container">
		<img class="specs-device" src={device} alt="Ferroir V2 fermentation kit" />

		<!-- Interactive Hotspot Dots -->
		{#each hotspots as hs}
			<button
				type="button"
				class="hotspot-dot"
				class:is-active={activeHotspotId === hs.id}
				style="top: {hs.top}; left: {hs.left};"
				onclick={() => toggleHotspot(hs.id)}
				aria-label={`Show ${hs.title} details`}
			>
				<img src={dotSvg} alt="" />
			</button>
		{/each}

		<!-- Active Feature Detail Modal Popup -->
		{#if activeHotspotId}
			{@const activeHs = hotspots.find((h) => h.id === activeHotspotId)}
			{#if activeHs}
				<div class="popup-card" role="dialog" aria-labelledby="popup-title">
					<div class="popup-header">
						<div class="popup-title">
							<span class="dot-indicator"></span>
							<h3 id="popup-title">{activeHs.title}</h3>
						</div>
						<button
							type="button"
							class="popup-close"
							onclick={closePopup}
							aria-label="Close detail modal"
						>
							✕
						</button>
					</div>

					<div class="popup-preview" aria-hidden="true"></div>

					<p class="popup-desc">{activeHs.description}</p>
				</div>
			{/if}
		{/if}
	</div>

	<p class="specs-tagline">The Next-Gen Fermentation<br />Kit for Beginners</p>
</section>

<style>
	.specs-stage {
		position: relative;
		min-height: clamp(680px, 76vw, 980px);
		display: grid;
		place-items: center;
		overflow: hidden;
		background: #f0f3f1;
		padding: clamp(32px, 5vw, 70px) clamp(24px, 6vw, 96px);
	}

	.specs-meta {
		position: absolute;
		top: clamp(24px, 5vw, 70px);
		left: clamp(24px, 6vw, 96px);
		color: #849962;
		font-size: clamp(0.95rem, 1.1vw, 1.1rem);
		font-weight: 800;
		line-height: 0.95;
		z-index: 4;
	}

	.specs-meta p,
	.specs-meta strong {
		display: block;
		margin: 0;
	}

	.specs-meta strong {
		color: #945600;
	}

	.specs-table {
		position: absolute;
		top: clamp(24px, 5vw, 70px);
		right: clamp(24px, 6vw, 96px);
		display: grid;
		gap: 2px;
		width: min(420px, 42vw);
		color: #849962;
		font-size: clamp(0.88rem, 1vw, 1rem);
		font-weight: 800;
		line-height: 0.98;
		text-align: right;
		z-index: 4;
	}

	.specs-table div {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 16px;
	}

	.specs-table strong {
		min-width: 110px;
		color: #45552d;
		text-align: left;
	}

	.specs-title-bg {
		position: absolute;
		left: 50%;
		top: 50%;
		width: min(1230px, 112vw);
		transform: translate(-50%, -51%);
		z-index: 1;
		pointer-events: none;
	}

	.specs-title-bg img {
		display: block;
		width: 100%;
		height: auto;
	}

	.specs-circle {
		position: absolute;
		width: min(720px, 72vw);
		aspect-ratio: 1;
		z-index: 2;
		animation: slow-spin 42s linear infinite;
		pointer-events: none;
	}

	.device-container {
		position: relative;
		z-index: 5;
		display: inline-block;
	}

	.specs-device {
		position: relative;
		display: block;
		width: min(430px, 37vw);
		max-height: 620px;
		object-fit: contain;
		filter: drop-shadow(0 28px 28px rgba(37, 51, 15, 0.12));
	}

	.hotspot-dot {
		position: absolute;
		transform: translate(-50%, -50%);
		width: 30px;
		height: 30px;
		padding: 0;
		border: none;
		background: transparent;
		cursor: pointer;
		z-index: 10;
		transition: transform 0.2s ease, filter 0.2s ease;
	}

	.hotspot-dot img {
		display: block;
		width: 100%;
		height: 100%;
	}

	.hotspot-dot:hover,
	.hotspot-dot.is-active {
		transform: translate(-50%, -50%) scale(1.25);
		filter: drop-shadow(0 0 8px rgba(212, 230, 81, 0.8));
	}

	/* Feature Modal Popup Card */
	.popup-card {
		position: absolute;
		top: 30%;
		left: 54%;
		z-index: 30;
		width: min(340px, 86vw);
		padding: 14px 16px 18px;
		border-radius: 4px;
		background: #748368;
		box-shadow: 0 18px 40px rgba(0, 0, 0, 0.32);
		animation: popup-fade-in 0.2s ease-out forwards;
	}

	.popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
	}

	.popup-title {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #ffffff;
	}

	.dot-indicator {
		width: 12px;
		height: 12px;
		background: #d4e651;
		flex-shrink: 0;
	}

	.popup-title h3 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		color: #ffffff;
		line-height: 1.2;
	}

	.popup-close {
		width: 26px;
		height: 26px;
		padding: 0;
		border: none;
		border-radius: 2px;
		background: #c5d7a9;
		color: #45552d;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		display: grid;
		place-items: center;
		line-height: 1;
		transition: background-color 0.15s ease;
	}

	.popup-close:hover {
		background: #d6e8bc;
	}

	.popup-preview {
		width: 100%;
		aspect-ratio: 1.5 / 1;
		background: #d4d8ce;
		border-radius: 3px;
		margin-bottom: 12px;
	}

	.popup-desc {
		margin: 0;
		color: #ffffff;
		font-size: 0.78rem;
		font-weight: 500;
		line-height: 1.38;
		opacity: 0.96;
	}

	.specs-tagline {
		position: absolute;
		left: clamp(24px, 6vw, 96px);
		bottom: clamp(72px, 9vw, 140px);
		max-width: 420px;
		margin: 0;
		color: #25330f;
		font-size: clamp(1.4rem, 2.4vw, 2rem);
		font-weight: 800;
		line-height: 1.16;
		z-index: 4;
	}

	@keyframes slow-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes popup-fade-in {
		from {
			opacity: 0;
			transform: translateY(6px) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (max-width: 980px) {
		.specs-table {
			top: auto;
			right: auto;
			left: clamp(24px, 6vw, 64px);
			bottom: 150px;
			width: min(480px, calc(100% - 48px));
			text-align: left;
		}

		.specs-tagline {
			bottom: 250px;
		}

		.specs-device {
			width: min(360px, 58vw);
			transform: translateY(-42px);
		}

		.popup-card {
			top: 20%;
			left: 50%;
			transform: translateX(-50%);
		}
	}

	@media (max-width: 640px) {
		.specs-stage {
			display: flex;
			min-height: auto;
			flex-direction: column;
			align-items: stretch;
			gap: 24px;
			padding: 72px 20px 48px;
		}

		.specs-meta {
			position: relative;
			top: auto;
			left: auto;
		}

		.specs-table {
			position: relative;
			top: auto;
			right: auto;
			bottom: auto;
			left: auto;
			width: 100%;
			font-size: 0.92rem;
			text-align: left;
		}

		.specs-table div {
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 12px;
			padding: 2px 0;
		}

		.specs-table strong {
			min-width: 0;
			text-align: right;
		}

		.specs-title-bg {
			top: 39%;
			width: 178vw;
			opacity: 0.72;
		}

		.specs-circle {
			top: 38%;
			width: 82vw;
			transform: translateY(-50%);
		}

		.specs-device {
			width: min(280px, 70vw);
			max-height: 430px;
			align-self: center;
			transform: none;
		}

		.specs-tagline {
			position: relative;
			left: auto;
			bottom: auto;
			max-width: 100%;
			font-size: clamp(1.55rem, 8vw, 2.45rem);
			line-height: 1.02;
		}

		.popup-card {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 90vw;
		}
	}
</style>
