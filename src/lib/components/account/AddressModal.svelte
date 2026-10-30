<script lang="ts">
	import Modal from './Modal.svelte';
	import PhoneField from './PhoneField.svelte';
	import PinPicker from './PinPicker.svelte';
	import { buildPhone, parsePhone, type Address } from '$lib/account/account';

	let {
		initial,
		title = 'Add address',
		onsave,
		onclose
	}: { initial: Address; title?: string; onsave: (a: Address) => Promise<void> | void; onclose: () => void } = $props();

	// svelte-ignore state_referenced_locally
	const start = parsePhone(initial.phone);
	// svelte-ignore state_referenced_locally
	let form = $state<Address>({ ...initial });
	let dial = $state(start.dial);
	let local = $state(start.local);
	let saving = $state(false);
	let error = $state('');
	let touched = $state(false);

	const missing = $derived(
		[
			!form.recipient.trim() && 'recipient name',
			!buildPhone(dial, local) && 'phone number',
			!form.line1.trim() && 'address line 1',
			!form.province.trim() && 'province',
			!form.city.trim() && 'city',
			!form.postal.trim() && 'postal code'
		].filter(Boolean) as string[]
	);

	async function save() {
		touched = true;
		if (missing.length) return;
		saving = true;
		error = '';
		try {
			await onsave({
				...form,
				label: form.label.trim(),
				recipient: form.recipient.trim(),
				phone: buildPhone(dial, local),
				line1: form.line1.trim(),
				line2: form.line2.trim(),
				place: form.place.trim(),
				province: form.province.trim(),
				city: form.city.trim(),
				district: form.district.trim(),
				subdistrict: form.subdistrict.trim(),
				postal: form.postal.trim()
			});
		} catch {
			error = 'We could not save this address. Please try again.';
			saving = false;
		}
	}
</script>

<Modal {title} {onclose} wide>
	<form class="ac-form" onsubmit={(e) => (e.preventDefault(), save())} id="addr-form">
		<PinPicker bind:lat={form.lat} bind:lng={form.lng} />

		<div class="ac-row">
			<label class="ac-field">Recipient name *
				<input class="ac-input" class:bad={touched && !form.recipient.trim()} bind:value={form.recipient} autocomplete="name" />
			</label>
			<div class="ac-field">
				<label for="a-phone">Phone number *</label>
				<PhoneField id="a-phone" bind:dial bind:local invalid={touched && !buildPhone(dial, local)} />
			</div>
		</div>

		<label class="ac-field">Label
			<input class="ac-input" bind:value={form.label} placeholder="Home, Office, Cafe, etc." />
		</label>

		<label class="ac-field">Address line 1 *
			<input class="ac-input" class:bad={touched && !form.line1.trim()} bind:value={form.line1} autocomplete="address-line1" />
			<small>Street, building, or landmark</small>
		</label>

		<label class="ac-field">Address line 2 (optional)
			<input class="ac-input" bind:value={form.line2} autocomplete="address-line2" />
			<small>House no., unit, or a landmark (e.g. blue gate, 2nd floor)</small>
		</label>

		<label class="ac-field">Place / building name (optional)
			<input class="ac-input" bind:value={form.place} />
		</label>

		<div class="ac-row">
			<label class="ac-field">Province *
				<input class="ac-input" class:bad={touched && !form.province.trim()} bind:value={form.province} autocomplete="address-level1" />
			</label>
			<label class="ac-field">City *
				<input class="ac-input" class:bad={touched && !form.city.trim()} bind:value={form.city} autocomplete="address-level2" />
			</label>
			<label class="ac-field">District (Kecamatan)
				<input class="ac-input" bind:value={form.district} />
			</label>
			<label class="ac-field">Subdistrict (Kelurahan)
				<input class="ac-input" bind:value={form.subdistrict} />
			</label>
		</div>

		<label class="ac-field" style="max-width: 220px">Postal code *
			<input class="ac-input" class:bad={touched && !form.postal.trim()} bind:value={form.postal} inputmode="numeric" autocomplete="postal-code" />
		</label>

		<label class="ac-check"><input type="checkbox" bind:checked={form.isDefault} /> Use as my default address</label>

		{#if error}<div class="ac-alert" role="alert">{error}</div>{/if}
	</form>

	{#snippet footer()}
		<span class="need">{touched && missing.length ? `Still needed: ${missing.join(', ')}.` : ''}</span>
		<span class="ac-actions">
			<button type="button" class="ac-btn ghost" onclick={onclose}>Cancel</button>
			<button type="submit" form="addr-form" class="ac-btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
		</span>
	{/snippet}
</Modal>
