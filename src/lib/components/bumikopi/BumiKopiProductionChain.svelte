<script lang="ts">
	import { onMount } from 'svelte';
	import { DEFAULT_BATCH, type Batch } from '$lib/batch';
	import { scrollToY } from '$lib/smooth-scroll';

	let { batch = DEFAULT_BATCH, images = {} }: { batch?: Batch; images?: Record<string, string> } = $props();

	const steps = $derived(batch.steps);
	const n = $derived(Math.max(1, steps.length));
	const pad = (i: number) => String(i + 1).padStart(2, '0');

	let section = $state<HTMLElement>();
	let active = $state(0);
	let progress = $state(0);

	// Bagian ini "menempel" di layar; tinggi section = beberapa layar, dan posisi scroll di dalamnya menentukan fase aktif.
	function update() {
		if (!section) return;
		const rect = section.getBoundingClientRect();
		const total = section.offsetHeight - window.innerHeight;
		const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
		progress = p;
		active = Math.min(n - 1, Math.floor(p * n));
	}

	onMount(() => {
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});

	// Klik fase di daftar kiri: gulir ke tengah rentang fase itu
	function goTo(i: number) {
		if (!section) return;
		const top = section.getBoundingClientRect().top + window.scrollY;
		const total = section.offsetHeight - window.innerHeight;
		scrollToY(top + ((i + 0.5) / n) * total);
	}

	// Posisi relatif kartu: -1 sudah lewat, 0 aktif, 1 berikutnya
	const rel = (i: number) => Math.sign(i - active);
</script>

<section
	class="chain"
	bind:this={section}
	aria-labelledby="chain-title"
	style="height: {(n + 1) * 100}vh; --p: {progress}; --n: {n}; --a: {active}"
