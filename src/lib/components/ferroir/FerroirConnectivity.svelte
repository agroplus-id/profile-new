<script lang="ts">
	import DigitalConnectivity from '../DigitalConnectivity.svelte';
	import phone from '$lib/assets/images/desktop 9/digital.svg';

	const items = [
		{ key: 'controlled-fermentation', label: 'Controlled Fermentation' },
		{ key: 'remote-monitoring', label: 'Remote Monitoring' },
		{ key: 'batch-logging', label: 'Batch Logging' },
		{ key: 'recipe-management', label: 'Recipe Management' },
		{ key: 'product-passport', label: 'Product Passport' }
	];
</script>

<DigitalConnectivity product="ferroir" fallback={phone} {items} />
