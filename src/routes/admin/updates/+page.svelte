<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/admin/Icon.svelte';
	import { notify } from '$lib/admin/toast.svelte';
	import { createDoc, formatDate, listAll, patchDoc, removeDoc } from '$lib/admin/db';
	import { resizeToDataUrl } from '$lib/team-store';
	import { seedUpdates } from '$lib/admin/seed';

	const CATEGORIES = ['Press Release', 'News', 'Event', 'Product'];

	type Update = {
		title: string;
		category: string;
		date: string; // yyyy-mm-dd
		summary: string;
		image: string;
		published: boolean;
	};
	type Row = Update & { id: string };

	const blank = (): Update => ({
		title: '',
		category: CATEGORIES[0],
		date: new Date().toISOString().slice(0, 10),
		summary: '',
		image: '',
		published: true
	});

	let rows = $state<Row[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let drawer = $state(false);
	let editingId = $state<string | null>(null);
	let confirmId = $state<string | null>(null);
	let form = $state<Update>(blank());

	const sorted = $derived([...rows].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')));

	let seeding = $state('');

	async function importSamples() {
		try {
			await seedUpdates((t) => (seeding = t));
			notify('6 berita bawaan berhasil diimpor');
			await load();
		} catch (err) {
			notify('Gagal impor: ' + err, true);
		} finally {
			seeding = '';
		}
	}

	onMount(load);

	async function load() {
		loading = true;
		try {
			rows = await listAll<Update>('updates');
		} catch (err) {
			notify('Gagal memuat berita: ' + err, true);
		} finally {
			loading = false;
		}
	}

	function openAdd() {
		editingId = null;
		form = blank();
		drawer = true;
	}

	function openEdit(r: Row) {
		editingId = r.id;
		const { id: _id, ...rest } = r;
		form = { ...blank(), ...rest };
		drawer = true;
	}

	async function onFile(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		try {
			form.image = await resizeToDataUrl(file, 800, 0.8);
		} catch {
			notify('File bukan gambar yang valid', true);
		}
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!form.title.trim()) return;
		saving = true;
		try {
			const data = { ...form, title: form.title.trim() };
			if (editingId) await patchDoc('updates', editingId, data);
			else await createDoc('updates', data);
			notify(editingId ? 'Berita diperbarui' : 'Berita ditambahkan');
			drawer = false;
			await load();
		} catch (err) {
			notify('Gagal menyimpan: ' + err, true);
		} finally {
			saving = false;
		}
	}

	async function togglePublish(r: Row) {
		try {
			await patchDoc('updates', r.id, { published: !(r.published !== false) });
			await load();
		} catch (err) {
			notify('Gagal mengubah status: ' + err, true);
		}
	}

	async function remove(r: Row) {
		try {
			await removeDoc('updates', r.id);
			notify('Berita dihapus');
			confirmId = null;
			await load();
		} catch (err) {
			notify('Gagal menghapus: ' + err, true);
		}
	}
</script>

<div class="adm-page-head">
	<div>
		<h1>Berita</h1>
		<p>Muncul di bagian "Updates" pada halaman utama. Draf tidak ditampilkan ke pengunjung.</p>
	</div>
	<button class="adm-btn primary" onclick={openAdd}><Icon name="plus" size={18} />Tambah berita</button>
</div>

{#if loading}
	<div class="list">{#each Array(3) as _}<div class="adm-card skel"></div>{/each}</div>
{:else if !sorted.length}
	<div class="adm-card adm-empty">
		<Icon name="news" size={32} />
		<p>Belum ada berita. Halaman utama sementara menampilkan contoh bawaan.</p>
		<div class="empty-acts">
			<button class="adm-btn primary" onclick={importSamples} disabled={!!seeding}>{seeding || 'Impor 6 berita bawaan'}</button>
			<button class="adm-btn" onclick={openAdd}>Tulis berita pertama</button>
		</div>
	</div>
{:else}
	<div class="list">
		{#each sorted as r, i (r.id)}
			<article class="adm-card row adm-rise" style="--i:{Math.min(i, 8)}">
				<div class="thumb">{#if r.image}<img src={r.image} alt="" />{:else}<Icon name="news" size={26} />{/if}</div>
				<div class="body">
					<div class="tags">
						<span class="adm-badge {r.published === false ? 'gray' : ''}">{r.published === false ? 'Draf' : 'Terbit'}</span>
						<span class="muted">{r.category} · {formatDate(r.date)}</span>
					</div>
					<h3>{r.title}</h3>
					{#if r.summary}<p>{r.summary}</p>{/if}
				</div>
				<div class="acts">
					<button class="adm-btn sm" onclick={() => togglePublish(r)}>{r.published === false ? 'Terbitkan' : 'Jadikan draf'}</button>
					<button class="adm-btn sm" onclick={() => openEdit(r)}><Icon name="edit" size={15} />Edit</button>
					{#if confirmId === r.id}
						<button class="adm-btn sm danger" onclick={() => remove(r)}>Yakin?</button>
					{:else}
						<button class="adm-btn sm icon danger" onclick={() => (confirmId = r.id)} aria-label="Hapus"><Icon name="trash" size={16} /></button>
					{/if}
				</div>
			</article>
		{/each}
	</div>
{/if}

{#if drawer}
	<div class="adm-overlay" role="presentation" onclick={(e) => e.target === e.currentTarget && (drawer = false)}>
		<form class="adm-drawer" onsubmit={submit}>
			<div class="adm-drawer-head">
				<h2>{editingId ? 'Edit berita' : 'Tambah berita'}</h2>
				<button type="button" class="adm-btn sm icon" onclick={() => (drawer = false)} aria-label="Tutup"><Icon name="close" size={18} /></button>
			</div>

			<div class="cover">
				{#if form.image}<img src={form.image} alt="Pratinjau sampul" />{:else}<div class="ph"><Icon name="news" size={30} /></div>{/if}
				<label class="adm-btn sm">Pilih gambar sampul<input type="file" accept="image/*" onchange={onFile} hidden /></label>
			</div>

			<div class="adm-form-grid">
				<label class="adm-field wide">Judul<input class="adm-input" bind:value={form.title} required /></label>
				<label class="adm-field">Kategori
					<select class="adm-input" bind:value={form.category}>
						{#each CATEGORIES as c}<option>{c}</option>{/each}
					</select>
				</label>
				<label class="adm-field">Tanggal<input class="adm-input" type="date" bind:value={form.date} required /></label>
				<label class="adm-field wide">Ringkasan (opsional)<textarea class="adm-input" bind:value={form.summary}></textarea></label>
				<label class="switch wide">
					<input type="checkbox" bind:checked={form.published} />
					<span class="knob"></span>
					<span>Terbitkan di situs</span>
				</label>
			</div>

			<div class="foot">
				<button type="button" class="adm-btn" onclick={() => (drawer = false)}>Batal</button>
				<button class="adm-btn primary" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</button>
			</div>
		</form>
	</div>
{/if}

<style>
	.empty-acts {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
	}

	.list {
		display: grid;
		gap: 14px;
	}

	.skel {
		min-height: 110px;
		background: linear-gradient(100deg, #fff 30%, #f1f4ee 50%, #fff 70%) 0 0 / 200% 100%;
		animation: shimmer 1.4s linear infinite;
	}

	@keyframes shimmer {
		to {
			background-position: -200% 0;
		}
	}

	.row {
		display: grid;
		grid-template-columns: 112px 1fr auto;
		align-items: center;
		gap: 18px;
		padding: 16px;
	}

	.thumb {
		display: grid;
		place-items: center;
		width: 112px;
		height: 84px;
		overflow: hidden;
		border-radius: 14px;
		background: #e4e9dd;
		color: var(--muted);
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.body {
		display: grid;
		gap: 6px;
		min-width: 0;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}

	.muted {
		color: var(--muted);
		font-size: 0.78rem;
	}

	.body h3 {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.body p {
		overflow: hidden;
		color: var(--muted);
		font-size: 0.85rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.acts {
		display: flex;
		gap: 6px;
	}

	.cover {
		display: grid;
		gap: 12px;
		justify-items: start;
		margin-bottom: 20px;
	}

	.cover img,
	.ph {
		display: grid;
		place-items: center;
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 16px;
		background: #e4e9dd;
		color: var(--muted);
		object-fit: cover;
	}

	.switch {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
	}

	.switch input {
		position: absolute;
		opacity: 0;
	}

	.knob {
		position: relative;
		width: 44px;
		height: 26px;
		border-radius: 999px;
		background: #c9d1bf;
		transition: background-color 0.3s var(--ease);
	}

	.knob::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
		transition: translate 0.3s var(--ease);
	}

	.switch input:checked + .knob {
		background: var(--brand);
	}

	.switch input:checked + .knob::after {
		translate: 18px 0;
	}

	.switch input:focus-visible + .knob {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.foot {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 26px;
	}

	@media (max-width: 760px) {
		.row {
			grid-template-columns: 84px 1fr;
		}

		.thumb {
			width: 84px;
			height: 64px;
		}

		.acts {
			grid-column: 1 / -1;
			flex-wrap: wrap;
		}
	}
</style>
