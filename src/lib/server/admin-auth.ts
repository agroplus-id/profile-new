import { env } from '$env/dynamic/private';

// Email pemilik token Firebase (diverifikasi ke Google), atau null bila token tidak sah.
export async function emailFromToken(idToken: string): Promise<{ email: string; verified: boolean } | null> {
	const key = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
	if (!key || !idToken) return null;
	const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ idToken })
	});
	if (!res.ok) return null;
	const body = (await res.json()) as { users?: { email?: string; emailVerified?: boolean }[] };
	const u = body.users?.[0];
	return u?.email ? { email: u.email.toLowerCase(), verified: !!u.emailVerified } : null;
}

export type AdminCheck = { ok: true; email: string } | { ok: false; reason: 'no_token' | 'bad_token' | 'admin_emails_not_set' | 'not_in_admin_emails' | 'email_not_verified' };

// Hanya email di ADMIN_EMAILS (dan sudah terverifikasi) yang dianggap admin. Alasan penolakan dikembalikan
// supaya admin yang sah tahu apa yang perlu dibetulkan.
export async function checkAdmin(request: Request): Promise<AdminCheck> {
	const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
	if (!token) return { ok: false, reason: 'no_token' };
	const who = await emailFromToken(token);
	if (!who) return { ok: false, reason: 'bad_token' };
	const admins = (env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	if (!admins.length) return { ok: false, reason: 'admin_emails_not_set' };
	if (!admins.includes(who.email)) return { ok: false, reason: 'not_in_admin_emails' };
	if (!who.verified) return { ok: false, reason: 'email_not_verified' };
	return { ok: true, email: who.email };
}

export async function adminFromRequest(request: Request): Promise<string | null> {
	const r = await checkAdmin(request);
	return r.ok ? r.email : null;
}
