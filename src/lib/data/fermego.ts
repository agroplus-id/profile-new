import simple from '$lib/assets/images/desktop10/simple.svg';
import flexible from '$lib/assets/images/desktop10/flexible.svg';
import connected from '$lib/assets/images/desktop10/connected.svg';
import aware from '$lib/assets/images/desktop10/aware.svg';

export const fermegoFeatures = [
	{
		label: 'Simple',
		title: 'Less setup. More fermentation.',
		text: 'Designed with simplicity at its core, Fermego minimises sensor calibration and setup, so you can focus on fermentation, not configuration.',
		image: simple
	},
	{
		label: 'Flexible',
		title: 'One kit. Multiple batches.',
		text: 'A compact monitor kit that\'s easy to install, remove, store, and move between conventional fermentation tanks.',
		image: flexible
	},
	{
		label: 'Connected',
		title: 'Every batch, always within reach.',
		text: 'Monitor essential fermentation parameters remotely through web and mobile, wherever your coffee is being processed.',
		image: connected
	},
	{
		label: 'Aware',
		title: 'It tells you when something changes.',
		text: 'Receive instant notifications when fermentation is complete or when critical conditions, such as pH or temperature, move beyond the desired range.',
		image: aware
	}
];

export const fermegoSpecs = [
	['Monitor', '30 printed AA'],
	['Dimension', '12 x 10 x 5 cm'],
	['Power', '5 V'],
	['Connectivity', 'Bluetooth & WiFi'],
	['Sensor Width', '60 CM'],
	['Mass', '1 KG']
];
