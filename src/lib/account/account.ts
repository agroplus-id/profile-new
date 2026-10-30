import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	query,
	setDoc,
	updateDoc,
	where
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { Order } from '$lib/admin/orders';

// Akun pelanggan: dokumen users/<uid> dan subkoleksi users/<uid>/addresses/<id>.

export interface Profile {
	email: string;
	emailVerified: boolean;
	firstName: string;
	lastName: string;
	phone: string; // digit lengkap dengan kode negara, mis. 6282232709316
	onboarded: boolean;
	termsAcceptedAt: string;
	createdAt: string;
	notify: { updates: boolean; orders: boolean };
}

export interface Address {
	label: string;
	recipient: string;
	phone: string;
	line1: string;
	line2: string;
	place: string;
	province: string;
	city: string;
	district: string;
	subdistrict: string;
	postal: string;
	lat: number | null;
	lng: number | null;
	isDefault: boolean;
}

export const DEFAULT_NOTIFY = { updates: true, orders: true };

export const COUNTRIES = [
	{ code: 'ID', dial: '62', name: 'Indonesia' },
	{ code: 'MY', dial: '60', name: 'Malaysia' },
	{ code: 'SG', dial: '65', name: 'Singapore' },
	{ code: 'AU', dial: '61', name: 'Australia' },
	{ code: 'JP', dial: '81', name: 'Japan' },
	{ code: 'GB', dial: '44', name: 'United Kingdom' },
	{ code: 'US', dial: '1', name: 'United States' }
] as const;

export function splitName(full: string | null | undefined): { first: string; last: string } {
	const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return { first: '', last: '' };
	return { first: parts[0], last: parts.slice(1).join(' ') };
}

// Susun nomor telepon: "0822…" + negara ID → "62822…"
export function buildPhone(dial: string, local: string): string {
	const digits = local.replace(/\D/g, '').replace(/^0+/, '');
	return digits ? dial + digits : '';
}

// Pecah kembali nomor tersimpan menjadi kode negara + nomor lokal.
export function parsePhone(full: string): { dial: string; local: string } {
	const digits = (full ?? '').replace(/\D/g, '');
	const c = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((x) => digits.startsWith(x.dial));
	return c ? { dial: c.dial, local: digits.slice(c.dial.length) } : { dial: '62', local: digits };
}

export function formatPhone(full: string): string {
	if (!full) return '';
	const { dial, local } = parsePhone(full);
	return `+${dial} ${local.replace(/(\d{3,4})(?=\d)/g, '$1 ').trim()}`;
}

export const displayName = (p: Pick<Profile, 'firstName' | 'lastName'> | null | undefined) =>
	[p?.firstName, p?.lastName].filter(Boolean).join(' ');

export const initialsOf = (name: string, email = '') =>
	(name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('') || email.slice(0, 2) || '?').toUpperCase();

export async function loadProfile(uid: string): Promise<Profile | null> {
	const snap = await getDoc(doc(db, 'users', uid));
	if (!snap.exists()) return null;
	const d = snap.data() as Partial<Profile>;
	return {
		email: d.email ?? '',
		emailVerified: !!d.emailVerified,
		firstName: d.firstName ?? '',
		lastName: d.lastName ?? '',
		phone: d.phone ?? '',
		onboarded: !!d.onboarded,
		termsAcceptedAt: d.termsAcceptedAt ?? '',
		createdAt: d.createdAt ?? '',
		notify: { ...DEFAULT_NOTIFY, ...(d.notify ?? {}) }
	};
}

// Buat/ubah sebagian isi profil. createdAt hanya diisi saat dokumen pertama kali dibuat.
export async function saveProfile(uid: string, data: Partial<Profile>) {
	const ref = doc(db, 'users', uid);
	const exists = (await getDoc(ref)).exists();
	if (exists) await updateDoc(ref, data as Record<string, unknown>);
	else await setDoc(ref, { notify: DEFAULT_NOTIFY, createdAt: new Date().toISOString(), ...data });
}

export async function listAddresses(uid: string): Promise<(Address & { id: string })[]> {
	const snap = await getDocs(collection(db, 'users', uid, 'addresses'));
	const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Address) }));
	return rows.sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.label.localeCompare(b.label));
}

// Simpan alamat; bila ditandai utama, alamat lain otomatis tidak lagi utama.
export async function saveAddress(uid: string, id: string | null, a: Address, others: { id: string; isDefault: boolean }[]) {
	const col = collection(db, 'users', uid, 'addresses');
	let savedId = id;
	if (id) await setDoc(doc(col, id), a);
	else savedId = (await addDoc(col, a)).id;
	if (a.isDefault) {
		for (const o of others) if (o.id !== savedId && o.isDefault) await updateDoc(doc(col, o.id), { isDefault: false });
	}
}

export const removeAddress = (uid: string, id: string) => deleteDoc(doc(db, 'users', uid, 'addresses', id));

export async function setDefaultAddress(uid: string, id: string, all: { id: string; isDefault: boolean }[]) {
	const col = collection(db, 'users', uid, 'addresses');
	await updateDoc(doc(col, id), { isDefault: true });
	for (const o of all) if (o.id !== id && o.isDefault) await updateDoc(doc(col, o.id), { isDefault: false });
}

// Pesanan CoffeeID milik pelanggan, dicocokkan lewat email akun (harus sudah terverifikasi — dijaga di rules).
export async function listMyOrders(email: string): Promise<(Order & { id: string })[]> {
	const snap = await getDocs(query(collection(db, 'orders'), where('email', '==', email.trim().toLowerCase())));
	return snap.docs
		.map((d) => ({ id: d.id, ...(d.data() as Order) }))
		.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

export const blankAddress = (recipient = '', phone = ''): Address => ({
	label: '',
	recipient,
	phone,
	line1: '',
	line2: '',
	place: '',
	province: '',
	city: '',
	district: '',
	subdistrict: '',
	postal: '',
	lat: null,
	lng: null,
	isDefault: false
});
