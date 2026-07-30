import nutrient from '$lib/assets/images/desktop 11/nutrient.svg';
import recognize from '$lib/assets/images/desktop 11/recognize.svg';
import mapped from '$lib/assets/images/desktop 11/mapped.svg';
import recorded from '$lib/assets/images/desktop 11/recorded.svg';
import verified from '$lib/assets/images/desktop 11/verified.svg';

export const agroCaptureFeatures = [
	{
		label: 'Nutrient-Aware',
		title: 'Know what your soil is saying.',
		text: 'AgroCapture reads nutrient levels across your coffee fields, giving you clear, actionable data so you can make smarter decisions about soil health and crop yield.',
		image: nutrient
	},
	{
		label: 'Recognized',
		title: 'Identify crops with confidence.',
		text: 'Powered by image recognition, AgroCapture identifies coffee plant conditions, diseases, and growth stages — so nothing on your farm goes unnoticed.',
		image: recognize
	},
	{
		label: 'Mapped',
		title: 'Every field, perfectly charted.',
		text: 'Create detailed digital maps of your entire farm. Track field boundaries, plot health zones, and plan your harvest with spatial precision built for agriculture.',
		image: mapped
	},
	{
		label: 'Recorded',
		title: 'A log for every harvest.',
		text: 'Automatically record crop data, timestamps, and field notes in one place. Your harvest history, always organized and ready to review.',
		image: recorded
	},
	{
		label: 'Verified',
		title: 'Trust every data point.',
		text: 'AgroCapture cross-validates field data against multiple sources, ensuring the information you act on is accurate, consistent, and reliable.',
		image: verified
	}
];

export const agroCaptureSpecs = [
	['Product', 'AgroCapture'],
	['Status', 'Launching 2026'],
	['Device Support', 'iOS & Android'],
	['Data Sync', 'Real-time Cloud'],
	['Field Mapping', 'GPS-enabled'],
	['Analysis', 'AI-powered']
];
