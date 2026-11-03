<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/admin/Icon.svelte';
	import FilterBar from '$lib/admin/FilterBar.svelte';
	import { inRange, matches, newFilter } from '$lib/admin/filter';
	import { notify } from '$lib/admin/toast.svelte';
	import { createDoc, formatDate, listAll, patchDoc, removeDoc } from '$lib/admin/db';
	import { resizeToDataUrl } from '$lib/team-store';
	import { TESTIMONIAL_CATEGORIES } from '$lib/data/testimonials';
	import { seedTestimonials } from '$lib/admin/seed';

	const CATEGORIES = [...TESTIMONIAL_CATEGORIES];

	type TestimonialForm = {
		title: string;
		clientName: string;
		clientRole: string;
		clientCompany: string;
		category: string;
		date: string;
		summary: string;
		image: string;
		rating: number;
		published: boolean;
	};
	type Row = TestimonialForm & { id: string };

	const blank = (): TestimonialForm => ({
		title: '',
		clientName: '',
		clientRole: '',
		clientCompany: '',
		category: CATEGORIES[0],
		date: new Date().toISOString().slice(0, 10),
		summary: '',
		image: '',
		rating: 5,
		published: true
	});

	let rows = $state<Row[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let editing = $state(false);
	let editingId = $state<string | null>(null);
	let confirmId = $state<string | null>(null);
	let form = $state<TestimonialForm>(blank());
	let startSnap = '';
	let confirmClose = $state(false);
	let seeding = $state('');
	let hasPermissionError = $state(false);

	let filt = $state(newFilter('terbaru', ['status', 'category', 'cover']));

	const filterDefs = $derived([
		{
			key: 'status',
			label: 'Status',
			options: [
				{ value: '', label: 'Semua', count: rows.length },
				{ value: 'terbit', label: 'Terbit', count: rows.filter((r) => r.published !== false).length },
				{ value: 'draf', label: 'Draf', count: rows.filter((r) => r.published === false).length }
			]
		},
		{
			key: 'category',
			label: 'Kategori',
			variant: 'select' as const,
			options: [
				{ value: '', label: 'Semua kategori' },
				...CATEGORIES.map((c) => ({ value: c, label: c, count: rows.filter((r) => r.category === c).length }))
			]
		},
		{
			key: 'cover',
			label: 'Foto bukti',
			variant: 'select' as const,
			options: [
				{ value: '', label: 'Semua' },
				{ value: 'ada', label: 'Ada foto', count: rows.filter((r) => r.image).length },
				{ value: 'tidak', label: 'Tanpa foto', count: rows.filter((r) => !r.image).length }
			]
		}
	]);

	const SORTS = [
		{ value: 'terbaru', label: 'Terbaru' },
		{ value: 'terlama', label: 'Terlama' },
		{ value: 'judul', label: 'Judul A–Z' },
		{ value: 'klien', label: 'Nama Klien A–Z' }
	];

	const sorted = $derived(
		rows
			.filter(
				(r) =>
					(!filt.values.status || (filt.values.status === 'terbit') === (r.published !== false)) &&
					(!filt.values.category || r.category === filt.values.category) &&
					(!filt.values.cover || (filt.values.cover === 'ada') === !!r.image) &&
					inRange(r.date, filt.from, filt.to) &&
					matches(filt.query, r.title, r.clientName, r.clientCompany, r.summary, r.category)
			)
			.sort((a, b) => {
				if (filt.sort === 'terlama') return (a.date ?? '').localeCompare(b.date ?? '');
				if (filt.sort === 'judul') return a.title.localeCompare(b.title);
				if (filt.sort === 'klien') return a.clientName.localeCompare(b.clientName);
				return (b.date ?? '').localeCompare(a.date ?? '');
			})
	);

	const dirty = $derived(editing && JSON.stringify(form) !== startSnap);

	async function load() {
		hasPermissionError = false;
		try {
			rows = await listAll<TestimonialForm>('testimonials');
		} catch (err) {
			const code = (err as { code?: string }).code;
			if (code === 'permission-denied') {
				hasPermissionError = true;
			}
			notify('Gagal memuat testimoni: ' + err, true);
		} finally {
			loading = false;
		}
	}

	onMount(load);

	async function importSamples() {
		try {
			await seedTestimonials((t) => (seeding = t));
			notify('Testimoni contoh berhasil diimpor');
			await load();
		} catch (err) {
			notify('Gagal impor: ' + err, true);
		} finally {
			seeding = '';
		}
	}

	function begin(id: string | null, initialForm: TestimonialForm) {
		editingId = id;
		form = { ...initialForm };
		confirmClose = false;
		editing = true;
		startSnap = JSON.stringify(form);
	}

	function openAdd() {
		begin(null, blank());
	}

	function openEdit(r: Row) {
		const { id, ...rest } = r;
		begin(id, { ...blank(), ...rest });
	}

	function requestClose() {
		if (dirty) confirmClose = true;
		else editing = false;
	}

	async function pickCover(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			notify('Pilih file gambar yang valid (JPG, PNG, atau WebP)', true);
			input.value = '';
			return;
		}
		if (file.size > 8 * 1024 * 1024) {
			notify('Ukuran file foto maksimal 8 MB', true);
			input.value = '';
			return;
		}
		try {
			let url = await resizeToDataUrl(file, 1200, 0.78);
			if (url.length > 250_000) url = await resizeToDataUrl(file, 900, 0.68);
			form.image = url;
		} catch {
			notify('File bukan gambar yang valid', true);
		} finally {
			input.value = '';
		}
	}

	async function save(publishNow?: boolean) {
		const title = form.title.trim();
		const clientName = form.clientName.trim();
		if (!title) {
			notify('Judul testimoni wajib diisi', true);
			return;
		}
		if (title.length < 3) {
			notify('Judul testimoni minimal 3 karakter', true);
			return;
		}
		if (!clientName) {
			notify('Nama klien/narasumber wajib diisi', true);
			return;
		}
		if (form.summary.length > 280) {
			notify('Kutipan maksimal 280 karakter', true);
			return;
		}
		if (publishNow !== undefined) form.published = publishNow;
		saving = true;
		try {
			const data = {
				...form,
				title,
				clientName,
				clientRole: form.clientRole.trim(),
				clientCompany: form.clientCompany.trim(),
				summary: form.summary.trim(),
				rating: Number(form.rating) || 5,
				date: form.date || new Date().toISOString().slice(0, 10)
			};
			if (editingId) {
				await patchDoc('testimonials', editingId, data);
			} else {
				await createDoc('testimonials', data);
			}

			startSnap = JSON.stringify(form);
			notify(form.published ? 'Testimoni disimpan dan terbit' : 'Draf testimoni disimpan');
			editing = false;
			await load();
		} catch (err) {
			notify('Gagal menyimpan: ' + err, true);
		} finally {
			saving = false;
		}
	}

	async function togglePublish(r: Row) {
		try {
			await patchDoc('testimonials', r.id, { published: !(r.published !== false) });
			await load();
		} catch (err) {
			notify('Gagal mengubah status: ' + err, true);
		}
	}

	async function remove(r: Row) {
		try {
			await removeDoc('testimonials', r.id);
			notify('Testimoni dihapus');
			confirmId = null;
			await load();
		} catch (err) {
			notify('Gagal menghapus: ' + err, true);
		}
	}
