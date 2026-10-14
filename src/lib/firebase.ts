import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Semua konfigurasi dibaca dari env, ganti nilainya di .env (lokal) / Vercel (produksi).
// Nilai VITE_* ditanam saat build, jadi setelah mengubahnya di Vercel perlu redeploy.
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase hanya dipakai di browser (semua pemanggilnya berjalan di onMount / handler klik). Di server (SSR) tidak
// diinisialisasi, supaya halaman tetap bisa dirender walau variabel env belum diisi — sebelumnya getAuth() melempar
// "auth/invalid-api-key" saat modul dimuat dan seluruh halaman jadi 500.
let app: FirebaseApp | undefined;
if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
	app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} else if (typeof window !== 'undefined') {
	console.error('Konfigurasi Firebase kosong: isi VITE_FIREBASE_* di environment lalu build ulang.');
}

export const db = (app ? getFirestore(app) : undefined) as unknown as Firestore;
export const auth = (app ? getAuth(app) : undefined) as unknown as Auth;
