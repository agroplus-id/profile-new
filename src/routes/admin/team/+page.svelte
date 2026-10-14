<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/admin/Icon.svelte';
	import FilterBar from '$lib/admin/FilterBar.svelte';
	import { matches, newFilter } from '$lib/admin/filter';
	import { notify } from '$lib/admin/toast.svelte';
	import {
		GROUP_LABELS,
		fetchTeam,
		removeMember,
		resizeToDataUrl,
		saveMember,
		seedFromStatic,
		updateMember,
		type TeamGroup,
		type TeamInput,
		type TeamRecord
	} from '$lib/team-store';

	const groups = Object.keys(GROUP_LABELS) as TeamGroup[];

	let members = $state<TeamRecord[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let seeding = $state('');
	let filt = $state(newFilter('urut', ['group', 'photo']));

	let drawer = $state(false);
	let editingId = $state<string | null>(null);
	let confirmId = $state<string | null>(null);

	const blank = (): TeamInput => ({
		name: '',
		role: '',
		group: (filt.values.group as TeamGroup) || 'team',
		order: members.length ? Math.max(...members.map((m) => m.order)) + 1 : 0,
		image: '',
		linkedin: '',
		instagram: '',
		scholar: ''
	});
	let form = $state<TeamInput>(blank());

	const filterDefs = $derived([
		{
			key: 'group',
			label: 'Grup',
			options: [
				{ value: '', label: 'Semua', count: members.length },
				...groups.map((g) => ({ value: g, label: GROUP_LABELS[g], count: members.filter((m) => m.group === g).length }))
			]
		},
		{
			key: 'photo',
			label: 'Foto',
			variant: 'select' as const,
			options: [
				{ value: '', label: 'Semua' },
				{ value: 'ada', label: 'Sudah ada foto', count: members.filter((m) => m.image).length },
				{ value: 'tidak', label: 'Belum ada foto', count: members.filter((m) => !m.image).length }
			]
		}
	]);
	const SORTS = [
		{ value: 'urut', label: 'Urutan tampil di situs' },
		{ value: 'nama', label: 'Nama A–Z' },
		{ value: 'jabatan', label: 'Jabatan A–Z' }
	];

	const visible = $derived(
		members
			.filter(
				(m) =>
					(!filt.values.group || m.group === filt.values.group) &&
					(!filt.values.photo || (filt.values.photo === 'ada') === !!m.image) &&
					matches(filt.query, m.name, m.role, m.linkedin, m.instagram)
			)
			.sort((a, b) => {
				if (filt.sort === 'nama') return a.name.localeCompare(b.name);
				if (filt.sort === 'jabatan') return (a.role || '~').localeCompare(b.role || '~') || a.name.localeCompare(b.name);
				return a.order - b.order;
			})
	);

	onMount(load);

	async function load() {
		loading = true;
		try {
			members = await fetchTeam();
		} catch (err) {
			notify('Gagal memuat tim: ' + err, true);
		} finally {
			loading = false;
		}
	}

	function openAdd() {
		editingId = null;
		form = blank();
		drawer = true;
	}

	function openEdit(m: TeamRecord) {
		editingId = m.id;
		const { id: _id, ...rest } = m;
		form = { ...rest };
		drawer = true;
	}

	async function onFile(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		try {
			form.image = await resizeToDataUrl(file);
		} catch {
			notify('File bukan gambar yang valid', true);
		}
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!form.name.trim()) return;
		saving = true;
		try {
			const data = { ...form, name: form.name.trim(), role: form.role.trim() };
			if (editingId) await updateMember(editingId, data);
			else await saveMember(data);
			notify(editingId ? 'Perubahan disimpan' : 'Anggota ditambahkan');
			drawer = false;
			await load();
		} catch (err) {
			notify('Gagal menyimpan: ' + err, true);
		} finally {
			saving = false;
		}
	}

	async function remove(m: TeamRecord) {
		try {
			await removeMember(m.id);
			notify(`${m.name} dihapus`);
			confirmId = null;
			await load();
		} catch (err) {
			notify('Gagal menghapus: ' + err, true);
		}
	}

	async function move(m: TeamRecord, dir: -1 | 1) {
		const list = members.filter((x) => x.group === m.group);
		const other = list[list.findIndex((x) => x.id === m.id) + dir];
		if (!other) return;
		try {
			await Promise.all([
				updateMember(m.id, { order: other.order }),
				updateMember(other.id, { order: m.order })
			]);
			await load();
		} catch (err) {
			notify('Gagal mengubah urutan: ' + err, true);
		}
	}

	async function seed() {
		try {
			await seedFromStatic((d, t) => (seeding = `Memproses foto ${d}/${t}…`));
			notify('Data tim bawaan berhasil diimpor');
			await load();
		} catch (err) {
			notify('Gagal impor: ' + err, true);
		} finally {
			seeding = '';
		}
	}
</script>

<div class="adm-page-head">
	<div>
		<h1>Tim</h1>
		<p>Kelola leadership, advisor, dan anggota tim yang tampil di halaman /team.</p>
	</div>
	<button class="adm-btn primary" onclick={openAdd}><Icon name="plus" size={18} />Tambah anggota</button>
</div>

