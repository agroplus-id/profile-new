<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/admin/Icon.svelte';
	import FilterBar from '$lib/admin/FilterBar.svelte';
	import { inRange, matches, newFilter } from '$lib/admin/filter';
	import RichEditor from '$lib/admin/RichEditor.svelte';
	import { notify } from '$lib/admin/toast.svelte';
	import { createDoc, formatDate, listAll, patchDoc, readDoc, removeDoc, writeDoc } from '$lib/admin/db';
	import { resizeToDataUrl } from '$lib/team-store';
	import { TESTIMONIAL_CATEGORIES, defaultTestimonials, type TestimonialItem } from '$lib/data/testimonials';
	import { seedTestimonials } from '$lib/admin/seed';

	const CATEGORIES = [...TESTIMONIAL_CATEGORIES];
	const MAX_HTML = 900_000;

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
	let html = $state('');
	let words = $state(0);
	let hadBody = false;
	let bodyReady = $state(false);
	let startSnap = '';
	let confirmClose = $state(false);

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

	const dirty = $derived(editing && bodyReady && JSON.stringify([form, html]) !== startSnap);
	const sizeKb = $derived(Math.round((html.length + form.image.length) / 1024));
	const tooBig = $derived(html.length + form.image.length > MAX_HTML);
	const readMin = $derived(Math.max(1, Math.round(words / 200)));

	let seeding = $state('');
	let hasPermissionError = $state(false);

	async function importSamples() {
		try {
			await seedTestimonials((t) => (seeding = t));
			notify('3 testimoni bawaan berhasil diimpor');
			await load();
		} catch (err) {
			notify('Gagal impor: ' + err, true);
		} finally {
			seeding = '';
		}
	}

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

	function begin(id: string | null, initialForm: TestimonialForm, initialHtml: string) {
		editingId = id;
		form = initialForm;
		html = initialHtml;
		hadBody = !!initialHtml;
		confirmClose = false;
		editing = true;
		bodyReady = true;
		startSnap = JSON.stringify([form, html]);
	}

	function openAdd() {
		bodyReady = false;
		begin(null, blank(), '');
	}

	async function openEdit(r: Row) {
		bodyReady = false;
		editing = true;
		editingId = r.id;
		const { id: _id, ...rest } = r;
		let body = '';
		try {
			body = (await readDoc<{ html: string }>('testimonialArticles', r.id))?.html ?? '';
		} catch (err) {
			notify('Isi testimoni tidak bisa dimuat: ' + err, true);
		}
		begin(r.id, { ...blank(), ...rest }, body);
	}

	function requestClose() {
		if (dirty) confirmClose = true;
		else editing = false;
	}

	async function pickCover(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			let url = await resizeToDataUrl(file, 1400, 0.78);
			if (url.length > 300_000) url = await resizeToDataUrl(file, 1100, 0.68);
			form.image = url;
		} catch {
			notify('File bukan gambar yang valid', true);
		} finally {
			input.value = '';
		}
	}

	function grow(e: Event) {
		const el = e.currentTarget as HTMLTextAreaElement;
		el.style.height = 'auto';
		el.style.height = el.scrollHeight + 'px';
	}

	function autosize(node: HTMLTextAreaElement) {
		queueMicrotask(() => {
			node.style.height = 'auto';
			node.style.height = node.scrollHeight + 'px';
		});
	}

	async function save(publishNow?: boolean) {
		if (!form.title.trim()) {
			notify('Judul cerita wajib diisi', true);
			return;
		}
		if (!form.clientName.trim()) {
			notify('Nama klien wajib diisi', true);
			return;
		}
		if (tooBig) {
			notify('Isi artikel terlalu besar. Kurangi jumlah atau ukuran gambar.', true);
			return;
		}
		if (publishNow !== undefined) form.published = publishNow;
		saving = true;
		try {
			const data = {
				...form,
				title: form.title.trim(),
				clientName: form.clientName.trim(),
				clientRole: form.clientRole.trim(),
				clientCompany: form.clientCompany.trim()
			};
			let id = editingId;
			if (id) await patchDoc('testimonials', id, data);
			else id = (await createDoc('testimonials', data)).id;

			if (html) await writeDoc('testimonialArticles', id, { html });
			else if (hadBody) await removeDoc('testimonialArticles', id);

			hadBody = !!html;
			editingId = id;
			startSnap = JSON.stringify([form, html]);
			notify(form.published ? 'Testimoni disimpan dan terbit' : 'Draf testimoni disimpan');
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
			await removeDoc('testimonialArticles', r.id).catch(() => {});
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
		<p>Kelola testimoni mitra, bukti kolaborasi di kebun/fasilitas prosesor, dan studi kasus dampak teknologi AgroPlus.</p>
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
		placeholder="Cari judul, nama klien, atau ringkasan…"
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
		<p>Tambahkan testimoni dan cerita kolaborasi pertama dari mitra prosesor atau perkebunan kopi Anda.</p>
		<div class="empty-acts">
			<button type="button" class="adm-btn primary" onclick={importSamples} disabled={!!seeding}>
				{seeding || 'Impor 3 testimoni bawaan'}
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
		<p>Tidak ada testimoni yang cocok dengan filter yang dipilih.</p>
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
						<a class="adm-btn sm icon-only" href="/testimonials/{r.id}" target="_blank" rel="noreferrer" title="Lihat di situs">
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
							<span>Hapus cerita ini?</span>
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

<!-- Editor Drawer / Modal -->
{#if editing}
	<div class="drawer-overlay" onclick={(e) => e.target === e.currentTarget && requestClose()} role="presentation">
		<div class="drawer" class:is-dirty={dirty}>
			<div class="ed-topbar">
				<div class="ed-title">
					<button type="button" class="adm-btn icon-only" onclick={requestClose} title="Tutup">
						<Icon name="close" size={18} />
					</button>
					<div>
						<h2>{editingId ? 'Edit Testimoni' : 'Testimoni Baru'}</h2>
						<span class="ed-state">{form.published ? 'Akan terbit di situs' : 'Disimpan sebagai draf'}</span>
					</div>
				</div>

				<div class="ed-acts">
					{#if dirty}
						<span class="dirty-badge">Perubahan belum disimpan</span>
					{/if}
					{#if editingId && form.published}
						<a class="adm-btn sm" href="/testimonials/{editingId}" target="_blank" rel="noreferrer">
							<Icon name="external" size={15} /> Lihat di situs
						</a>
					{/if}
					<button type="button" class="adm-btn" disabled={saving} onclick={() => save(false)}>
						Simpan draf
					</button>
					<button type="button" class="adm-btn primary" disabled={saving || tooBig} onclick={() => save(true)}>
						{saving ? 'Menyimpan…' : 'Terbitkan'}
					</button>
				</div>
			</div>

			{#if confirmClose}
				<div class="confirm-bar">
					<span>Ada perubahan yang belum disimpan. Yakin ingin keluar?</span>
					<div>
						<button type="button" class="adm-btn sm danger" onclick={() => (editing = false)}>Ya, abaikan</button>
						<button type="button" class="adm-btn sm primary" onclick={() => (confirmClose = false)}>Lanjut edit</button>
					</div>
				</div>
			{/if}

			<div class="ed-body">
				<div class="ed-main">
					<div class="ed-paper">
						<!-- Cover / Foto Bukti Klien -->
						<div class="cover-box">
							{#if form.image}
								<img class="cover-preview" src={form.image} alt="Foto bukti klien" />
								<div class="cover-acts">
									<label class="adm-btn sm">
										Ganti foto
										<input type="file" accept="image/*" hidden onchange={pickCover} />
									</label>
									<button type="button" class="adm-btn sm" onclick={() => (form.image = '')}>Hapus</button>
								</div>
							{:else}
								<label class="cover-empty">
									<Icon name="media" size={26} />
									<strong>Tambahkan foto bersama klien / bukti implementasi</strong>
									<span>Format landscape paling pas untuk cover cerita</span>
									<input type="file" accept="image/*" hidden onchange={pickCover} />
								</label>
							{/if}
						</div>

						<textarea
							class="title-input"
							rows="1"
							placeholder="Judul kisah testimoni (cth: Optimalisasi Fermentasi Liberica Bersama Ferroir)…"
							bind:value={form.title}
							oninput={grow}
							use:autosize
						></textarea>

						<div class="client-grid-inputs">
							<label class="adm-field">
								<span>Nama Klien / Narasumber *</span>
								<input class="adm-input" type="text" placeholder="cth: H. Wandhe" bind:value={form.clientName} required />
							</label>

							<label class="adm-field">
								<span>Jabatan / Peran</span>
								<input class="adm-input" type="text" placeholder="cth: Founder & Head Processor" bind:value={form.clientRole} />
							</label>

							<label class="adm-field">
								<span>Nama Perusahaan / Kebun</span>
								<input class="adm-input" type="text" placeholder="cth: Wandhe Family Estate (Wonosalam)" bind:value={form.clientCompany} />
							</label>
						</div>

						<label class="adm-field" style="margin-top: 14px;">
							<span>Kutipan Utama / Ringkasan Singkat (Lead Quote)</span>
							<textarea
								class="subtitle-input"
								rows="2"
								placeholder="Kutipan langsung dari klien yang paling berbobot (tampil di kartu dan header)..."
								bind:value={form.summary}
								oninput={grow}
								use:autosize
							></textarea>
						</label>

						<div class="editor-section">
							<span class="editor-label">Isi Lengkap Studi Kasus / Kisah Kolaborasi:</span>
							{#key editingId ?? 'new'}
								<RichEditor bind:html bind:words placeholder="Tuliskan latar belakang masalah klien, solusi yang digunakan, kutipan narasumber, dan hasil terukur..." />
							{/key}
						</div>
					</div>
				</div>

				<aside class="ed-side">
					<section>
						<h4>Pengaturan</h4>
						<label class="adm-field">
							Kategori
							<select class="adm-input" bind:value={form.category}>
								{#each CATEGORIES as c}<option>{c}</option>{/each}
							</select>
						</label>

						<label class="adm-field">
							Rating Kepuasan
							<select class="adm-input" bind:value={form.rating}>
								<option value={5}>★★★★★ (5 Bintang)</option>
								<option value={4}>★★★★☆ (4 Bintang)</option>
								<option value={3}>★★★☆☆ (3 Bintang)</option>
							</select>
						</label>

						<label class="adm-field">
							Tanggal
							<input class="adm-input" type="date" bind:value={form.date} required />
						</label>

						<label class="switch">
							<input type="checkbox" bind:checked={form.published} />
							<span class="knob"></span>
							<span>Tayang di situs</span>
						</label>
					</section>

					<section>
						<h4>Statistik Konten</h4>
						<dl>
							<div><dt>Kata</dt><dd>{words}</dd></div>
							<div><dt>Waktu baca</dt><dd>±{readMin} menit</dd></div>
							<div><dt>Ukuran</dt><dd class:bad={tooBig}>{sizeKb} KB</dd></div>
						</dl>
						{#if tooBig}
							<p class="bad">Ukuran terlalu besar (batas ~900 KB). Kurangi gambar di dalam artikel.</p>
						{/if}
					</section>

					<section class="tips">
						<h4>Tips Cerita Klien Berbobot</h4>
						<ul>
							<li>Sertakan nama spesifik perkebunan, roastery, atau fasilitas pengolahan.</li>
							<li>Gunakan fitur <strong>Blockquote</strong> (<kbd>"</kbd>) untuk highlight kutipan langsung.</li>
							<li>Sebutkan metrik hasil (misal: stabilitas rasa, penghematan waktu, peningkatan cup score).</li>
						</ul>
					</section>
				</aside>
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
		transition: transform 0.2s ease, box-shadow 0.2s ease;
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

	/* Drawer */
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
		max-width: 1200px;
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

	.dirty-badge {
		font-size: 0.75rem;
		color: #b45309;
		background: #fef3c7;
		padding: 4px 10px;
		border-radius: 999px;
		font-weight: 600;
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

	.ed-body {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 310px;
		overflow: hidden;
	}

	.ed-main {
		overflow-y: auto;
		padding: 24px 32px 64px;
	}

	.ed-paper {
		background: #ffffff;
		border-radius: 14px;
		padding: 32px 36px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
		border: 1px solid rgba(85, 104, 61, 0.12);
	}

	.cover-box {
		margin-bottom: 24px;
	}

	.cover-preview {
		width: 100%;
		max-height: 320px;
		object-fit: cover;
		border-radius: 10px;
		display: block;
	}

	.cover-acts {
		display: flex;
		gap: 8px;
		margin-top: 10px;
	}

	.cover-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 36px 20px;
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

	.title-input {
		width: 100%;
		border: none;
		outline: none;
		font-size: 1.5rem;
		font-weight: 700;
		color: #25330f;
		line-height: 1.25;
		margin-bottom: 16px;
		resize: none;
		padding: 0;
		background: transparent;
	}

	.title-input::placeholder {
		color: #a4b395;
	}

	.client-grid-inputs {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
		margin-bottom: 16px;
		padding-bottom: 16px;
		border-bottom: 1px solid rgba(85, 104, 61, 0.12);
	}

	.client-grid-inputs span {
		font-size: 0.78rem;
		font-weight: 600;
		color: #45552d;
		margin-bottom: 4px;
		display: block;
	}

	.subtitle-input {
		width: 100%;
		border: 1px solid rgba(85, 104, 61, 0.2);
		border-radius: 8px;
		padding: 10px 14px;
		font-size: 0.92rem;
		color: #25330f;
		line-height: 1.5;
		resize: none;
		background: #fafbfa;
		outline: none;
	}

	.subtitle-input:focus {
		border-color: #25330f;
		background: #ffffff;
	}

	.editor-section {
		margin-top: 24px;
		padding-top: 20px;
		border-top: 1px solid rgba(85, 104, 61, 0.12);
	}

	.editor-label {
		display: block;
		font-size: 0.85rem;
		font-weight: 700;
		color: #25330f;
		margin-bottom: 12px;
	}

	.ed-side {
		background: #ffffff;
		border-left: 1px solid rgba(85, 104, 61, 0.15);
		padding: 24px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.ed-side section h4 {
		margin: 0 0 12px;
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #849962;
	}

	.ed-side dl {
		display: grid;
		gap: 8px;
		margin: 0;
	}

	.ed-side dl div {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
	}

	.ed-side dt {
		color: #6a7b54;
	}

	.ed-side dd {
		margin: 0;
		font-weight: 700;
		color: #25330f;
	}

	.bad {
		color: #b91c1c !important;
	}

	.tips ul {
		margin: 0;
		padding-left: 18px;
		font-size: 0.8rem;
		color: #45552d;
		line-height: 1.5;
		display: grid;
		gap: 6px;
	}

	.switch {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		margin-top: 14px;
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

	@media (max-width: 960px) {
		.row {
			grid-template-columns: 1fr auto;
		}

		.thumb {
			display: none;
		}

		.ed-body {
			grid-template-columns: 1fr;
		}

		.ed-side {
			display: none;
		}

		.client-grid-inputs {
			grid-template-columns: 1fr;
		}
	}
</style>

