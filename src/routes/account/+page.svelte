<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Swal from 'sweetalert2';
	import '$lib/components/account/account.css';
	import Modal from '$lib/components/account/Modal.svelte';
	import PhoneField from '$lib/components/account/PhoneField.svelte';
	import AddressModal from '$lib/components/account/AddressModal.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import {
		blankAddress,
		buildPhone,
		displayName,
		formatPhone,
		initialsOf,
		listAddresses,
		listMyOrders,
		parsePhone,
		removeAddress,
		saveAddress,
		saveProfile,
		setDefaultAddress,
		type Address
	} from '$lib/account/account';
	import {
		authMessage,
		deleteAccount,
		logout,
		providersOf,
		reauthenticate,
		refreshProfile,
		resendVerification,
		session,
		setOrChangePassword,
		whenReady
	} from '$lib/account/session.svelte';
	import { ORDER_STATUS, type Order } from '$lib/admin/orders';
	import { VERIFIED_KEY } from '$lib/batch';

	type Addr = Address & { id: string };

	let loading = $state(true);
	let addresses = $state<Addr[]>([]);
	let orders = $state<(Order & { id: string })[]>([]);
	let ordersError = $state('');
	let addrModal = $state<{ id: string | null; data: Address } | null>(null);
	let editOpen = $state(false);
	let pwOpen = $state(false);
	let notice = $state('');

	// formulir ubah profil
	let eFirst = $state('');
	let eLast = $state('');
	let eDial = $state('62');
	let eLocal = $state('');
	let eBusy = $state(false);
	let eError = $state('');

	// formulir sandi
	let pw1 = $state('');
	let pw2 = $state('');
	let pwBusy = $state(false);
	let pwError = $state('');

	const user = $derived(session.user);
	const profile = $derived(session.profile);
	const name = $derived(displayName(profile));
	const providers = $derived(providersOf(user));
	const hasPassword = $derived(providers.includes('password'));
	const hasGoogle = $derived(providers.includes('google.com'));
	const verified = $derived(!!user?.emailVerified);

	onMount(async () => {
		await whenReady();
		if (!session.user) return void goto('/login?next=/account', { replaceState: true });
		const p = session.profile ?? (await refreshProfile());
		if (!p?.onboarded) return void goto('/onboarding?next=/account', { replaceState: true });
		await Promise.all([loadAddresses(), loadOrders()]);
		loading = false;
	});

	async function loadAddresses() {
		try {
			addresses = await listAddresses(session.user!.uid);
		} catch (err) {
			console.warn('Gagal memuat alamat', err);
		}
	}

	async function loadOrders() {
		ordersError = '';
		if (!session.user?.emailVerified || !session.user.email) return;
		try {
			orders = await listMyOrders(session.user.email);
		} catch (err) {
			console.warn('Gagal memuat pesanan', err);
			ordersError = 'We could not load your orders right now.';
		}
	}

	const flash = (m: string) => {
		notice = m;
		setTimeout(() => (notice = ''), 3200);
	};

	// ───── profil ─────
	function openEdit() {
		const p = profile!;
		eFirst = p.firstName;
		eLast = p.lastName;
		({ dial: eDial, local: eLocal } = parsePhone(p.phone));
		eError = '';
		editOpen = true;
	}

	async function saveEdit(e: SubmitEvent) {
		e.preventDefault();
		if (!eFirst.trim() || buildPhone(eDial, eLocal).length < 9) {
			eError = 'Please enter your first name and a valid phone number.';
			return;
		}
		eBusy = true;
		try {
			await saveProfile(user!.uid, { firstName: eFirst.trim(), lastName: eLast.trim(), phone: buildPhone(eDial, eLocal) });
			await refreshProfile();
			editOpen = false;
			flash('Profile updated');
		} catch {
			eError = 'We could not save that. Please try again.';
		} finally {
			eBusy = false;
		}
	}

	// ───── alamat ─────
	const newAddress = () => (addrModal = { id: null, data: blankAddress(name, profile?.phone ?? '') });
	const editAddress = (a: Addr) => (addrModal = { id: a.id, data: { ...a } });

	async function submitAddress(a: Address) {
		const first = addresses.length === 0;
		await saveAddress(user!.uid, addrModal!.id, { ...a, isDefault: a.isDefault || first }, addresses);
		addrModal = null;
		await loadAddresses();
		flash('Address saved');
	}

	async function deleteAddress(a: Addr) {
		const ok = await Swal.fire({
			title: 'Delete this address?',
			text: a.label || a.line1,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Delete',
			confirmButtonColor: '#b03a2e'
		});
		if (!ok.isConfirmed) return;
		await removeAddress(user!.uid, a.id);
		await loadAddresses();
		flash('Address deleted');
	}

	async function makeDefault(a: Addr) {
		await setDefaultAddress(user!.uid, a.id, addresses);
		await loadAddresses();
	}

	// ───── koleksi ─────
	function openPassport(o: Order & { id: string }) {
		try {
			sessionStorage.setItem(VERIFIED_KEY, o.id);
		} catch {
			/* storage tidak tersedia */
		}
		goto('/supply-verification/result');
	}

	const statusOf = (k: string) => ORDER_STATUS.find((s) => s.key === k) ?? ORDER_STATUS[0];

	// ───── notifikasi ─────
	async function toggleNotify(key: 'updates' | 'orders', value: boolean) {
		try {
			await saveProfile(user!.uid, { notify: { ...profile!.notify, [key]: value } });
			await refreshProfile();
			flash('Preference saved');
		} catch {
			flash('Could not save preference');
		}
	}

	// ───── keamanan ─────
	async function sendVerify() {
		try {
			await resendVerification();
			flash('Verification email sent — check your inbox');
		} catch (err) {
			flash(authMessage(err));
		}
	}

	async function askPassword() {
		const r = await Swal.fire({
			title: 'Confirm it’s you',
			text: 'Enter your current password to continue.',
			input: 'password',
			inputAttributes: { autocomplete: 'current-password' },
			showCancelButton: true,
			confirmButtonText: 'Continue',
			confirmButtonColor: '#25330f'
		});
		return r.isConfirmed ? (r.value as string) : null;
	}

	// Jalankan aksi sensitif; bila diminta login ulang, lakukan lalu ulangi sekali.
	async function sensitive(action: () => Promise<void>) {
		try {
			await action();
		} catch (err) {
			if ((err as { code?: string }).code === 'auth/requires-recent-login') {
				if (await reauthenticate(askPassword)) await action();
			} else throw err;
		}
	}

	function openPw() {
		pw1 = pw2 = pwError = '';
		pwOpen = true;
	}

	async function savePw(e: SubmitEvent) {
		e.preventDefault();
		if (pw1.length < 8) return void (pwError = 'Use at least 8 characters.');
		if (pw1 !== pw2) return void (pwError = 'The two passwords do not match.');
		pwBusy = true;
		pwError = '';
		try {
			await sensitive(() => setOrChangePassword(pw1));
			await user!.reload();
			pwOpen = false;
			flash(hasPassword ? 'Password updated' : 'Password set — you can now also sign in with your email');
		} catch (err) {
			pwError = authMessage(err);
		} finally {
			pwBusy = false;
		}
	}

	// ───── privasi & data ─────
	function downloadData() {
		const data = { exportedAt: new Date().toISOString(), account: { uid: user!.uid, email: user!.email, ...profile }, addresses, orders };
		const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
		const a = Object.assign(document.createElement('a'), { href: url, download: 'agroplus-my-data.json' });
		a.click();
		URL.revokeObjectURL(url);
	}

	async function removeAccount() {
		const ok = await Swal.fire({
			title: 'Delete your account?',
			html: 'This permanently removes your profile and saved addresses. Your past orders stay on record with AgroPlus.ID. This cannot be undone.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Delete my account',
			confirmButtonColor: '#b03a2e'
		});
		if (!ok.isConfirmed) return;
		try {
			await sensitive(deleteAccount);
			await goto('/', { replaceState: true });
		} catch (err) {
			Swal.fire({ icon: 'error', title: 'Could not delete account', text: authMessage(err), confirmButtonColor: '#25330f' });
		}
	}

	async function signOut() {
		await logout();
		await goto('/', { replaceState: true });
	}