<FilterBar bind:model={filt} filters={filterDefs} sorts={SORTS} placeholder="Cari nama, jabatan, atau tautan sosial…" total={members.length} shown={visible.length} noun="anggota" />

{#if loading}
	<div class="grid">
		{#each Array(6) as _}<div class="adm-card skel"></div>{/each}
	</div>
{:else if !members.length}
	<div class="adm-card adm-empty">
		<Icon name="team" size={32} />
		<p>Belum ada data tim di Firestore. Halaman /team masih memakai data bawaan dari kode.</p>
		<button class="adm-btn primary" onclick={seed} disabled={!!seeding}>{seeding || 'Impor 17 anggota bawaan'}</button>
	</div>
{:else if !visible.length}
	<div class="adm-card adm-empty">Tidak ada anggota yang cocok.</div>
{:else}
	<div class="grid">
		{#each visible as m, i (m.id)}
			<article class="adm-card member adm-rise" style="--i:{Math.min(i, 8)}">
				<div class="photo"><img src={m.image} alt="" /></div>
				<div class="meta">
					<strong>{m.name}</strong>
					<small>{m.role || '—'}</small>
					<span class="adm-badge gray">{GROUP_LABELS[m.group]}</span>
				</div>
				<div class="acts">
					{#if filt.sort === 'urut'}
						<button class="adm-btn sm icon" onclick={() => move(m, -1)} aria-label="Naik"><Icon name="up" size={16} /></button>
						<button class="adm-btn sm icon" onclick={() => move(m, 1)} aria-label="Turun"><Icon name="down" size={16} /></button>
					{/if}
					<button class="adm-btn sm push" onclick={() => openEdit(m)}><Icon name="edit" size={15} />Edit</button>
					{#if confirmId === m.id}
						<button class="adm-btn sm danger" onclick={() => remove(m)}>Yakin?</button>
					{:else}
						<button class="adm-btn sm icon danger" onclick={() => (confirmId = m.id)} aria-label="Hapus"><Icon name="trash" size={16} /></button>
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
				<h2>{editingId ? 'Edit anggota' : 'Tambah anggota'}</h2>
				<button type="button" class="adm-btn sm icon" onclick={() => (drawer = false)} aria-label="Tutup"><Icon name="close" size={18} /></button>
			</div>

			<div class="photo-pick">
				{#if form.image}<img src={form.image} alt="Pratinjau" />{:else}<div class="ph"><Icon name="team" size={28} /></div>{/if}
				<label class="adm-btn">
					Pilih foto
					<input type="file" accept="image/*" onchange={onFile} hidden />
				</label>
			</div>

			<div class="adm-form-grid">
				<label class="adm-field wide">Nama<input class="adm-input" bind:value={form.name} required /></label>
				<label class="adm-field">Jabatan<input class="adm-input" bind:value={form.role} /></label>
				<label class="adm-field">Grup
					<select class="adm-input" bind:value={form.group}>
						{#each groups as g}<option value={g}>{GROUP_LABELS[g]}</option>{/each}
					</select>
				</label>
				<label class="adm-field wide">LinkedIn<input class="adm-input" bind:value={form.linkedin} placeholder="https://" /></label>
				<label class="adm-field wide">Instagram<input class="adm-input" bind:value={form.instagram} placeholder="https://" /></label>
				<label class="adm-field wide">Google Scholar (advisor)<input class="adm-input" bind:value={form.scholar} placeholder="https://" /></label>
			</div>

			<div class="foot">
				<button type="button" class="adm-btn" onclick={() => (drawer = false)}>Batal</button>
				<button class="adm-btn primary" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</button>
			</div>
		</form>
	</div>
{/if}

<style>

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
		gap: 16px;
	}

	.skel {
		min-height: 150px;
		background: linear-gradient(100deg, #fff 30%, #f1f4ee 50%, #fff 70%) 0 0 / 200% 100%;
		animation: shimmer 1.4s linear infinite;
	}

	@keyframes shimmer {
		to {
			background-position: -200% 0;
		}
	}

	.member {
		display: grid;
		grid-template-columns: 72px 1fr;
		gap: 14px;
		align-items: center;
		padding: 16px;
	}

	.photo img {
		display: block;
		width: 72px;
		height: 72px;
		border-radius: 18px;
		background: #e4e9dd;
		object-fit: cover;
		object-position: center top;
	}

	.meta {
		display: grid;
		gap: 3px;
		min-width: 0;
	}

	.meta strong {
		font-size: 0.95rem;
		font-weight: 600;
		line-height: 1.25;
	}

	.meta small {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.meta .adm-badge {
		justify-self: start;
		margin-top: 6px;
	}

	.acts {
		grid-column: 1 / -1;
		display: flex;
		gap: 6px;
		padding-top: 12px;
		border-top: 1px solid var(--line);
	}

	.acts .push {
		margin-left: auto;
	}

	.photo-pick {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 20px;
	}

	.photo-pick img,
	.ph {
		display: grid;
		place-items: center;
		width: 88px;
		height: 88px;
		border-radius: 22px;
		background: #e4e9dd;
		color: var(--muted);
		object-fit: cover;
		object-position: center top;
	}

	.foot {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 26px;
	}
</style>
