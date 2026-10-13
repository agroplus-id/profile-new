<script lang="ts">
	import { onDestroy } from 'svelte';
	import { DEFAULT_BATCH, type Batch } from '$lib/batch';
	import { pauseSmoothScroll, resumeSmoothScroll } from '$lib/smooth-scroll';

	let { batch = DEFAULT_BATCH, itemNumber = 1 }: { batch?: Batch; itemNumber?: number } = $props();

	// Data disimpan dalam gram, ditampilkan dalam kilogram.
	const kg = (gram: number) => Number((gram / 1000).toFixed(3));

	// Popup pilihan toko online
	let open = $state(false);
	let dialog = $state<HTMLElement>();
	let trigger: HTMLElement | undefined;

	function show(e: MouseEvent) {
		trigger = e.currentTarget as HTMLElement;
		open = true;
	}

	function close() {
		open = false;
		trigger?.focus();
	}

	function onKey(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') close();
		// Fokus tetap berputar di dalam popup
		if (e.key === 'Tab' && dialog) {
			const f = dialog.querySelectorAll<HTMLElement>('a[href], button');
			if (!f.length) return;
			const first = f[0];
			const last = f[f.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	$effect(() => {
		if (!open) return;
		pauseSmoothScroll();
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		queueMicrotask(() => dialog?.querySelector<HTMLElement>('a[href], button')?.focus());
		return () => {
			document.body.style.overflow = prev;
			resumeSmoothScroll();
		};
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') document.body.style.overflow = '';
	});
</script>

<section class="batch-section" aria-labelledby="batch-title">
	<div class="batch-inner">
		<div class="batch-header">
			<h2 id="batch-title">Your Coffee<br />Batch Detail</h2>
			<div class="item-number">Item Number<br /><strong>{itemNumber}/{batch.totalItems}</strong></div>
		</div>

		<div class="batch-rows">
			<div class="batch-row">
				<div class="stat">
					<span class="value">{kg(batch.weightGram)}</span>
					<span class="unit">Kg</span>
				</div>
				<div class="stat-label">WEIGHT/PACKAGES</div>
			</div>

			<div class="divider"></div>

			<div class="batch-row">
				<div class="stat">
					<span class="value">{kg(batch.totalGram)}</span>
					<span class="unit">Kg</span>
				</div>
				<div class="stat-label">TOTAL PRODUCTION ON THIS BATCH</div>
			</div>
		</div>

		{#if batch.stores.length}
			<div class="purchase-area">
				<h3>Purchase more on</h3>
				<button type="button" class="order-btn" onclick={show} aria-haspopup="dialog">
					Order Now <span aria-hidden="true">→</span>
				</button>
			</div>
		{/if}
	</div>
</section>

<svelte:window onkeydown={onKey} />

{#if open}
	<div class="order-overlay" role="presentation" onclick={(e) => e.target === e.currentTarget && close()}>
		<div class="order-dialog" role="dialog" aria-modal="true" aria-labelledby="order-title" bind:this={dialog}>
			<button type="button" class="order-close" onclick={close} aria-label="Close">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
			</button>
			<p class="order-eyebrow">Order online</p>
			<h3 id="order-title">{batch.productName}</h3>
			<p class="order-sub">Choose where you would like to buy.</p>
			<ul>
				{#each batch.stores as st, i}
					<li style="--i:{i}">
						<a href={st.url} target="_blank" rel="noopener noreferrer">
							<span class="mono" aria-hidden="true">{st.name.slice(0, 1)}</span>
							<span class="nm">{st.name}</span>
							<span class="go" aria-hidden="true">↗</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}

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

	.order-btn {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: clamp(12px, 1.4vw, 18px) clamp(32px, 4vw, 64px);
		border: 0;
		border-radius: 999px;
		background: #556b35;
		color: #ffffff;
		font: inherit;
		font-size: clamp(0.95rem, 1.15vw, 1.25rem);
		font-weight: 700;
		cursor: pointer;
		transition:
			background-color 0.4s cubic-bezier(0.62, 0.05, 0.01, 0.99),
			transform 0.4s cubic-bezier(0.62, 0.05, 0.01, 0.99),
			box-shadow 0.4s cubic-bezier(0.62, 0.05, 0.01, 0.99);
	}

	.order-btn span {
		transition: transform 0.4s cubic-bezier(0.62, 0.05, 0.01, 0.99);
	}

	.order-btn:hover {
		background: #3e5025;
		transform: translateY(-2px);
		box-shadow: 0 14px 30px rgba(62, 80, 37, 0.3);
	}

	.order-btn:hover span {
		transform: translateX(5px);
	}

	/* ───── Popup pilihan toko ───── */
	.order-overlay {
		position: fixed;
		inset: 0;
		z-index: 4000;
		display: grid;
		place-items: center;
		padding: 20px;
		background: rgba(20, 28, 12, 0.5);
		-webkit-backdrop-filter: blur(8px);
		backdrop-filter: blur(8px);
		animation: ov-in 0.45s cubic-bezier(0.62, 0.05, 0.01, 0.99) both;
	}

	.order-dialog {
		position: relative;
		width: min(440px, 100%);
		padding: clamp(28px, 4vw, 40px);
		border: 1px solid rgba(255, 255, 255, 0.6);
		border-radius: 28px;
		background: linear-gradient(165deg, #fbfcfa, #eef3e6);
		color: #25330f;
		box-shadow:
			0 40px 90px rgba(20, 28, 12, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
		animation: dlg-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	.order-close {
		position: absolute;
		top: 16px;
		right: 16px;
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: rgba(85, 107, 53, 0.1);
		color: #45552d;
		cursor: pointer;
		transition:
			background-color 0.3s ease,
			transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.order-close:hover {
		background: rgba(85, 107, 53, 0.2);
		transform: rotate(90deg);
	}

	.order-eyebrow {
		margin: 0 0 6px;
		color: #849962;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.22em;
		text-transform: uppercase;
	}

	.order-dialog h3 {
		margin: 0;
		padding-right: 40px;
		font-size: clamp(1.5rem, 2.4vw, 1.9rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.15;
	}

	.order-sub {
		margin: 8px 0 24px;
		color: #6c7a5a;
		font-size: 0.9rem;
	}

	.order-dialog ul {
		display: grid;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.order-dialog li {
		animation: item-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
		animation-delay: calc(0.18s + var(--i) * 0.07s);
	}

	.order-dialog li a {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
		border: 1px solid rgba(37, 51, 15, 0.1);
		border-radius: 18px;
		background: #fff;
		color: inherit;
		text-decoration: none;
		transition:
			transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
			border-color 0.3s ease;
	}

	.order-dialog li a:hover,
	.order-dialog li a:focus-visible {
		transform: translateY(-2px);
		border-color: #849962;
		box-shadow: 0 14px 30px rgba(85, 107, 53, 0.18);
		outline: none;
	}

	.mono {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		width: 42px;
		height: 42px;
		border-radius: 13px;
		background: linear-gradient(145deg, #849962, #55683d);
		color: #fff;
		font-weight: 700;
		text-transform: uppercase;
	}

	.nm {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		font-size: 1rem;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.go {
		color: #849962;
		font-size: 1.1rem;
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.order-dialog li a:hover .go {
		transform: translate(3px, -3px);
	}

	@keyframes ov-in {
		from {
			opacity: 0;
		}
	}

	@keyframes dlg-in {
		from {
			opacity: 0;
			transform: translateY(28px) scale(0.94);
		}
	}

	@keyframes item-in {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.order-overlay,
		.order-dialog,
		.order-dialog li {
			animation: none;
		}
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
