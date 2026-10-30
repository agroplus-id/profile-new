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

// Hanya email di ADMIN_EMAILS (dan sudah terverifikasi) yang dianggap admin.
export async function adminFromRequest(request: Request): Promise<string | null> {
	const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
	const who = await emailFromToken(token);
	const admins = (env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	return who && who.verified && admins.includes(who.email) ? who.email : null;
}
