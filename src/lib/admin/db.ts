import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc
} from 'firebase/firestore';
import { db } from '$lib/firebase';

// Helper CRUD tipis di atas Firestore, dipakai semua halaman admin.

export async function listAll<T extends object>(col: string): Promise<(T & { id: string })[]> {
	const snap = await getDocs(collection(db, col));
	return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
}

export const createDoc = (col: string, data: object) => addDoc(collection(db, col), data);
export const createDocWithId = (col: string, id: string, data: object) =>
	setDoc(doc(db, col, id), data);
export const patchDoc = (col: string, id: string, data: object) =>
	updateDoc(doc(db, col, id), data as Record<string, unknown>);
export const removeDoc = (col: string, id: string) => deleteDoc(doc(db, col, id));

export async function readDoc<T extends object>(col: string, id: string): Promise<T | null> {
	const snap = await getDoc(doc(db, col, id));
	return snap.exists() ? (snap.data() as T) : null;
}

export const writeDoc = (col: string, id: string, data: object) =>
	setDoc(doc(db, col, id), data, { merge: true });

export function formatDate(iso: string | undefined): string {
	if (!iso) return '';
	const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
	return isNaN(d.getTime())
		? iso
		: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
