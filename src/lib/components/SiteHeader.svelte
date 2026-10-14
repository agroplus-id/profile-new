<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { pauseSmoothScroll, resumeSmoothScroll } from '$lib/smooth-scroll';
	import logo from '$lib/assets/images/group-1233620.svg';

	type Item = { label: string; href: string; desc?: string };
	type Menu = { id: string; label: string; items: Item[]; mega?: boolean };

	const menus: Menu[] = [
		{
			id: 'projects',
			label: 'Projects',
			mega: true,
			items: [
				{ label: 'AgroCapture', href: '/agro-capture', desc: 'Seeing every coffee field differently' },
				{ label: 'Ferroir', href: '/ferroir', desc: 'Connected fermentation, thoughtfully designed' },
				{ label: 'Fermego', href: '/fermego', desc: 'Modern monitoring for familiar fermentation' }
			]
		},
		{
			id: 'about',
			label: 'About us',
			mega: true,
			items: [
				{ label: 'Team', href: '/team', desc: 'The people behind AgroPlus.ID' },
				{ label: 'Roadmap', href: '/#about', desc: 'Where we are heading' }
			]
		},
		{
			id: 'tools',
			label: 'Tools',
			items: [
				{ label: 'Supply Verification', href: '/supply-verification' },
				{ label: 'Coffee Supply Maps', href: '/#tools' },
				{ label: 'Species Checker', href: '/#tools' },
				{ label: 'Coffee Identity Research', href: '/#tools' }
			]
		}
	];

	let open = $state<string | null>(null);
	let mobileOpen = $state(false);
	let scrolled = $state(false);
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	const leftMenus = menus.filter((m) => m.id !== 'tools');
	const rightMenus = menus.filter((m) => m.id === 'tools');

	onMount(() => {
		const onScroll = () => (scrolled = window.scrollY > 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		document.body.style.overflow = mobileOpen ? 'hidden' : '';
		if (mobileOpen) pauseSmoothScroll();
		return () => {
			document.body.style.overflow = '';
			resumeSmoothScroll();
		};
	});

	$effect(() => {
		page.url.pathname;
		close();
	});

	function close() {
		open = null;
		mobileOpen = false;
	}

	function hoverOpen(id: string) {
		clearTimeout(closeTimer);
		open = id;
	}

	function hoverClose() {
		clearTimeout(closeTimer);
		closeTimer = setTimeout(() => (open = null), 120);
	}

	function toggle(id: string) {
		open = open === id ? null : id;
	}
</script>

<svelte:window
	onclick={(e) => {
		if (!(e.target as Element).closest('.vnav')) open = null;
	}}
	onkeydown={(e) => e.key === 'Escape' && close()}
/>

{#snippet menuItem(m: Menu, i: number, align: 'left' | 'right')}
	<li
		class="vnav-li"
		class:static={m.mega}
		style="--i:{i}"
		onmouseenter={() => hoverOpen(m.id)}
		onmouseleave={hoverClose}
	>
		<button
			class="vnav-btn"
			class:is-open={open === m.id}
			aria-expanded={open === m.id}
			aria-haspopup="true"
			onclick={() => toggle(m.id)}
			onfocus={() => hoverOpen(m.id)}
		>
			<span class="wipe"></span><span class="txt">{m.label}</span>
		</button>
		{#if m.mega}
			<div class="vnav-dd mega" class:is-open={open === m.id}>
				<div class="mega-inner">
					{#each m.items as it, n}
						<a class="mega-card" href={it.href} style="--n:{n}">
							<span class="mega-wipe" aria-hidden="true"></span>
							<strong>{it.label}</strong>
							{#if it.desc}<p>{it.desc}</p>{/if}
							<span class="mega-chev" aria-hidden="true">
								<span class="chev-fill"></span>
								<span class="chev-list">
									<svg viewBox="0 0 6 13" fill="none"><path d="M.5 11.7l4-3.9a1.9 1.9 0 000-2.8L.5 1" stroke="currentColor"/></svg>
									<svg viewBox="0 0 6 13" fill="none"><path d="M.5 11.7l4-3.9a1.9 1.9 0 000-2.8L.5 1" stroke="currentColor"/></svg>
								</span>
							</span>
						</a>
					{/each}
					{#each Array(Math.max(0, 4 - m.items.length)) as _}
						<div class="mega-card is-empty" aria-hidden="true"></div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="vnav-dd" class:is-open={open === m.id} class:align-right={align === 'right'}>
				<div class="vnav-dd-inner">
					{#each m.items as it, n}
						<a class="vnav-dd-link" href={it.href} style="--n:{n}">
							<span class="dd-txt">{it.label}</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</li>
{/snippet}

<header class="vnav" class:scrolled class:menu-open={mobileOpen}>
	<div class="vnav-w">
		<div class="vnav-bar">
			<a class="vnav-logo" href="/" aria-label="AgroPlus.ID home">
				<img src={logo} alt="AgroPlus.ID" />
			</a>

			<nav class="vnav-menu" aria-label="Main navigation">
				<ul class="vnav-list">
					<li class="vnav-li" style="--i:0">
						<a class="vnav-btn" href="/" data-active={page.url.pathname === '/'}>
							<span class="wipe"></span><span class="txt">Home</span>
						</a>
					</li>
					{#each leftMenus as m, i}
						{@render menuItem(m, i + 1, 'left')}
					{/each}
				</ul>
			</nav>

			<div class="vnav-right">
				<ul class="vnav-list vnav-list-right">
					{#each rightMenus as m}
						{@render menuItem(m, 3, 'right')}
					{/each}
				</ul>
				<a class="vnav-cta" href="/#contact">
					<span class="wipe"></span><span class="txt">Contact Us</span>
				</a>
				<button
					type="button"
					class="vnav-burger"
					class:is-active={mobileOpen}
					onclick={() => (mobileOpen = !mobileOpen)}
					aria-label="Toggle navigation menu"
					aria-expanded={mobileOpen}
				>
					<span></span><span></span>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile full-screen menu -->
	<div class="vnav-mobile" class:is-open={mobileOpen} aria-hidden={!mobileOpen}>
		<div class="vnav-mobile-inner">
			<a class="m-link" href="/" style="--i:0">Home</a>
			{#each menus as m, i}
				<div class="m-group" style="--i:{i + 1}">
					<button class="m-link m-toggle" onclick={() => toggle(m.id)} aria-expanded={open === m.id}>
						{m.label}<span class="m-plus" class:is-open={open === m.id}></span>
					</button>
					<div class="m-sub" class:is-open={open === m.id}>
						<div>
							{#each m.items as it}
								<a href={it.href}>{it.label}{#if it.desc}<small>{it.desc}</small>{/if}</a>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
		<a class="m-cta" href="/#contact">Contact Us</a>
	</div>
</header>

<div class="vnav-spacer" aria-hidden="true"></div>

<style>
	/* Easing & durasi mengikuti referensi: 0.65s / 0.5s cubic-bezier(0.62, 0.05, 0.01, 0.99) */
	.vnav {
		--ease: cubic-bezier(0.62, 0.05, 0.01, 0.99);
		--t: 0.65s var(--ease);
		--t-fast: 0.5s var(--ease);
		--ink: #25330f;
		--wipe: #cddcae;
		--bar-h: 80px;
		position: fixed;
		inset: 0 0 auto;
		z-index: 3001;
		color: var(--ink);
	}

	.vnav-spacer {
		height: 88px;
	}

	/* Di atas: bar rata penuh selebar layar. Setelah scroll: bar putih melayang dengan jarak. */
	.vnav-w {
		padding: 0;
		transition: padding var(--t);
	}

	.vnav.scrolled .vnav-w {
		padding: 20px clamp(20px, 4.5vw, 56px) 0;
	}

	.vnav-bar {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88px;
		padding: 12px clamp(24px, 7.8vw, 100px);
		background: #f0f3f1;
		box-shadow: 0 16px 24px 0 rgba(42, 44, 47, 0);
		transition:
			height var(--t),
			padding var(--t),
			border-radius var(--t),
			background-color var(--t-fast),
			box-shadow var(--t),
			color var(--t-fast);
	}

	/* Bar melayang setelah scroll: gradasi tipis abu muda, sudut membulat */
	.vnav-bar {
		isolation: isolate;
		border-radius: 0;
	}

	.vnav-bar::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		border-radius: inherit;
		background: linear-gradient(180deg, #eef0ee 0%, #d4d7d4 55%, #bcbfbc 100%);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.85),
			inset 0 -1px 0 rgba(255, 255, 255, 0.35);
		opacity: 0;
		transition: opacity var(--t);
	}

	.vnav.scrolled .vnav-bar {
		height: var(--bar-h);
		padding: 12px 32px;
		border-radius: 18px;
		background: transparent;
		color: #6f8650;
		box-shadow: 0 14px 28px 0 rgba(42, 44, 47, 0.14);
	}

	.vnav.scrolled .vnav-bar::before {
		opacity: 1;
	}


	/* Logo */
	.vnav-logo {
		display: flex;
		align-items: center;
		flex: 0 0 auto;
		width: 150px;
		margin: -10px;
		padding: 10px;
		transition: transform var(--t);
	}

	.vnav-logo img {
		display: block;
		width: 100%;
		height: auto;
		transition: filter var(--t-fast);
	}


	/* Link list */
	.vnav-menu {
		flex: 1;
		margin-left: 64px;
	}

	.vnav-list {
		display: flex;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.vnav-li {
		position: relative;
		flex: 0 0 auto;
	}

	.vnav-btn,
	.vnav-cta {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 0.95rem;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
		transition: color var(--t-fast);
	}

	.vnav-btn {
		padding: 16px 28px;
	}

	.txt {
		position: relative;
	}

	/* Wipe: kotak yang naik dari bawah saat hover */
	.wipe {
		position: absolute;
		inset: 0;
		background: var(--wipe);
		transform: scaleY(0) rotate(0.001deg);
		transform-origin: left top;
		transition:
			background-color var(--t),
			transform var(--t);
	}

	.vnav-btn:hover .wipe,
	.vnav-btn.is-open .wipe,
	.vnav-cta:hover .wipe {
		transform: scaleY(1) rotate(0.001deg);
		transform-origin: left bottom;
	}

	.vnav-btn:hover,
	.vnav-btn.is-open,
	.vnav-btn[data-active='true']:hover {
		color: var(--ink);
	}

	/* CTA */
	.vnav-right {
		display: flex;
		align-items: center;
		gap: 16px;
		transition: transform var(--t);
	}

	.vnav-cta {
		min-height: 48px;
		padding: 0 28px;
		border-radius: 8px;
		background: var(--ink);
		color: #fff;
		font-weight: 600;
		transition:
			background-color var(--t-fast),
			color var(--t-fast);
	}

	.vnav-cta .wipe {
		background: #fff;
	}

	.vnav-cta:hover {
		color: var(--ink);
	}

	/* Dropdown */
	.vnav-dd {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		min-width: 0;
		padding-top: 14px;
		pointer-events: none;
		visibility: hidden;
		clip-path: inset(0 0 100% 0);
		opacity: 0;
		transform: translateY(-10px);
		transition:
			clip-path var(--t),
			opacity var(--t-fast),
			transform var(--t),
			visibility 0s linear 0.65s;
	}

	.vnav-dd.align-right {
		left: auto;
		right: 0;
	}

	.vnav-dd.is-open {
		pointer-events: auto;
		visibility: visible;
		clip-path: inset(0 -40px -60px -40px);
		opacity: 1;
		transform: translateY(0);
		transition-delay: 0s;
	}

	/* Dropdown kecil (Tools): panel kaca buram, tautan teks polos */
	.vnav-dd-inner {
		display: flex;
		flex-direction: column;
		min-width: 270px;
		padding: 12px 6px;
		border: 1px solid rgba(255, 255, 255, 0.55);
		border-radius: 18px;
		background: rgba(240, 243, 241, 0.82);
		-webkit-backdrop-filter: blur(22px) saturate(1.4);
		backdrop-filter: blur(22px) saturate(1.4);
		color: var(--ink);
		box-shadow:
			0 24px 48px rgba(10, 14, 6, 0.22),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}

	.vnav-dd-link {
		position: relative;
		display: block;
		padding: 13px 24px;
		opacity: 0;
		translate: 0 8px;
		transition:
			opacity var(--t-fast),
			translate var(--t),
			color 0.3s var(--ease);
	}

	.vnav-dd.is-open .vnav-dd-link {
		opacity: 1;
		translate: 0 0;
		transition-delay: calc(0.1s + var(--n, 0) * 0.06s), calc(0.1s + var(--n, 0) * 0.06s), 0s;
	}

	.dd-txt {
		position: relative;
		display: inline-block;
		font-size: 1rem;
		font-weight: 400;
		white-space: nowrap;
	}

	/* Garis bawah tumbuh dari kiri saat hover */
	.dd-txt::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -3px;
		height: 1px;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: left center;
		transition: transform var(--t-fast);
	}

	.vnav-dd-link:hover {
		color: #6f8650;
	}

	.vnav-dd-link:hover .dd-txt::after {
		transform: scaleX(1);
	}

	/* Mega panel (Projects & About us): selebar bar, 4 kolom dengan garis pemisah */
	.vnav-li.static {
		position: static;
	}

	.vnav-dd.mega {
		left: clamp(20px, 4.5vw, 56px);
		right: clamp(20px, 4.5vw, 56px);
		min-width: 0;
		padding-top: 12px;
	}

	/* Bar sudah melayang dengan jarak sendiri, panel sejajar dengan tepinya */
	.vnav.scrolled .vnav-dd.mega {
		left: 0;
		right: 0;
	}

	.vnav-dd.mega.is-open {
		clip-path: inset(0 -40px -60px -40px);
	}

	.mega-inner {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1px;
		overflow: hidden;
		border-radius: 24px;
		background: #dde3d8;
		color: var(--ink);
		box-shadow: 0 24px 48px rgba(10, 14, 6, 0.22);
	}

	.mega-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		min-height: 200px;
		padding: 32px 32px 28px;
		overflow: hidden;
		background: #f0f3f1;
		opacity: 0;
		translate: 0 14px;
		transition:
			opacity var(--t-fast),
			translate var(--t);
	}

	.vnav-dd.mega.is-open .mega-card {
		opacity: 1;
		translate: 0 0;
		transition-delay: calc(0.12s + var(--n, 0) * 0.07s);
	}

	.mega-card strong {
		position: relative;
		z-index: 1;
		font-size: 1.35rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.mega-card p {
		position: relative;
		z-index: 1;
		max-width: 22ch;
		margin: 14px 0 0;
		font-size: 0.85rem;
		font-weight: 500;
		line-height: 1.3;
	}

	/* Wipe latar kartu: naik dari bawah saat hover, turun-keluar ke atas saat lepas */
	.mega-wipe {
		position: absolute;
		inset: 0;
		background: #dfe8d0;
		transform: scaleY(0) rotate(0.001deg);
		transform-origin: left top;
		transition: transform var(--t-fast);
	}

	.mega-card:not(.is-empty):hover .mega-wipe {
		transform: scaleY(1) rotate(0.001deg);
		transform-origin: left bottom;
	}

	/* Tombol chevron: kotak outline, terisi gelap saat hover, panah bergulir */
	.mega-chev {
		position: relative;
		display: block;
		width: 45px;
		height: 45px;
		margin-top: auto;
		overflow: hidden;
		border: 1px solid #849962;
		transition:
			color 0.3s var(--ease),
			border-color 0.3s var(--ease);
	}

	.chev-fill {
		position: absolute;
		inset: 0;
		background: var(--ink);
		transform: scaleY(0) rotate(0.001deg);
		transform-origin: left top;
		transition: transform 0.3s var(--ease);
	}

	.chev-list {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		width: 90px;
		height: 100%;
		transition: transform var(--t);
	}

	.chev-list svg {
		flex: 0 0 45px;
		width: 45px;
		height: 100%;
		padding: 16px 18px;
	}

	.mega-card:not(.is-empty):hover .chev-fill {
		transform: scaleY(1) rotate(0.001deg);
		transform-origin: left bottom;
	}

	.mega-card:not(.is-empty):hover .mega-chev {
		color: #fff;
		border-color: var(--ink);
	}

	.chev-list path {
		stroke: var(--ink);
		stroke-width: 1.2;
		transition: stroke 0.3s var(--ease);
	}

	.mega-card:not(.is-empty):hover .chev-list path {
		stroke: #fff;
	}

	.mega-card:not(.is-empty):hover .chev-list {
		transform: translateX(-45px);
	}

	.mega-card.is-empty {
		pointer-events: none;
	}

	@media (max-width: 1100px) {
		.mega-card {
			padding: 24px 22px;
			min-height: 170px;
		}
	}

	@media (max-width: 960px) {
		.vnav-dd.mega {
			display: none;
		}
	}

	/* Animasi masuk saat halaman dimuat */
	.vnav-bar {
		animation: bar-in 0.9s var(--ease) var(--intro-delay, 0s) backwards;
	}

	.vnav-li {
		animation: item-in 0.8s var(--ease) backwards;
		animation-delay: calc(0.25s + var(--i) * 0.07s + var(--intro-delay, 0s));
	}

	.vnav-right {
		animation: item-in 0.8s var(--ease) calc(0.5s + var(--intro-delay, 0s)) backwards;
	}

	@keyframes bar-in {
		from {
			opacity: 0;
			translate: 0 -24px;
		}
	}

	@keyframes item-in {
		from {
			opacity: 0;
			translate: 0 -12px;
		}
	}

	/* Burger */
	.vnav-burger {
		display: none;
		position: relative;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.vnav-burger span {
		position: absolute;
		left: 11px;
		right: 11px;
		height: 1.5px;
		background: currentColor;
		transition:
			transform var(--t),
			top var(--t);
	}

	.vnav-burger span:nth-child(1) {
		top: 18px;
	}

	.vnav-burger span:nth-child(2) {
		top: 25px;
	}

	.vnav-burger.is-active span:nth-child(1) {
		top: 21.5px;
		transform: rotate(45deg);
	}

	.vnav-burger.is-active span:nth-child(2) {
		top: 21.5px;
		transform: rotate(-45deg);
	}

	/* Mobile menu */
	.vnav-mobile {
		display: none;
	}

	@media (max-width: 960px) {
		.vnav-w,
		.vnav.scrolled .vnav-w {
			padding: 0;
		}

		.vnav-bar,
		.vnav.scrolled .vnav-bar {
			position: relative;
			z-index: 2;
			height: var(--bar-h);
			padding: 14px 18px;
			border-radius: 0;
		}

		.vnav.scrolled .vnav-bar::before {
			border-radius: 0;
		}

		.vnav-menu,
		.vnav-list-right,
		.vnav-cta {
			display: none;
		}

		.vnav-burger {
			display: block;
		}

		.vnav-mobile {
			position: fixed;
			inset: 0;
			z-index: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			padding: calc(var(--bar-h) + 24px) 24px 28px;
			background: #fff;
			color: var(--ink);
			overflow-y: auto;
			visibility: hidden;
			clip-path: inset(0 0 100% 0);
			transition:
				clip-path var(--t),
				visibility 0s linear 0.65s;
		}

		.vnav-mobile.is-open {
			visibility: visible;
			clip-path: inset(0 0 0 0);
			transition-delay: 0s;
		}

		.vnav-mobile-inner {
			display: flex;
			flex-direction: column;
		}

		.m-link,
		.m-toggle {
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;
			padding: 18px 0;
			border: 0;
			border-bottom: 1px solid rgba(37, 51, 15, 0.12);
			background: none;
			color: inherit;
			font: inherit;
			font-size: 1.6rem;
			font-weight: 500;
			text-align: left;
			cursor: pointer;
		}

		.m-link,
		.m-group {
			opacity: 0;
			translate: 0 18px;
			transition:
				opacity var(--t),
				translate var(--t);
		}

		.vnav-mobile.is-open .m-link,
		.vnav-mobile.is-open .m-group {
			opacity: 1;
			translate: 0 0;
			transition-delay: calc(0.2s + var(--i) * 0.07s);
		}

		.m-group .m-link {
			opacity: 1;
			translate: none;
			transition: none;
		}

		.m-plus {
			position: relative;
			width: 16px;
			height: 16px;
		}

		.m-plus::before,
		.m-plus::after {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			top: 7.25px;
			height: 1.5px;
			background: currentColor;
			transition: transform var(--t);
		}

		.m-plus::after {
			transform: rotate(90deg);
		}

		.m-plus.is-open::after {
			transform: rotate(0deg);
		}

		.m-sub {
			display: grid;
			grid-template-rows: 0fr;
			transition: grid-template-rows var(--t);
		}

		.m-sub.is-open {
			grid-template-rows: 1fr;
		}

		.m-sub > div {
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}

		.m-sub a {
			display: grid;
			gap: 2px;
			padding: 14px 0 14px 8px;
			font-size: 1.1rem;
			font-weight: 500;
		}

		.m-sub small {
			font-size: 0.82rem;
			opacity: 0.6;
		}

		.m-cta {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 56px;
			margin-top: 28px;
			background: var(--ink);
			color: #fff;
			font-weight: 600;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.vnav-bar,
		.vnav-li,
		.vnav-right {
			animation: none;
		}
	}
</style>
