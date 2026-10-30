<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import '$lib/components/account/account.css';
	import Modal from '$lib/components/account/Modal.svelte';
	import PhoneField from '$lib/components/account/PhoneField.svelte';
	import AddressModal from '$lib/components/account/AddressModal.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { blankAddress, buildPhone, listAddresses, parsePhone, saveAddress, saveProfile, splitName, type Address } from '$lib/account/account';
	import { logout, refreshProfile, safeNext, session, whenReady } from '$lib/account/session.svelte';

	let ready = $state(false);
	let step = $state(1);
	let termsOk = $state(false);
	let readTerms = $state(false);
	let readPrivacy = $state(false);
	let first = $state('');
	let last = $state('');
	let dial = $state('62');
	let local = $state('');
	let saving = $state(false);
	let error = $state('');
	let addrOpen = $state(false);
	let touched = $state(false);

	const next = $derived(safeNext(page.url.searchParams.get('next')));
	const phoneOk = $derived(buildPhone(dial, local).length >= 9);

	onMount(async () => {
		await whenReady();
		const u = session.user;
		if (!u) return void goto(`/login?next=${encodeURIComponent(next)}`, { replaceState: true });
		const p = session.profile ?? (await refreshProfile());
		if (p?.onboarded) return void goto(next, { replaceState: true });
		// Nama dari Google bila ada; dokumen profil yang sudah setengah jadi juga dipakai kembali.
		const g = splitName(u.displayName);
		first = p?.firstName || g.first;
		last = p?.lastName || g.last;
		if (p?.phone) ({ dial, local } = parsePhone(p.phone));
		termsOk = !!p?.termsAcceptedAt;
		ready = true;
	});

	async function persist(extra: Partial<Parameters<typeof saveProfile>[1]> = {}) {
		const u = session.user!;
		saving = true;
		error = '';
		try {
			await saveProfile(u.uid, {
				email: (u.email ?? '').toLowerCase(),
				emailVerified: u.emailVerified,
				firstName: first.trim(),
				lastName: last.trim(),
				phone: buildPhone(dial, local),
				termsAcceptedAt: new Date().toISOString(),
				...extra
			});
			await refreshProfile();
			return true;
		} catch {
			error = 'We could not save that. Please try again.';
			return false;
		} finally {
			saving = false;
		}
	}

	async function toStep2(e: SubmitEvent) {
		e.preventDefault();
		touched = true;
		if (!first.trim()) return;
		if (await persist()) {
			touched = false;
			step = 2;
		}
	}

	async function toStep3(e: SubmitEvent) {
		e.preventDefault();
		touched = true;
		if (!phoneOk) return;
		if (await persist({ onboarded: true })) {
			touched = false;
			step = 3;
		}
	}

	const finish = () => goto(next, { replaceState: true });

	async function addAddress(a: Address) {
		const u = session.user!;
		const existing = await listAddresses(u.uid);
		await saveAddress(u.uid, null, { ...a, isDefault: true }, existing);
		addrOpen = false;
		await finish();
	}

	async function signOutInstead() {
		await logout();
		await goto('/', { replaceState: true });
	}
</script>

