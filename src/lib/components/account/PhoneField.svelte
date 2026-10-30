<script lang="ts">
	import { COUNTRIES } from '$lib/account/account';

	let {
		dial = $bindable('62'),
		local = $bindable(''),
		id,
		invalid = false,
		placeholder = '812 345 678'
	}: { dial?: string; local?: string; id?: string; invalid?: boolean; placeholder?: string } = $props();
</script>

<div class="ac-phone">
	<select class="ac-input" bind:value={dial} aria-label="Country code">
		{#each COUNTRIES as c}
			<option value={c.dial}>{c.code} +{c.dial}</option>
		{/each}
	</select>
	<input {id} class="ac-input" class:bad={invalid} type="tel" inputmode="tel" autocomplete="tel-national" bind:value={local} {placeholder} />
</div>
