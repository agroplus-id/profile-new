import {
	EmailAuthProvider,
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	deleteUser,
	linkWithCredential,
	onAuthStateChanged,
	reauthenticateWithCredential,
	reauthenticateWithPopup,
	sendEmailVerification,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	updatePassword,
	type User
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { auth, db } from '$lib/firebase';
import { loadProfile, saveProfile, type Profile } from './account';

// Sesi pelanggan di sisi browser: pengguna Firebase + profilnya di Firestore.
export const session = $state<{ user: User | null; profile: Profile | null; ready: boolean }>({
	user: null,
	profile: null,
	ready: false
});

let started = false;

export function startSession() {
	if (started) return;
	if (!auth) {
		session.ready = true;
		return;
	}
	started = true;
	onAuthStateChanged(auth, async (u) => {
		session.user = u;
		session.profile = null;
		if (u) {
			try {
				session.profile = await loadProfile(u.uid);
				// Status verifikasi email dicatat di profil agar admin tahu siapa yang boleh dikirimi email.
				if (session.profile && session.profile.emailVerified !== u.emailVerified) {
					await saveProfile(u.uid, { emailVerified: u.emailVerified });
					session.profile.emailVerified = u.emailVerified;
				}
			} catch (err) {
				console.warn('Gagal memuat profil', err);
			}
		}
		session.ready = true;
	});
}

export async function refreshProfile() {
	if (!session.user) return null;
	session.profile = await loadProfile(session.user.uid);
	return session.profile;
}

// Tunggu sampai status login pertama kali diketahui.
export function whenReady(): Promise<void> {
	if (session.ready) return Promise.resolve();
	return new Promise((resolve) => {
		const t = setInterval(() => {
			if (session.ready) {
				clearInterval(t);
				resolve();
			}
		}, 40);
	});
}

const google = () => {
	const p = new GoogleAuthProvider();
	p.setCustomParameters({ prompt: 'select_account' });
	return p;
};

export const signInGoogle = () => signInWithPopup(auth, google());

export const signInEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email.trim(), password);

export async function signUpEmail(email: string, password: string) {
	const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
	// Email konfirmasi dikirim otomatis; gagal kirim tidak boleh menggagalkan pendaftaran.
	sendEmailVerification(cred.user).catch(() => {});
	return cred;
}

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email.trim());

export const resendVerification = () => sendEmailVerification(auth.currentUser as User);

export async function logout() {
	await signOut(auth);
	session.user = null;
	session.profile = null;
}

export const providersOf = (u: User | null) => (u?.providerData ?? []).map((p) => p.providerId);

// Aksi sensitif (ganti sandi, hapus akun) meminta login ulang bila sesi sudah lama.
export async function reauthenticate(passwordProvider: () => Promise<string | null>): Promise<boolean> {
	const u = auth.currentUser as User;
	if (providersOf(u).includes('google.com')) {
		await reauthenticateWithPopup(u, google());
		return true;
	}
	const pw = await passwordProvider();
	if (!pw) return false;
	await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email as string, pw));
	return true;
}

export async function setOrChangePassword(newPassword: string) {
	const u = auth.currentUser as User;
	if (providersOf(u).includes('password')) await updatePassword(u, newPassword);
	else await linkWithCredential(u, EmailAuthProvider.credential(u.email as string, newPassword));
}

// Hapus seluruh data pelanggan lalu akunnya.
export async function deleteAccount() {
	const u = auth.currentUser as User;
	const addrs = await getDocs(collection(db, 'users', u.uid, 'addresses'));
	for (const a of addrs.docs) await deleteDoc(a.ref);
	await deleteDoc(doc(db, 'users', u.uid));
	await deleteUser(u);
	session.user = null;
	session.profile = null;
}

const MESSAGES: Record<string, string> = {
	'auth/invalid-credential': 'Email or password is incorrect.',
	'auth/wrong-password': 'Email or password is incorrect.',
	'auth/user-not-found': 'Email or password is incorrect.',
	'auth/invalid-email': 'That email address does not look right.',
	'auth/email-already-in-use': 'This email already has an account. Try signing in instead.',
	'auth/weak-password': 'Use at least 8 characters for your password.',
	'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
	'auth/popup-closed-by-user': 'The Google window was closed before finishing.',
	'auth/cancelled-popup-request': 'The Google window was closed before finishing.',
	'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups and try again.',
	'auth/network-request-failed': 'Network problem. Check your connection and try again.',
	'auth/unauthorized-domain': 'This website address is not authorised for sign-in yet.',
	'auth/operation-not-allowed': 'This sign-in method is not enabled yet.',
	'auth/requires-recent-login': 'For your security, please sign in again and retry.',
	'auth/credential-already-in-use': 'That sign-in method is already linked to another account.'
};

export function authMessage(err: unknown): string {
	const code = (err as { code?: string })?.code ?? '';
	return MESSAGES[code] ?? 'Something went wrong. Please try again.';
}

export const safeNext = (raw: string | null | undefined, fallback = '/account') =>
	raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : fallback;
