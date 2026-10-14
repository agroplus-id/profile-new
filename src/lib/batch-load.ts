import { doc, getDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { withDefaults, type Batch } from '$lib/batch';
import { fetchImages, imageKeys } from '$lib/batch-images';

// Muat satu batch dari Firestore beserta gambarnya. Mengembalikan null bila batch tidak ada.
export async function loadBatch(id: string): Promise<{ batch: Batch; images: Record<string, string> } | null> {
	const snap = await getDoc(doc(db, 'batches', id));
	if (!snap.exists()) return null;
	const batch = withDefaults(snap.data() as Partial<Batch>);
	const images = await fetchImages(id, imageKeys(batch.placePhotos?.length ?? 0, batch.steps.length));
	return { batch, images };
}

// Batch yang ditampilkan di halaman /bumi-kopi (dipilih admin), disimpan di settings/featured.
export async function featuredBatchId(): Promise<string | null> {
	const snap = await getDoc(doc(db, 'settings', 'featured'));
	return snap.exists() ? ((snap.data().batchId as string) || null) : null;
}
