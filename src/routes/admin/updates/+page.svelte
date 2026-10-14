<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/admin/Icon.svelte';
	import FilterBar from '$lib/admin/FilterBar.svelte';
	import { inRange, matches, newFilter } from '$lib/admin/filter';
	import RichEditor from '$lib/admin/RichEditor.svelte';
	import { notify } from '$lib/admin/toast.svelte';
	import { createDoc, formatDate, listAll, patchDoc, readDoc, removeDoc, writeDoc } from '$lib/admin/db';
	import { resizeToDataUrl } from '$lib/team-store';
	import { seedUpdates } from '$lib/admin/seed';

	const CATEGORIES = ['Press Release', 'News', 'Event', 'Product'];
	const MAX_HTML = 900_000; // batas aman satu dokumen Firestore (1 MB)

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
	let editing = $state(false);
	let editingId = $state<string | null>(null);
	let confirmId = $state<string | null>(null);
	let form = $state<Update>(blank());
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
			options: [{ value: '', label: 'Semua kategori' }, ...CATEGORIES.map((c) => ({ value: c, label: c, count: rows.filter((r) => r.category === c).length }))]
		},
		{
			key: 'cover',
			label: 'Gambar sampul',
			variant: 'select' as const,
			options: [
				{ value: '', label: 'Semua' },
				{ value: 'ada', label: 'Ada sampul', count: rows.filter((r) => r.image).length },
				{ value: 'tidak', label: 'Tanpa sampul', count: rows.filter((r) => !r.image).length }
			]
		}
	]);
	const SORTS = [
		{ value: 'terbaru', label: 'Terbaru' },
		{ value: 'terlama', label: 'Terlama' },
		{ value: 'judul', label: 'Judul A–Z' }
	];

	const sorted = $derived(
		rows
			.filter(
				(r) =>
					(!filt.values.status || (filt.values.status === 'terbit') === (r.published !== false)) &&
					(!filt.values.category || r.category === filt.values.category) &&
					(!filt.values.cover || (filt.values.cover === 'ada') === !!r.image) &&
					inRange(r.date, filt.from, filt.to) &&
					matches(filt.query, r.title, r.summary, r.category)
			)
			.sort((a, b) => {
				if (filt.sort === 'terlama') return (a.date ?? '').localeCompare(b.date ?? '');
				if (filt.sort === 'judul') return a.title.localeCompare(b.title);
				return (b.date ?? '').localeCompare(a.date ?? '');
			})
	);
	const dirty = $derived(editing && bodyReady && JSON.stringify([form, html]) !== startSnap);
	const sizeKb = $derived(Math.round((html.length + form.image.length) / 1024));
	const readMin = $derived(Math.max(1, Math.round(words / 200)));
	const tooBig = $derived(html.length > MAX_HTML);

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

	// Pindahkan editor ke <body> supaya menutupi area kanan sidebar sampai ke bawah layar.
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return { destroy: () => node.remove() };
	}

	$effect(() => {
		if (!editing) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => (document.body.style.overflow = prev);
	});

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

	function begin(id: string | null, data: Update, body: string) {
		editingId = id;
		form = data;
		html = body;
		words = 0;
		hadBody = !!body;
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
			body = (await readDoc<{ html: string }>('articles', r.id))?.html ?? '';
		} catch (err) {
			notify('Isi artikel tidak bisa dimuat: ' + err, true);
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
			notify('Judul wajib diisi', true);
			return;
		}
		if (tooBig) {
			notify('Isi artikel terlalu besar. Kurangi jumlah atau ukuran gambar.', true);
			return;
		}
		if (publishNow !== undefined) form.published = publishNow;
		saving = true;
		try {
			const data = { ...form, title: form.title.trim() };
			let id = editingId;
			if (id) await patchDoc('updates', id, data);
			else id = (await createDoc('updates', data)).id;
			if (html) await writeDoc('articles', id, { html });
			else if (hadBody) await removeDoc('articles', id);
			hadBody = !!html;
			editingId = id;
			startSnap = JSON.stringify([form, html]);
			notify(form.published ? 'Artikel disimpan dan terbit' : 'Draf disimpan');
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
			await removeDoc('articles', r.id).catch(() => {});
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
		<p>Muncul di bagian "Updates" pada halaman utama dan punya halaman artikel sendiri. Draf tidak ditampilkan ke pengunjung.</p>
	</div>
	<button class="adm-btn primary" onclick={openAdd}><Icon name="plus" size={18} />Tulis artikel</button>
</div>

{#if rows.length}
	<FilterBar bind:model={filt} filters={filterDefs} sorts={SORTS} dateLabel="Tanggal berita" placeholder="Cari judul atau ringkasan…" total={rows.length} shown={sorted.length} noun="berita" />
{/if}

{#if loading}
	<div class="list">{#each Array(3) as _}<div class="adm-card skel"></div>{/each}</div>
{:else if !rows.length}
	<div class="adm-card adm-empty">
		<Icon name="news" size={32} />
		<p>Belum ada berita. Halaman utama sementara menampilkan contoh bawaan.</p>
		<div class="empty-acts">
			<button class="adm-btn primary" onclick={importSamples} disabled={!!seeding}>{seeding || 'Impor 6 berita bawaan'}</button>
			<button class="adm-btn" onclick={openAdd}>Tulis artikel pertama</button>
		</div>
	</div>
{:else if !sorted.length}
	<div class="adm-card adm-empty">Tidak ada berita yang cocok dengan filter.</div>
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
					{#if r.published !== false}
						<a class="adm-btn sm" href="/updates/{r.id}" target="_blank" rel="noreferrer"><Icon name="external" size={15} />Lihat</a>
					{/if}
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

{#if editing}
	<div class="adm portal" use:portal>
		<div class="editor" role="dialog" aria-modal="true" aria-label="Editor artikel">
			<header class="ed-top">
				<button type="button" class="adm-btn" onclick={requestClose}><Icon name="close" size={17} />Tutup</button>
				<div class="ed-title">
					<small>Berita</small>
					<span class="status" class:live={form.published}>{form.published ? 'Terbit' : 'Draf'}</span>
					{#if dirty}<span class="unsaved">Belum disimpan</span>{/if}
				</div>
				<div class="ed-acts">
					<button class="adm-btn" onclick={() => save(false)} disabled={saving || !bodyReady}>Simpan draf</button>
					<button class="adm-btn primary" onclick={() => save(true)} disabled={saving || !bodyReady}>
						<Icon name="check" size={18} />{saving ? 'Menyimpan…' : form.published && editingId ? 'Perbarui' : 'Terbitkan'}
					</button>
				</div>
			</header>

			{#if confirmClose}
				<div class="warnbar">
					<span>Ada perubahan yang belum disimpan.</span>
					<button class="adm-btn sm" onclick={() => (confirmClose = false)}>Lanjut menulis</button>
					<button class="adm-btn sm danger" onclick={() => { editing = false; confirmClose = false; }}>Tutup tanpa simpan</button>
				</div>
			{/if}

			{#if !bodyReady}
				<div class="loading">Memuat artikel…</div>
			{:else}
				<div class="ed-body">
					<div class="ed-scroll">
						<div class="paper">
							<div class="cover" class:has={!!form.image}>
								{#if form.image}
									<img src={form.image} alt="Sampul artikel" />
									<div class="cover-acts">
										<label class="adm-btn sm">Ganti sampul<input type="file" accept="image/*" hidden onchange={pickCover} /></label>
										<button type="button" class="adm-btn sm" onclick={() => (form.image = '')}>Hapus</button>
									</div>
								{:else}
									<label class="cover-empty">
										<Icon name="media" size={26} />
										<strong>Tambahkan gambar sampul</strong>
										<span>Rasio 16 : 9 paling pas</span>
										<input type="file" accept="image/*" hidden onchange={pickCover} />
									</label>
								{/if}
							</div>

							<textarea class="title" rows="1" placeholder="Judul artikel" bind:value={form.title} oninput={grow} use:autosize></textarea>
							<textarea class="subtitle" rows="1" placeholder="Ringkasan singkat (tampil di kartu dan hasil berbagi)…" bind:value={form.summary} oninput={grow} use:autosize></textarea>

							{#key editingId ?? 'new'}
								<RichEditor bind:html bind:words />
							{/key}
						</div>
					</div>

					<aside class="ed-side">
						<section>
							<h4>Pengaturan</h4>
							<label class="adm-field">Kategori
								<select class="adm-input" bind:value={form.category}>
									{#each CATEGORIES as c}<option>{c}</option>{/each}
								</select>
							</label>
							<label class="adm-field">Tanggal terbit<input class="adm-input" type="date" bind:value={form.date} required /></label>
							<label class="switch">
								<input type="checkbox" bind:checked={form.published} />
								<span class="knob"></span>
								<span>Tayang di situs</span>
							</label>
						</section>

						<section>
							<h4>Statistik</h4>
							<dl>
								<div><dt>Kata</dt><dd>{words}</dd></div>
								<div><dt>Waktu baca</dt><dd>±{readMin} menit</dd></div>
								<div><dt>Ukuran</dt><dd class:bad={tooBig}>{sizeKb} KB</dd></div>
							</dl>
							{#if tooBig}<p class="bad">Isi terlalu besar (batas sekitar 900 KB). Kurangi gambar di dalam artikel.</p>{/if}
						</section>

						{#if editingId && form.published}
							<section>
								<h4>Halaman publik</h4>
								<a class="adm-btn sm" href="/updates/{editingId}" target="_blank" rel="noreferrer"><Icon name="external" size={15} />Buka artikel</a>
							</section>
						{/if}

						<section class="tips">
							<h4>Tips menulis</h4>
							<ul>
								<li>Ketik <kbd>/</kbd> di baris kosong untuk menyisipkan judul, daftar, kutipan, atau gambar.</li>
								<li>Blok teks untuk memunculkan toolbar cepat.</li>
								<li>Tempel atau seret gambar langsung ke editor.</li>
								<li><kbd>Ctrl</kbd>+<kbd>K</kbd> untuk tautan.</li>
							</ul>
						</section>
					</aside>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
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
		flex-wrap: wrap;
		gap: 6px;
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
		}
	}

	/* ───── Editor artikel layar penuh (menyisakan sidebar di desktop) ───── */
	.portal {
		position: fixed;
		inset: 0 0 0 264px;
		z-index: 200;
		min-height: 0;
	}

	@media (max-width: 900px) {
		.portal {
			inset: 0;
		}
	}

	.editor {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		background: var(--bg);
		animation: ed-in 0.45s var(--ease) both;
	}

	@keyframes ed-in {
		from {
			opacity: 0;
			transform: translateY(18px) scale(0.985);
		}
	}

	.ed-top {
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 14px clamp(16px, 3vw, 36px);
		border-bottom: 1px solid var(--line);
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(14px);
	}

	.ed-title {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	.ed-title small {
		color: var(--muted);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.status {
		padding: 3px 10px;
		border-radius: 999px;
		background: #ecefe9;
		color: var(--muted);
		font-size: 0.72rem;
		font-weight: 600;
	}

	.status.live {
		background: #e8eedc;
		color: var(--brand);
	}

	.unsaved {
		color: #94620a;
		font-size: 0.78rem;
	}

	.ed-acts {
		display: flex;
		gap: 10px;
	}

	.warnbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		padding: 10px clamp(16px, 3vw, 36px);
		background: #fbefd5;
		color: #7a5208;
		font-size: 0.86rem;
	}

	.warnbar span {
		flex: 1;
	}

	.loading {
		display: grid;
		flex: 1;
		place-items: center;
		color: var(--muted);
	}

	.ed-body {
		display: grid;
		grid-template-columns: 1fr 300px;
		flex: 1;
		min-height: 0;
	}

	.ed-scroll {
		overflow-y: auto;
		padding: clamp(16px, 3vw, 40px);
	}

	.paper {
		max-width: 780px;
		margin: 0 auto;
		padding: clamp(20px, 3.5vw, 48px);
		border: 1px solid var(--line);
		border-radius: 24px;
		background: #fff;
		box-shadow: var(--shadow);
	}

	.cover {
		position: relative;
		margin-bottom: 24px;
		overflow: hidden;
		border-radius: 18px;
		background: #f3f6ee;
	}

	.cover img {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}

	.cover-acts {
		position: absolute;
		right: 12px;
		bottom: 12px;
		display: flex;
		gap: 8px;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.cover:hover .cover-acts,
	.cover:focus-within .cover-acts {
		opacity: 1;
	}

	.cover-empty {
		display: grid;
		place-items: center;
		align-content: center;
		gap: 4px;
		aspect-ratio: 16 / 6;
		border: 1.5px dashed rgba(85, 104, 61, 0.4);
		border-radius: 18px;
		color: var(--brand);
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.cover-empty:hover {
		background: #eaf0e1;
	}

	.cover-empty span {
		color: var(--muted);
		font-size: 0.78rem;
	}

	.title,
	.subtitle {
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		color: #172010;
		font-family: Poppins, Inter, system-ui, sans-serif;
		resize: none;
		overflow: hidden;
		outline: none;
	}

	.title {
		margin-bottom: 8px;
		font-size: clamp(1.9rem, 3.6vw, 2.8rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.15;
	}

	.subtitle {
		margin-bottom: 22px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--line);
		color: #62705a;
		font-size: 1.15rem;
		line-height: 1.5;
	}

	.title::placeholder,
	.subtitle::placeholder {
		color: #b0b9a6;
	}

	.ed-side {
		display: grid;
		align-content: start;
		gap: 16px;
		padding: 24px 20px;
		overflow-y: auto;
		border-left: 1px solid var(--line);
	}

	.ed-side section {
		display: grid;
		gap: 12px;
		padding: 16px;
		border: 1px solid var(--line);
		border-radius: 16px;
		background: #fff;
	}

	.ed-side h4 {
		margin: 0;
		color: var(--muted);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	dl {
		display: grid;
		gap: 8px;
		margin: 0;
	}

	dl > div {
		display: flex;
		justify-content: space-between;
		font-size: 0.88rem;
	}

	dt {
		color: var(--muted);
	}

	dd {
		margin: 0;
		font-weight: 600;
	}

	.bad {
		margin: 0;
		color: var(--danger);
		font-size: 0.8rem;
	}

	.tips ul {
		display: grid;
		gap: 8px;
		margin: 0;
		padding-left: 18px;
		color: var(--muted);
		font-size: 0.8rem;
		line-height: 1.5;
	}

	kbd {
		padding: 1px 6px;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: #f3f6ee;
		font-family: ui-monospace, Menlo, monospace;
		font-size: 0.72rem;
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

	@media (max-width: 1100px) {
		.ed-body {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;
		}

		.ed-side {
			display: none;
		}
	}
</style>
