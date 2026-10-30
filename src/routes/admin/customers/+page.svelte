<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/admin/Icon.svelte';
	import { notify } from '$lib/admin/toast.svelte';
	import { listAll, formatDate } from '$lib/admin/db';
	import FilterBar from '$lib/admin/FilterBar.svelte';
	import { inRange, matches, newFilter } from '$lib/admin/filter';
	import { displayName, formatPhone, type Profile } from '$lib/account/account';

	type Row = Profile & { id: string };

	let rows = $state<Row[]>([]);
	let loading = $state(true);
	let failed = $state(false);
	let filt = $state(newFilter('terbaru', ['verified', 'updates']));

	const yesNo = (key: 'verified' | 'updates') => [
		{ value: '', label: 'Semua', count: rows.length },
		{ value: 'ya', label: 'Ya', count: rows.filter((r) => (key === 'verified' ? r.emailVerified : r.notify?.updates)).length },
		{ value: 'tidak', label: 'Tidak', count: rows.filter((r) => !(key === 'verified' ? r.emailVerified : r.notify?.updates)).length }
	];
	const filterDefs = $derived([
		{ key: 'verified', label: 'Email terverifikasi', options: yesNo('verified') },
		{ key: 'updates', label: 'Terima pengumuman', options: yesNo('updates') }
	]);
	const SORTS = [
		{ value: 'terbaru', label: 'Terbaru bergabung' },
		{ value: 'terlama', label: 'Terlama bergabung' },
		{ value: 'nama', label: 'Nama A–Z' }
	];

	const test = (v: string, flag: boolean) => !v || (v === 'ya') === flag;

	const visible = $derived(
		rows
			.filter(
				(r) =>
					test(filt.values.verified, !!r.emailVerified) &&
					test(filt.values.updates, !!r.notify?.updates) &&
					inRange(r.createdAt, filt.from, filt.to) &&
					matches(filt.query, displayName(r), r.email, r.phone)
			)
			.sort((a, b) => {
				if (filt.sort === 'terlama') return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
				if (filt.sort === 'nama') return (displayName(a) || '~').localeCompare(displayName(b) || '~');
				return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
			})
	);

	onMount(load);

	async function load() {
		loading = true;
		failed = false;
		try {
			rows = (await listAll<Profile>('users')).filter((r) => r.email);
		} catch (err) {
			failed = true;
			notify('Gagal memuat pelanggan: ' + err, true);
		} finally {
			loading = false;
		}
	}

	function exportCsv() {
		const q = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
		const lines = [
			['Nama', 'Email', 'Telepon', 'Email terverifikasi', 'Terima pengumuman', 'Bergabung'].map(q).join(','),
			...visible.map((r) =>
				[displayName(r), r.email, formatPhone(r.phone), r.emailVerified ? 'ya' : 'tidak', r.notify?.updates ? 'ya' : 'tidak', r.createdAt?.slice(0, 10)].map(q).join(',')
			)
		];
		const url = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
		Object.assign(document.createElement('a'), { href: url, download: 'pelanggan-agroplus.csv' }).click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="adm-page-head">
	<div>
		<h1>Pelanggan</h1>
		<p>Akun yang mendaftar lewat halaman Masuk di situs. Hanya yang terverifikasi dan mengizinkan pengumuman yang menerima email dari menu Pengumuman.</p>
	</div>
	<div class="head-acts">
		<button class="adm-btn" onclick={exportCsv} disabled={!visible.length}>Ekspor CSV</button>
		<a class="adm-btn primary" href="/admin/broadcast"><Icon name="mail" size={18} />Kirim pengumuman</a>
	</div>
</div>

<FilterBar bind:model={filt} filters={filterDefs} sorts={SORTS} dateLabel="Tanggal bergabung" placeholder="Cari nama, email, telepon…" total={rows.length} shown={visible.length} noun="pelanggan" />

<div class="adm-card tablecard">
	{#if loading}
		<div class="adm-empty">Memuat pelanggan…</div>
	{:else if failed}
		<div class="adm-empty">
			<p>Tidak bisa membaca data pelanggan. Pastikan Firestore Rules terbaru (koleksi <code>users</code>) sudah di-publish.</p>
			<button class="adm-btn" onclick={load}><Icon name="refresh" size={16} />Coba lagi</button>
		</div>
	{:else if !rows.length}
		<div class="adm-empty">
			<Icon name="team" size={32} />
			<p>Belum ada pelanggan yang mendaftar.</p>
		</div>
	{:else if !visible.length}
		<div class="adm-empty">Tidak ada pelanggan yang cocok.</div>
	{:else}
		<div class="table-wrap">
			<table class="adm-table">
				<thead>
					<tr><th>Pelanggan</th><th>Kontak</th><th>Email</th><th>Pengumuman</th><th>Bergabung</th></tr>
				</thead>
				<tbody>
					{#each visible as r (r.id)}
						<tr>
							<td><strong>{displayName(r) || '—'}</strong></td>
							<td>{r.email}<small>{formatPhone(r.phone) || '—'}</small></td>
							<td><span class="adm-badge" class:amber={!r.emailVerified}>{r.emailVerified ? 'Terverifikasi' : 'Belum'}</span></td>
							<td><span class="adm-badge" class:gray={!r.notify?.updates}>{r.notify?.updates ? 'Ya' : 'Tidak'}</span></td>
							<td class="nowrap">{formatDate(r.createdAt?.slice(0, 10))}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.head-acts {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.tablecard {
		padding: 10px 16px 16px;
	}

	.table-wrap {
		overflow-x: auto;
	}

	small {
		display: block;
		color: var(--muted);
		font-size: 0.76rem;
		line-height: 1.4;
	}

	.nowrap {
		white-space: nowrap;
	}
</style>
