<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/testimonials', { replaceState: true });
	});
</script>

<div style="min-height: 60vh; display: grid; place-items: center; color: #849962;">
	<p>Mengalihkan ke halaman Testimonials…</p>
</div>