</script>

<svelte:head>
	<title>Testimoni &amp; Cerita Klien — Admin AgroPlus.ID</title>
</svelte:head>

<div class="adm-page-head">
	<div>
		<h1>Testimoni &amp; Cerita Klien</h1>
		<p>Kelola testimoni mitra, bukti serah terima perangkat di kebun/fasilitas prosesor, dan review kepuasan klien.</p>
	</div>
	<div class="head-acts">
		<button type="button" class="adm-btn primary" onclick={openAdd}>
			<Icon name="plus" size={17} /> Tambah Testimoni
		</button>
	</div>
</div>

{#if hasPermissionError}
	<div class="adm-card warn adm-rise" style="margin-bottom: 20px; border-left: 4px solid #ef4444; background: #fef2f2; padding: 16px 20px;">
		<strong style="color: #991b1b; display: block; margin-bottom: 6px;">Aturan Keamanan Firestore Belum Di-publish</strong>
		<p style="margin: 0; color: #7f1d1d; font-size: 0.88rem; line-height: 1.5;">
			Firebase menolak akses karena aturan keamanan untuk koleksi <code>testimonials</code> belum di-publish di Firebase Console.
			Silakan buka <strong>Firebase Console &gt; Firestore Database &gt; Rules</strong>, lalu salin isi file <code>firestore.rules</code> dan klik <strong>Publish</strong>.
		</p>
	</div>
{/if}

{#if rows.length}
	<FilterBar
		bind:model={filt}
		filters={filterDefs}
		sorts={SORTS}
		dateLabel="Tanggal"
		placeholder="Cari judul, nama klien, atau lokasi…"
		total={rows.length}
		shown={sorted.length}
		noun="testimoni"
	/>
{/if}

{#if loading}
	<div class="list">
		{#each Array(4) as _}
			<div class="adm-card skel"></div>
		{/each}
	</div>
{:else if !rows.length}
	<div class="adm-card adm-empty">
		<Icon name="quote" size={32} />
		<h3>Belum ada testimoni</h3>
		<p>Tambahkan testimoni dan bukti serah terima perangkat pertama dari mitra prosesor atau perkebunan kopi Anda.</p>
		<div class="empty-acts">
			<button type="button" class="adm-btn primary" onclick={importSamples} disabled={!!seeding}>
				{seeding || 'Impor data bawaan'}
			</button>
			<button type="button" class="adm-btn" onclick={openAdd}>
				<Icon name="plus" size={16} /> Tambah manual
			</button>
		</div>
	</div>
{:else if !sorted.length}
	<div class="adm-card adm-empty">
		<Icon name="search" size={28} />
		<h3>Tidak ada hasil</h3>
		<p>Tidak ada testimoni yang cocok dengan kata kunci atau filter yang dipilih.</p>
	</div>
{:else}
	<div class="list">
		{#each sorted as r (r.id)}
			<article class="adm-card row" class:is-draft={r.published === false}>
				<div class="thumb">
					{#if r.image}
						<img src={r.image} alt="" />
					{:else}
						<div class="no-thumb"><Icon name="quote" size={24} /></div>
					{/if}
				</div>

				<div class="main">
					<div class="tags">
						<span class="badge cat">{r.category}</span>
						<span class="badge" class:pub={r.published !== false} class:draft={r.published === false}>
							{r.published !== false ? 'Terbit' : 'Draf'}
						</span>
						<span class="muted date">{formatDate(r.date)}</span>
						{#if r.rating}
							<span class="stars">{'★'.repeat(r.rating)}</span>
						{/if}
					</div>

					<h3 class="title">{r.title}</h3>

					<p class="client-meta">
						<strong>{r.clientName}</strong>
						{#if r.clientRole || r.clientCompany}
							<span> · {r.clientRole}{#if r.clientCompany} ({r.clientCompany}){/if}</span>
						{/if}
					</p>

					{#if r.summary}
						<p class="sum">"{r.summary}"</p>
					{/if}
				</div>

				<div class="acts">
					{#if r.published !== false}
						<a class="adm-btn sm icon-only" href="/testimonials" target="_blank" rel="noreferrer" title="Lihat di situs">
							<Icon name="external" size={16} />
						</a>
					{/if}
					<button
						type="button"
						class="adm-btn sm icon-only"
						title={r.published !== false ? 'Jadikan draf' : 'Terbitkan'}
						onclick={() => togglePublish(r)}
					>
						<Icon name={r.published !== false ? 'eyeOff' : 'eye'} size={16} />
					</button>
					<button type="button" class="adm-btn sm icon-only" title="Ubah" onclick={() => openEdit(r)}>
						<Icon name="edit" size={16} />
					</button>
					{#if confirmId === r.id}
						<div class="confirm-pop">
							<span>Hapus testimoni ini?</span>
							<button type="button" class="adm-btn sm danger" onclick={() => remove(r)}>Ya, hapus</button>
							<button type="button" class="adm-btn sm" onclick={() => (confirmId = null)}>Batal</button>
						</div>
					{:else}
						<button
							type="button"
							class="adm-btn sm icon-only danger"
							title="Hapus"
							onclick={() => (confirmId = r.id)}
						>
							<Icon name="trash" size={16} />
						</button>
					{/if}
				</div>
			</article>
		{/each}
	</div>
{/if}

<!-- Form Modal / Drawer (Sederhana & Cepat) -->
{#if editing}
	<div class="drawer-overlay" onclick={(e) => e.target === e.currentTarget && requestClose()} role="presentation">
		<div class="drawer" class:is-dirty={dirty}>
			<div class="ed-topbar">
				<div class="ed-title">
					<button type="button" class="adm-btn icon-only" onclick={requestClose} title="Tutup">
						<Icon name="close" size={18} />
					</button>
					<div>
						<h2>{editingId ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}</h2>
						<span class="ed-state">{form.published ? 'Status: Terbit di situs' : 'Status: Disimpan sebagai draf'}</span>
					</div>
				</div>

				<div class="ed-acts">
					<button type="button" class="adm-btn" disabled={saving} onclick={() => save(false)}>
						Simpan draf
					</button>
					<button type="button" class="adm-btn primary" disabled={saving} onclick={() => save(true)}>
						{saving ? 'Menyimpan…' : 'Simpan & Terbitkan'}
					</button>
				</div>
			</div>

			{#if confirmClose}
				<div class="confirm-bar">
					<span>Ada perubahan yang belum disimpan. Yakin ingin keluar?</span>
					<div>
						<button type="button" class="adm-btn sm danger" onclick={() => (editing = false)}>Abaikan</button>
						<button type="button" class="adm-btn sm primary" onclick={() => (confirmClose = false)}>Lanjut edit</button>
					</div>
				</div>
			{/if}

			<div class="ed-content">
				<div class="form-container">
					<!-- Upload Foto Bukti -->
					<div class="form-group">
						<span class="field-title">Foto Bukti / Penyerahan Perangkat</span>
						{#if form.image}
							<div class="cover-preview-box">
								<img class="cover-preview" src={form.image} alt="Foto bukti" />
								<div class="cover-actions">
									<label class="adm-btn sm">
										Ganti Foto
										<input type="file" accept="image/*" hidden onchange={pickCover} />
									</label>
									<button type="button" class="adm-btn sm" onclick={() => (form.image = '')}>Hapus Foto</button>
								</div>
							</div>
						{:else}
							<label class="cover-empty">
								<Icon name="media" size={28} />
								<strong>Pilih Foto Bukti Klien</strong>
								<span>Klik untuk memilih file foto (landscape lebih direkomendasikan)</span>
								<input type="file" accept="image/*" hidden onchange={pickCover} />
							</label>
						{/if}
					</div>

					<!-- Judul Testimoni -->
					<div class="form-group">
						<div class="field-header">
							<label for="f-title" class="field-title">Judul Testimoni / Serah Terima *</label>
							<span class="char-count" class:limit={form.title.length >= 100}>{form.title.length}/100</span>
						</div>
						<input
							id="f-title"
							class="adm-input f-large"
							type="text"
							maxlength="100"
							placeholder="Cth: Serah Terima Pembelian 1 IoT FERROIR"
							bind:value={form.title}
							required
						/>
					</div>

					<!-- Klien info -->
					<div class="fields-row">
						<div class="form-group">
							<div class="field-header">
								<label for="f-name" class="field-title">Nama Klien / Narasumber *</label>
								<span class="char-count" class:limit={form.clientName.length >= 60}>{form.clientName.length}/60</span>
							</div>
							<input
								id="f-name"
								class="adm-input"
								type="text"
								maxlength="60"
								placeholder="Cth: Adam"
								bind:value={form.clientName}
								required
							/>
						</div>

						<div class="form-group">
							<div class="field-header">
								<label for="f-role" class="field-title">Peran / Jabatan</label>
								<span class="char-count" class:limit={form.clientRole.length >= 60}>{form.clientRole.length}/60</span>
							</div>
							<input
								id="f-role"
								class="adm-input"
								type="text"
								maxlength="60"
								placeholder="Cth: Coffee Farmer"
								bind:value={form.clientRole}
							/>
						</div>

						<div class="form-group">
							<div class="field-header">
								<label for="f-co" class="field-title">Perusahaan / Lokasi</label>
								<span class="char-count" class:limit={form.clientCompany.length >= 80}>{form.clientCompany.length}/80</span>
							</div>
							<input
								id="f-co"
								class="adm-input"
								type="text"
								maxlength="80"
								placeholder="Cth: Maduarjo"
								bind:value={form.clientCompany}
							/>
						</div>
					</div>

					<!-- Kutipan Singkat -->
					<div class="form-group">
						<div class="field-header">
							<label for="f-quote" class="field-title">Kutipan / Ulasan Klien (Quote)</label>
							<span class="char-count" class:limit={form.summary.length >= 260}>{form.summary.length}/260</span>
						</div>
						<textarea
							id="f-quote"
							class="adm-input f-area"
							rows="3"
							maxlength="260"
							placeholder="Cth: Coba coba dulu sek, kemarin masih lancar pake nya..."
							bind:value={form.summary}
						></textarea>
						<span class="field-hint">Kutipan ini akan langsung tampil di dalam kartu testimoni (maksimal 260 karakter).</span>
					</div>

					<!-- Kategori, Tanggal, Rating -->
					<div class="fields-row">
						<div class="form-group">
							<label for="f-cat" class="field-title">Kategori</label>
							<select id="f-cat" class="adm-input" bind:value={form.category}>
								{#each CATEGORIES as c}<option>{c}</option>{/each}
							</select>
						</div>

						<div class="form-group">
							<label for="f-date" class="field-title">Tanggal</label>
							<input id="f-date" class="adm-input" type="date" bind:value={form.date} required />
						</div>

						<div class="form-group">
							<label for="f-rating" class="field-title">Rating Kepuasan</label>
							<select id="f-rating" class="adm-input" bind:value={form.rating}>
								<option value={5}>★★★★★ (5 Bintang)</option>
								<option value={4}>★★★★☆ (4 Bintang)</option>
								<option value={3}>★★★☆☆ (3 Bintang)</option>
							</select>
						</div>
					</div>

					<!-- Status Publish -->
					<div class="form-group" style="margin-top: 10px;">
						<label class="switch">
							<input type="checkbox" bind:checked={form.published} />
							<span class="knob"></span>
							<span>Tayang langsung di situs publik</span>
						</label>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.head-acts {
		display: flex;
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

	.empty-acts {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		margin-top: 14px;
	}

	.row {
		display: grid;
		grid-template-columns: 120px 1fr auto;
		align-items: center;
		gap: 20px;
		padding: 16px 20px;
	}

	.row.is-draft {
		opacity: 0.72;
		background: #fafbfa;
	}

	.thumb {
		width: 120px;
		height: 84px;
		border-radius: 8px;
		overflow: hidden;
		background: #e6ede0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.no-thumb {
		color: #849962;
		opacity: 0.6;
	}

	.main {
		min-width: 0;
	}

	.tags {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 6px;
	}

	.badge {
		padding: 2px 8px;
		border-radius: 6px;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.badge.cat {
		background: rgba(85, 104, 61, 0.12);
		color: #384620;
	}

	.badge.pub {
		background: #dcfce7;
		color: #166534;
	}

	.badge.draft {
		background: #fef3c7;
		color: #92400e;
	}

	.date {
		font-size: 0.78rem;
		color: #6a7b54;
	}

	.stars {
		color: #f59e0b;
		font-size: 0.85rem;
		letter-spacing: 1px;
	}

	.title {
		margin: 0 0 4px;
		font-size: 1.05rem;
		font-weight: 700;
		color: #25330f;
		line-height: 1.3;
	}

	.client-meta {
		margin: 0 0 6px;
		font-size: 0.85rem;
		color: #45552d;
	}

	.client-meta strong {
		color: #25330f;
	}

	.sum {
		margin: 0;
		font-size: 0.82rem;
		color: #6a7b54;
		line-height: 1.4;
		font-style: italic;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 600px;
	}

	.acts {
		display: flex;
		align-items: center;
		gap: 8px;
		position: relative;
	}

	.confirm-pop {
		position: absolute;
		right: 0;
		top: 100%;
		z-index: 10;
		background: #ffffff;
		padding: 12px 14px;
		border-radius: 10px;
		box-shadow: 0 10px 28px rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(85, 104, 61, 0.2);
		display: flex;
		align-items: center;
		gap: 8px;
		white-space: nowrap;
	}

	.confirm-pop span {
		font-size: 0.82rem;
		font-weight: 600;
		color: #25330f;
	}

	/* Drawer Modal */
	.drawer-overlay {
		position: fixed;
		inset: 0;
		background: rgba(16, 24, 8, 0.55);
		backdrop-filter: blur(4px);
		z-index: 9999;
		display: flex;
		justify-content: flex-end;
	}

	.drawer {
		width: 100%;
		max-width: 720px;
		height: 100%;
		background: #f7f9f6;
		display: flex;
		flex-direction: column;
		box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
		animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.ed-topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 24px;
		background: #ffffff;
		border-bottom: 1px solid rgba(85, 104, 61, 0.15);
		gap: 16px;
	}

	.ed-title {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.ed-title h2 {
		margin: 0;
		font-size: 1.15rem;
		color: #25330f;
	}

	.ed-state {
		font-size: 0.78rem;
		color: #6a7b54;
	}

	.ed-acts {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.confirm-bar {
		background: #fee2e2;
		color: #991b1b;
		padding: 10px 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.confirm-bar div {
		display: flex;
		gap: 8px;
	}

	.ed-content {
		flex: 1;
		overflow-y: auto;
		padding: 24px 28px 48px;
	}

	.form-container {
		background: #ffffff;
		border-radius: 14px;
		padding: 28px;
		border: 1px solid rgba(85, 104, 61, 0.12);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.field-title {
		font-size: 0.85rem;
		font-weight: 700;
		color: #25330f;
	}

	.char-count {
		font-size: 0.75rem;
		color: #849962;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.char-count.limit {
		color: #dc2626;
	}

	.field-hint {
		font-size: 0.78rem;
		color: #6a7b54;
	}

	.f-large {
		font-size: 1.05rem;
		font-weight: 600;
	}

	.f-area {
		line-height: 1.5;
		resize: vertical;
	}

	.fields-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}

	.cover-preview-box {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.cover-preview {
		width: 100%;
		max-height: 260px;
		object-fit: cover;
		border-radius: 10px;
		border: 1px solid rgba(85, 104, 61, 0.15);
	}

	.cover-actions {
		display: flex;
		gap: 8px;
	}

	.cover-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 32px 20px;
		border: 2px dashed rgba(85, 104, 61, 0.3);
		border-radius: 12px;
		cursor: pointer;
		background: #fafbfa;
		color: #55683d;
		text-align: center;
		transition: all 0.2s ease;
	}

	.cover-empty:hover {
		border-color: #25330f;
		background: rgba(216, 228, 198, 0.2);
	}

	.cover-empty strong {
		margin: 8px 0 2px;
		font-size: 0.95rem;
		color: #25330f;
	}

	.cover-empty span {
		font-size: 0.8rem;
		color: #6a7b54;
	}

	.switch {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
	}

	.switch input {
		position: absolute;
		opacity: 0;
	}

	.knob {
		position: relative;
		width: 44px;
		height: 24px;
		border-radius: 999px;
		background: #c9d1bf;
		transition: background-color 0.25s ease;
		flex-shrink: 0;
	}

	.knob::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
		transition: transform 0.25s ease;
	}

	.switch input:checked + .knob {
		background: #25330f;
	}

	.switch input:checked + .knob::after {
		transform: translateX(20px);
	}

	@media (max-width: 640px) {
		.row {
			grid-template-columns: 1fr auto;
		}

		.thumb {
			display: none;
		}

		.fields-row {
			grid-template-columns: 1fr;
		}
	}
</style>
