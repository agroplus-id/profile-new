<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/admin/Icon.svelte';
	import { notify } from '$lib/admin/toast.svelte';
	import { createDoc, formatDate, listAll } from '$lib/admin/db';
	import { auth } from '$lib/firebase';
	import type { Profile } from '$lib/account/account';

	type Sent = { subject: string; message: string; sent: number; failed: number; createdAt: string; by: string };

	let customers = $state<(Profile & { id: string })[]>([]);
	let history = $state<(Sent & { id: string })[]>([]);
	let loading = $state(true);
	let subject = $state('');
	let message = $state('');
	let ctaLabel = $state('');
	let ctaUrl = $state('');
	let busy = $state<'' | 'test' | 'all'>('');
	let confirming = $state(false);
	let notConfigured = $state(false);

	// Penerima: akun terverifikasi yang mengizinkan pengumuman.
	const audience = $derived(customers.filter((c) => c.email && c.emailVerified && c.notify?.updates !== false));
	const ready = $derived(subject.trim().length > 2 && message.trim().length > 5);

	const PLACEHOLDER = 'Halo!\n\nKami baru saja merilis batch terbaru.\n\nPisahkan paragraf dengan baris kosong.';

	onMount(async () => {
		try {
			customers = await listAll<Profile>('users');
			history = (await listAll<Sent>('broadcasts')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
		} catch (err) {
			notify('Gagal memuat data: ' + err, true);
		} finally {
			loading = false;
		}
	});

	async function send(test: boolean) {
		busy = test ? 'test' : 'all';
		confirming = false;
		try {
			const token = await auth.currentUser?.getIdToken();
			const res = await fetch('/api/broadcast', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({
					subject,
					message,
					ctaLabel,
					ctaUrl,
					test,
					recipients: test ? [] : audience.map((c) => c.email)
				})
			});
			const out = (await res.json().catch(() => ({}))) as { sent?: number; failed?: number; error?: string };
			if (res.status === 501) {
				notConfigured = true;
				notify('Pengiriman email belum dikonfigurasi (RESEND_API_KEY dan MAIL_FROM).', true);
				return;
			}
			if (!res.ok) throw new Error(out.error ?? `HTTP ${res.status}`);
			notify(test ? 'Email tes terkirim ke email Anda' : `Terkirim ke ${out.sent} pelanggan${out.failed ? `, gagal ${out.failed}` : ''}`);
			if (!test) {
				const row = { subject, message, sent: out.sent ?? 0, failed: out.failed ?? 0, createdAt: new Date().toISOString(), by: auth.currentUser?.email ?? '' };
				const ref = await createDoc('broadcasts', row);
				history = [{ id: ref.id, ...row }, ...history].slice(0, 10);
			}
		} catch (err) {
			notify('Gagal mengirim: ' + (err as Error).message, true);
		} finally {
			busy = '';
		}
	}
</script>

<div class="adm-page-head">
	<div>
		<h1>Pengumuman email</h1>
		<p>Kirim kabar produk baru, batch baru, atau info penting ke semua pelanggan yang terdaftar dan mengizinkan pemberitahuan.</p>
	</div>
</div>

{#if notConfigured}
	<div class="adm-card warn">
		<strong>Pengiriman email belum aktif.</strong>
		Isi <code>RESEND_API_KEY</code> dan <code>MAIL_FROM</code> di environment (lokal <code>.env</code> dan Vercel), lalu redeploy. Panduannya ada di <code>.env.example</code>.
	</div>
{/if}

<div class="grid">
	<section class="adm-card form">
		<label class="adm-field">Subjek
			<input class="adm-input" bind:value={subject} maxlength="120" placeholder="Batch baru Bumi Kopi sudah tersedia" />
		</label>
		<label class="adm-field">Isi pesan
			<textarea class="adm-input" rows="9" bind:value={message} placeholder={PLACEHOLDER}></textarea>
		</label>
		<div class="two">
			<label class="adm-field">Teks tombol (opsional)
				<input class="adm-input" bind:value={ctaLabel} placeholder="Lihat batch" />
			</label>
			<label class="adm-field">Tautan tombol
				<input class="adm-input" bind:value={ctaUrl} placeholder="/bumi-kopi atau https://…" />
			</label>
		</div>

		<div class="acts">
			<button class="adm-btn" onclick={() => send(true)} disabled={!ready || !!busy}>{busy === 'test' ? 'Mengirim…' : 'Kirim tes ke saya'}</button>
			{#if confirming}
				<button class="adm-btn primary" onclick={() => send(false)} disabled={!!busy}>Ya, kirim ke {audience.length} orang</button>
				<button class="adm-btn" onclick={() => (confirming = false)}>Batal</button>
			{:else}
				<button class="adm-btn primary" onclick={() => (confirming = true)} disabled={!ready || !audience.length || !!busy}>
					<Icon name="mail" size={18} />{busy === 'all' ? 'Mengirim…' : `Kirim ke ${audience.length} pelanggan`}
				</button>
			{/if}
		</div>
		<p class="hint">
			{#if loading}Memuat penerima…{:else}Penerima: {audience.length} dari {customers.length} akun (hanya email terverifikasi yang mengizinkan pengumuman). Selalu kirim tes dulu.{/if}
		</p>
	</section>

	<aside class="side">
		<section class="adm-card">
			<h2 class="h">Pratinjau</h2>
			<div class="mail">
				<b>AgroPlus.ID</b>
				<div class="subj">{subject || 'Subjek email'}</div>
				{#each (message || 'Isi pesan akan tampil di sini.').split(/\n{2,}/) as para}
					<p>{para}</p>
				{/each}
				{#if ctaLabel.trim() && ctaUrl.trim()}<span class="btn">{ctaLabel}</span>{/if}
			</div>
		</section>

		<section class="adm-card">
			<h2 class="h">Riwayat terkirim</h2>
			{#if !history.length}
				<p class="hint">Belum ada pengumuman yang dikirim.</p>
			{:else}
				<ul class="hist">
					{#each history as h (h.id)}
						<li>
							<strong>{h.subject}</strong>
							<small>{formatDate(h.createdAt.slice(0, 10))} · terkirim {h.sent}{h.failed ? `, gagal ${h.failed}` : ''}</small>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</aside>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
		gap: 20px;
		align-items: start;
	}

	.form {
		display: grid;
		gap: 16px;
		padding: 24px;
	}

	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}

	.acts {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.hint {
		margin: 0;
		color: var(--muted);
		font-size: 0.82rem;
	}

	.warn {
		margin-bottom: 18px;
		padding: 16px 20px;
		background: #fbefd5;
		color: #7a5208;
		font-size: 0.9rem;
	}

	.side {
		display: grid;
		gap: 20px;
	}

	.side .adm-card {
		padding: 20px;
	}

	.h {
		margin: 0 0 12px;
		font-size: 1rem;
	}

	.mail {
		padding: 18px;
		border-radius: 14px;
		background: #f0f3f1;
		font-size: 0.86rem;
		line-height: 1.6;
	}

	.mail b {
		color: #55683d;
	}

	.subj {
		margin: 8px 0 12px;
		font-weight: 700;
	}

	.mail p {
		margin: 0 0 10px;
		white-space: pre-line;
	}

	.btn {
		display: inline-block;
		padding: 10px 18px;
		border-radius: 8px;
		background: #25330f;
		color: #fff;
		font-weight: 600;
	}

	.hist {
		display: grid;
		gap: 12px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.hist small {
		display: block;
		color: var(--muted);
	}

	@media (max-width: 1000px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 560px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
