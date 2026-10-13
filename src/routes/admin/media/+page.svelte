<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/admin/Icon.svelte';
	import { notify } from '$lib/admin/toast.svelte';
	import { createDoc, listAll, patchDoc, removeDoc } from '$lib/admin/db';
	import { resizeLogo } from '$lib/admin/image';
	import { seedPartners, seedPress, type Progress } from '$lib/admin/seed';

	let seeding = $state('');

	async function runSeed(fn: (p: Progress) => Promise<void>, done: string) {
		try {
			await fn((t) => (seeding = t));
			notify(done);
			await load();
		} catch (err) {
			notify('Gagal impor: ' + err, true);
		} finally {
			seeding = '';
		}
	}

	type Press = { title: string; quote: string; url: string; image: string; order: number };
	type Partner = { name: string; url: string; image: string; order: number };
	type PressRow = Press & { id: string };
	type PartnerRow = Partner & { id: string };
	type Kind = 'press' | 'partners';

	let press = $state<PressRow[]>([]);
	let partners = $state<PartnerRow[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let confirm = $state('');

	let drawer = $state<Kind | null>(null);
	let editingId = $state<string | null>(null);
	let pForm = $state<Press>({ title: '', quote: '', url: '', image: '', order: 0 });
	let lForm = $state<Partner>({ name: '', url: '', image: '', order: 0 });

	const sortByOrder = <T extends { order: number }>(a: T[]) => [...a].sort((x, y) => x.order - y.order);
	const nextOrder = (a: { order: number }[]) => (a.length ? Math.max(...a.map((x) => x.order)) + 1 : 0);

	onMount(load);

	async function load() {
		loading = true;
		try {
			[press, partners] = await Promise.all([
				listAll<Press>('press').then(sortByOrder),
				listAll<Partner>('partners').then(sortByOrder)
			]);
		} catch (err) {
			notify('Gagal memuat media: ' + err, true);
		} finally {
			loading = false;
		}
	}

	function openPress(r?: PressRow) {
		editingId = r?.id ?? null;
		pForm = r
			? { title: r.title, quote: r.quote, url: r.url ?? '', image: r.image ?? '', order: r.order }
			: { title: '', quote: '', url: '', image: '', order: nextOrder(press) };
		drawer = 'press';
	}

	function openPartner(r?: PartnerRow) {
		editingId = r?.id ?? null;
		lForm = r
			? { name: r.name, url: r.url ?? '', image: r.image, order: r.order }
			: { name: '', url: '', image: '', order: nextOrder(partners) };
		drawer = 'partners';
	}

	async function pickLogo(e: Event, target: 'press' | 'partners') {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		try {
			const dataUrl = await resizeLogo(file);
			if (target === 'press') pForm.image = dataUrl;
			else lForm.image = dataUrl;
		} catch {
			notify('File bukan gambar yang valid', true);
		}
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (drawer === 'partners' && !lForm.image) {
			notify('Logo mitra wajib diunggah', true);
			return;
		}
		saving = true;
		try {
			const col = drawer!;
			const data = col === 'press' ? { ...pForm, title: pForm.title.trim() } : { ...lForm, name: lForm.name.trim() };
			if (editingId) await patchDoc(col, editingId, data);
			else await createDoc(col, data);
			notify(editingId ? 'Perubahan disimpan' : 'Ditambahkan');
			drawer = null;
			await load();
		} catch (err) {
			notify('Gagal menyimpan: ' + err, true);
		} finally {
			saving = false;
		}
	}

	async function remove(kind: Kind, id: string) {
		try {
			await removeDoc(kind, id);
			notify('Dihapus');
			confirm = '';
			await load();
		} catch (err) {
			notify('Gagal menghapus: ' + err, true);
		}
	}

	async function move<T extends { id: string; order: number }>(kind: Kind, list: T[], item: T, dir: -1 | 1) {
		const other = list[list.findIndex((x) => x.id === item.id) + dir];
		if (!other) return;
		try {
			await Promise.all([patchDoc(kind, item.id, { order: other.order }), patchDoc(kind, other.id, { order: item.order })]);
			await load();
		} catch (err) {
			notify('Gagal mengubah urutan: ' + err, true);
		}
	}
</script>

<div class="adm-page-head">
	<div>
		<h1>Media</h1>
		<p>Bagian "In the press" dan logo mitra yang berjalan di halaman utama.</p>
	</div>
</div>

<section class="adm-card sec adm-rise" style="--i:0">
	<div class="adm-card-head">
		<div>
			<h2>In the press</h2>
			<p class="hint">Ditampilkan 3 per halaman; bila lebih dari 3, tombol ‹ › di situs aktif.</p>
		</div>
		<button class="adm-btn primary" onclick={() => openPress()}><Icon name="plus" size={18} />Tambah</button>
	</div>

	{#if loading}
		<div class="adm-empty">Memuat…</div>
	{:else if !press.length}
		<div class="adm-empty">
			<Icon name="news" size={30} />
			<p>Belum ada data. Halaman utama sementara menampilkan 3 contoh "Press Logo".</p>
			<button class="adm-btn primary" onclick={() => runSeed(seedPress, 'Data press bawaan berhasil diimpor')} disabled={!!seeding}>
				{seeding || 'Impor 3 contoh bawaan'}
			</button>
		</div>
	{:else}
		<ul class="rows">
			{#each press as r (r.id)}
				<li>
					<div class="logo">{#if r.image}<img src={r.image} alt="" />{:else}<span>{r.title.slice(0, 2)}</span>{/if}</div>
					<div class="txt">
						<strong>{r.title}</strong>
						<p>{r.quote}</p>
					</div>
					<div class="acts">
						<button class="adm-btn sm icon" onclick={() => move('press', press, r, -1)} aria-label="Naik"><Icon name="up" size={16} /></button>
						<button class="adm-btn sm icon" onclick={() => move('press', press, r, 1)} aria-label="Turun"><Icon name="down" size={16} /></button>
						<button class="adm-btn sm icon" onclick={() => openPress(r)} aria-label="Edit"><Icon name="edit" size={16} /></button>
						{#if confirm === 'press' + r.id}
							<button class="adm-btn sm danger" onclick={() => remove('press', r.id)}>Yakin?</button>
						{:else}
							<button class="adm-btn sm icon danger" onclick={() => (confirm = 'press' + r.id)} aria-label="Hapus"><Icon name="trash" size={16} /></button>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="adm-card sec adm-rise" style="--i:1">
	<div class="adm-card-head">
		<div>
			<h2>Logo mitra</h2>
			<p class="hint">Berjalan sebagai marquee di bawah "In the press". Gunakan PNG/SVG berlatar transparan.</p>
		</div>
		<button class="adm-btn primary" onclick={() => openPartner()}><Icon name="plus" size={18} />Tambah logo</button>
	</div>

	{#if loading}
		<div class="adm-empty">Memuat…</div>
	{:else if !partners.length}
		<div class="adm-empty">
			<Icon name="media" size={30} />
			<p>Belum ada logo. Halaman utama sementara memakai logo bawaan.</p>
			<button class="adm-btn primary" onclick={() => runSeed(seedPartners, 'Logo bawaan berhasil diimpor')} disabled={!!seeding}>
				{seeding || 'Impor 6 logo bawaan'}
			</button>
		</div>
	{:else}
		<div class="logos">
			{#each partners as r (r.id)}
				<div class="logo-card">
					<div class="plate"><img src={r.image} alt={r.name} /></div>
					<strong>{r.name || 'Tanpa nama'}</strong>
					<div class="acts">
						<button class="adm-btn sm icon" onclick={() => move('partners', partners, r, -1)} aria-label="Geser maju"><Icon name="up" size={15} /></button>
						<button class="adm-btn sm icon" onclick={() => move('partners', partners, r, 1)} aria-label="Geser mundur"><Icon name="down" size={15} /></button>
						<button class="adm-btn sm icon" onclick={() => openPartner(r)} aria-label="Edit"><Icon name="edit" size={15} /></button>
						{#if confirm === 'partners' + r.id}
							<button class="adm-btn sm danger" onclick={() => remove('partners', r.id)}>Yakin?</button>
						{:else}
							<button class="adm-btn sm icon danger" onclick={() => (confirm = 'partners' + r.id)} aria-label="Hapus"><Icon name="trash" size={15} /></button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

{#if drawer}
	<div class="adm-overlay" role="presentation" onclick={(e) => e.target === e.currentTarget && (drawer = null)}>
		<form class="adm-drawer" onsubmit={submit}>
			<div class="adm-drawer-head">
				<h2>
					{#if drawer === 'press'}{editingId ? 'Edit kutipan press' : 'Tambah kutipan press'}{:else}{editingId ? 'Edit logo mitra' : 'Tambah logo mitra'}{/if}
				</h2>
				<button type="button" class="adm-btn sm icon" onclick={() => (drawer = null)} aria-label="Tutup"><Icon name="close" size={18} /></button>
			</div>

			{#if drawer === 'press'}
				<div class="adm-form-grid">
					<label class="adm-field wide">Judul / nama media<input class="adm-input" bind:value={pForm.title} placeholder="Press Logo" required /></label>
					<label class="adm-field wide">Kutipan<textarea class="adm-input" rows="5" bind:value={pForm.quote} required></textarea></label>
					<label class="adm-field wide">Link artikel (opsional)<input class="adm-input" bind:value={pForm.url} placeholder="https://" /></label>
				</div>
				<div class="pick">
					<div class="plate">{#if pForm.image}<img src={pForm.image} alt="Logo media" />{:else}<span class="muted">Tanpa logo — judul teks ditampilkan</span>{/if}</div>
					<div class="pick-acts">
						<label class="adm-btn sm">Unggah logo (opsional)<input type="file" accept="image/*" hidden onchange={(e) => pickLogo(e, 'press')} /></label>
						{#if pForm.image}<button type="button" class="adm-btn sm" onclick={() => (pForm.image = '')}>Hapus logo</button>{/if}
					</div>
				</div>
			{:else}
				<div class="pick">
					<div class="plate big">{#if lForm.image}<img src={lForm.image} alt="Pratinjau logo" />{:else}<span class="muted">Belum ada logo</span>{/if}</div>
					<label class="adm-btn sm">Pilih logo<input type="file" accept="image/*" hidden onchange={(e) => pickLogo(e, 'partners')} /></label>
				</div>
				<div class="adm-form-grid">
					<label class="adm-field wide">Nama mitra<input class="adm-input" bind:value={lForm.name} required /></label>
					<label class="adm-field wide">Website (opsional)<input class="adm-input" bind:value={lForm.url} placeholder="https://" /></label>
				</div>
			{/if}

			<div class="foot">
				<button type="button" class="adm-btn" onclick={() => (drawer = null)}>Batal</button>
				<button class="adm-btn primary" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</button>
			</div>
		</form>
	</div>
{/if}

<style>
	.sec {
		margin-bottom: 16px;
	}

	.hint {
		margin-top: 2px;
		color: var(--muted);
		font-size: 0.8rem;
	}

	.rows {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.rows li {
		display: grid;
		grid-template-columns: 96px 1fr auto;
		align-items: center;
		gap: 16px;
		padding: 14px 4px;
		border-top: 1px solid var(--line);
	}

	.rows li:first-child {
		border-top: 0;
	}

	.logo,
	.plate {
		display: grid;
		place-items: center;
		overflow: hidden;
		border-radius: 14px;
		background: #d8e4c6;
	}

	.logo {
		width: 96px;
		height: 64px;
		color: var(--brand);
		font-weight: 700;
		text-transform: uppercase;
	}

	.logo img,
	.plate img {
		max-width: 80%;
		max-height: 70%;
		object-fit: contain;
	}

	.txt {
		display: grid;
		gap: 4px;
		min-width: 0;
	}

	.txt p {
		overflow: hidden;
		color: var(--muted);
		font-size: 0.84rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.acts {
		display: flex;
		gap: 6px;
	}

	.logos {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		gap: 14px;
	}

	.logo-card {
		display: grid;
		gap: 10px;
		padding: 12px;
		border: 1px solid var(--line);
		border-radius: 16px;
	}

	.logo-card .plate {
		height: 92px;
	}

	.logo-card strong {
		overflow: hidden;
		font-size: 0.85rem;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.pick {
		display: grid;
		gap: 12px;
		justify-items: start;
		margin: 18px 0;
	}

	.pick .plate {
		width: 100%;
		height: 110px;
	}

	.pick .plate.big {
		height: 150px;
	}

	.pick-acts {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.muted {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.foot {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 26px;
	}

	@media (max-width: 700px) {
		.rows li {
			grid-template-columns: 72px 1fr;
		}

		.logo {
			width: 72px;
			height: 52px;
		}

		.rows .acts {
			grid-column: 1 / -1;
		}
	}
</style>
