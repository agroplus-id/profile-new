<script lang="ts">
	import '$lib/admin/admin.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
	import { auth } from '$lib/firebase';
	import Icon from '$lib/admin/Icon.svelte';
	import { toast } from '$lib/admin/toast.svelte';

	let { children } = $props();

	const nav = [
		{ href: '/admin', label: 'Dashboard', icon: 'dashboard' },
		{ href: '/admin/team', label: 'Tim', icon: 'team' },
		{ href: '/admin/updates', label: 'Berita', icon: 'news' },
		{ href: '/admin/media', label: 'Media', icon: 'media' },
		{ href: '/admin/batches', label: 'Batch', icon: 'batch' },
		{ href: '/admin/orders', label: 'Pesanan', icon: 'orders' }
	] as const;

	let user = $state<User | null>(null);
	let ready = $state(false);
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let busy = $state(false);
	let showPassword = $state(false);

	const path = $derived(page.url.pathname.replace(/\/$/, '') || '/admin');
	const current = $derived(nav.find((n) => n.href === path) ?? nav[0]);
	const initials = $derived((user?.email ?? 'A').slice(0, 2).toUpperCase());

	let configMissing = $state(false);

	onMount(() => {
		// Tanpa konfigurasi Firebase di build ini, auth bernilai undefined — tampilkan penjelasan, bukan spinner.
		if (!auth) {
			configMissing = true;
			ready = true;
			return;
		}
		return onAuthStateChanged(auth, (u) => {
			user = u;
			ready = true;
		});
	});

	async function login(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		busy = true;
		try {
			await signInWithEmailAndPassword(auth, email.trim(), password);
			password = '';
		} catch {
			error = 'Email atau password salah.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>{ready && user ? `${current.label} — Admin AgroPlus.ID` : 'Masuk — Admin AgroPlus.ID'}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="adm">
	{#if !ready}
		<div class="boot"><span class="spinner"></span></div>
	{:else if configMissing}
		<div class="boot">
			<div style="max-width: 460px; padding: 24px; text-align: center; line-height: 1.6">
				<h2 style="margin: 0 0 8px">Konfigurasi Firebase belum terisi</h2>
				<p style="margin: 0; opacity: 0.75">
					Build ini tidak memuat variabel <code>VITE_FIREBASE_*</code>. Isi di Vercel → Settings → Environment
					Variables (scope Production), lalu Redeploy.
				</p>
			</div>
		</div>
	{:else if !user}
		<main class="login-wrap">
			<section class="login-art" aria-hidden="true">
				<div class="art-badge">AgroPlus.ID</div>
				<h2>Kelola situs<br />dengan tenang.</h2>
				<p>Tim, berita, pesanan CoffeeID, dan teks situs — semuanya dari satu tempat.</p>
				<span class="orb o1"></span><span class="orb o2"></span>
			</section>
			<form class="login-form" onsubmit={login}>
				<h1>Selamat datang</h1>
				<p class="lead">Masuk dengan akun admin Anda.</p>
				<label class="adm-field">Email
					<input class="adm-input" type="email" bind:value={email} required autocomplete="username" />
				</label>
				<label class="adm-field">Password
					<span class="pw">
						<input
							class="adm-input"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							required
							autocomplete="current-password"
						/>
						<button
							type="button"
							class="eye"
							onclick={() => (showPassword = !showPassword)}
							aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
							aria-pressed={showPassword}
						>
							<Icon name={showPassword ? 'eyeOff' : 'eye'} size={20} />
						</button>
					</span>
				</label>
				{#if error}<p class="err">{error}</p>{/if}
				<button class="adm-btn primary" type="submit" disabled={busy}>{busy ? 'Memeriksa…' : 'Masuk'}</button>
			</form>
		</main>
	{:else}
		<aside class="side">
			<a class="brand" href="/admin">
				<span class="mark">A</span>
				<span><strong>AgroPlus</strong><small>Admin Console</small></span>
			</a>
			<nav aria-label="Menu admin">
				{#each nav as n}
					<a href={n.href} class:active={current.href === n.href}>
						<Icon name={n.icon} /><span>{n.label}</span>
					</a>
				{/each}
			</nav>
			<div class="side-foot">
				<a class="view-site" href="/" target="_blank" rel="noreferrer"><Icon name="external" size={16} />Lihat situs</a>
				<div class="me">
					<span class="avatar">{initials}</span>
					<span class="who">{user.email}</span>
					<button class="out" onclick={() => signOut(auth)} aria-label="Keluar"><Icon name="logout" size={18} /></button>
				</div>
			</div>
		</aside>

		<div class="main">
			<header class="top">
				<div class="crumb"><span class="crumb-dot"></span>{current.label}</div>
				<div class="top-actions">
					<a class="adm-btn sm" href="/" target="_blank" rel="noreferrer"><Icon name="external" size={15} />Situs</a>
					<span class="avatar sm" title={user.email}>{initials}</span>
				</div>
			</header>
			<main class="content">
				{#key path}
					<div class="page-in">{@render children()}</div>
				{/key}
			</main>
		</div>

		<nav class="tabbar" aria-label="Menu admin">
			{#each nav as n}
				<a href={n.href} class:active={current.href === n.href}>
					<Icon name={n.icon} size={22} /><span>{n.label}</span>
				</a>
			{/each}
		</nav>
	{/if}

	{#if toast.message}
		<div class="adm-toast" class:error={toast.error} role="status">{toast.message}</div>
	{/if}
</div>

<style>
	.boot {
		display: grid;
		place-items: center;
		min-height: 100vh;
	}

	.spinner {
		width: 30px;
		height: 30px;
		border: 3px solid rgba(85, 104, 61, 0.2);
		border-top-color: var(--brand);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}

	/* ───── Login ───── */
	.login-wrap {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		min-height: 100vh;
	}

	.login-art {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 14px;
		padding: clamp(32px, 5vw, 72px);
		overflow: hidden;
		background: linear-gradient(155deg, #3c4f27 0%, #26331a 60%, #1b2510 100%);
		color: #fff;
	}

	.art-badge {
		position: absolute;
		top: clamp(28px, 4vw, 56px);
		left: clamp(32px, 5vw, 72px);
		padding: 8px 16px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 999px;
		font-size: 0.85rem;
		letter-spacing: 0.04em;
	}

	.login-art h2 {
		font-size: clamp(2rem, 3.6vw, 3.2rem);
		font-weight: 600;
		line-height: 1.05;
		letter-spacing: -0.03em;
	}

	.login-art p {
		max-width: 38ch;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.95rem;
	}

	.orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(2px);
	}

	.o1 {
		top: -120px;
		right: -80px;
		width: 380px;
		height: 380px;
		background: radial-gradient(circle at 35% 35%, rgba(201, 220, 123, 0.5), transparent 70%);
	}

	.o2 {
		bottom: 22%;
		left: -140px;
		width: 320px;
		height: 320px;
		background: radial-gradient(circle at 60% 40%, rgba(132, 153, 98, 0.4), transparent 70%);
	}

	.login-form {
		display: grid;
		align-content: center;
		gap: 16px;
		width: min(400px, 100% - 48px);
		margin: 0 auto;
		padding: 40px 0;
	}

	.login-form h1 {
		font-size: 1.9rem;
		font-weight: 700;
		letter-spacing: -0.03em;
	}

	.lead {
		margin-top: -8px;
		color: var(--muted);
		font-size: 0.92rem;
	}

	.pw {
		position: relative;
		display: block;
	}

	.pw .adm-input {
		padding-right: 48px;
	}

	.eye {
		position: absolute;
		top: 50%;
		right: 6px;
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		translate: 0 -50%;
		border: 0;
		border-radius: 10px;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		transition:
			background-color 0.25s var(--ease),
			color 0.25s var(--ease);
	}

	.eye:hover {
		background: #edf1e8;
		color: var(--brand);
	}

	.eye:focus-visible {
		outline: 2px solid var(--accent);
	}

	.err {
		color: var(--danger);
		font-size: 0.85rem;
	}

	.login-form .adm-btn {
		min-height: 48px;
		margin-top: 4px;
	}

	/* ───── Sidebar ───── */
	.side {
		position: fixed;
		inset: 0 auto 0 0;
		z-index: 40;
		display: flex;
		flex-direction: column;
		width: 264px;
		padding: 22px 16px 16px;
		background: linear-gradient(175deg, #2e3d1e 0%, #1f2a14 100%);
		color: #e8eedc;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 30px;
		padding: 0 8px;
	}

	.mark {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: linear-gradient(145deg, #d6e68f, #9db85b);
		color: #26331a;
		font-weight: 800;
	}

	.brand strong {
		display: block;
		font-size: 1rem;
		font-weight: 600;
	}

	.brand small {
		color: rgba(232, 238, 220, 0.55);
		font-size: 0.72rem;
	}

	.side nav {
		display: grid;
		gap: 4px;
	}

	.side nav a {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		border-radius: 14px;
		color: rgba(232, 238, 220, 0.7);
		font-size: 0.92rem;
		font-weight: 500;
		transition:
			background-color 0.3s var(--ease),
			color 0.3s var(--ease);
	}

	.side nav a:hover {
		background: rgba(255, 255, 255, 0.06);
		color: #fff;
	}

	.side nav a.active {
		background: rgba(255, 255, 255, 0.11);
		color: #fff;
	}

	.side nav a.active::before {
		content: '';
		position: absolute;
		left: -16px;
		top: 12px;
		bottom: 12px;
		width: 4px;
		border-radius: 0 4px 4px 0;
		background: var(--lime);
	}

	.side-foot {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 12px;
		margin-top: auto;
	}

	.view-site {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 11px;
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 14px;
		color: rgba(232, 238, 220, 0.85);
		font-size: 0.85rem;
		transition: background-color 0.3s var(--ease);
	}

	.view-site:hover {
		background: rgba(255, 255, 255, 0.07);
	}

	.me {
		display: flex;
		align-items: center;
		min-width: 0;
		gap: 10px;
		padding: 10px;
		border-radius: 14px;
		background: rgba(0, 0, 0, 0.18);
	}

	.who {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		font-size: 0.78rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.out {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border: 0;
		border-radius: 10px;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.out:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.avatar {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: linear-gradient(145deg, #d6e68f, #9db85b);
		color: #26331a;
		font-size: 0.78rem;
		font-weight: 700;
	}

	.avatar.sm {
		width: 38px;
		height: 38px;
	}

	/* ───── Konten ───── */
	.main {
		margin-left: 264px;
		min-height: 100vh;
	}

	.top {
		position: sticky;
		top: 0;
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px clamp(20px, 3vw, 40px);
		background: rgba(241, 244, 238, 0.82);
		backdrop-filter: blur(14px);
	}

	.crumb {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--muted);
		font-size: 0.88rem;
		font-weight: 500;
	}

	.crumb-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 0 4px rgba(132, 153, 98, 0.2);
	}

	.top-actions {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.content {
		padding: 8px clamp(20px, 3vw, 40px) 60px;
		max-width: 1280px;
	}

	.page-in {
		/* backwards (bukan both): transform yang tersisa akan membuat elemen fixed di dalamnya terkurung di area ini */
		animation: rise 0.55s var(--ease) backwards;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}

	/* ───── Tab bar mobile ───── */
	.tabbar {
		display: none;
	}

	@media (max-width: 900px) {
		.login-wrap {
			grid-template-columns: 1fr;
		}

		.login-art {
			min-height: 260px;
		}

		.side {
			display: none;
		}

		.main {
			margin-left: 0;
			padding-bottom: 84px;
		}

		.tabbar {
			position: fixed;
			left: 12px;
			right: 12px;
			bottom: 12px;
			z-index: 50;
			display: grid;
			grid-template-columns: repeat(6, 1fr);
			padding: 8px;
			border: 1px solid rgba(255, 255, 255, 0.5);
			border-radius: 24px;
			background: rgba(255, 255, 255, 0.82);
			box-shadow: 0 18px 44px rgba(20, 28, 12, 0.18);
			backdrop-filter: blur(18px) saturate(1.4);
		}

		.tabbar a {
			display: grid;
			justify-items: center;
			gap: 3px;
			padding: 8px 2px;
			border-radius: 16px;
			color: var(--muted);
			font-size: 0.62rem;
			font-weight: 500;
			transition:
				background-color 0.3s var(--ease),
				color 0.3s var(--ease);
		}

		.tabbar a.active {
			background: #e6edd9;
			color: var(--brand);
		}
	}
</style>
