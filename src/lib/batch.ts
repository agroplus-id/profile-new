import { flavorNotes, productionChainSteps } from '$lib/data/bumikopi';

// Data satu batch kopi yang dilihat pelanggan setelah verifikasi CoffeeID.
// Disimpan di Firestore koleksi "batches" (ID dokumen = kode batch), diisi lewat dashboard admin.
export interface Store {
	name: string;
	url: string;
}

// Tebak nama toko dari alamatnya (dipakai untuk batch lama yang hanya punya satu link toko).
export function guessStoreName(url: string): string {
	const u = url.toLowerCase();
	if (u.includes('tokopedia')) return 'Tokopedia';
	if (u.includes('shopee')) return 'Shopee';
	if (u.includes('lazada')) return 'Lazada';
	if (u.includes('tiktok')) return 'TikTok Shop';
	if (u.includes('blibli')) return 'Blibli';
	return 'Toko online';
}

export interface Batch {
	productName: string;
	// Lokasi asal untuk peta interaktif (kosong = peta tidak tampil)
	mapLat?: number | null;
	mapLng?: number | null;
	mapPlace?: string;
	mapNote?: string;
	placePhotos?: { caption: string }[]; // gambarnya disimpan terpisah di batchImages (kunci place_0, place_1, …)
	whyImage?: string; // foto di bagian "Why we choose this coffee" (data URL); kosong = foto bawaan
	heroImage?: string; // foto utama di bagian atas halaman (data URL); kosong = gambar bawaan
	story: string;
	whyText: string;
	passportNumber: string;
	species: string;
	farm: string;
	farmLocation: string;
	processor: string;
	processorLocation: string;
	origin: string;
	originCountry: string;
	lotNumber: string;
	altitude: string;
	steps: { name: string; description: string }[];
	flavors: string[]; // kunci dari FLAVOR_OPTIONS
	weightGram: number;
	totalGram: number;
	totalItems: number;
	stores: Store[]; // toko online tempat pelanggan bisa memesan
}

export const FLAVOR_OPTIONS = flavorNotes.map((f) => ({
	key: f.name.toLowerCase(),
	name: f.name,
	image: f.image
}));

// Nilai awal = isi halaman Bumi Kopi yang sekarang; dipakai juga sebagai cadangan kolom kosong.
export const DEFAULT_BATCH: Batch = {
	productName: 'Bumi Kopi',
	story:
		'Long before it reaches your cup, this Liberica coffee begins in the volcanic highlands of Wonosalam, East Java. Since the Dutch colonial era, generations of local growers have preserved its legacy. Today, through curiosity and innovation, they continue uncovering new expressions of Liberica while honoring the character that has defined it for generations.',
	whyText:
		'We chose to verify this Liberica because its value extends far beyond the cup. Its history, origin, and the generations of growers who have preserved it deserve more than recognition, they deserve a permanent record. Verification helps ensure that every bottle carries the authentic identity of Wonosalam Liberica.',
	passportNumber: 'AP-26-0001867',
	species: 'Liberica',
	farm: 'Wandhe Family Estate',
	farmLocation: 'Wonosalam',
	processor: 'Boemi Lanjoet Coffee Processor',
	processorLocation: 'Malang',
	origin: 'Wonosalam',
	originCountry: 'Indonesia',
	lotNumber: 'AGP-001-2026',
	altitude: '800 MDPL',
	steps: productionChainSteps.map((s) => ({ name: s.name, description: s.description })),
	flavors: FLAVOR_OPTIONS.map((f) => f.key),
	weightGram: 150,
	totalGram: 4500,
	totalItems: 30,
	stores: [{ name: 'Tokopedia', url: 'https://tokopedia.com' }],
	mapLat: -7.6,
	mapLng: 112.35,
	mapPlace: 'Wonosalam, Jombang, Jawa Timur',
	mapNote: 'Dataran tinggi vulkanik tempat kopi Liberica ini tumbuh.',
	placePhotos: []
};

// Kolom paspor yang diisi otomatis dari data alat Ferroir (bukan dari nilai awal).
export const FERROIR_KEYS = [
	'lotNumber',
	'species',
	'altitude',
	'farm',
	'farmLocation',
	'processor',
	'processorLocation',
	'origin',
	'originCountry'
] as const;
export const PASSPORT_KEYS = ['passportNumber', ...FERROIR_KEYS] as const;
export type FerroirData = Partial<Record<(typeof FERROIR_KEYS)[number], string>>;

// Gabungkan data dari Firestore dengan nilai awal: kolom kosong memakai nilai awal.
// Kecuali kolom paspor pada batch yang nyata: kosong tetap kosong (tidak dipalsukan dengan data contoh).
export function withDefaults(data: Partial<Batch> | null | undefined): Batch {
	const out = { ...DEFAULT_BATCH } as Record<string, unknown>;
	// Batch nyata: kolom paspor dan toko yang kosong tetap kosong (tidak diisi data contoh).
	if (data) {
		for (const k of PASSPORT_KEYS) out[k] = '';
		out.stores = [];
		out.mapLat = null;
		out.mapLng = null;
		out.mapPlace = '';
		out.mapNote = '';
		out.placePhotos = [];
	}
	// Batch lama menyimpan satu link toko (storeUrl); ubah jadi daftar toko.
	const legacy = data as (Partial<Batch> & { storeUrl?: string }) | null | undefined;
	if (legacy?.storeUrl && !legacy.stores?.length) {
		data = { ...legacy, stores: [{ name: guessStoreName(legacy.storeUrl), url: legacy.storeUrl }] };
	}
	for (const [k, v] of Object.entries(data ?? {})) {
		const empty = v === '' || v === undefined || v === null || (Array.isArray(v) && v.length === 0);
		if (!empty) out[k] = v;
	}
	return out as unknown as Batch;
}

// Batch baru di admin: semua isian bawaan kecuali data paspor (diisi dari Ferroir).
export function blankBatch(): Batch {
	const b = structuredClone(DEFAULT_BATCH) as unknown as Record<string, unknown>;
	for (const k of PASSPORT_KEYS) b[k] = '';
	b.stores = [];
	b.mapLat = null;
	b.mapLng = null;
	b.mapPlace = '';
	b.mapNote = '';
	b.placePhotos = [];
	return b as unknown as Batch;
}

export const VERIFIED_KEY = 'coffeeid-verified';
