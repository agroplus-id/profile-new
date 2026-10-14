import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';

// Gambar batch disimpan di dokumen terpisah (koleksi "batchImages", ID = <kode batch>__<kunci>) agar
// tiap gambar punya batas 1 MB sendiri dan dokumen batch tetap kecil.
// Kunci: hero, why, passport, place_0, place_1, …, step_0, step_1, … (gambar tiap fase rantai produksi)
const col = 'batchImages';
const idOf = (batchId: string, key: string) => `${batchId}__${key}`;

export async function fetchImages(batchId: string, keys: string[]): Promise<Record<string, string>> {
	const out: Record<string, string> = {};
	await Promise.all(
		keys.map(async (k) => {
			try {
				const snap = await getDoc(doc(db, col, idOf(batchId, k)));
				const data = snap.exists() ? (snap.data().data as string) : '';
				if (data) out[k] = data;
			} catch {
				/* gambar opsional: abaikan bila gagal */
			}
		})
	);
	return out;
}

export const saveImage = (batchId: string, key: string, data: string) =>
	setDoc(doc(db, col, idOf(batchId, key)), { data });

export const deleteImage = (batchId: string, key: string) => deleteDoc(doc(db, col, idOf(batchId, key)));

// Kunci yang perlu dimuat untuk satu batch.
export const imageKeys = (placeCount: number, stepCount = 0) => [
	'hero',
	'why',
	'passport',
	...Array.from({ length: placeCount }, (_, i) => `place_${i}`),
	...Array.from({ length: stepCount }, (_, i) => `step_${i}`)
];
