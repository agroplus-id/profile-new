<script lang="ts">
	import DigitalConnectivity from '../DigitalConnectivity.svelte';
	import connectivity from '$lib/assets/images/desktop10/connectivity.svg';

	const items = [
		{ key: 'remote-monitoring', label: 'Remote Monitoring' },
		{ key: 'batch-logging', label: 'Batch Logging' },
		{ key: 'recipe-management', label: 'Recipe Management' },
		{ key: 'product-passport', label: 'Product Passport' }
	];
</script>

<DigitalConnectivity product="fermego" fallback={connectivity} {items} />
