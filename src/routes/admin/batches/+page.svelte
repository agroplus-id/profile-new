<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/admin/Icon.svelte';
	import { notify } from '$lib/admin/toast.svelte';
	import { createDocWithId, listAll, patchDoc, removeDoc } from '$lib/admin/db';
	import { normalizeCode, type Order } from '$lib/admin/orders';
	import { FLAVOR_OPTIONS, blankBatch, guessStoreName, type Batch } from '$lib/batch';
	import { importFromFerroir, nextPassportNumber } from '$lib/admin/passport';
	import { seedBatch } from '$lib/admin/seed';
	import { resizeToDataUrl } from '$lib/team-store';
	import { deleteImage, fetchImages, imageKeys, saveImage } from '$lib/batch-images';

	type Row = Batch & { id: string };

	// Impor otomatis dari Ferroir dimatikan dulu: data paspor diisi manual. Ubah ke true bila API-nya sudah siap
	// (butuh FERROIR_API_URL di server, lihat src/routes/api/ferroir).
	const FERROIR_IMPORT = false;

	let rows = $state<Row[]>([]);
	let orders = $state<(Order & { id: string })[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let drawer = $state(false);
	let editingId = $state<string | null>(null);
	let confirmId = $state<string | null>(null);
	let code = $state('');
	let form = $state<Batch>(blankBatch());
	// Pembentuk kode batch: AGP-<mitra>-<DDMMYYYY perilisan>-<jenis beans><nomor baris>
	const BEANS = [
		{ letter: 'A', label: 'Arabica' },
		{ letter: 'R', label: 'Robusta' },
		{ letter: 'L', label: 'Liberica' },
		{ letter: 'E', label: 'Excelsa' }
	];
	let partnerCode = $state('BMK');
	let releaseDate = $state(new Date().toISOString().slice(0, 10));
	let beans = $state('A');

	const cleanPartner = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
	const ddmmyyyy = (iso: string) => (iso ? iso.slice(8, 10) + iso.slice(5, 7) + iso.slice(0, 4) : '');

	const pad = (n: number) => String(n).padStart(3, '0');

	// Berat diisi dalam kilogram di form; di database tetap disimpan dalam gram (batch lama tidak perlu diubah).
	const kg = (gram: number) => (gram ? Number((gram / 1000).toFixed(3)) : 0);
	const toGram = (v: string) => Math.max(0, Math.round((parseFloat(v) || 0) * 1000));

	// Setiap kemasan punya kode sendiri: <awalan><nomor kemasan>, mis. AGP-BMK-13102026-A001 … A030.
	// Jumlah kemasan = total produksi ÷ berat per kemasan (dibulatkan ke bawah).
	const itemCount = $derived(form.weightGram > 0 ? Math.floor(form.totalGram / form.weightGram) : 0);

	function parseId(id: string) {
		const m = id.match(/^(.*-[A-Z])(\d+)$/);
		return m ? { prefix: m[1], start: Number(m[2]) } : null;
	}

	// Nomor kemasan pertama batch baru = nomor terakhir yang sudah terpakai (semua batch dengan awalan sama) + 1.
	// Memakai rentang yang sudah ada (bukan jumlah batch) agar tidak bentrok walau ada batch yang dihapus.
	function nextStart(existing: { id: string; totalItems?: number }[]) {
		const prefix = `AGP-${cleanPartner(partnerCode)}-${ddmmyyyy(releaseDate)}-${beans}`;
		let max = 0;
		for (const r of existing) {
			const p = parseId(r.id);
			if (p && p.prefix === prefix) max = Math.max(max, p.start + Math.max(1, r.totalItems ?? 1) - 1);
		}
		return { prefix, start: max + 1 };
	}

	let importEmail = $state('');
	let importing = $state(false);
	let importNote = $state<{ ok: boolean; text: string } | null>(null);
	let fromFerroir = $state(false);

	// Email pembeli dari pesanan yang terhubung ke batch ini.
	const linkedEmails = $derived(
		[...new Set(orders.filter((o) => o.batch === normalizeCode(code) && o.email).map((o) => o.email))]
	);
	let scroller = $state<HTMLElement>();
	let activeSec = $state('sec-identitas');

	// Isian Coffee Passport ditampilkan dan diisi manual. Isi otomatis dari Ferroir (FERROIR_IMPORT) masih dimatikan
	// sampai API-nya tersedia.
	const SHOW_PASSPORT = true;

	const ALL_SECTIONS = [
		{ id: 'sec-identitas', label: 'Identitas' },
		{ id: 'sec-cerita', label: 'Cerita' },
		{ id: 'sec-paspor', label: 'Coffee Passport' },
		{ id: 'sec-rantai', label: 'Rantai produksi' },
		{ id: 'sec-rasa', label: 'Cita rasa' },
		{ id: 'sec-detail', label: 'Detail & toko' }
	];
	const SECTIONS = ALL_SECTIONS.filter((x) => SHOW_PASSPORT || x.id !== 'sec-paspor');
	const secNo = (id: string) => SECTIONS.findIndex((x) => x.id === id) + 1;

	let seeding = $state('');

	async function importSample() {
		try {
			const id = await seedBatch((t) => (seeding = t));
			notify(`Batch contoh ${id} berhasil diimpor`);
			await load();
		} catch (err) {
			notify('Gagal impor: ' + err, true);
		} finally {
			seeding = '';
		}
	}

	onMount(load);

	// Pindahkan editor ke <body> agar benar-benar menutupi seluruh layar (di atas sidebar),
	// tak peduli elemen induk mana yang mengurung elemen fixed.
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return { destroy: () => node.remove() };
	}

	// Kunci scroll halaman di belakang editor layar penuh.
	$effect(() => {
		if (!drawer) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		activeSec = SECTIONS[0].id;
		return () => (document.body.style.overflow = prev);
	});

	function goSection(id: string) {
		scroller?.querySelector('#' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	// Tandai bagian yang sedang terlihat di menu kiri.
	function onScrollSections() {
		if (!scroller) return;
		const top = scroller.getBoundingClientRect().top + 90;
		let current = SECTIONS[0].id;
		for (const sec of SECTIONS) {
			const el = scroller.querySelector('#' + sec.id);
			if (el && el.getBoundingClientRect().top <= top) current = sec.id;
		}
		activeSec = current;
	}

	async function load() {
		loading = true;
		try {
			[rows, orders] = await Promise.all([listAll<Batch>('batches'), listAll<Order>('orders')]);
		} catch (err) {
			notify('Gagal memuat batch: ' + err, true);
		} finally {
			loading = false;
		}
	}

	const preview = $derived(nextStart(rows));
	const previewCode = $derived(preview.prefix + pad(preview.start));
	// Awalan dan nomor awal untuk daftar kode kemasan: batch yang diedit memakai ID-nya, batch baru memakai pratinjau.
	const ctx = $derived(editingId ? (parseId(editingId) ?? { prefix: editingId, start: 1 }) : preview);
	const firstCode = $derived(ctx.prefix + pad(ctx.start));
	const lastCode = $derived(itemCount > 0 ? ctx.prefix + pad(ctx.start + itemCount - 1) : '—');


	const orderCount = (id: string) => orders.filter((o) => o.batch === id).length;

	function openAdd() {
		editingId = null;
		code = '';
		partnerCode = 'BMK';
		releaseDate = new Date().toISOString().slice(0, 10);
		beans = 'A';
		resetImages();
		form = blankBatch(); // isian umum dari Bumi Kopi; data paspor dikosongkan (diisi dari Ferroir)
		importEmail = '';
		importNote = null;
		fromFerroir = false;
		drawer = true;
	}

	function openEdit(r: Row) {
		editingId = r.id;
		code = r.id;
		const { id: _id, ...rest } = r;
		// rest berasal dari state reaktif (proxy): $state.snapshot membuatnya objek biasa, karena structuredClone
		// tidak bisa menyalin proxy dan akan melempar error (tombol Edit jadi tidak bereaksi).
		form = { ...blankBatch(), ...structuredClone($state.snapshot(rest)) };
		// Batch lama hanya punya satu link toko: jadikan baris pertama daftar toko.
		const legacy = rest as unknown as { storeUrl?: string };
		if (!form.stores?.length) {
			form.stores = legacy.storeUrl ? [{ name: guessStoreName(legacy.storeUrl), url: legacy.storeUrl }] : [];
		}
		importEmail = '';
		importNote = null;
		fromFerroir = false;
		resetImages();
		drawer = true;
		loadImagesFor(r);
		autoImport();
	}

	async function runImport(email: string, silent: boolean) {
		const target = email.trim();
		if (!target) {
			importNote = { ok: false, text: 'Isi email pembeli dulu.' };
			return;
		}
		importing = true;
		const res = await importFromFerroir(target, normalizeCode(code));
		importing = false;
		if (!res.ok) {
			if (!silent) importNote = { ok: false, text: res.message };
			return;
		}
		const entries = Object.entries(res.data).filter(([, v]) => v);
		if (!entries.length) {
			if (!silent) importNote = { ok: false, text: 'Belum ada data dari Ferroir untuk email ini.' };
			return;
		}
		Object.assign(form, Object.fromEntries(entries));
		fromFerroir = true;
		importNote = { ok: true, text: `Terisi otomatis dari Ferroir (${entries.length} kolom). Nomor paspor dibuat saat disimpan.` };
	}

	// Bila batch sudah punya pesanan dan data paspor masih kosong, coba isi otomatis dari email pembeli.
	function autoImport() {
		if (!FERROIR_IMPORT || form.lotNumber || !linkedEmails.length) return;
		importEmail = linkedEmails[0];
		runImport(importEmail, true);
	}

	// ───── Gambar batch: disimpan di dokumen terpisah (koleksi batchImages), jadi tiap gambar boleh sampai ~800 KB ─────
	type PlacePhoto = { caption: string; src: string };
	let imgs = $state<Record<string, string>>({});
	let dirtyImgs = $state<string[]>([]);
	let removedImgs = $state<string[]>([]);
	let places = $state<PlacePhoto[]>([]);
	let placesDirty = $state(false);
	let loadedPlaceCount = 0;
	let mapLink = $state('');
	const MAX_PLACES = 6;

	function resetImages() {
		imgs = {};
		dirtyImgs = [];
		removedImgs = [];
		places = [];
		placesDirty = false;
		loadedPlaceCount = 0;
		mapLink = '';
	}

	async function compress(file: File, max: number, quality: number, limit: number) {
		let url = await resizeToDataUrl(file, max, quality);
		if (url.length > limit) url = await resizeToDataUrl(file, Math.round(max * 0.8), quality - 0.1);
		if (url.length > limit) url = await resizeToDataUrl(file, Math.round(max * 0.6), quality - 0.2);
		if (url.length > limit * 1.15) throw new Error('too-big');
		return url;
	}

	async function pickImage(e: Event, key: 'hero' | 'why' | 'passport') {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			imgs[key] = await compress(file, 1600, 0.8, 700_000);
			if (!dirtyImgs.includes(key)) dirtyImgs.push(key);
			removedImgs = removedImgs.filter((k) => k !== key);
		} catch (err) {
			notify(String(err).includes('too-big') ? 'Gambar terlalu besar, pilih yang lebih sederhana atau lebih kecil' : 'File bukan gambar yang valid', true);
		} finally {
			input.value = '';
		}
	}

	function removeImg(key: 'hero' | 'why' | 'passport') {
		delete imgs[key];
		dirtyImgs = dirtyImgs.filter((k) => k !== key);
		if (!removedImgs.includes(key)) removedImgs.push(key);
	}

	async function addPlace(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const files = [...(input.files ?? [])].slice(0, MAX_PLACES - places.length);
		for (const f of files) {
			try {
				places.push({ caption: '', src: await compress(f, 1200, 0.75, 500_000) });
				placesDirty = true;
			} catch {
				notify(`${f.name}: gambar tidak bisa dipakai`, true);
			}
		}
		input.value = '';
	}

	function removePlace(i: number) {
		places.splice(i, 1);
		placesDirty = true;
	}

	// Ambil koordinat dari tautan Google Maps (…@-7.6,112.3… / …!3d-7.6!4d112.3 / …?q=-7.6,112.3) atau teks "lat, lng".
	function parseMapLink() {
		const t = mapLink.trim();
		const m =
			t.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/) ||
			t.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/) ||
			t.match(/[?&](?:q|ll|query)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/) ||
			t.match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/);
		if (!m) {
			notify('Koordinat tidak terbaca. Buka lokasinya di Google Maps lalu salin tautan dari bilah alamat (bukan tautan pendek).', true);
			return;
		}
		form.mapLat = Number(m[1]);
		form.mapLng = Number(m[2]);
		notify('Koordinat terisi');
	}

	async function loadImagesFor(r: Row) {
		const n = r.placePhotos?.length ?? 0;
		const got = await fetchImages(r.id, imageKeys(n));
		for (const k of ['hero', 'why', 'passport'] as const) if (got[k]) imgs[k] = got[k];
		places = (r.placePhotos ?? []).map((p, i) => ({ caption: p.caption, src: got[`place_${i}`] ?? '' })).filter((p) => p.src);
		loadedPlaceCount = n;
		// Gambar lama yang tersimpan langsung di dokumen batch dipindahkan ke penyimpanan terpisah saat disimpan.
		if (!imgs.hero && form.heroImage) {
			imgs.hero = form.heroImage;
			dirtyImgs.push('hero');
		}
		if (!imgs.why && form.whyImage) {
			imgs.why = form.whyImage;
			dirtyImgs.push('why');
		}
	}

	async function persistImages(id: string) {
		for (const k of dirtyImgs) if (imgs[k]) await saveImage(id, k, imgs[k]);
		for (const k of removedImgs) await deleteImage(id, k);
		if (placesDirty) {
			for (let i = 0; i < places.length; i++) await saveImage(id, `place_${i}`, places[i].src);
			for (let i = places.length; i < loadedPlaceCount; i++) await deleteImage(id, `place_${i}`);
		}
	}

	function addStore() {
		form.stores.push({ name: '', url: '' });
	}

	function removeStore(i: number) {
		form.stores.splice(i, 1);
	}

	function addStep() {
		form.steps.push({ name: '', description: '' });
	}

	function removeStep(i: number) {
		form.steps.splice(i, 1);
	}

	function moveStep(i: number, dir: -1 | 1) {
		const j = i + dir;
		if (j < 0 || j >= form.steps.length) return;
		[form.steps[i], form.steps[j]] = [form.steps[j], form.steps[i]];
	}

	function toggleFlavor(key: string) {
		form.flavors = form.flavors.includes(key) ? form.flavors.filter((k) => k !== key) : [...form.flavors, key];
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!editingId && (!cleanPartner(partnerCode) || !releaseDate)) {
			notify('Isi kode mitra dan tanggal perilisan', true);
			return;
		}
		if (!form.steps.length) {
			notify('Tambahkan minimal satu tahap produksi', true);
			return;
		}
		if (itemCount < 1) {
			notify('Total produksi harus minimal sebesar berat per kemasan', true);
			return;
		}
		form.totalItems = itemCount;
		saving = true;
		try {
			// Batch baru: hitung ulang nomor baris dari data terbaru agar dua admin tidak mendapat kode sama.
			let id = editingId ?? '';
			let codeMeta = {};
			if (!editingId) {
				const fresh = await listAll<Batch>('batches');
				const n = nextStart(fresh);
				id = n.prefix + pad(n.start);
				code = id;
				codeMeta = { codePrefix: n.prefix, itemStart: n.start };
			}
			// Nomor paspor baru muncul setelah data paspor terisi, dan dibuat sekali (tidak pernah ganda).
			if (form.lotNumber.trim() && !form.passportNumber) form.passportNumber = await nextPassportNumber();
			// storeLabel/storeUrl kosong: membersihkan sisa data lama agar tidak muncul lagi
			const data: Record<string, unknown> = { ...$state.snapshot(form), storeLabel: '', storeUrl: '', heroImage: '', whyImage: '' };
			if (placesDirty) data.placePhotos = places.map((p) => ({ caption: p.caption.trim() }));
			if (editingId) {
				await patchDoc('batches', editingId, data);
			} else {
				await createDocWithId('batches', id, { ...data, ...codeMeta, partnerCode: cleanPartner(partnerCode), releaseDate, beans });
			}
			await persistImages(id);
			notify(editingId ? 'Batch diperbarui' : `Batch ${id} ditambahkan`);
			drawer = false;
			await load();
		} catch (err) {
			notify('Gagal menyimpan: ' + err, true);
		} finally {
			saving = false;
		}
	}

	async function remove(r: Row) {
		try {
			await removeDoc('batches', r.id);
			notify('Batch dihapus');
			confirmId = null;
			await load();
		} catch (err) {
			notify('Gagal menghapus: ' + err, true);
		}
	}
