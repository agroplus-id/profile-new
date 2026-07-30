import header from '$lib/assets/images/desktop 13/header.svg';
import coffeePhoto from '$lib/assets/images/desktop 13/kopi.svg';
import passportGraphic from '$lib/assets/images/desktop 13/passport.svg';
import lavender from '$lib/assets/images/desktop 13/lavender.svg';
import strawberry from '$lib/assets/images/desktop 13/strawbery.svg';
import mango from '$lib/assets/images/desktop 13/mango.svg';
import stevia from '$lib/assets/images/desktop 13/stevia.svg';
import brewing from '$lib/assets/images/desktop 13/brewing.svg';

export const bumiKopiImages = {
	header,
	coffeePhoto,
	passportGraphic,
	brewing
};

export const flavorNotes = [
	{ name: 'Lavender', image: lavender },
	{ name: 'Strawberry', image: strawberry },
	{ name: 'Mango', image: mango },
	{ name: 'Stevia', image: stevia }
];

export const productionChainSteps = [
	{
		id: 'harvest',
		name: 'Harvest',
		description:
			'Harvest began on 17 June 2026 at 8:00 AM (GMT+7) in the highlands of Wonosalam, East Java. Only fully ripe Liberica cherries were selectively hand-picked before being transported directly to the processing station. Within one hour, the cherries entered fermentation, minimizing uncontrolled microbial activity and preserving the fruit at its freshest state. This short harvest-to-process window establishes the foundation for a clean, well-controlled fermentation and a more transparent expression of origin.'
	},
	{
		id: 'ferment',
		name: 'Ferment',
		description:
			"This Liberica lot was fermented using a selected Pichia culture, a non-Saccharomyces yeast chosen to enhance aromatic complexity while preserving the coffee's natural character. The cherries were fermented in a sealed vessel for 72 hours at 24°C, allowing controlled microbial activity to gradually transform fruit sugars into aromatic compounds. This slow, balanced process promotes a cleaner cup, refined sweetness, and a soft mouthfeel while preserving the distinctive identity of Liberica."
	},
	{
		id: 'drying',
		name: 'Drying',
		description:
			"Following fermentation, the coffee was transferred to Malang, East Java, where it was sun-dried on raised trays for approximately seven days under average daytime temperatures of 27°C. The beans were turned regularly to ensure even drying and prevent uneven moisture migration until reaching a final moisture content of 10%. This slow dehydration helps preserve the coffee's stability, clarity, and overall cup quality."
	},
	{
		id: 'roasting',
		name: 'Roasting',
		description:
			"The coffee was roasted to a light roast profile, carefully developed to preserve the unique characteristics shaped throughout cultivation and processing. By ending the roast before deeper caramelization occurs, the profile highlights the coffee's natural sweetness, vibrant acidity, and delicate aromatics while allowing the identity of this Wonosalam Liberica to remain clearly expressed in every cup."
	}
];
