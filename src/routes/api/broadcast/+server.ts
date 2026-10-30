import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { checkAdmin } from '$lib/server/admin-auth';

// Kirim pengumuman email ke pelanggan lewat Resend. Hanya admin (ADMIN_EMAILS) yang boleh memanggil.
//
// Env (set di .env lokal dan di Vercel):
//   RESEND_API_KEY  kunci API dari resend.com
//   MAIL_FROM       alamat pengirim dari domain yang sudah diverifikasi, mis. "AgroPlus.ID <info@agroplus.id>"
//   ADMIN_EMAILS    email admin, pisahkan dengan koma

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildHtml(message: string, origin: string, cta?: { label: string; url: string }) {
	const paras = message
		.split(/\n{2,}/)
		.map((p) => `<p style="margin:0 0 16px;line-height:1.7">${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
		.join('');
	const button = cta
		? `<p style="margin:24px 0 8px"><a href="${esc(cta.url)}" style="display:inline-block;padding:14px 28px;border-radius:10px;background:#25330f;color:#ffffff;font-weight:600;text-decoration:none">${esc(cta.label)}</a></p>`
		: '';
	return `<!doctype html><html><body style="margin:0;background:#f0f3f1;font-family:Poppins,Arial,sans-serif;color:#25330f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px">
<tr><td style="padding:28px 32px 0;font-size:20px;font-weight:700;color:#55683d">AgroPlus.ID</td></tr>
<tr><td style="padding:20px 32px 8px;font-size:15px">${paras}${button}</td></tr>
<tr><td style="padding:20px 32px 28px;font-size:12px;line-height:1.6;color:#6b7a5a;border-top:1px solid #e3e8dc">
You are receiving this because you have an AgroPlus.ID account.
<a href="${origin}/account#notifikasi" style="color:#55683d">Manage your email preferences</a>.
</td></tr></table></td></tr></table></body></html>`;
}

export const POST: RequestHandler = async ({ request, url }) => {
	const check = await checkAdmin(request);
	if (!check.ok) return json({ error: 'forbidden', reason: check.reason }, { status: 403 });
	const admin = check.email;

	const key = env.RESEND_API_KEY;
	const from = env.MAIL_FROM;
	if (!key || !from) return json({ error: 'not_configured' }, { status: 501 });

	const body = (await request.json().catch(() => ({}))) as {
		subject?: string;
		message?: string;
		ctaLabel?: string;
		ctaUrl?: string;
		recipients?: string[];
		test?: boolean;
	};
	const subject = (body.subject ?? '').trim();
	const message = (body.message ?? '').trim();
	if (!subject || !message) return json({ error: 'subject_and_message_required' }, { status: 400 });

	let cta: { label: string; url: string } | undefined;
	if (body.ctaLabel?.trim() && body.ctaUrl?.trim()) {
		const raw = body.ctaUrl.trim();
		const abs = raw.startsWith('/') ? url.origin + raw : raw;
		if (!/^https?:\/\//i.test(abs)) return json({ error: 'invalid_link' }, { status: 400 });
		cta = { label: body.ctaLabel.trim(), url: abs };
	}

	const list = body.test ? [admin] : [...new Set((body.recipients ?? []).map((e) => e.trim().toLowerCase()))].filter((e) => EMAIL.test(e));
	if (!list.length) return json({ error: 'no_recipients' }, { status: 400 });
	if (list.length > 2000) return json({ error: 'too_many_recipients' }, { status: 400 });

	const html = buildHtml(message, url.origin, cta);
	const subj = body.test ? `[Test] ${subject}` : subject;
	let sent = 0;
	let failed = 0;
	let lastError = '';

	// Resend menerima maksimal 100 email per permintaan batch; tiap penerima mendapat email sendiri.
	for (let i = 0; i < list.length; i += 100) {
		const chunk = list.slice(i, i + 100);
		try {
			const res = await fetch('https://api.resend.com/emails/batch', {
				method: 'POST',
				headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
				body: JSON.stringify(chunk.map((to) => ({ from, to: [to], subject: subj, html })))
			});
			if (res.ok) sent += chunk.length;
			else {
				failed += chunk.length;
				lastError = ((await res.json().catch(() => ({}))) as { message?: string }).message ?? `HTTP ${res.status}`;
			}
		} catch {
			failed += chunk.length;
			lastError = 'network';
		}
	}

	return json({ sent, failed, error: failed ? lastError : undefined }, { status: sent ? 200 : 502 });
};