>
	<div class="pin">
		<div class="lines" aria-hidden="true">
			<i class="v v1"></i><i class="v v2"></i><i class="v v3"></i><i class="h"></i>
		</div>

		<h2 id="chain-title" class="title">
			<span>Coffee</span><span>Production</span><span>Chain.</span>
		</h2>

		<ol class="dots" aria-hidden="true">
			{#each steps as _, i}<li class:on={i === active} class:past={i < active}></li>{/each}
		</ol>

		<div class="body">
			<!-- Kolom 1: daftar fase -->
			<nav class="phases" aria-label="Production phases">
				<i class="marker" style="--idx:{active}"></i>
				<ul>
					{#each steps as s, i}
						<li>
							<button type="button" class:on={i === active} onclick={() => goTo(i)} aria-current={i === active ? 'step' : undefined}>
								<span class="no">PHASE {pad(i)}</span>
								<span class="nm">{s.name}</span>
							</button>
						</li>
					{/each}
				</ul>
			</nav>

			<!-- Kolom 2: visual besar yang berganti -->
			<div class="stage" aria-live="polite">
				{#each steps as s, i}
					<div class="visual" data-rel={rel(i)}>
						{#if images[`step_${i}`]}
							<img src={images[`step_${i}`]} alt={s.name} />
						{:else}
							<div class="art" aria-hidden="true">
								<span class="ring r1"></span><span class="ring r2"></span><span class="ring r3"></span>
								<b>{pad(i)}</b>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Kolom 3: judul, keterangan, dan thumbnail -->
			<div class="copy">
				{#each steps as s, i}
					<article class="info" data-rel={rel(i)} aria-hidden={i !== active}>
						<h3>{s.name}</h3>
						<p>{s.description}</p>
						<div class="thumb" aria-hidden="true">
							<span class="c tl"></span><span class="c tr"></span><span class="c bl"></span><span class="c br"></span>
							{#if images[`step_${i}`]}
								<img src={images[`step_${i}`]} alt="" />
							{:else}
								<b>{pad(i)}</b>
							{/if}
						</div>
					</article>
				{/each}
				<p class="hint" aria-hidden="true">{active < n - 1 ? '(scroll down)' : '(continue)'}</p>
			</div>
		</div>
	</div>
</section>

<style>
	.chain {
		--ease: cubic-bezier(0.16, 1, 0.3, 1);
		position: relative;
		background: #f0f3f1;
		color: #849962;
	}

	.pin {
		position: sticky;
		top: 0;
		height: 100svh;
		min-height: 560px;
		overflow: hidden;
		padding: 112px clamp(20px, 2vw, 32px) clamp(20px, 3vw, 36px);
		display: grid;
		grid-template-rows: auto 1fr;
	}

	/* Garis kisi tipis seperti desain acuan */
	.lines i {
		position: absolute;
		background: rgba(132, 153, 98, 0.35);
		pointer-events: none;
	}

	.lines .v {
		top: 0;
		bottom: 0;
		width: 1px;
	}

	.lines .v1 {
		left: clamp(20px, 2vw, 32px);
	}

	.lines .v2 {
		left: calc(clamp(20px, 2vw, 32px) + (100% - 2 * clamp(20px, 2vw, 32px)) * 2 / 3);
	}

	.lines .v3 {
		right: clamp(20px, 2vw, 32px);
	}

	.lines .h {
		left: 0;
		right: 0;
		top: calc(112px + clamp(3.2rem, 7.4vw, 7rem));
		height: 1px;
	}

	.title {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		margin: 0;
		font-size: clamp(2rem, 5vw, 5.4rem);
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.045em;
		color: #849962;
	}

	.title span {
		white-space: nowrap;
	}

	.dots {
		position: absolute;
		top: 124px;
		right: clamp(28px, 3.4vw, 52px);
		z-index: 2;
		display: grid;
		gap: 7px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.dots li {
		width: 13px;
		height: 13px;
		border: 1px solid rgba(132, 153, 98, 0.55);
		transition:
			background-color 0.5s var(--ease),
			border-color 0.5s var(--ease),
			transform 0.5s var(--ease);
	}

	.dots li.past {
		background: rgba(132, 153, 98, 0.55);
	}

	.dots li.on {
		border-color: #55683d;
		background: #849962;
		transform: scale(1.25);
	}

	.body {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		padding-top: clamp(16px, 2vw, 28px);
		min-height: 0;
	}

	/* ───── Kolom 1: fase ───── */
	.phases {
		position: relative;
		align-self: center;
		padding-left: clamp(14px, 2vw, 28px);
	}

	.phases ul {
		display: grid;
		gap: 14px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.marker {
		position: absolute;
		left: calc(-1 * clamp(0px, 0.3vw, 6px));
		top: 18px;
		width: 14px;
		height: 14px;
		background: #8bbd2c;
		transform: translateY(calc(var(--idx) * 64px));
		transition: transform 0.8s var(--ease);
	}

	.phases button {
		display: grid;
		gap: 2px;
		width: 100%;
		height: 50px;
		padding: 0 0 0 0;
		border: 0;
		background: none;
		color: rgba(132, 153, 98, 0.42);
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			color 0.6s var(--ease),
			transform 0.7s var(--ease);
	}

	.phases button .no {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.22em;
	}

	.phases button .nm {
		font-size: clamp(0.95rem, 1.4vw, 1.25rem);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.phases button.on {
		color: #25330f;
		transform: translateX(20px);
	}

	.phases button:hover:not(.on) {
		color: rgba(85, 104, 61, 0.8);
	}

	/* ───── Kolom 2: visual ───── */
	.stage {
		position: relative;
		min-height: 0;
	}

	.visual {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		opacity: 0;
		transform: translateY(70px) scale(0.92);
		transition:
			opacity 0.9s var(--ease),
			transform 1.1s var(--ease);
		pointer-events: none;
	}

	.visual[data-rel='0'] {
		opacity: 1;
		transform: translateY(0) scale(1) rotate(calc((var(--p) * var(--n) - var(--a) - 0.5) * 8deg));
	}

	.visual[data-rel='-1'] {
		transform: translateY(-70px) scale(0.92);
	}

	.visual img {
		display: block;
		max-width: min(86%, 520px);
		max-height: 100%;
		border-radius: 24px;
		object-fit: contain;
		filter: drop-shadow(0 30px 40px rgba(37, 51, 15, 0.22));
	}

	/* Pengganti gambar: lingkaran bertingkat + nomor besar */
	.art {
		position: relative;
		display: grid;
		place-items: center;
		width: min(60%, 420px);
		aspect-ratio: 1;
	}

	.art .ring {
		position: absolute;
		inset: 0;
		border: 1.5px solid rgba(132, 153, 98, 0.4);
		border-radius: 50%;
	}

	.art .r2 {
		inset: 12%;
		border-style: dashed;
		animation: spin 40s linear infinite;
	}

	.art .r3 {
		inset: 26%;
		background: radial-gradient(circle at 35% 30%, #e8f0dc, #c9dba8);
		border-color: transparent;
	}

	.art b {
		position: relative;
		color: #55683d;
		font-size: clamp(3.5rem, 9vw, 8rem);
		font-weight: 300;
		letter-spacing: -0.05em;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ───── Kolom 3: teks ───── */
	.copy {
		position: relative;
		min-height: 0;
	}

	.info {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 52px;
		display: grid;
		gap: 16px;
		max-height: 100%;
		pointer-events: none;
	}

	.info > * {
		opacity: 0;
		transform: translateY(26px);
		transition:
			opacity 0.7s var(--ease),
			transform 0.9s var(--ease);
	}

	.info[data-rel='-1'] > * {
		transform: translateY(-26px);
	}

	.info[data-rel='0'] {
		pointer-events: auto;
	}

	.info[data-rel='0'] > * {
		opacity: 1;
		transform: none;
	}

	.info[data-rel='0'] > :nth-child(1) {
		transition-delay: 0.12s;
	}
	.info[data-rel='0'] > :nth-child(2) {
		transition-delay: 0.22s;
	}
	.info[data-rel='0'] > :nth-child(3) {
		transition-delay: 0.34s;
	}

	.info h3 {
		margin: 0;
		color: #55683d;
		font-size: clamp(1.4rem, 2.4vw, 2.2rem);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.info p {
		margin: 0;
		max-width: 52ch;
		overflow: auto;
		color: #3c4b2b;
		font-size: clamp(0.82rem, 0.98vw, 0.98rem);
		line-height: 1.65;
		scrollbar-width: thin;
	}

	.thumb {
		position: relative;
		display: grid;
		place-items: center;
		width: clamp(120px, 14vw, 200px);
		aspect-ratio: 1;
	}

	.thumb img {
		max-width: 70%;
		max-height: 70%;
		object-fit: contain;
		filter: grayscale(1) contrast(1.15);
	}

	.thumb b {
		color: rgba(85, 104, 61, 0.5);
		font-size: 2.6rem;
		font-weight: 300;
	}

	.thumb .c {
		position: absolute;
		width: 12px;
		height: 12px;
		border: 0 solid #25330f;
	}

	.thumb .tl {
		top: 0;
		left: 0;
		border-width: 1px 0 0 1px;
	}
	.thumb .tr {
		top: 0;
		right: 0;
		border-width: 1px 1px 0 0;
	}
	.thumb .bl {
		bottom: 0;
		left: 0;
		border-width: 0 0 1px 1px;
	}
	.thumb .br {
		right: 0;
		bottom: 0;
		border-width: 0 1px 1px 0;
	}

	.hint {
		position: absolute;
		left: 0;
		bottom: 0;
		margin: 0;
		color: rgba(85, 104, 61, 0.7);
		font-size: 0.82rem;
		letter-spacing: 0.04em;
	}

	/* ───── Mobile ───── */
	@media (max-width: 900px) {
		.pin {
			padding-top: 100px;
		}

		.lines .v2 {
			display: none;
		}

		.lines .h {
			top: calc(100px + clamp(2.2rem, 9vw, 3.4rem));
		}

		.title {
			grid-template-columns: repeat(3, auto);
			justify-content: space-between;
			font-size: clamp(1.6rem, 8vw, 3rem);
		}

		.dots {
			top: auto;
			bottom: 18px;
			right: 20px;
			display: flex;
		}

		.body {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr auto;
			gap: 8px;
		}

		.phases {
			padding-left: 0;
		}

		.phases ul {
			display: flex;
			gap: 14px;
			overflow-x: auto;
		}

		.marker {
			display: none;
		}

		.phases button {
			width: auto;
			height: auto;
			padding: 6px 2px;
		}

		.phases button .no {
			display: none;
		}

		.phases button.on {
			transform: none;
			border-bottom: 2px solid #8bbd2c;
		}

		.copy {
			min-height: 210px;
		}

		.info {
			bottom: 0;
		}

		.thumb,
		.hint {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.visual,
		.info > *,
		.marker,
		.phases button {
			transition-duration: 0.01s;
		}

		.art .r2 {
			animation: none;
		}
	}
</style>
