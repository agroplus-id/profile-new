<script lang="ts">
	import { DEFAULT_BATCH, type Batch } from "$lib/batch";
	import kotakkecil from "$lib/assets/images/desktop 13/kotakkecil.svg";

	let { batch = DEFAULT_BATCH }: { batch?: Batch } = $props();
	const productionChainSteps = $derived(batch.steps);

	let activeStepIndex = $state(0);
	let sectionElement = $state<HTMLElement | null>(null);

	let activeStep = $derived(
		productionChainSteps[activeStepIndex] || productionChainSteps[0],
	);

	$effect(() => {
		if (typeof window === "undefined") return;

		function handleScroll() {
			if (!sectionElement) return;
			const rect = sectionElement.getBoundingClientRect();
			const windowHeight = window.innerHeight;

			const startPoint = windowHeight * 0.75;
			const endPoint = windowHeight * 0.15;

			if (rect.top <= startPoint && rect.top >= endPoint) {
				const progress =
					(startPoint - rect.top) / (startPoint - endPoint);
				const clampedProgress = Math.min(Math.max(progress, 0), 0.999);
				const newIndex = Math.floor(
					clampedProgress * productionChainSteps.length,
				);

				if (newIndex !== activeStepIndex) {
					activeStepIndex = newIndex;
				}
			} else if (rect.top > startPoint) {
				activeStepIndex = 0;
			} else if (rect.top < endPoint) {
				activeStepIndex = productionChainSteps.length - 1;
			}
		}

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	});

	function selectStep(index: number) {
		activeStepIndex = index;
	}
</script>

<section
	bind:this={sectionElement}
	class="production-chain"
	aria-labelledby="chain-title"
>
	<div class="chain-inner">
		<div class="chain-header">
			<h2 id="chain-title">Coffee<br />Production<br />Chain</h2>
		</div>

		<div class="chain-content">
			<img
				class="kotak-kecil"
				src={kotakkecil}
				alt=""
				aria-hidden="true"
			/>
			<div class="step-details">
				{#key activeStepIndex}
					<h3 class="step-title">{activeStep.name}</h3>
				{/key}

				<div class="step-body">
					<nav class="step-list" aria-label="Production steps">
						<ul>
							{#each productionChainSteps as step, index}
								<li>
									<button
										type="button"
										class:active={index === activeStepIndex}
										onclick={() => selectStep(index)}
									>
										<span>{step.name}</span>
									</button>
								</li>
							{/each}
						</ul>
					</nav>

					<div class="step-description">
						{#key activeStepIndex}
							<p>{activeStep.description}</p>
						{/key}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.production-chain {
		background: #f0f3f1;
		padding: clamp(32px, 5vw, 64px) clamp(24px, 6vw, 96px);
		color: #23320e;
	}

	.chain-inner {
		position: relative;
		max-width: 1200px;
		margin: 0 auto;
		border: 1.5px solid #a3b880;
		background: #f0f3f1;
	}

	.chain-header {
		padding: clamp(24px, 4vw, 48px) clamp(28px, 4.5vw, 56px);
		border-bottom: 1.5px solid #a3b880;
	}

	h2 {
		margin: 0;
		font-size: clamp(3rem, 6.5vw, 7rem);
		font-weight: 800;
		line-height: 0.84;
		letter-spacing: -0.05em;
		color: #849962;
	}

	.chain-content {
		position: relative;
		padding: clamp(32px, 5vw, 64px) clamp(28px, 4.5vw, 56px);
	}

	.kotak-kecil {
		position: absolute;
		left: -10px;
		top: clamp(42px, 6vw, 84px);
		width: 20px;
		height: 20px;
		pointer-events: none;
		z-index: 2;
	}

	.step-title {
		margin: 0 0 clamp(24px, 3.5vw, 40px);
		font-size: clamp(3.2rem, 6vw, 6.5rem);
		font-weight: 800;
		line-height: 0.9;
		letter-spacing: -0.04em;
		color: #1e2e0a;
		animation: fadeIn 0.2s ease-out forwards;
	}

	.step-body {
		display: grid;
		grid-template-columns: minmax(160px, 0.4fr) minmax(0, 1fr);
		gap: clamp(24px, 4vw, 72px);
		align-items: start;
	}

	.step-list ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.step-list button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: inherit;
		font-size: clamp(0.85rem, 1vw, 1.15rem);
		font-weight: 600;
		letter-spacing: 0.06em;
		color: #728753;
		text-transform: uppercase;
		display: flex;
		align-items: center;
		gap: 8px;
		transition:
			color 0.15s ease,
			font-weight 0.15s ease;
	}

	.step-list button:hover {
		color: #1e2e0a;
	}

	.step-list button.active {
		color: #1e2e0a;
		font-weight: 800;
	}

	.step-description p {
		margin: 0;
		font-size: clamp(0.78rem, 0.92vw, 1.05rem);
		font-weight: 500;
		line-height: 1.48;
		color: #33441a;
		max-width: 580px;
		animation: fadeIn 0.2s ease-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0.4;
			transform: translateY(3px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 760px) {
		.step-body {
			grid-template-columns: 1fr;
			gap: 24px;
		}

		.step-list ul {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 16px;
		}
	}
</style>
