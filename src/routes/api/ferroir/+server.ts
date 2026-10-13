import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Proxy aman ke API alat Ferroir. Kunci API dan alamatnya hanya ada di server (env privat),
// dan hanya akun admin Firebase yang boleh memanggilnya.
//
// Env (set di .env lokal dan di Vercel):
//   FERROIR_API_URL  alamat endpoint Ferroir (isi "mock" untuk data contoh saat uji coba)
//   FERROIR_API_KEY  kunci API Ferroir (opsional, dikirim sebagai "Authorization: Bearer …")
//   ADMIN_EMAILS     email admin yang diizinkan, pisahkan dengan koma

const FIELDS = [
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

const snake = (k: string) => k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());

// Terima respons berbentuk { lotNumber: … } maupun { lot_number: … }, langsung atau di dalam "data".
function normalize(raw: unknown): Record<string, string> {
	const root = (raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}) as Record<string, unknown>;
	const src = (root.data && typeof root.data === 'object' ? root.data : root) as Record<string, unknown>;
	const out: Record<string, string> = {};
	for (const k of FIELDS) {
		const v = src[k] ?? src[snake(k)];
		if (v !== undefined && v !== null && String(v).trim() !== '') out[k] = String(v).trim();
	}
	return out;
}

async function adminEmailFromToken(idToken: string): Promise<string | null> {
	const key = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
	if (!key) return null;
	const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ idToken })
	});
	if (!res.ok) return null;
	const body = (await res.json()) as { users?: { email?: string }[] };
	return body.users?.[0]?.email?.toLowerCase() ?? null;
}

export const POST: RequestHandler = async ({ request }) => {
	const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
	const email = token ? await adminEmailFromToken(token) : null;
	const admins = (env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	if (!email || !admins.includes(email)) return json({ error: 'forbidden' }, { status: 403 });

	const base = env.FERROIR_API_URL;
	if (!base) return json({ error: 'not_configured' }, { status: 501 });

	const body = (await request.json().catch(() => ({}))) as { email?: string; batch?: string };
	const buyer = (body.email ?? '').trim().toLowerCase();
	if (!buyer) return json({ error: 'email_required' }, { status: 400 });

	if (base === 'mock') {
		return json({
			data: {
				lotNumber: 'AGP-001-2026',
				species: 'Liberica',
				altitude: '800 MDPL',
				farm: 'Wandhe Family Estate',
				farmLocation: 'Wonosalam',
				processor: 'Boemi Lanjoet Coffee Processor',
				processorLocation: 'Malang',
				origin: 'Wonosalam',
				originCountry: 'Indonesia'
			}
		});
	}

	try {
		const url = new URL(base);
		url.searchParams.set('email', buyer);
		if (body.batch) url.searchParams.set('batch', body.batch);
		const res = await fetch(url, {
			headers: {
				Accept: 'application/json',
				...(env.FERROIR_API_KEY ? { Authorization: `Bearer ${env.FERROIR_API_KEY}` } : {})
			}
		});
		if (res.status === 404) return json({ data: {} });
		if (!res.ok) return json({ error: 'upstream_error', status: res.status }, { status: 502 });
		return json({ data: normalize(await res.json()) });
	} catch {
		return json({ error: 'upstream_unreachable' }, { status: 502 });
	}
};
