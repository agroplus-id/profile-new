import { createDoc, createDocWithId, listAll } from '$lib/admin/db';
import { resizeLogo } from '$lib/admin/image';
import { nextPassportNumber } from '$lib/admin/passport';
import { seedFromStatic } from '$lib/team-store';
import { DEFAULT_BATCH } from '$lib/batch';
import { partnerLogos, pressItems, updates as sampleUpdates } from '$lib/data/home';

// Impor data bawaan situs (yang sekarang tertulis di kode) ke Firestore agar bisa diubah dari dashboard.
// Tiap fungsi hanya dipanggil saat koleksinya masih kosong (diatur oleh halaman yang memanggilnya).

export type Progress = (text: string) => void;

export const PARTNER_NAMES = [
	'British Embassy Jakarta',
	'UK International Development',
	'Komdigi',
	'inStellar Impact',
	'1000 Startup Digital',
	'UK Indonesia Tech Hub'
];

export async function seedTeam(progress?: Progress) {
	await seedFromStatic((d, t) => progress?.(`Memproses foto ${d}/${t}…`));
}

export async function seedPress(progress?: Progress) {
	for (let i = 0; i < pressItems.length; i++) {
		progress?.(`Mengimpor ${i + 1}/${pressItems.length}…`);
		await createDoc('press', {
			title: pressItems[i].title,
			quote: pressItems[i].body,
			url: '',
			image: '',
			order: i
		});
	}
}

export async function seedPartners(progress?: Progress) {
	for (let i = 0; i < PARTNER_NAMES.length; i++) {
		progress?.(`Mengimpor logo ${i + 1}/${PARTNER_NAMES.length}…`);
		const blob = await fetch(partnerLogos[i]).then((r) => r.blob());
		await createDoc('partners', { name: PARTNER_NAMES[i], url: '', image: await resizeLogo(blob), order: i });
	}
}

// Berita contoh yang tampil di bagian "Updates" halaman utama (6 kartu, tanggal sama seperti di situs).
const MONTHS: Record<string, string> = { January: '01', February: '02', March: '03', April: '04', May: '05', June: '06', July: '07', August: '08', September: '09', October: '10', November: '11', December: '12' };

function isoFromEnglish(label: string): string {
	const m = label.match(/^(\w+)\s+(\d{1,2}),\s*(\d{4})$/);
	return m && MONTHS[m[1]] ? `${m[3]}-${MONTHS[m[1]]}-${m[2].padStart(2, '0')}` : new Date().toISOString().slice(0, 10);
}

export async function seedUpdates(progress?: Progress) {
	for (let i = 0; i < sampleUpdates.length; i++) {
		progress?.(`Mengimpor berita ${i + 1}/${sampleUpdates.length}…`);
		await createDoc('updates', {
			title: sampleUpdates[i].title,
			category: 'Press Release',
			date: isoFromEnglish(sampleUpdates[i].date),
			summary: '',
			image: '',
			published: true
		});
	}
}

// Batch contoh = isi halaman Bumi Kopi yang sekarang (Liberica, Wonosalam), lengkap dengan data paspor.
export async function seedBatch(progress?: Progress) {
	progress?.('Membuat batch contoh…');
	const id = 'AGP-BMK-17062026-L001';
	const passportNumber = await nextPassportNumber();
	await createDocWithId('batches', id, {
		...structuredClone(DEFAULT_BATCH),
		passportNumber,
		partnerCode: 'BMK',
		releaseDate: '2026-06-17',
		beans: 'L',
		codePrefix: 'AGP-BMK-17062026-L',
		itemStart: 1,
		storeLabel: '',
		storeUrl: ''
	});
	return id;
}

export type SeedCounts = Record<'team' | 'press' | 'partners' | 'updates' | 'batches', number>;

export async function countAll(): Promise<SeedCounts> {
	const count = (col: string) => listAll<object>(col).then((r) => r.length).catch(() => 0);
	const [team, press, partners, updates, batches] = await Promise.all(['team', 'press', 'partners', 'updates', 'batches'].map(count));
	return { team, press, partners, updates, batches };
}
