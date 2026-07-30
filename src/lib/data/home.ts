import agroCaptureTitle from '$lib/assets/images/desktop 11/agro-capture1.svg';
import agroCaptureImage from '$lib/assets/images/i-phone-13-pro0.png';
import fermegoImage from '$lib/assets/images/_8-bcd-8-b-63-7-ad-7-431-c-87-ce-882-a-48-a-88-eee-10.png';
import fermegoTitle from '$lib/assets/images/desktop10/fermego1.svg';
import ferroirImage from '$lib/assets/images/_673257-ea-35-e-3-416-e-ae-0-c-c-4254710-b-3-ca-20.png';
import ferroirTitle from '$lib/assets/images/ferroir-v-20.svg';
import embassyLogo from '$lib/assets/images/kedutaan-besar-inggris-di-jakarta-02-1-10.png';
import instellarLogo from '$lib/assets/images/logo-instellar-impact-20.png';
import partnersLogo from '$lib/assets/images/images-100.png';
import partnerOneLogo from '$lib/assets/images/images-1-30.png';
import partnerTwoLogo from '$lib/assets/images/images-2-30.png';
import techHubLogo from '$lib/assets/images/uk-indonesia-tech-hub-20.png';

export type Product = {
	name: string;
	kicker: string;
	year: string;
	titleSvg: string;
	mainImage: string;
	mainAlt: string;
	tagline: string;
	specs: { label: string; value: string }[];
};

export const products: Product[] = [
	{
		name: 'Ferroir', kicker: 'Ferroir-V2', year: 'Launching 2027', titleSvg: ferroirTitle,
		mainImage: ferroirImage, mainAlt: 'Ferroir fermentation kit',
		tagline: 'The Next-Gen Fermentation Kit for Beginners',
		specs: [
			{ label: 'Capacity', value: '60 Liters' }, { label: 'Energy Consumption', value: '2.3 KWH' },
			{ label: 'Connectivity', value: 'Bluetooth & Wi-Fi' }, { label: 'Pressure Tolerance', value: '35 PSI' },
			{ label: 'Height', value: '120 CM' }, { label: 'Mass', value: '23 KG' }
		]
	},
	{
		name: 'Fermego', kicker: 'Fermego', year: 'Launching 2026', titleSvg: fermegoTitle,
		mainImage: fermegoImage, mainAlt: 'Fermego smart fermentation barrel',
		tagline: 'Smarter Fermentation Starts Here.',
		specs: [
			{ label: 'Material', value: '3D printed ASA' }, { label: 'Dimension', value: '15 x 10 x 5 cm' },
			{ label: 'Energy Consumption', value: '5 V' }, { label: 'Connection', value: 'Bluetooth & Wifi' },
			{ label: 'Sensor Width', value: '60 CM' }, { label: 'Mass', value: '1 KG' }
		]
	},
	{
		name: 'AgroCapture', kicker: 'AgroCapture', year: 'Launching 2026', titleSvg: agroCaptureTitle,
		mainImage: agroCaptureImage, mainAlt: 'AgroCapture mobile app screens',
		tagline: 'Better Coffee Begins with Better Insights.',
		specs: [{ label: 'Device Support', value: 'Ios & Android' }]
	}
];

export const updates = Array.from({ length: 6 }, (_, index) => ({
	title: 'The Next-Gen Fermentation Kit for Beginners',
	date: index < 3 ? 'June 24, 2025' : 'June 26, 2025'
}));

export const pressItems = Array.from({ length: 3 }, () => ({
	title: 'Press Logo',
	body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
}));

export const partnerLogos = [
	embassyLogo, partnersLogo, partnerOneLogo, instellarLogo, partnerTwoLogo, techHubLogo, embassyLogo
];
