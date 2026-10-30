import { collection, doc, documentId, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
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

// Cari batch dari kode kemasan (mis. AGP-KAE-15102026-R005). ID batch = kode kemasan pertamanya,
// jadi batch pemilik adalah ID terbesar dengan awalan sama yang <= kode ini, dan kode harus masih dalam rentang totalItems.
export async function resolvePackage(rawCode: string): Promise<{ batchId: string; itemNumber: number } | null> {
	const code = rawCode.trim().toUpperCase();
	const m = code.match(/^(.*-[A-Z])(\d+)$/);
	if (!m) return null;
	const [, prefix, digits] = m;
	const n = Number(digits);
	const snap = await getDocs(
		query(collection(db, 'batches'), where(documentId(), '>=', prefix + '0'.repeat(digits.length)), where(documentId(), '<=', code), orderBy(documentId(), 'desc'), limit(1))
	);
	const hit = snap.docs[0];
	if (!hit) return null;
	const start = Number(hit.id.slice(prefix.length));
	const total = Math.max(1, Number((hit.data() as { totalItems?: number }).totalItems ?? 1));
	if (!Number.isFinite(start) || n < start || n >= start + total) return null;
	return { batchId: hit.id, itemNumber: n - start + 1 };
}

// Batch yang ditampilkan di halaman /bumi-kopi (dipilih admin), disimpan di settings/featured.
export async function featuredBatchId(): Promise<string | null> {
	const snap = await getDoc(doc(db, 'settings', 'featured'));
	return snap.exists() ? ((snap.data().batchId as string) || null) : null;
}