<svelte:head>
	<title>Welcome — AgroPlus.ID</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="site-shell">
	<div class="ac-page">
		<div class="ac-narrow stage">
			{#if ready && termsOk}
				{#key step}
					<section class="step" in:fly={{ x: 40, duration: 600, opacity: 0 }}>
						{#if step === 1}
							<h1 class="ac-title sm">Welcome!</h1>
							<p class="ac-sub">{session.user?.displayName ? 'We got your name from Google. Please confirm it’s correct, or feel free to change it.' : 'Tell us what we should call you.'}</p>
							<form class="ac-form form" onsubmit={toStep2} novalidate>
								<div class="ac-row">
									<label class="ac-field">First name
										<input class="ac-input" class:bad={touched && !first.trim()} bind:value={first} autocomplete="given-name" />
									</label>
									<label class="ac-field">Last name
										<input class="ac-input" bind:value={last} autocomplete="family-name" />
									</label>
								</div>
								{#if error}<div class="ac-alert" role="alert">{error}</div>{/if}
								<button class="ac-btn block" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Continue'}</button>
							</form>
						{:else if step === 2}
							<h1 class="ac-title sm">Phone Number</h1>
							<p class="ac-sub">We need your phone number for order updates and delivery coordination.</p>
							<div class="ac-alert info tip">
								<strong>Please use a number you can reach on WhatsApp.</strong> Most couriers in Indonesia coordinate deliveries via WhatsApp, so we’ll pass this number along to whoever handles your order.
							</div>
							<form class="ac-form form" onsubmit={toStep3} novalidate>
								<div class="ac-field">
									<label for="ob-phone">Phone number *</label>
									<PhoneField id="ob-phone" bind:dial bind:local invalid={touched && !phoneOk} />
								</div>
								{#if error}<div class="ac-alert" role="alert">{error}</div>{/if}
								<div class="ac-actions two">
									<button type="button" class="ac-btn ghost" onclick={() => ((step = 1), (touched = false))}>Back</button>
									<button class="ac-btn" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Continue'}</button>
								</div>
							</form>
						{:else}
							<h1 class="ac-title sm">Add Shipping Address</h1>
							<p class="ac-sub">Save time on your first order by adding your default shipping address now. You can always add or change it later.</p>
							<div class="ac-form form">
								<button class="ac-btn block" type="button" onclick={() => (addrOpen = true)}>Add Address</button>
								<button class="ac-btn ghost block" type="button" onclick={finish}>Skip for now</button>
							</div>
						{/if}
						<p class="count">Step {step} of 3{step === 3 ? ' · Optional' : ''}</p>
						<div class="bar" aria-hidden="true"><i style="width:{(step / 3) * 100}%"></i></div>
					</section>
				{/key}
			{/if}
		</div>
	</div>
	<SiteFooter />
</main>

{#if ready && !termsOk}
	<Modal title="Please review our terms" dismissible={false}>
		<p class="ac-muted">Before you continue with your account, we need your agreement to our current Terms &amp; Conditions and Privacy Policy. The links open in a new tab.</p>
		<div class="ac-form checks">
			<label class="ac-check"><input type="checkbox" bind:checked={readTerms} /><span>I have read and agree to the <a href="/terms" target="_blank" rel="noopener">Terms &amp; Conditions</a>.</span></label>
			<label class="ac-check"><input type="checkbox" bind:checked={readPrivacy} /><span>I have read the <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a> and agree to AgroPlus.ID processing my personal data as it describes.</span></label>
		</div>
		{#snippet footer()}
			<span class="need"></span>
			<span class="ac-actions">
				<button type="button" class="ac-btn ghost" onclick={signOutInstead}>Sign out instead</button>
				<button type="button" class="ac-btn" disabled={!readTerms || !readPrivacy} onclick={() => (termsOk = true)}>Agree and continue</button>
			</span>
		{/snippet}
	</Modal>
{/if}

{#if addrOpen}
	<AddressModal initial={blankAddress(`${first} ${last}`.trim(), buildPhone(dial, local))} onsave={addAddress} onclose={() => (addrOpen = false)} />
{/if}

<style>
	.stage {
		min-height: 60svh;
		padding-top: clamp(24px, 8vh, 96px);
		text-align: center;
	}

	.step {
		display: grid;
		justify-items: center;
	}

	.form {
		width: 100%;
		margin-top: 28px;
		text-align: left;
	}

	.tip {
		width: 100%;
		margin-top: 22px;
		text-align: left;
	}

	.two {
		display: grid;
		grid-template-columns: 1fr 1.6fr;
	}

	.count {
		margin: 28px 0 10px;
		color: #5f6e4e;
		font-size: 0.85rem;
	}

	.bar {
		width: 120px;
		height: 4px;
		overflow: hidden;
		border-radius: 4px;
		background: #dbe3d1;
	}

	.bar i {
		display: block;
		height: 100%;
		border-radius: 4px;
		background: #849962;
		transition: width 0.7s var(--ease);
	}

	.checks {
		margin: 20px 0 6px;
	}
</style>