</script>

<div class="adm-page-head">
	<div>
		<h1>Batch kopi</h1>
		<p>
			Isi halaman <b>Supply Verification</b> yang dilihat pelanggan setelah memasukkan kode pesanan. Hubungkan pesanan ke batch lewat kolom
			"Kode batch" di menu Pesanan.
		</p>
	</div>
	<button class="adm-btn primary" onclick={openAdd}><Icon name="plus" size={18} />Tambah batch</button>
</div>

{#if loading}
	<div class="adm-card adm-empty">Memuat batch…</div>
{:else if !rows.length}
	<div class="adm-card adm-empty">
		<Icon name="batch" size={32} />
		<p>
			Belum ada batch. Pelanggan yang lolos verifikasi sementara melihat tampilan bawaan (Bumi Kopi Liberica). Buat batch untuk menampilkan data kopi
			mereka sendiri.
		</p>
		<div class="empty-acts">
			<button class="adm-btn primary" onclick={importSample} disabled={!!seeding}>{seeding || 'Impor batch contoh (Bumi Kopi)'}</button>
			<button class="adm-btn" onclick={openAdd}>Buat batch pertama</button>
		</div>
	</div>
{:else}
	<div class="grid">
		{#each rows as r, i (r.id)}
			<article class="adm-card batch adm-rise" style="--i:{Math.min(i, 8)}">
				<div class="top">
					<span class="code">{r.id}</span>
					<span class="adm-badge gray">{orderCount(r.id)} pesanan</span>
				</div>
				<h3>{r.productName}</h3>
				<dl>
					<div><dt>Paspor</dt><dd>{r.passportNumber}</dd></div>
					<div><dt>Lot</dt><dd>{r.lotNumber}</dd></div>
					<div><dt>Jenis</dt><dd>{r.species}</dd></div>
					<div><dt>Produksi</dt><dd>{kg(r.totalGram)} kg · {r.totalItems} kemasan</dd></div>
				</dl>
				<div class="acts">
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

{#snippet codeRange()}
	<div class="code-range">
		<div class="cr-cell">
			<span class="cr-label">Kode pertama</span>
			<input class="adm-input" value={firstCode} readonly aria-label="Kode pertama" />
		</div>
		<div class="cr-mid" aria-hidden="true">
			<i></i><b>sampai</b><i></i>
		</div>
		<div class="cr-cell">
			<span class="cr-label">Kode terakhir</span>
			<input class="adm-input" value={lastCode} readonly aria-label="Kode terakhir" />
		</div>
	</div>
	<p class="cr-note">
		{#if itemCount > 0}
			<b>{itemCount} kode berurutan</b>, setiap kemasan satu kode. Di antara keduanya ada
			<span class="mono">{ctx.prefix}{pad(ctx.start + 1)}</span>, <span class="mono">{ctx.prefix}{pad(ctx.start + 2)}</span>,
			<span class="mono">{ctx.prefix}{pad(ctx.start + 3)}</span> dan seterusnya sampai <span class="mono">{lastCode}</span>.
		{:else}
			Isi total produksi dan berat per kemasan (bagian Detail batch &amp; toko) untuk menentukan jumlah kode.
		{/if}
	</p>
{/snippet}

{#if drawer}
	<div class="adm portal" use:portal>
	<div class="editor" role="dialog" aria-modal="true" aria-label={editingId ? 'Edit batch' : 'Batch baru'}>
		<header class="ed-top">
			<button type="button" class="adm-btn" onclick={() => (drawer = false)}><Icon name="close" size={17} />Tutup</button>
			<div class="ed-title">
				<small>Batch kopi</small>
				<h2>{editingId ? 'Edit batch' : 'Batch baru'}{#if editingId}<span class="code-pill">{code}</span>{/if}</h2>
			</div>
			<div class="ed-acts">
				<button type="button" class="adm-btn" onclick={() => (drawer = false)}>Batal</button>
				<button class="adm-btn primary" type="submit" form="batch-form" disabled={saving}>
					<Icon name="check" size={18} />{saving ? 'Menyimpan…' : 'Simpan batch'}
				</button>
			</div>
		</header>

		<div class="ed-body">
			<nav class="ed-nav" aria-label="Bagian formulir">
				{#each SECTIONS as sec, n}
					<button type="button" class:on={activeSec === sec.id} onclick={() => goSection(sec.id)}>
						<span class="num">{n + 1}</span>{sec.label}
					</button>
				{/each}
			</nav>

			<div class="ed-scroll" bind:this={scroller} onscroll={onScrollSections}>
				<form id="batch-form" class="ed-main" onsubmit={submit}>
					<section class="adm-card sec" id="sec-identitas">
						<div class="sec-head"><span class="num">{secNo('sec-identitas')}</span><div><h3>Identitas batch</h3><p>Kode unik yang dihubungkan ke pesanan.</p></div></div>
						<div class="adm-form-grid">
							{#if editingId}
								<label class="adm-field">Nama produk<input class="adm-input" bind:value={form.productName} required /></label>
								<div class="adm-field wide">Kode batch
									{@render codeRange()}
								</div>
							{:else}
								<label class="adm-field">Kode mitra
									<input class="adm-input" value={partnerCode} oninput={(e) => (partnerCode = cleanPartner(e.currentTarget.value))} placeholder="BMK" list="partner-codes" required />
									<datalist id="partner-codes">{#each [...new Set(rows.map((r) => (r as unknown as { partnerCode?: string }).partnerCode).filter(Boolean))] as pc}<option value={pc}></option>{/each}</datalist>
								</label>
								<label class="adm-field">Tanggal perilisan
									<input class="adm-input" type="date" bind:value={releaseDate} required />
								</label>
								<label class="adm-field">Jenis beans
									<select class="adm-input" bind:value={beans}>
										{#each BEANS as b}<option value={b.letter}>{b.label} ({b.letter})</option>{/each}
									</select>
								</label>
								<label class="adm-field">Nama produk<input class="adm-input" bind:value={form.productName} required /></label>
								<div class="adm-field wide">Kode batch (otomatis)
										{@render codeRange()}
										<span class="hint">
											<b>AGP</b> = AgroPlus – <b>{cleanPartner(partnerCode) || 'BMK'}</b> = kode mitra –
											<b>{ddmmyyyy(releaseDate) || 'DDMMYYYY'}</b> = tanggal perilisan – <b>{beans}</b> = jenis beans –
											<b>001</b>, <b>002</b>, … = nomor kemasan. Jumlah kode = <b>total produksi ÷ berat per kemasan</b> (bagian Detail batch &amp; toko).
										</span>
									</div>
							{/if}
							<div class="adm-field wide">Gambar utama (bagian atas halaman)
								<div class="hero-pick">
									<div class="hero-prev">
										{#if imgs.hero}
											<img src={imgs.hero} alt="Pratinjau gambar utama" />
										{:else}
											<span>Memakai gambar bawaan Bumi Kopi</span>
										{/if}
									</div>
									<div class="hero-acts">
										<label class="adm-btn sm">
											<Icon name="media" size={15} />{imgs.hero ? 'Ganti gambar' : 'Pilih gambar'}
											<input type="file" accept="image/*" hidden onchange={(e) => pickImage(e, 'hero')} />
										</label>
										{#if imgs.hero}
											<button type="button" class="adm-btn sm" onclick={() => removeImg('hero')}>Hapus gambar</button>
										{/if}
										<span class="hint">Rasio terbaik sekitar 2,5 : 1 (mis. 1514 × 601 px). Gambar otomatis diperkecil dan dipotong mengisi bingkai.</span>
									</div>
								</div>
							</div>
						</div>
					</section>

					<section class="adm-card sec" id="sec-cerita">
						<div class="sec-head"><span class="num">{secNo('sec-cerita')}</span><div><h3>Cerita</h3><p>Teks yang dibaca pelanggan di bagian atas halaman.</p></div></div>
						<div class="adm-form-grid">
							<label class="adm-field wide">Cerita asal-usul<textarea class="adm-input" rows="5" bind:value={form.story}></textarea></label>
							<label class="adm-field wide">Mengapa diverifikasi<textarea class="adm-input" rows="4" bind:value={form.whyText}></textarea></label>
							<div class="adm-field wide">Foto pendukung (di bawah "Why we choose this coffee")
								<div class="hero-pick">
									<div class="hero-prev">
										{#if imgs.why}
											<img src={imgs.why} alt="Pratinjau foto pendukung" />
										{:else}
											<span>Memakai foto bawaan (petik kopi di Wonosalam)</span>
										{/if}
									</div>
									<div class="hero-acts">
										<label class="adm-btn sm">
											<Icon name="media" size={15} />{imgs.why ? 'Ganti foto' : 'Pilih foto'}
											<input type="file" accept="image/*" hidden onchange={(e) => pickImage(e, 'why')} />
										</label>
										{#if imgs.why}
											<button type="button" class="adm-btn sm" onclick={() => removeImg('why')}>Hapus foto</button>
										{/if}
										<span class="hint">Rasio terbaik sekitar 2,5 : 1. Foto otomatis diperkecil dan sudutnya dibulatkan di halaman pelanggan.</span>
									</div>
								</div>
							</div>
						</div>
					</section>

					{#if SHOW_PASSPORT}
					<section class="adm-card sec" id="sec-paspor">
						<div class="sec-head"><span class="num">3</span><div><h3>Coffee Passport</h3><p>Isi manual. Kartu paspor baru tampil di halaman pelanggan setelah ada data.</p></div></div>
						{#if FERROIR_IMPORT}
						<div class="ferroir-box">
							<div class="fb-head">
								<strong>Isi otomatis dari alat Ferroir</strong>
								<span>Masukkan email pembeli, lalu ambil datanya.</span>
							</div>
							<div class="fb-row">
								<input class="adm-input" type="email" bind:value={importEmail} placeholder="email@pembeli.com" list="buyer-emails" />
								<datalist id="buyer-emails">{#each linkedEmails as m}<option value={m}></option>{/each}</datalist>
								<button type="button" class="adm-btn primary" onclick={() => runImport(importEmail, false)} disabled={importing}>
									<Icon name="refresh" size={17} />{importing ? 'Mengambil…' : 'Ambil dari Ferroir'}
								</button>
							</div>
							{#if importNote}<p class="fb-note" class:ok={importNote.ok}>{importNote.text}</p>{/if}
						</div>
						{/if}

						<div class="passport-no">
							<span class="lbl">Nomor paspor</span>
							{#if form.passportNumber}
								<strong>{form.passportNumber}</strong>
							{:else}
								<em>Dibuat otomatis berurutan setelah data di bawah terisi dan disimpan</em>
							{/if}
						</div>

						<div class="adm-form-grid">
							<label class="adm-field">Nomor lot {#if fromFerroir}<i class="src">Ferroir</i>{/if}<input class="adm-input" bind:value={form.lotNumber} /></label>
							<label class="adm-field">Jenis &amp; varietas<input class="adm-input" bind:value={form.species} /></label>
							<label class="adm-field">Ketinggian<input class="adm-input" bind:value={form.altitude} placeholder="800 MDPL" /></label>
							<span></span>
							<label class="adm-field">Kebun / farm<input class="adm-input" bind:value={form.farm} /></label>
							<label class="adm-field">Lokasi kebun<input class="adm-input" bind:value={form.farmLocation} /></label>
							<label class="adm-field">Pengolah<input class="adm-input" bind:value={form.processor} /></label>
							<label class="adm-field">Lokasi pengolah<input class="adm-input" bind:value={form.processorLocation} /></label>
							<label class="adm-field">Asal<input class="adm-input" bind:value={form.origin} /></label>
							<label class="adm-field">Negara<input class="adm-input" bind:value={form.originCountry} /></label>
						</div>
					
						<div class="loc-box">
							<div class="loc-head">
								<strong>Foto paspor</strong>
								<span>Foto biji kopi di kiri kartu paspor (diberi stempel Verified Origin otomatis).</span>
							</div>
							<div class="hero-pick">
								<div class="hero-prev tall">
									{#if imgs.passport}
										<img src={imgs.passport} alt="Pratinjau foto paspor" />
									{:else}
										<span>Belum ada foto</span>
									{/if}
								</div>
								<div class="hero-acts">
									<label class="adm-btn sm">
										<Icon name="media" size={15} />{imgs.passport ? 'Ganti foto' : 'Pilih foto'}
										<input type="file" accept="image/*" hidden onchange={(e) => pickImage(e, 'passport')} />
									</label>
									{#if imgs.passport}
										<button type="button" class="adm-btn sm" onclick={() => removeImg('passport')}>Hapus foto</button>
									{/if}
									<span class="hint">Rasio portrait 3 : 4 paling pas.</span>
								</div>
							</div>
						</div>

						<div class="loc-box">
							<div class="loc-head">
								<strong>Peta lokasi asal</strong>
								<span>Peta interaktif di kartu paspor: pengunjung klik titik hijau, peta memperbesar, lalu foto lokasi muncul seperti di Google Maps. Kosongkan koordinat bila tidak ingin menampilkan peta.</span>
							</div>
							<div class="fb-row">
								<input class="adm-input" bind:value={mapLink} placeholder="Tempel tautan Google Maps (atau tulis: -7.6, 112.35)" />
								<button type="button" class="adm-btn" onclick={parseMapLink}>Ambil koordinat</button>
							</div>
							<div class="adm-form-grid">
								<label class="adm-field">Latitude<input class="adm-input" type="number" step="any" bind:value={form.mapLat} placeholder="-7.6" /></label>
								<label class="adm-field">Longitude<input class="adm-input" type="number" step="any" bind:value={form.mapLng} placeholder="112.35" /></label>
								<label class="adm-field">Nama lokasi<input class="adm-input" bind:value={form.mapPlace} placeholder="Wonosalam, Jombang, Jawa Timur" /></label>
								<label class="adm-field">Keterangan singkat<input class="adm-input" bind:value={form.mapNote} placeholder="Dataran tinggi vulkanik…" /></label>
							</div>

							<div class="places">
								<div class="loc-head">
									<strong>Foto lokasi ({places.length}/{MAX_PLACES})</strong>
									<span>Muncul sebagai gambar bulat di sekitar titik dan di kartu tempat saat peta diperbesar.</span>
								</div>
								<div class="place-grid">
									{#each places as pl, i}
										<div class="place">
											<img src={pl.src} alt="" />
											<input class="adm-input" bind:value={pl.caption} oninput={() => (placesDirty = true)} placeholder="Keterangan foto" />
											<button type="button" class="adm-btn sm icon danger" onclick={() => removePlace(i)} aria-label="Hapus foto"><Icon name="trash" size={15} /></button>
										</div>
									{/each}
									{#if places.length < MAX_PLACES}
										<label class="place add">
											<Icon name="plus" size={22} /><span>Tambah foto</span>
											<input type="file" accept="image/*" multiple hidden onchange={addPlace} />
										</label>
									{/if}
								</div>
							</div>
						</div>
					</section>
					{/if}

					<section class="adm-card sec" id="sec-rantai">
						<div class="sec-head">
							<span class="num">{secNo('sec-rantai')}</span>
							<div><h3>Rantai produksi</h3><p>Tahap perjalanan biji kopi, dari panen sampai sangrai.</p></div>
							<button type="button" class="adm-btn sm" onclick={addStep}><Icon name="plus" size={15} />Tambah tahap</button>
						</div>
						<div class="steps">
							{#each form.steps as step, i}
								<div class="step">
									<div class="step-head">
										<span class="step-no">{i + 1}</span>
										<input class="adm-input" bind:value={step.name} placeholder="Nama tahap (mis. Harvest)" required />
										<button type="button" class="adm-btn sm icon" onclick={() => moveStep(i, -1)} aria-label="Naik"><Icon name="up" size={15} /></button>
										<button type="button" class="adm-btn sm icon" onclick={() => moveStep(i, 1)} aria-label="Turun"><Icon name="down" size={15} /></button>
										<button type="button" class="adm-btn sm icon danger" onclick={() => removeStep(i)} aria-label="Hapus tahap"><Icon name="trash" size={15} /></button>
									</div>
									<textarea class="adm-input" rows="4" bind:value={step.description} placeholder="Penjelasan tahap ini"></textarea>
								</div>
							{/each}
						</div>
					</section>

					<section class="adm-card sec" id="sec-rasa">
						<div class="sec-head"><span class="num">{secNo('sec-rasa')}</span><div><h3>Cita rasa</h3><p>Pilih kartu "This coffee reminds us of".</p></div></div>
						<div class="flavors">
							{#each FLAVOR_OPTIONS as f}
								<button type="button" class="flavor" class:on={form.flavors.includes(f.key)} onclick={() => toggleFlavor(f.key)} aria-pressed={form.flavors.includes(f.key)}>
									<img src={f.image} alt="" />
									<span>{f.name}</span>
									{#if form.flavors.includes(f.key)}<i class="tick"><Icon name="check" size={14} /></i>{/if}
								</button>
							{/each}
						</div>
					</section>

					<section class="adm-card sec" id="sec-detail">
						<div class="sec-head"><span class="num">{secNo('sec-detail')}</span><div><h3>Detail batch &amp; toko</h3><p>Angka produksi (menentukan jumlah kode kemasan) dan toko online tempat memesan.</p></div></div>
						<div class="adm-form-grid">
							<label class="adm-field">Berat per kemasan (kg)
								<input class="adm-input" type="number" min="0" step="0.01" value={kg(form.weightGram)} oninput={(e) => (form.weightGram = toGram(e.currentTarget.value))} placeholder="0.15" />
							</label>
							<label class="adm-field">Total produksi batch (kg)
								<input class="adm-input" type="number" min="0" step="0.01" value={kg(form.totalGram)} oninput={(e) => (form.totalGram = toGram(e.currentTarget.value))} placeholder="4.5" />
							</label>
							<div class="adm-field">Jumlah kemasan (otomatis)
								<div class="code-auto"><span>{itemCount} kemasan</span><i>{kg(form.totalGram)} ÷ {kg(form.weightGram) || '?'} kg</i></div>
							</div>
							<span></span>
						</div>

						<div class="stores">
							<div class="stores-head">
								<div>
									<strong>Toko online</strong>
									<span>Tombol Order Now di halaman pelanggan membuka daftar toko ini. Cukup isi toko yang dipakai (mis. hanya Shopee).</span>
								</div>
								<button type="button" class="adm-btn sm" onclick={addStore}><Icon name="plus" size={15} />Tambah toko</button>
							</div>
							{#each form.stores as st, i}
								<div class="store-row">
									<input class="adm-input" bind:value={st.name} list="store-names" placeholder="Nama toko (mis. Shopee)" required />
									<input class="adm-input" type="url" bind:value={st.url} placeholder="https://shopee.co.id/…" required />
									<button type="button" class="adm-btn sm icon danger" onclick={() => removeStore(i)} aria-label="Hapus toko"><Icon name="trash" size={15} /></button>
								</div>
							{:else}
								<p class="cr-note">Belum ada toko. Tombol Order Now tidak akan tampil di halaman pelanggan.</p>
							{/each}
							<datalist id="store-names"><option value="Tokopedia"></option><option value="Shopee"></option><option value="Lazada"></option><option value="TikTok Shop"></option><option value="Blibli"></option><option value="Website resmi"></option></datalist>
						</div>

					</section>

					<div class="ed-foot">
						<button type="button" class="adm-btn" onclick={() => (drawer = false)}>Batal</button>
						<button class="adm-btn primary" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan batch'}</button>
					</div>
				</form>
			</div>
		</div>
	</div>
	</div>
{/if}

<style>
	.empty-acts {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 16px;
	}

	.batch {
		display: grid;
		gap: 12px;
	}

	.hint {
		color: var(--muted);
		font-size: 0.74rem;
		font-weight: 400;
		line-height: 1.55;
	}

	.sec :global(.adm-form-grid) {
		align-items: start;
	}

	.hint :global(b) {
		color: var(--brand);
		font-weight: 600;
	}

	/* Rentang kode: kode pertama — sampai — kode terakhir */
	.code-range {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: end;
		gap: 12px;
	}

	.cr-cell {
		display: grid;
		gap: 6px;
	}

	.cr-label {
		color: var(--muted);
		font-size: 0.72rem;
		font-weight: 500;
	}

	.code-range .adm-input {
		min-height: 52px;
		border-style: dashed;
		background: #f3f6ee;
		color: var(--brand);
		font-family: ui-monospace, Menlo, monospace;
		font-weight: 600;
	}

	.cr-mid {
		display: flex;
		align-items: center;
		gap: 8px;
		padding-bottom: 14px;
		color: var(--muted);
		font-size: 0.72rem;
	}

	.cr-mid i {
		width: 16px;
		height: 1px;
		background: rgba(85, 104, 61, 0.45);
	}

	.cr-mid b {
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.cr-note {
		margin-top: 8px;
		color: var(--muted);
		font-size: 0.78rem;
		line-height: 1.7;
	}

	.cr-note b {
		color: var(--brand);
		font-weight: 600;
	}

	.mono {
		padding: 1px 6px;
		border-radius: 6px;
		background: #eef2e7;
		color: var(--brand);
		font-family: ui-monospace, Menlo, monospace;
		font-size: 0.74rem;
	}

	@media (max-width: 700px) {
		.code-range {
			grid-template-columns: 1fr;
		}

		.cr-mid {
			padding: 0;
			justify-content: center;
		}
	}

	.hero-pick {
		display: grid;
		grid-template-columns: minmax(0, 360px) 1fr;
		align-items: center;
		gap: 18px;
	}

	.hero-prev {
		display: grid;
		place-items: center;
		aspect-ratio: 1514 / 601;
		overflow: hidden;
		border: 1px dashed rgba(85, 104, 61, 0.4);
		border-radius: 14px;
		background: #f3f6ee;
		color: var(--muted);
		font-size: 0.78rem;
		text-align: center;
	}

	.hero-prev img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.hero-acts {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}

	.hero-acts .hint {
		flex-basis: 100%;
	}

	@media (max-width: 700px) {
		.hero-pick {
			grid-template-columns: 1fr;
		}
	}

	.hero-prev.tall {
		aspect-ratio: 3 / 4;
		max-width: 150px;
	}

	.loc-box {
		display: grid;
		gap: 14px;
		margin-top: 22px;
		padding: 18px;
		border: 1px solid var(--line);
		border-radius: 16px;
		background: #fafbf8;
	}

	.loc-head strong {
		display: block;
		font-size: 0.95rem;
	}

	.loc-head span {
		color: var(--muted);
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.places {
		display: grid;
		gap: 12px;
		margin-top: 4px;
	}

	.place-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		gap: 12px;
	}

	.place {
		position: relative;
		display: grid;
		gap: 8px;
		padding: 8px;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: #fff;
	}

	.place img {
		width: 100%;
		aspect-ratio: 4 / 3;
		border-radius: 10px;
		object-fit: cover;
	}

	.place .adm-btn.icon {
		position: absolute;
		top: 14px;
		right: 14px;
		background: rgba(255, 255, 255, 0.92);
	}

	.place.add {
		place-items: center;
		align-content: center;
		min-height: 150px;
		border-style: dashed;
		color: var(--brand);
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
	}

	.stores {
		display: grid;
		gap: 10px;
		margin-top: 22px;
		padding: 16px;
		border: 1px solid var(--line);
		border-radius: 16px;
		background: #fafbf8;
	}

	.stores-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.stores-head strong {
		display: block;
		font-size: 0.95rem;
	}

	.stores-head span {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.store-row {
		display: grid;
		grid-template-columns: 200px 1fr auto;
		gap: 8px;
	}

	@media (max-width: 700px) {
		.store-row {
			grid-template-columns: 1fr;
		}
	}

	.code-auto {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		min-height: 44px;
		padding: 10px 14px;
		border: 1px dashed rgba(85, 104, 61, 0.4);
		border-radius: 12px;
		background: #f3f6ee;
	}

	.code-auto span {
		color: var(--brand);
		font-family: ui-monospace, Menlo, monospace;
		font-size: 0.95rem;
		font-weight: 600;
	}

	.code-auto i {
		padding: 2px 8px;
		border-radius: 999px;
		background: #e6edd9;
		color: var(--brand);
		font-size: 0.66rem;
		font-style: normal;
		font-weight: 600;
	}

	.ferroir-box {
		display: grid;
		gap: 12px;
		margin-bottom: 18px;
		padding: 18px;
		border: 1px dashed rgba(85, 104, 61, 0.35);
		border-radius: 18px;
		background: linear-gradient(160deg, #f6f9f0, #eef3e5);
	}

	.fb-head strong {
		display: block;
		font-size: 0.95rem;
	}

	.fb-head span {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.fb-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.fb-row .adm-input {
		flex: 1 1 260px;
	}

	.fb-note {
		color: var(--danger);
		font-size: 0.82rem;
	}

	.fb-note.ok {
		color: var(--brand);
	}

	.passport-no {
		display: grid;
		gap: 4px;
		margin-bottom: 18px;
		padding: 14px 18px;
		border-radius: 14px;
		background: #f3f6ee;
	}

	.passport-no .lbl {
		color: var(--muted);
		font-size: 0.78rem;
		font-weight: 500;
	}

	.passport-no strong {
		color: var(--brand);
		font-family: ui-monospace, Menlo, monospace;
		font-size: 1.15rem;
		letter-spacing: 0.02em;
	}

	.passport-no em {
		color: var(--muted);
		font-size: 0.86rem;
	}

	.src {
		margin-left: 6px;
		padding: 2px 8px;
		border-radius: 999px;
		background: #e0ecf8;
		color: #2a5f94;
		font-size: 0.66rem;
		font-style: normal;
		font-weight: 600;
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.code {
		padding: 4px 10px;
		border-radius: 8px;
		background: #edf1e8;
		color: var(--brand);
		font-family: ui-monospace, Menlo, monospace;
		font-size: 0.78rem;
		font-weight: 600;
	}

	.batch h3 {
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	dl {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px 16px;
		margin: 0;
	}

	dt {
		color: var(--muted);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	dd {
		margin: 2px 0 0;
		font-size: 0.86rem;
		font-weight: 500;
	}

	.acts {
		display: flex;
		gap: 6px;
		padding-top: 12px;
		border-top: 1px solid var(--line);
	}

	.acts .adm-btn:last-child {
		margin-left: auto;
	}

	/* ───── Editor layar penuh ───── */
	/* Editor memenuhi tinggi layar penuh, tetapi menyisakan sidebar (264px) di kiri pada desktop. */
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
		background: rgba(255, 255, 255, 0.82);
		backdrop-filter: blur(14px);
	}

	.ed-title {
		flex: 1;
		min-width: 0;
	}

	.ed-title small {
		display: block;
		color: var(--muted);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.ed-title h2 {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.code-pill {
		padding: 3px 10px;
		border-radius: 8px;
		background: #edf1e8;
		color: var(--brand);
		font-family: ui-monospace, Menlo, monospace;
		font-size: 0.74rem;
		font-weight: 600;
	}

	.ed-acts {
		display: flex;
		gap: 10px;
	}

	.ed-body {
		display: grid;
		grid-template-columns: 250px 1fr;
		flex: 1;
		min-height: 0;
	}

	.ed-nav {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 24px 18px;
		overflow-y: auto;
		border-right: 1px solid var(--line);
	}

	.ed-nav button {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 11px 12px;
		border: 0;
		border-radius: 14px;
		background: transparent;
		color: var(--muted);
		font: inherit;
		font-size: 0.9rem;
		font-weight: 500;
		text-align: left;
		cursor: pointer;
		transition:
			background-color 0.3s var(--ease),
			color 0.3s var(--ease);
	}

	.ed-nav button:hover {
		background: rgba(85, 104, 61, 0.07);
	}

	.ed-nav button.on {
		background: #e6edd9;
		color: var(--brand);
		font-weight: 600;
	}

	.num {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: #edf1e8;
		color: var(--brand);
		font-size: 0.78rem;
		font-weight: 700;
	}

	.ed-nav button.on .num {
		background: var(--brand);
		color: #fff;
	}

	.ed-scroll {
		overflow-y: auto;
		scroll-behavior: smooth;
		padding: clamp(18px, 3vw, 40px);
	}

	.ed-main {
		display: grid;
		gap: 20px;
		max-width: 960px;
		margin: 0 auto;
		padding-bottom: 60px;
	}

	.sec {
		padding: clamp(20px, 2.6vw, 32px);
		scroll-margin-top: 16px;
	}

	.sec-head {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 22px;
	}

	.sec-head > div {
		flex: 1;
	}

	.sec-head h3 {
		font-size: 1.12rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.sec-head p {
		margin-top: 2px;
		color: var(--muted);
		font-size: 0.82rem;
	}

	.sec :global(.adm-form-grid) {
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 18px;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 14px;
	}

	.step {
		display: grid;
		gap: 10px;
		padding: 14px;
		border: 1px solid var(--line);
		border-radius: 16px;
		background: #fafbf8;
	}

	.step-head {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.step-no {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 10px;
		background: var(--brand);
		color: #fff;
		font-size: 0.8rem;
		font-weight: 700;
	}

	.flavors {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 14px;
	}

	.flavor {
		position: relative;
		display: grid;
		gap: 8px;
		justify-items: center;
		padding: 10px;
		border: 2px solid var(--line);
		border-radius: 18px;
		background: #fff;
		color: var(--muted);
		font: inherit;
		font-size: 0.86rem;
		font-weight: 500;
		cursor: pointer;
		opacity: 0.6;
		transition: all 0.3s var(--ease);
	}

	.flavor img {
		width: 100%;
		height: 120px;
		border-radius: 12px;
		object-fit: cover;
		object-position: top;
	}

	.flavor.on {
		border-color: var(--accent);
		color: var(--ink);
		opacity: 1;
		box-shadow: 0 10px 24px rgba(85, 104, 61, 0.16);
	}

	.tick {
		position: absolute;
		top: 16px;
		right: 16px;
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--brand);
		color: #fff;
	}

	.ed-foot {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
	}

	@media (max-width: 900px) {
		.ed-body {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}

		.ed-nav {
			flex-direction: row;
			padding: 10px 14px;
			overflow-x: auto;
			border-right: 0;
			border-bottom: 1px solid var(--line);
		}

		.ed-nav button {
			flex: 0 0 auto;
			white-space: nowrap;
		}

		.ed-top {
			flex-wrap: wrap;
		}

		.ed-title {
			order: 2;
			flex-basis: 100%;
		}

		.steps {
			grid-template-columns: 1fr;
		}
	}
</style>