</script>

<svelte:head>
	<title>My account — AgroPlus.ID</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="site-shell">
	<div class="ac-page">
		{#if profile && user}
			<div class="ac-wide stack">
				<!-- Profil -->
				<section class="ac-card top ac-rise" style="--d:0">
					<div class="who">
						<span class="ac-avatar">
							{#if user.photoURL}<img src={user.photoURL} alt="" referrerpolicy="no-referrer" />{:else}{initialsOf(name, user.email ?? '')}{/if}
						</span>
						<div>
							<h1 class="ac-title sm nm">{name || 'Welcome'}</h1>
							<p class="meta">
								<span>{user.email}</span>
								{#if profile.phone}<i aria-hidden="true">•</i><span>{formatPhone(profile.phone)}</span>{/if}
							</p>
						</div>
					</div>
					<div class="ac-actions">
						<button class="ac-btn ghost sm" onclick={openEdit}>Edit</button>
						<a class="ac-btn ghost sm" href="#koleksi">My Collection</a>
						<a class="ac-btn ghost sm" href="#privasi">Privacy &amp; Data</a>
						<button class="ac-btn ghost sm" onclick={signOut}>Sign Out</button>
					</div>
				</section>

				{#if !verified}
					<div class="ac-alert info verify ac-rise" style="--d:1" role="status">
						<span><strong>Verify your email.</strong> We sent a link to {user.email}. Confirm it to see your coffee collection.</span>
						<button class="ac-btn ghost sm" onclick={sendVerify}>Resend link</button>
					</div>
				{/if}

				<!-- Alamat -->
				<section class="ac-card ac-rise" style="--d:2" id="alamat">
					<div class="sec-head">
						<div>
							<h2 class="ac-h2">Addresses</h2>
							<p class="ac-muted">Manage your shipping addresses</p>
						</div>
						<button class="ac-btn ghost sm" onclick={newAddress}>+ Add Address</button>
					</div>
					{#if loading}
						<p class="empty">Loading…</p>
					{:else if !addresses.length}
						<div class="empty">
							<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
							<strong>No addresses saved yet.</strong>
							<span>Add your first address to get started.</span>
						</div>
					{:else}
						<ul class="addr-list">
							{#each addresses as a (a.id)}
								<li class="addr">
									<div class="addr-top">
										<strong>{a.label || a.recipient}</strong>
										{#if a.isDefault}<span class="ac-badge">Default</span>{/if}
									</div>
									<p>{a.recipient} · {formatPhone(a.phone)}</p>
									<p class="ac-muted">
										{[a.line1, a.line2, a.place].filter(Boolean).join(', ')}<br />
										{[a.subdistrict, a.district, a.city, a.province, a.postal].filter(Boolean).join(', ')}
									</p>
									<div class="ac-actions">
										<button class="ac-btn ghost sm" onclick={() => editAddress(a)}>Edit</button>
										{#if !a.isDefault}<button class="ac-btn ghost sm" onclick={() => makeDefault(a)}>Set as default</button>{/if}
										<button class="ac-btn danger sm" onclick={() => deleteAddress(a)}>Delete</button>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</section>

				<!-- Koleksi -->
				<section class="ac-card ac-rise" style="--d:3" id="koleksi">
					<div class="sec-head">
						<div>
							<h2 class="ac-h2">My Collection</h2>
							<p class="ac-muted">Coffee you have ordered. Open any batch to see its passport and journey.</p>
						</div>
					</div>
					{#if !verified}
						<p class="empty">Verify your email to see orders placed with {user.email}.</p>
					{:else if ordersError}
						<div class="ac-alert">{ordersError}</div>
					{:else if loading}
						<p class="empty">Loading…</p>
					{:else if !orders.length}
						<div class="empty">
							<strong>No orders yet.</strong>
							<span>Orders placed with {user.email} will appear here. You can also <a class="ac-link" href="/supply-verification">verify a package</a> with its order code.</span>
						</div>
					{:else}
						<ul class="orders">
							{#each orders as o (o.id)}
								{@const st = statusOf(o.status)}
								<li class="order">
									<div>
										<strong>{o.product}</strong>
										<p class="ac-muted">
											<code>{o.orderCode}</code>{#if o.itemNumber} · Package #{o.itemNumber}{/if}
										</p>
									</div>
									<span class="ac-badge {st.tone}">{st.label}</span>
									{#if o.batch}
										<button class="ac-btn sm" onclick={() => openPassport(o)}>View passport</button>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</section>

				<!-- Keamanan -->
				<section class="ac-card ac-rise" style="--d:4" id="keamanan">
					<h2 class="ac-h2">Sign-in &amp; security</h2>
					<p class="ac-muted">Manage how you sign in to your account.</p>
					<div class="rows">
						<div class="line">
							<div>
								<strong>Email &amp; password</strong>
								<p class="ac-muted">{hasPassword ? 'Password is set' : 'No password set'}</p>
							</div>
							<button class="ac-btn ghost sm" onclick={openPw}>{hasPassword ? 'Change password' : 'Set password'}</button>
						</div>
						<div class="line">
							<div>
								<strong>Google</strong>
								<p class="ac-muted">{hasGoogle ? 'Connected — you can sign in with Google' : 'Not connected'}</p>
							</div>
							<span class="ac-badge" class:gray={!hasGoogle}>{hasGoogle ? 'Connected' : 'Not connected'}</span>
						</div>
						<div class="line">
							<div>
								<strong>Email verification</strong>
								<p class="ac-muted">{verified ? 'Your email is verified' : 'Not verified yet'}</p>
							</div>
							<span class="ac-badge" class:amber={!verified}>{verified ? 'Verified' : 'Pending'}</span>
						</div>
					</div>
				</section>

				<!-- Notifikasi -->
				<section class="ac-card ac-rise" style="--d:5" id="notifikasi">
					<h2 class="ac-h2">Email notifications</h2>
					<p class="ac-muted">Choose which emails AgroPlus.ID may send to {user.email}.</p>
					<div class="rows">
						<label class="line sw">
							<div>
								<strong>Product updates &amp; news</strong>
								<p class="ac-muted">New batches, product launches and important announcements.</p>
							</div>
							<input type="checkbox" role="switch" checked={profile.notify.updates} onchange={(e) => toggleNotify('updates', e.currentTarget.checked)} />
						</label>
						<label class="line sw">
							<div>
								<strong>Order updates</strong>
								<p class="ac-muted">Status changes for your CoffeeID orders.</p>
							</div>
							<input type="checkbox" role="switch" checked={profile.notify.orders} onchange={(e) => toggleNotify('orders', e.currentTarget.checked)} />
						</label>
					</div>
				</section>

				<!-- Privasi -->
				<section class="ac-card ac-rise" style="--d:6" id="privasi">
					<h2 class="ac-h2">Privacy &amp; data</h2>
					<p class="ac-muted">You are in control of your information. Read our <a class="ac-link" href="/privacy">Privacy Policy</a>.</p>
					<div class="rows">
						<div class="line">
							<div>
								<strong>Download my data</strong>
								<p class="ac-muted">A copy of your profile, addresses and orders as a file.</p>
							</div>
							<button class="ac-btn ghost sm" onclick={downloadData}>Download</button>
						</div>
						<div class="line">
							<div>
								<strong>Delete account</strong>
								<p class="ac-muted">Permanently remove your profile and saved addresses.</p>
							</div>
							<button class="ac-btn danger sm" onclick={removeAccount}>Delete</button>
						</div>
					</div>
				</section>
			</div>
		{:else}
			<div class="ac-narrow boot" aria-live="polite"><span class="spin"></span></div>
		{/if}
	</div>
	<SiteFooter />
</main>

{#if notice}<div class="flash" role="status">{notice}</div>{/if}

{#if editOpen}
	<Modal title="Edit profile" onclose={() => (editOpen = false)}>
		<form class="ac-form" id="edit-form" onsubmit={saveEdit} novalidate>
			<div class="ac-row">
				<label class="ac-field">First name<input class="ac-input" bind:value={eFirst} autocomplete="given-name" /></label>
				<label class="ac-field">Last name<input class="ac-input" bind:value={eLast} autocomplete="family-name" /></label>
			</div>
			<div class="ac-field">
				<label for="e-phone">Phone number</label>
				<PhoneField id="e-phone" bind:dial={eDial} bind:local={eLocal} />
				<small>Use a number you can reach on WhatsApp.</small>
			</div>
			<label class="ac-field">Email<input class="ac-input" value={user?.email ?? ''} disabled /><small>Your sign-in email cannot be changed here.</small></label>
			{#if eError}<div class="ac-alert" role="alert">{eError}</div>{/if}
		</form>
		{#snippet footer()}
			<span class="need"></span>
			<span class="ac-actions">
				<button type="button" class="ac-btn ghost" onclick={() => (editOpen = false)}>Cancel</button>
				<button type="submit" form="edit-form" class="ac-btn" disabled={eBusy}>{eBusy ? 'Saving…' : 'Save'}</button>
			</span>
		{/snippet}
	</Modal>
{/if}

{#if pwOpen}
	<Modal title={hasPassword ? 'Change password' : 'Set password'} onclose={() => (pwOpen = false)}>
		<form class="ac-form" id="pw-form" onsubmit={savePw} novalidate>
			{#if !hasPassword}<p class="ac-muted">Add a password so you can also sign in with {user?.email} without Google.</p>{/if}
			<label class="ac-field">New password<input class="ac-input" type="password" autocomplete="new-password" bind:value={pw1} placeholder="At least 8 characters" /></label>
			<label class="ac-field">Repeat new password<input class="ac-input" type="password" autocomplete="new-password" bind:value={pw2} /></label>
			{#if pwError}<div class="ac-alert" role="alert">{pwError}</div>{/if}
		</form>
		{#snippet footer()}
			<span class="need"></span>
			<span class="ac-actions">
				<button type="button" class="ac-btn ghost" onclick={() => (pwOpen = false)}>Cancel</button>
				<button type="submit" form="pw-form" class="ac-btn" disabled={pwBusy}>{pwBusy ? 'Saving…' : 'Save password'}</button>
			</span>
		{/snippet}
	</Modal>
{/if}

{#if addrModal}
	<AddressModal title={addrModal.id ? 'Edit address' : 'Add address'} initial={addrModal.data} onsave={submitAddress} onclose={() => (addrModal = null)} />
{/if}

<style>
	.stack {
		display: grid;
		gap: 22px;
	}

	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 22px;
	}

	.who {
		display: flex;
		align-items: center;
		gap: 20px;
		min-width: 0;
	}

	.nm {
		color: #25330f;
		overflow-wrap: anywhere;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 12px;
		margin: 6px 0 0;
		color: #5f6e4e;
		font-size: 0.92rem;
		overflow-wrap: anywhere;
	}

	.meta i {
		font-style: normal;
		opacity: 0.5;
	}

	.verify {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.sec-head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 14px;
		margin-bottom: 18px;
	}

	.sec-head p {
		margin: 4px 0 0;
	}

	.empty {
		display: grid;
		justify-items: center;
		gap: 4px;
		padding: 34px 12px;
		color: #5f6e4e;
		font-size: 0.92rem;
		text-align: center;
	}

	.empty strong {
		color: #25330f;
	}

	.addr-list,
	.orders {
		display: grid;
		gap: 14px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.addr-list {
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
	}

	.addr {
		display: grid;
		align-content: start;
		gap: 6px;
		padding: 18px;
		border: 1px solid rgba(37, 51, 15, 0.12);
		border-radius: 18px;
		transition:
			border-color 0.3s ease,
			transform 0.5s var(--ease);
	}

	.addr:hover {
		border-color: #849962;
		transform: translateY(-3px);
	}

	.addr p {
		margin: 0;
		font-size: 0.9rem;
	}

	.addr .ac-actions {
		margin-top: 8px;
	}

	.addr-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.order {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 18px;
		padding: 16px 18px;
		border: 1px solid rgba(37, 51, 15, 0.12);
		border-radius: 18px;
	}

	.order > div {
		flex: 1 1 200px;
	}

	.order p {
		margin: 2px 0 0;
	}

	.order code {
		font-size: 0.82rem;
	}

	.rows {
		display: grid;
		margin-top: 12px;
	}

	.line {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		padding: 16px 0;
		border-top: 1px solid rgba(37, 51, 15, 0.1);
	}

	.line p {
		margin: 2px 0 0;
		font-size: 0.85rem;
	}

	.sw {
		cursor: pointer;
	}

	/* Saklar */
	.sw input {
		appearance: none;
		flex: none;
		position: relative;
		width: 48px;
		height: 28px;
		margin: 0;
		border-radius: 999px;
		background: #cfd7c5;
		cursor: pointer;
		transition: background-color 0.4s var(--ease);
	}

	.sw input::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
		transition: transform 0.45s var(--ease);
	}

	.sw input:checked {
		background: #55683d;
	}

	.sw input:checked::after {
		transform: translateX(20px);
	}

	.sw input:focus-visible {
		outline: 2px solid #849962;
		outline-offset: 3px;
	}

	.flash {
		position: fixed;
		left: 50%;
		bottom: 28px;
		z-index: 4100;
		max-width: calc(100% - 32px);
		padding: 12px 22px;
		translate: -50% 0;
		border-radius: 999px;
		background: #25330f;
		color: #fff;
		font-size: 0.9rem;
		animation: flash-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	@keyframes flash-in {
		from {
			opacity: 0;
			translate: -50% 16px;
		}
	}

	.boot {
		display: grid;
		place-items: center;
		min-height: 50svh;
	}

	.spin {
		width: 30px;
		height: 30px;
		border: 3px solid #cddcae;
		border-top-color: #55683d;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 640px) {
		.who {
			align-items: flex-start;
		}

		.ac-avatar {
			width: 56px;
			height: 56px;
			font-size: 1.1rem;
		}

		.line {
			align-items: flex-start;
			flex-wrap: wrap;
		}
	}
</style>
