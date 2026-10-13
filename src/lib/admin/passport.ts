import { doc, runTransaction } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { auth } from '$lib/firebase';
import type { FerroirData } from '$lib/batch';

// Nomor paspor berurutan dan tidak pernah dipakai dua kali: penghitung di Firestore (counters/passport)
// dinaikkan lewat transaksi, jadi dua admin yang menyimpan bersamaan pun tidak akan mendapat nomor sama.
// Nomor tidak dipakai ulang walau batch dihapus. Format: AP-<2 digit tahun>-<7 digit urut>.
export async function nextPassportNumber(): Promise<string> {
	const ref = doc(db, 'counters', 'passport');
	const n = await runTransaction(db, async (tx) => {
		const snap = await tx.get(ref);
		const next = ((snap.exists() ? (snap.data().last as number) : 0) || 0) + 1;
		tx.set(ref, { last: next });
		return next;
	});
	const yy = String(new Date().getFullYear()).slice(-2);
	return `AP-${yy}-${String(n).padStart(7, '0')}`;
}

export type FerroirResult =
	| { ok: true; data: FerroirData }
	| { ok: false; reason: 'not_configured' | 'forbidden' | 'error'; message: string };

// Ambil data paspor dari API alat Ferroir lewat proxy server (/api/ferroir).
export async function importFromFerroir(email: string, batch: string): Promise<FerroirResult> {
	const user = auth.currentUser;
	if (!user) return { ok: false, reason: 'forbidden', message: 'Belum login' };
	try {
		const res = await fetch('/api/ferroir', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${await user.getIdToken()}`
			},
			body: JSON.stringify({ email, batch })
		});
		const body = await res.json().catch(() => ({}));
		if (res.status === 501) {
			return { ok: false, reason: 'not_configured', message: 'API Ferroir belum dikonfigurasi di server (FERROIR_API_URL).' };
		}
		if (res.status === 403) {
			return { ok: false, reason: 'forbidden', message: 'Akun ini belum terdaftar di ADMIN_EMAILS server.' };
		}
		if (!res.ok) return { ok: false, reason: 'error', message: `API Ferroir bermasalah (${body.error ?? res.status}).` };
		return { ok: true, data: (body.data ?? {}) as FerroirData };
	} catch {
		return { ok: false, reason: 'error', message: 'Tidak bisa menghubungi server.' };
	}
}
