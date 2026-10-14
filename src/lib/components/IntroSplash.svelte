<script lang="ts">
	import { onMount } from 'svelte';
	import logo from '$lib/assets/images/group-1233620.svg';

	const TAGLINE = 'UPSTREAM COFFEE TECHNOLOGY';
	const MIN_MS = 2300; // lama minimum layar pembuka
	const MAX_WAIT_MS = 6000; // jangan menahan pengunjung bila halaman lambat dimuat

	let el = $state<HTMLElement>();
	let percent = $state(0);
	let leaving = $state(false);
	let gone = $state(false);

	const ease = (t: number) => 1 - Math.pow(1 - t, 3);

	onMount(() => {
		const root = document.documentElement;
		// Dilewati (kunjungan ulang, halaman admin, atau reduce-motion): ditentukan skrip kecil di app.html sebelum cat pertama.
		if (root.dataset.intro !== 'play') {
			gone = true;
			return;
		}

		const start = performance.now();
		let raf = 0;
		let loaded = document.readyState === 'complete';
		const onLoad = () => (loaded = true);
		if (!loaded) window.addEventListener('load', onLoad, { once: true });

		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / MIN_MS);
			// Berhenti di 99% bila halaman belum selesai dimuat
			percent = Math.round(ease(t) * (loaded || t < 1 ? 100 : 99));
			if (t >= 1 && (loaded || now - start > MAX_WAIT_MS)) {
				percent = 100;
				exit();
				return;
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		function exit() {
			leaving = true;
			// Animasi halaman (hero, navbar) menunggu --intro-delay; setelah tirai terangkat, kembalikan ke normal.
			setTimeout(() => {
				gone = true;
				root.dataset.intro = 'done';
				root.style.removeProperty('--intro-delay');
				try {
					sessionStorage.setItem('agroplus-intro', '1');
				} catch {
					/* storage tidak tersedia */
				}
			}, 1700);
		}

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('load', onLoad);
		};
	});
</script>

{#if !gone}
	<div class="intro" class:leaving bind:this={el} role="status" aria-label="Loading AgroPlus.ID">
		<div class="stage">
			<img class="mark" src={logo} alt="AgroPlus.ID" />
			<p class="tag" aria-hidden="true">
				{#each TAGLINE.split('') as ch, i}
					<span style="--i:{i}">{ch === ' ' ? ' ' : ch}</span>
				{/each}
			</p>
		</div>

		<div class="count" aria-hidden="true">
			<span>{String(percent).padStart(2, '0')}</span><small>%</small>
		</div>
		<div class="bar" aria-hidden="true"><i style="transform: scaleX({percent / 100})"></i></div>
	</div>
{/if}

<style>
	.intro {
		--ease: cubic-bezier(0.76, 0, 0.24, 1);
		position: fixed;
		inset: 0;
		z-index: 10000;
		display: grid;
		place-items: center;
		overflow: hidden;
		background: radial-gradient(120% 90% at 50% 40%, #162010 0%, #070a05 70%);
		color: #fff;
		transition:
			translate 1.1s var(--ease) 0.45s,
			border-radius 1.1s var(--ease) 0.45s;
		border-radius: 0 0 0 0;
		will-change: translate;
	}

	.intro.leaving {
		translate: 0 -100%;
		border-radius: 0 0 50% 50% / 0 0 14vh 14vh;
	}

	:global(html[data-intro='play']) {
		overflow: hidden;
	}

	/* Sebelum JS berjalan, jangan menutupi halaman pada kunjungan ulang / admin / reduce-motion */
	:global(html[data-intro='skip']) .intro {
		display: none;
	}

	.stage {
		display: grid;
		justify-items: center;
		gap: 28px;
		transition:
			opacity 0.5s ease,
			transform 0.7s var(--ease);
	}

	.leaving .stage {
		opacity: 0;
		transform: translateY(-26px) scale(0.98);
	}

	/* Logo terbuka dari kiri ke kanan, dari buram menjadi tajam */
	.mark {
		display: block;
		width: min(340px, 62vw);
		height: auto;
		filter: brightness(0) invert(1);
		animation: reveal 1.3s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
	}

	@keyframes reveal {
		from {
			clip-path: inset(0 100% 0 0);
			opacity: 0;
			transform: scale(1.06);
			filter: brightness(0) invert(1) blur(6px);
		}
		to {
			clip-path: inset(0 0 0 0);
			opacity: 1;
			transform: scale(1);
			filter: brightness(0) invert(1) blur(0);
		}
	}

	/* Teks berspasi lebar, huruf muncul satu per satu */
	.tag {
		display: flex;
		margin: 0;
		color: rgba(255, 255, 255, 0.78);
		font-size: clamp(0.62rem, 1.2vw, 0.8rem);
		font-weight: 500;
		letter-spacing: 0.5em;
		margin-right: -0.5em;
	}

	.tag span {
		display: inline-block;
		animation: letter 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
		animation-delay: calc(0.9s + var(--i) * 0.035s);
	}

	@keyframes letter {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}

	.count {
		position: absolute;
		left: clamp(20px, 4vw, 56px);
		bottom: clamp(22px, 4vw, 44px);
		display: flex;
		align-items: baseline;
		gap: 4px;
		font-variant-numeric: tabular-nums;
		font-size: clamp(2.2rem, 6vw, 4.2rem);
		font-weight: 300;
		letter-spacing: -0.04em;
		line-height: 1;
		color: rgba(255, 255, 255, 0.9);
		transition: opacity 0.4s ease;
	}

	.count small {
		color: #a9c27f;
		font-size: 0.32em;
		font-weight: 500;
	}

	.leaving .count {
		opacity: 0;
	}

	.bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 3px;
		background: rgba(255, 255, 255, 0.08);
	}

	.bar i {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #849962, #c9dc7b);
		transform-origin: left center;
		will-change: transform;
	}

	@media (prefers-reduced-motion: reduce) {
		.mark,
		.tag span {
			animation: none;
		}

		.intro {
			transition-duration: 0.01s;
		}
	}
</style>
