<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import '$lib/components/account/account.css';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import {
		authMessage,
		refreshProfile,
		resetPassword,
		safeNext,
		session,
		signInEmail,
		signInGoogle,
		signUpEmail,
		whenReady
	} from '$lib/account/session.svelte';

	let mode = $state<'signin' | 'signup'>('signin');
	let email = $state('');
	let password = $state('');
	let showPw = $state(false);
	let busy = $state(false);
	let error = $state('');
	let info = $state('');

	const next = $derived(safeNext(page.url.searchParams.get('next')));

	onMount(async () => {
		if (page.url.searchParams.get('mode') === 'signup') mode = 'signup';
		await whenReady();
		if (session.user) await proceed();
	});

	// Pelanggan baru diarahkan melengkapi profil dulu; yang lama langsung ke tujuan.
	async function proceed() {
		const p = session.profile ?? (await refreshProfile());
		if (!p?.onboarded) await goto(`/onboarding?next=${encodeURIComponent(next)}`, { replaceState: true });
		else await goto(next, { replaceState: true });
	}

	async function run(task: () => Promise<unknown>) {
		busy = true;
		error = '';
		info = '';
		try {
			await task();
			await proceed();
		} catch (err) {
			error = authMessage(err);
		} finally {
			busy = false;
		}
	}

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (mode === 'signup' && password.length < 8) {
			error = 'Use at least 8 characters for your password.';
			return;
		}
		run(() => (mode === 'signin' ? signInEmail(email, password) : signUpEmail(email, password)));
	}

	async function forgot() {
		error = '';
		info = '';
		if (!email.trim()) {
			error = 'Type your email above first, then tap “Forgot password”.';
			return;
		}
		try {
			await resetPassword(email);
			info = 'If an account exists for that email, a reset link is on its way.';
		} catch (err) {
			error = authMessage(err);
		}
	}
</script>

<svelte:head>
	<title>{mode === 'signin' ? 'Sign in' : 'Create account'} — AgroPlus.ID</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="site-shell">
	<div class="ac-page">
		<div class="ac-narrow">
			<header class="head ac-rise" style="--d:0">
				<h1 class="ac-title">{mode === 'signin' ? 'Welcome back.' : 'Join AgroPlus.ID.'}</h1>
				<p class="ac-sub">
					{mode === 'signin'
						? 'Sign in to see your coffee collection, saved addresses and updates.'
						: 'Create an account to keep your CoffeeID orders, passports and updates in one place.'}
				</p>
			</header>

			<section class="ac-card box ac-rise" style="--d:1">
				<div class="seg" role="tablist" data-mode={mode}>
					<span class="thumb" aria-hidden="true"></span>
					<button type="button" role="tab" aria-selected={mode === 'signin'} onclick={() => ((mode = 'signin'), (error = ''), (info = ''))}>Sign in</button>
					<button type="button" role="tab" aria-selected={mode === 'signup'} onclick={() => ((mode = 'signup'), (error = ''), (info = ''))}>Create account</button>
				</div>

				<button type="button" class="ac-btn ghost block" onclick={() => run(signInGoogle)} disabled={busy}>
					<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" /><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.9 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>
					Continue with Google
				</button>

				<div class="ac-divider">or use your email</div>

				<form class="ac-form" onsubmit={submit} novalidate>
					<label class="ac-field">Email
						<input class="ac-input" type="email" autocomplete="email" bind:value={email} placeholder="you@example.com" required />
					</label>

					<label class="ac-field">Password
						<span class="ac-pw">
							<input class="ac-input" type={showPw ? 'text' : 'password'} autocomplete={mode === 'signin' ? 'current-password' : 'new-password'} bind:value={password} placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'} required />
							<button type="button" class="ac-eye" onclick={() => (showPw = !showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}>
								{#if showPw}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 6.1A10.9 10.9 0 0112 6c5 0 9 4 10 6a13.7 13.7 0 01-3.1 3.9M6.6 6.7C4.3 8.1 2.7 10.1 2 12c1 2 5 6 10 6 1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 004.2 4.2" /></svg>
								{:else}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c1-2 5-6 10-6s9 4 10 6c-1 2-5 6-10 6S3 14 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
								{/if}
							</button>
						</span>
					</label>

					{#if error}<div class="ac-alert" role="alert">{error}</div>{/if}
					{#if info}<div class="ac-alert ok" role="status">{info}</div>{/if}

					<button class="ac-btn block" type="submit" disabled={busy}>
						{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
					</button>

					{#if mode === 'signin'}
						<button type="button" class="ac-link ac-link-btn forgot" onclick={forgot}>Forgot password?</button>
					{:else}
						<p class="ac-muted fine">By continuing you will be asked to review our <a class="ac-link" href="/terms" target="_blank" rel="noopener">Terms</a> and <a class="ac-link" href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</p>
					{/if}
				</form>
			</section>
		</div>
	</div>
	<SiteFooter />
</main>

<style>
	.head {
		margin-bottom: 28px;
		text-align: center;
	}

	.box {
		display: grid;
		gap: 18px;
	}

	/* Pemilih mode dengan penanda yang meluncur */
	.seg {
		position: relative;
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 5px;
		border-radius: 16px;
		background: #e8ede3;
	}

	.seg button {
		position: relative;
		z-index: 1;
		min-height: 42px;
		border: 0;
		background: none;
		color: #5f6e4e;
		font-size: 0.92rem;
		font-weight: 600;
		cursor: pointer;
		transition: color 0.4s var(--ease);
	}

	.seg button[aria-selected='true'] {
		color: #25330f;
	}

	.thumb {
		position: absolute;
		inset: 5px auto 5px 5px;
		width: calc(50% - 5px);
		border-radius: 12px;
		background: #fff;
		box-shadow: 0 4px 14px rgba(37, 51, 15, 0.12);
		transition: transform 0.55s var(--ease);
	}

	.seg[data-mode='signup'] .thumb {
		transform: translateX(100%);
	}

	.forgot {
		justify-self: center;
		font-size: 0.88rem;
	}

	.fine {
		margin: 0;
		text-align: center;
		font-size: 0.8rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.thumb {
			transition: none;
		}
	}
</style>
